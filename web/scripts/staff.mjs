#!/usr/bin/env node
/**
 * Provision and list staff accounts for the internal surfaces.
 *
 *   npm run staff:add -- <email> <password> [role] [name]
 *   npm run staff:list
 *
 * Roles: secretary_general (default) | standards_officer | council_member
 *
 * Writes to the same JSON store the app reads (VAACA_DATA_DIR, or ./data).
 * Passwords are scrypt-hashed here and never stored in plain text.
 */

import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROLES = ["secretary_general", "standards_officer", "council_member"];

const DATA_DIR = process.env.VAACA_DATA_DIR
  ? path.resolve(process.env.VAACA_DATA_DIR)
  : path.join(process.cwd(), "data");
const STAFF_FILE = path.join(DATA_DIR, "staff.json");

const hashPassword = (password) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`;
};

const load = async () => {
  try {
    return JSON.parse(await readFile(STAFF_FILE, "utf8"));
  } catch {
    return [];
  }
};

const save = async (staff) => {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STAFF_FILE, JSON.stringify(staff, null, 2), "utf8");
};

const fail = (message) => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

const [command, ...args] = process.argv.slice(2);

if (command === "list") {
  const staff = await load();
  if (!staff.length) {
    console.log("\n  No staff accounts. Add one with:");
    console.log("  npm run staff:add -- you@vaaca.org 'a-strong-password'\n");
  } else {
    console.log(`\n  ${staff.length} staff account(s) in ${STAFF_FILE}:\n`);
    for (const s of staff)
      console.log(`  · ${s.email}  [${s.role}]  ${s.name}`);
    console.log();
  }
  process.exit(0);
}

if (command !== "add") {
  fail(
    "Usage:\n    npm run staff:add -- <email> <password> [role] [name]\n    npm run staff:list",
  );
}

const [email, password, role = "secretary_general", ...nameParts] = args;

if (!email || !password) fail("Both an email and a password are required.");
if (!/^\S+@\S+\.\S+$/.test(email)) fail(`"${email}" is not a valid email.`);
if (password.length < 12)
  fail("Use a password of at least 12 characters for a staff account.");
if (!ROLES.includes(role)) fail(`Role must be one of: ${ROLES.join(", ")}`);

const staff = await load();
const normalised = email.trim().toLowerCase();
const name = nameParts.join(" ") || normalised.split("@")[0];

const existing = staff.findIndex((s) => s.email === normalised);
const account = {
  email: normalised,
  name,
  role,
  passwordHash: hashPassword(password),
};

if (existing >= 0) {
  staff[existing] = account;
  console.log(`\n  Updated ${normalised} (${role}).\n`);
} else {
  staff.push(account);
  console.log(`\n  Added ${normalised} (${role}).\n`);
}

await save(staff);
