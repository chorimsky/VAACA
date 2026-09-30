import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/server/member-auth";
import { getMember, getScores } from "@/lib/server/members";
import { getApplication } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/**
 * `GET /api/member/me` — the signed-in member's own record.
 *
 * Every lookup is keyed off `session.memberId`, never off anything the client
 * sends, so there is no parameter a member could change to read someone else's
 * data. That is the "own data only" rule from BACKEND_NOTES.md expressed in
 * code rather than in the UI.
 */
export async function GET() {
  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const member = await getMember(session.memberId);
  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // A session issued before the suspension stops working here too, or
  // suspending someone would only take effect the next time they signed in.
  if (member.status === "suspended") {
    return NextResponse.json(
      {
        error: "This account is suspended. Contact the secretariat.",
        code: "suspended",
      },
      { status: 403 },
    );
  }

  const [scores, application] = await Promise.all([
    getScores(member.id),
    member.applicationId ? getApplication(member.applicationId) : null,
  ]);

  return NextResponse.json({
    member,
    scores,
    application: application
      ? {
          id: application.id,
          status: application.status,
          submittedAt: application.submittedAt,
          updatedAt: application.updatedAt,
          notes: application.notes,
        }
      : null,
  });
}
