#!/usr/bin/env node
/**
 * A write must survive the process that made it.
 *
 *   DATABASE_URL=postgres://... npm run test:persistence
 *
 * This is the one thing the file store could not do on a serverless host, and
 * the reason four revenue engines could not be sold: `/tmp` is per-instance and
 * erased on every redeploy, so an institution that registered on Monday was
 * gone on Tuesday. Nothing else in the suite catches it, because every other
 * check runs against a single server that never restarts.
 *
 * So: register a member, kill the server, start a different one against the
 * same database, and prove the member is still there and can still sign in.
 */
import { spawn } from "node:child_process";

const PORT = process.env.PORT ?? "3013";
const BASE = `http://localhost:${PORT}`;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log(
    "\n  DATABASE_URL is not set, so there is no persistence to check.\n" +
      "  This check is about surviving a restart, which the file store cannot do.\n",
  );
  process.exit(0);
}

let failures = 0;
const check = (label, actual, expected) => {
  const ok =
    typeof expected === "function" ? expected(actual) : actual === expected;
  console.log(
    `  ${ok ? "ok  " : "FAIL"}  ${label}${ok ? "" : `  got ${JSON.stringify(actual)}`}`,
  );
  if (!ok) failures++;
};

const start = () => {
  const server = spawn("npx", ["next", "start", "-p", PORT], {
    env: {
      ...process.env,
      DATABASE_URL,
      SESSION_SECRET:
        process.env.SESSION_SECRET ??
        "persistence-check-secret-at-least-32-chars",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  server.stdout.on("data", (d) => (log += d));
  server.stderr.on("data", (d) => (log += d));
  return { server, log: () => log };
};

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/membership`)).ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const stop = (server) =>
  new Promise((resolve) => {
    server.once("exit", resolve);
    server.kill("SIGTERM");
    setTimeout(() => {
      server.kill("SIGKILL");
      resolve();
    }, 8000);
  });

const post = async (path, body) => {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, body: json };
};

const uniq = Date.now().toString(36);
const member = {
  name: `Persistence Test ${uniq} Ltd`,
  email: `persist-${uniq}@testbed.cm`,
  country: "Cameroon",
  chamberId: "technology",
  classKey: "A",
  password: "survives-a-restart",
};

const first = start();
try {
  if (!(await waitForServer())) {
    console.log("first server did not start\n" + first.log().slice(-900));
    await stop(first.server);
    process.exit(1);
  }

  console.log("\nBefore the restart");
  const registered = await post("/api/applications", member);
  check("registration accepted", registered.status, 201);
  const signedIn = await post("/api/member/session", {
    email: member.email,
    password: member.password,
  });
  check("the new member can sign in", signedIn.status, 200);
} finally {
  await stop(first.server);
}

console.log("\n  — server stopped, starting a different one —");

const second = start();
try {
  if (!(await waitForServer())) {
    console.log("second server did not start\n" + second.log().slice(-900));
    await stop(second.server);
    process.exit(1);
  }

  console.log("\nAfter the restart");
  const again = await post("/api/member/session", {
    email: member.email,
    password: member.password,
  });
  check("the member is still there", again.status, 200);
  check("  …and is the same record", again.body?.member?.name, member.name);
  const duplicate = await post("/api/applications", member);
  check("  …so a second registration is refused", duplicate.status, 409);
} finally {
  await stop(second.server);
}

console.log(
  failures
    ? `\n  ${failures} failed — a write did not survive the restart.\n`
    : "\n  writes survive a restart\n",
);
process.exit(failures ? 1 : 0);
