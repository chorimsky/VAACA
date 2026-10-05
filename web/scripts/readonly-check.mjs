#!/usr/bin/env node
/**
 * Every public page must render against a store it cannot write to.
 *
 *   npm run test:readonly
 *
 * Vercel's deployment filesystem is read-only apart from /tmp. Seeding a store
 * writes a file, so the first read of `documents`, `seats` or `applications`
 * threw EACCES and the page streamed a 200 shell with no content — which every
 * status-code check happily passes. This asserts on rendered content instead.
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, chmodSync } from "node:fs";

const PORT = process.env.PORT ?? "3011";
const BASE = `http://localhost:${PORT}`;
const DIR = "/tmp/vaaca-readonly-check";

const PAGES = [
  "/",
  "/standards",
  "/governance",
  "/region",
  "/resources",
  "/institution",
  "/membership",
  "/ecosystem",
];

rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });
chmodSync(DIR, 0o500); // read + execute only: no writes

const server = spawn("npx", ["next", "start", "-p", PORT], {
  env: {
    ...process.env,
    // This check is about a filesystem that refuses writes, so it must run
    // against the file backing even when a database is configured.
    DATABASE_URL: "",
    SESSION_SECRET: "readonly-check-secret-at-least-32-chars",
    VAACA_DATA_DIR: `${DIR}/data`,
    // Set deliberately: with a seed password configured, the first read of the
    // staff file tries to *write* the seeded account. That write fails here,
    // and /institution reads it to say which secretariat posts are filled — so
    // without this the branch that broke the page is never exercised.
    STAFF_SEED_PASSWORD: "readonly-check-seed-password",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));

const stop = () => {
  server.kill("SIGTERM");
  rmSync(DIR, { recursive: true, force: true });
};

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + "/membership");
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

let failures = 0;
try {
  if (!(await waitForServer())) {
    console.log("server did not start\n" + log.slice(-800));
    stop();
    process.exit(1);
  }

  for (const path of PAGES) {
    const html = await (await fetch(BASE + path)).text();
    // A server component that throws mid-render still returns 200, so check
    // that the page actually produced its content.
    const ok =
      html.includes("<main") && !/Loading…\s*<\/div><\/body>/.test(html);
    console.log(`  ${ok ? "ok  " : "FAIL"}  ${path}`);
    if (!ok) failures++;
  }

  // A failing route returns an empty body, so parse defensively: this must
  // report a failure, not crash the check.
  const docs = await (
    await fetch(BASE + "/api/documents")
  )
    .json()
    .catch(() => null);
  const docsOk =
    !!docs && Array.isArray(docs.documents) && docs.documents.length > 0;
  console.log(`  ${docsOk ? "ok  " : "FAIL"}  /api/documents serves the seed`);
  if (!docsOk) failures++;
} finally {
  stop();
}

console.log(
  failures === 0
    ? "\nall public pages render against a read-only store"
    : `\n${failures} failed`,
);
process.exit(failures === 0 ? 0 : 1);
