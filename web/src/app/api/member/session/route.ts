import { NextResponse, type NextRequest } from "next/server";
import {
  clearMemberCookie,
  getMemberSession,
  setMemberCookie,
} from "@/lib/server/member-auth";
import { authenticateMember } from "@/lib/server/members";

export const dynamic = "force-dynamic";

/** `GET /api/member/session` — who am I, if anyone. */
export async function GET() {
  return NextResponse.json({ session: await getMemberSession() });
}

/** `POST /api/member/session` — member sign-in. */
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

  const member = await authenticateMember(email, password);

  // One message for both "no such account" and "wrong password", so the
  // endpoint does not reveal which addresses are registered.
  if (!member) {
    return NextResponse.json(
      { error: "Those credentials were not recognised." },
      { status: 401 },
    );
  }

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
