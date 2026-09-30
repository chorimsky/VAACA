import { NextResponse, type NextRequest } from "next/server";
import {
  clearMemberCookie,
  getMemberSession,
  setMemberCookie,
} from "@/lib/server/member-auth";
import { authenticateMember } from "@/lib/server/members";
import {
  SIGN_IN_LIMIT,
  checkLimit,
  clearFailures,
  clientKey,
  recordFailure,
} from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** `GET /api/member/session` — who am I, if anyone. */
export async function GET() {
  return NextResponse.json({ session: await getMemberSession() });
}

/**
 * `POST /api/member/session` — member sign-in.
 *
 * Responses carry a stable `code` alongside the message. The message is
 * English, because this is an API; the `code` is what the French pages
 * translate, so a member never reads an English error on a French screen.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Expected JSON body", code: "bad_request" },
      { status: 400 },
    );
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "email and password are required", code: "bad_request" },
      { status: 400 },
    );
  }

  const key = clientKey(request, "member");
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

  const member = await authenticateMember(email, password);

  // One message for both "no such account" and "wrong password", so the
  // endpoint does not reveal which addresses are registered.
  if (!member) {
    recordFailure(key, SIGN_IN_LIMIT);
    return NextResponse.json(
      {
        error: "Those credentials were not recognised.",
        code: "invalid_credentials",
      },
      { status: 401 },
    );
  }

  // A suspended member holds no session. Suspension was previously a label on
  // the dashboard and nothing more: the account signed in, reached the
  // dashboard and read its own record exactly as before. Refusing here is what
  // makes the status mean something, and the member is told plainly rather than
  // left guessing at a rejected password.
  if (member.status === "suspended") {
    return NextResponse.json(
      {
        error: "This account is suspended. Contact the secretariat.",
        code: "suspended",
      },
      { status: 403 },
    );
  }

  clearFailures(key);
  await setMemberCookie(member.id, member.email, member.classKey);
  return NextResponse.json({
    member: { name: member.name, classKey: member.classKey },
  });
}

/** `DELETE /api/member/session` — sign out. */
export async function DELETE() {
  await clearMemberCookie();
  return NextResponse.json({ ok: true });
}
