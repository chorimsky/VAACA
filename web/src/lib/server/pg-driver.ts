import "server-only";

import { Pool } from "pg";

/**
 * Postgres backing for the document store.
 *
 * The shape is deliberately the same as the file store it replaces: one JSON
 * document per key, read whole and written whole under a lock. That is not a
 * relational model and does not pretend to be — it is the smallest change that
 * fixes the thing actually wrong with the file store, which is that `/tmp` on a
 * serverless host is per-instance and erased on every redeploy.
 *
 * What this buys, and it is the whole point: a write survives a redeploy, two
 * instances see the same data, and a read-modify-write is serialised across
 * processes rather than only within one.
 *
 * When to replace it with real tables: when something needs to be queried
 * rather than loaded. A directory of a few thousand institutions filtered in
 * memory is fine; a directory that needs `WHERE chamber = $1 AND country = $2`
 * across tens of thousands of rows is not, and that is the signal.
 */

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // A write holds a connection while its mutator runs, and some mutators
      // read another document (a scorecard reads the gap register to find its
      // caps). The pool has to be wide enough for that nesting.
      max: 10,
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

/** Creates the table on first use. Idempotent, and cheap enough to await. */
function ensureSchema(): Promise<void> {
  ready ??= getPool()
    .query(
      `CREATE TABLE IF NOT EXISTS vaaca_store (
         name       text PRIMARY KEY,
         data       jsonb NOT NULL,
         updated_at timestamptz NOT NULL DEFAULT now()
       )`,
    )
    .then(() => undefined)
    .catch((error) => {
      // Let the next call try again rather than caching a failure forever.
      ready = null;
      throw error;
    });
  return ready;
}

export async function pgRead<T>(name: string, fallback: T): Promise<T> {
  await ensureSchema();
  const { rows } = await getPool().query<{ data: T }>(
    "SELECT data FROM vaaca_store WHERE name = $1",
    [name],
  );
  return rows.length ? rows[0].data : fallback;
}

/**
 * Read, transform and persist under an advisory lock held for the transaction.
 *
 * The lock is keyed on the document name, so two documents never block each
 * other, and it is released by COMMIT or ROLLBACK — including if the process
 * dies mid-mutation, which a file-based mutex cannot promise.
 */
export async function pgWrite<T, R>(
  name: string,
  fallback: T,
  mutate: (current: T) => Promise<{ next: T; result: R }>,
): Promise<R> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [name]);

    const { rows } = await client.query<{ data: T }>(
      "SELECT data FROM vaaca_store WHERE name = $1",
      [name],
    );
    const current = rows.length ? rows[0].data : fallback;

    const { next, result } = await mutate(current);

    await client.query(
      `INSERT INTO vaaca_store (name, data, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (name) DO UPDATE
         SET data = EXCLUDED.data, updated_at = now()`,
      [name, JSON.stringify(next)],
    );
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Closes the pool. Only the test harness needs this; the server never exits. */
export async function pgClose(): Promise<void> {
  if (pool) {
    const closing = pool.end();
    pool = null;
    ready = null;
    await closing;
  }
}
