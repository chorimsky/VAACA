import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/server/auth";
import { staffCount } from "@/lib/server/store";
import { StaffLoginForm } from "./StaffLoginForm";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Secretariat Sign-in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const requested = Array.isArray(next) ? next[0] : next;
  // Only ever bounce to an internal path, never to an attacker-supplied URL.
  const destination =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/admin";

  if (await getStaffSession()) redirect(destination);

  // With no accounts provisioned the form can never succeed, so say so rather
  // than letting someone guess at credentials that do not exist.
  const provisioned = (await staffCount()) > 0;

  const { locale, t } = await getTranslations();

  return (
    <StaffLoginForm
      provisioned={provisioned}
      destination={destination}
      locale={locale}
      t={t.auth}
      backLabel={t.nav.backToVaaca}
    />
  );
}
