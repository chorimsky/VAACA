import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/server/auth";
import { staffCount } from "@/lib/server/store";
import { StaffLoginForm } from "./StaffLoginForm";
import { getTranslations } from "@/lib/i18n/server";
import { routes } from "@/lib/routes";
import { documentMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  // The title, the description and the social card all follow the
  // page's language, and the canonical URL names this page.
  const { t } = await getTranslations();
  const m = t.meta.staffLogin;
  return {
    ...(await documentMetadata(m.title, m.description)),
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const requested = Array.isArray(next) ? next[0] : next;
  const { locale, t, path } = await getTranslations();

  // Only ever bounce to an internal path, never to an attacker-supplied URL.
  // The fallback carries the locale, or signing in on /fr/admin/login lands on
  // the English queue.
  const destination =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : path(routes.admin);

  if (await getStaffSession()) redirect(destination);

  // With no accounts provisioned the form can never succeed, so say so rather
  // than letting someone guess at credentials that do not exist.
  const provisioned = (await staffCount()) > 0;

  return (
    <StaffLoginForm
      provisioned={provisioned}
      destination={destination}
      locale={locale}
      t={t.auth}
      backLabel={t.nav.backToVaaca}
      languageLabel={t.language.label}
    />
  );
}
