import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/server/auth";
import { countByCountry, countByStatus } from "@/lib/server/store";
import { countMembers, membersByCountry } from "@/lib/server/members";
import { listGaps } from "@/lib/server/gaps";
import { countSeatsFilled, listSeatsForStaff } from "@/lib/server/seats";
import { OperatingSystemConsole } from "./Console";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Operating System",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Same server-side gate as the admin queue — the console holds working-draft
 * governance material that BACKEND_NOTES.md restricts to secretariat and
 * Council staff.
 */
export default async function OperatingSystemPage() {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login?next=/operating-system");

  const [
    applications,
    members,
    byCountry,
    membersPerCountry,
    gaps,
    seats,
    seatsFilled,
  ] = await Promise.all([
    countByStatus(),
    countMembers(),
    countByCountry(),
    membersByCountry(),
    listGaps(),
    listSeatsForStaff(),
    countSeatsFilled(),
  ]);

  const { locale, t } = await getTranslations();

  return (
    <OperatingSystemConsole
      locale={locale}
      languageLabel={t.language.label}
      staffEmail={session.email}
      staffRole={session.role}
      gaps={gaps}
      seats={seats}
      counts={{
        applications: applications.total,
        pendingApplications: applications.submitted + applications.in_review,
        members: members.total,
        seatsFilled,
        // The Cameroon founding chapter is the one live state; the other five
        // are still pending accession.
        statesOnboarded: 1,
      }}
      memberCounts={members}
      chapterActivity={{ applications: byCountry, members: membersPerCountry }}
    />
  );
}
