import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/server/member-auth";
import { getMember, getScores } from "@/lib/server/members";
import { getApplication } from "@/lib/server/store";
import { STATUS_LABEL } from "@/lib/application-types";
import { Dashboard } from "./Dashboard";

export const metadata: Metadata = {
  title: "Member Dashboard",
  description: "Your VAACA membership status and activity.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Everything here is loaded by `session.memberId`. There is no `?role=` and no
 * id in the URL, so a member cannot address another member's record — the
 * "own data only" rule from BACKEND_NOTES.md, enforced where it counts.
 */
export default async function DashboardPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/dashboard");

  const member = await getMember(session.memberId);
  if (!member) redirect("/login");

  const [scores, application] = await Promise.all([
    getScores(member.id),
    member.applicationId ? getApplication(member.applicationId) : null,
  ]);

  return (
    <Dashboard
      member={member}
      scores={scores}
      application={
        application
          ? {
              statusLabel: STATUS_LABEL[application.status],
              status: application.status,
              submittedAt: application.submittedAt,
              updatedAt: application.updatedAt,
              notes: application.notes,
            }
          : null
      }
    />
  );
}
