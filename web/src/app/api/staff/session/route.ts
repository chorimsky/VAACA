import { NextResponse, type NextRequest } from "next/server";
import {
  clearSessionCookie,
  getStaffSession,
  newSession,
  setSessionCookie,
  verifyAgainstAbsentAccount,
  verifyPassword,
} from "@/lib/server/auth";
import { findStaffByEmail } from "@/lib/server/store";
import {
  SIGN_IN_LIMIT,
  checkLimit,
  clearFailures,
  clientKey,
  recordFailure,
} from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** `GET /api/staff/session` — who am I, if anyone. */
export async function GET() {
  const session = await getStaffSession();
  return NextResponse.json({ session });
}

/** `POST /api/staff/session` — sign in. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  const key = clientKey(request, "staff");
  const limit = checkLimit(key, SIGN_IN_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many sign-in attempts. Try again shortly.",
        code: "rate_limited",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const account = await findStaffByEmail(email);

  // Same response *and* the same work either way, so neither the message nor
  // the response time reveals which addresses exist. The absent-account branch
  // used to skip the hash entirely and answer ten times faster.
  const ok = account
    ? verifyPassword(password, account.passwordHash)
    : verifyAgainstAbsentAccount(password);
  if (!account || !ok) {
    recordFailure(key, SIGN_IN_LIMIT);
    return NextResponse.json(
      {
        error: "Those credentials were not recognised.",
        code: "invalid_credentials",
      },
      { status: 401 },
    );
  }

  clearFailures(key);
  const session = newSession(account.email, account.role);
  await setSessionCookie(session);
  return NextResponse.json({ session });
}

/** `DELETE /api/staff/session` — sign out. */
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
