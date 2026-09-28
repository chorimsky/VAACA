import { isStaffRole, type StaffRole } from "./staff-roles";
import { isClassKey, type ClassKey } from "./application-types";

/**
 * Signed session cookies for the two separate audiences.
 *
 * Uses Web Crypto rather than `node:crypto` so identical verification runs in
 * middleware (Edge) and in server components — a request can be rejected
 * before the page renders, not after.
 *
 * Staff and member sessions are distinct cookies AND carry a `kind`
 * discriminator that verification checks, so a member cookie can never be
 * replayed as a staff one even if the cookie name were swapped.
 */

export type StaffSession = {
  kind: "staff";
  email: string;
  role: StaffRole;
  /** Expiry, epoch seconds. */
  exp: number;
};

export type MemberSession = {
  kind: "member";
  memberId: string;
  email: string;
  classKey: ClassKey;
  exp: number;
};

export type AnySession = StaffSession | MemberSession;

export const STAFF_COOKIE = "vaaca_staff_session";
export const MEMBER_COOKIE = "vaaca_member_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function sessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set (32+ random chars) to run sessions in production.",
    );
  }
  // Dev only: stable within a process so logins survive a hot reload.
  return "vaaca-dev-only-insecure-session-secret";
}

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
};

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSession(session: AnySession): Promise<string> {
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await key(),
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

/** Verifies the signature and expiry, and returns the raw payload. */
async function openToken(token: string | undefined): Promise<unknown | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  let ok = false;
  try {
    ok = await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
  } catch {
    return null;
  }
  if (!ok) return null;

  try {
    const parsed = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as { exp?: unknown };
    if (typeof parsed.exp !== "number" || parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function verifyStaffSession(
  token: string | undefined,
): Promise<StaffSession | null> {
  const s = (await openToken(token)) as StaffSession | null;
  if (!s || s.kind !== "staff") return null;
  if (typeof s.email !== "string" || !isStaffRole(s.role)) return null;
  return s;
}

export async function verifyMemberSession(
  token: string | undefined,
): Promise<MemberSession | null> {
  const s = (await openToken(token)) as MemberSession | null;
  if (!s || s.kind !== "member") return null;
  if (typeof s.email !== "string" || typeof s.memberId !== "string")
    return null;
  if (!isClassKey(s.classKey)) return null;
  return s;
}

const expiry = () => Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;

export const newStaffSession = (
  email: string,
  role: StaffRole,
): StaffSession => ({ kind: "staff", email, role, exp: expiry() });

export const newMemberSession = (
  memberId: string,
  email: string,
  classKey: ClassKey,
): MemberSession => ({
  kind: "member",
  memberId,
  email,
  classKey,
  exp: expiry(),
});
