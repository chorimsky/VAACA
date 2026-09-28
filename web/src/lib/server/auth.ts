import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  STAFF_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifyStaffSession,
} from "@/lib/session-token";

export { ROLE_LABEL, STAFF_ROLES } from "@/lib/staff-roles";
export type { StaffRole } from "@/lib/staff-roles";
export {
  newStaffSession as newSession,
  STAFF_COOKIE as SESSION_COOKIE_NAME,
} from "@/lib/session-token";
export type { StaffSession } from "@/lib/session-token";

import type { StaffSession } from "@/lib/session-token";

/**
 * Staff authentication for the internal surfaces.
 *
 * BACKEND_NOTES.md calls for a `staff_role` check enforced server-side rather
 * than hidden in the UI. This is that check: scrypt-hashed credentials and a
 * signed httpOnly session cookie, verified in middleware before the page
 * renders and again in every server component and route handler that reads
 * applicant data.
 *
 * Deliberately small — a real deployment should move accounts into the member
 * database and put SSO in front. What it is NOT is a UI-only gate.
 */

/* -------------------------------------------------------------------------- */
/* Passwords                                                                   */
/* -------------------------------------------------------------------------- */

const SCRYPT_KEYLEN = 64;

/** `scrypt$<saltHex>$<hashHex>` — the format stored in the staff file. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(
    password,
    Buffer.from(saltHex, "hex"),
    expected.length,
  );
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/* -------------------------------------------------------------------------- */
/* Session cookie                                                              */
/* -------------------------------------------------------------------------- */

export async function setSessionCookie(session: StaffSession) {
  const jar = await cookies();
  jar.set(STAFF_COOKIE, await signSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(STAFF_COOKIE);
}

/** The signed-in staff member, or null. Safe to call in any server context. */
export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  return verifyStaffSession(jar.get(STAFF_COOKIE)?.value);
}
