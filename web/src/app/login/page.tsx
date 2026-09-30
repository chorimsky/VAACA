import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/server/member-auth";
import { LoginForm } from "./LoginForm";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Member Login",
  description: "Sign in to the VAACA member portal.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const requested = Array.isArray(next) ? next[0] : next;
  // Only ever bounce to an internal path, never an attacker-supplied URL.
  const destination =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/dashboard";

  if (await getMemberSession()) redirect(destination);

  const { locale, t } = await getTranslations();
  return <LoginForm destination={destination} locale={locale} t={t.auth} />;
}
