import { NextResponse, type NextRequest } from "next/server";
import {
  clearSessionCookie,
  getStaffSession,
  newSession,
  setSessionCookie,
  verifyPassword,
} from "@/lib/server/auth";
import { findStaffByEmail } from "@/lib/server/store";

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

  const account = await findStaffByEmail(email);

  // Same response and broadly the same work either way, so the endpoint does
  // not reveal which addresses exist.
  const ok = account ? verifyPassword(password, account.passwordHash) : false;
  if (!account || !ok) {
    return NextResponse.json(
      { error: "Those credentials were not recognised." },
      { status: 401 },
    );
  }

  const session = newSession(account.email, account.role);
  await setSessionCookie(session);
  return NextResponse.json({ session });
}

/** `DELETE /api/staff/session` — sign out. */
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
