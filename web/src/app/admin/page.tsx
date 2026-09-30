import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/server/auth";
import { countByStatus, listApplications } from "@/lib/server/store";
import { findMemberByEmail, getScores } from "@/lib/server/members";
import { ApplicationsQueue } from "./ApplicationsQueue";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Secretariat Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The gate BACKEND_NOTES.md asks for: the session is checked on the server
 * before any application data is read, so an unauthenticated request never
 * receives applicant records — the UI is not what's protecting this.
 */
export default async function AdminPage() {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");

  const [applications, counts] = await Promise.all([
    listApplications({ sort: "newest" }),
    countByStatus(),
  ]);

  // Attach the member account and readiness card behind each application, so
  // the Standards & Assessment Officer can score without leaving the queue.
  const scorecards = Object.fromEntries(
    await Promise.all(
      applications.map(async (app) => {
        const member = await findMemberByEmail(app.email);
        return [
          app.id,
          member
            ? {
                memberId: member.id,
                status: member.status,
                scores: await getScores(member.id),
              }
            : null,
        ] as const;
      }),
    ),
  );

  const { locale, t } = await getTranslations();

  return (
    <ApplicationsQueue
      locale={locale}
      languageLabel={t.language.label}
      staffEmail={session.email}
      staffRole={session.role}
      initialApplications={applications}
      initialCounts={counts}
      scorecards={scorecards}
    />
  );
}
