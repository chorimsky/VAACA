import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Small JSON-file persistence layer shared by the application, member and gap
 * stores. This is the seam BACKEND_NOTES.md describes: everything the app reads
 * or writes goes through here, so moving to a real database means replacing
 * this module and nothing else.
 *
 * Caveat for deployment: serverless filesystems are ephemeral and often
 * read-only, so writes will not survive on Vercel. Point `VAACA_DATA_DIR` at a
 * persistent volume, or swap this for a database client, before running
 * anywhere but a single long-lived server.
 */

/**
 * Where the store lives.
 *
 * On Vercel the deployment filesystem is read-only apart from `/tmp`, so
 * defaulting to `./data` there made the very first read fail: seeding writes a
 * file, `mkdir` returned EACCES, and every page that touches a store rendered
 * nothing. `/tmp` is writable, but it is per-instance and lost on redeploy or
 * scale-out — fine for a preview, not persistence. Point `VAACA_DATA_DIR` at a
 * real volume, or replace this module with a database client, before this
 * holds anything that matters.
 */
export const DATA_DIR = process.env.VAACA_DATA_DIR
  ? path.resolve(process.env.VAACA_DATA_DIR)
  : process.env.VERCEL
    ? "/tmp/vaaca-data"
    : path.join(process.cwd(), "data");

/** A filesystem that will not accept writes, rather than a bug in a mutation. */
const isUnwritable = (error: unknown) => {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  return (
    code === "EROFS" ||
    code === "EACCES" ||
    code === "EPERM" ||
    code === "ENOSPC"
  );
};

/** Raised when the store cannot be written, so callers can say so plainly. */
export class StoreUnavailableError extends Error {
  constructor(name: string, cause: unknown) {
    super(`The data store is read-only; ${name} could not be written.`);
    this.name = "StoreUnavailableError";
    this.cause = cause;
  }
}

export const isStoreUnavailable = (
  error: unknown,
): error is StoreUnavailableError => error instanceof StoreUnavailableError;

const filePath = (name: string) => path.join(DATA_DIR, name);

export async function readStore<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Write via a temp file + rename so a crash can't leave a half-written file. */
async function writeFileAtomic(name: string, value: unknown): Promise<void> {
  const target = filePath(name);
  try {
    await mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
    await rename(tmp, target);
  } catch (error) {
    if (isUnwritable(error)) throw new StoreUnavailableError(name, error);
    throw error;
  }
}

/**
 * Serialises read-modify-write cycles per file within this process. It does not
 * guard against multiple processes — another reason this is a single-server
 * store rather than a database.
 */
const queues = new Map<string, Promise<unknown>>();

function exclusive<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const previous = queues.get(name) ?? Promise.resolve();
  const run = previous.then(fn, fn);
  queues.set(
    name,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

/**
 * Read, transform and persist a store file under the per-file lock. The
 * mutator returns the next value plus whatever the caller needs back.
 */
export async function writeStore<T, R>(
  name: string,
  fallback: T,
  mutate: (current: T) => Promise<{ next: T; result: R }>,
): Promise<R> {
  return exclusive(name, async () => {
    const current = await readStore<T>(name, fallback);
    const { next, result } = await mutate(current);
    await writeFileAtomic(name, next);
    return result;
  });
}

/**
 * Seeds a file on first read, then returns it.
 *
 * Reading must never depend on being able to write. If the store cannot be
 * persisted, the seed is still returned, so a read-only deployment renders its
 * starting data instead of failing — writes are what should complain, not
 * reads.
 */
export async function readOrSeed<T>(name: string, seed: () => T): Promise<T> {
  const existing = await readStore<T | null>(name, null);
  if (existing !== null) return existing;

  try {
    return await writeStore<T | null, T>(name, null, async (current) => {
      if (current !== null) return { next: current, result: current };
      const value = seed();
      return { next: value, result: value };
    });
  } catch (error) {
    if (isStoreUnavailable(error)) return seed();
    throw error;
  }
}
