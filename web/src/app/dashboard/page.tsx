import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/server/member-auth";
import { getMember, getScores } from "@/lib/server/members";
import { getApplication } from "@/lib/server/store";
import { STATUS_LABEL } from "@/lib/application-types";
import { Dashboard } from "./Dashboard";
import { Suspended } from "./Suspended";
import { getTranslations } from "@/lib/i18n/server";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t.meta.dashboard.title,
    description: t.meta.dashboard.description,
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

/**
 * Everything here is loaded by `session.memberId`. There is no `?role=` and no
 * id in the URL, so a member cannot address another member's record — the
 * "own data only" rule from BACKEND_NOTES.md, enforced where it counts.
 */
export default async function DashboardPage() {
  const { locale, t, path } = await getTranslations();
  const session = await getMemberSession();
  if (!session) {
    // Both halves carry the locale: the login page the visitor lands on, and
    // the page they are sent back to after signing in.
    redirect(
      `${path(routes.login)}?next=${encodeURIComponent(path(routes.dashboard))}`,
    );
  }

  const member = await getMember(session.memberId);
  if (!member) redirect(path(routes.login));

  // A member suspended while signed in loses the dashboard too, not just the
  // next sign-in. Rendered rather than redirected: `redirect()` from a page
  // that has begun streaming answers 200 with an empty shell, which is a blank
  // screen without JavaScript. None of the member's record is read here.
  if (member.status === "suspended") {
    return (
      <Suspended
        t={t.auth.suspendedPage}
        backLabel={t.nav.backToVaaca}
        homeHref={path(routes.home)}
      />
    );
  }

  const [scores, application] = await Promise.all([
    getScores(member.id),
    member.applicationId ? getApplication(member.applicationId) : null,
  ]);

  return (
    <Dashboard
      locale={locale}
      languageLabel={t.language.label}
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
