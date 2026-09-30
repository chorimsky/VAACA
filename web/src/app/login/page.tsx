import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/server/member-auth";
import { LoginForm } from "./LoginForm";
import { getTranslations } from "@/lib/i18n/server";
import { routes } from "@/lib/routes";
import { documentMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  // The title, the description and the social card all follow the
  // page's language, and the canonical URL names this page.
  const { t } = await getTranslations();
  const m = t.meta.login;
  return {
    ...(await documentMetadata(m.title, m.description)),
    robots: { index: false, follow: true },
  };
}

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; suspended?: string }>;
}) {
  const { next, suspended } = await searchParams;
  const requested = Array.isArray(next) ? next[0] : next;
  const { locale, t, path } = await getTranslations();

  // Only ever bounce to an internal path, never an attacker-supplied URL. The
  // fallback carries the locale: signing in on /fr/login used to land on the
  // English dashboard, because "/dashboard" was written out literally here.
  const destination =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : path(routes.dashboard);

  if (await getMemberSession()) redirect(destination);

  return (
    <LoginForm
      destination={destination}
      locale={locale}
      t={t.auth}
      languageLabel={t.language.label}
      suspended={suspended === "1"}
    />
  );
}
