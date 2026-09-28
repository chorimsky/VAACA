import "server-only";

import { cookies } from "next/headers";
import {
  MEMBER_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  newMemberSession,
  signSession,
  verifyMemberSession,
} from "@/lib/session-token";
import type { MemberSession } from "@/lib/session-token";
import type { ClassKey } from "@/lib/application-types";

export { newMemberSession } from "@/lib/session-token";
export type { MemberSession } from "@/lib/session-token";

/**
 * Member sessions, separate from staff sessions in both cookie and payload.
 *
 * BACKEND_NOTES.md: a member sees "own data only … never another member's
 * data". The session carries the member id, and every dashboard read is keyed
 * off that id rather than off anything the client can supply.
 */

export async function setMemberCookie(
  memberId: string,
  email: string,
  classKey: ClassKey,
) {
  const jar = await cookies();
  jar.set(
    MEMBER_COOKIE,
    await signSession(newMemberSession(memberId, email, classKey)),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  );
}

export async function clearMemberCookie() {
  const jar = await cookies();
  jar.delete(MEMBER_COOKIE);
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const jar = await cookies();
  return verifyMemberSession(jar.get(MEMBER_COOKIE)?.value);
}
