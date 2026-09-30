import type { Metadata } from "next";
import { ResetForm } from "./ResetForm";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  // The title, the description and the social card all follow the
  // page's language, and the canonical URL names this page.
  const { t } = await getTranslations();
  const m = t.meta.reset;
  return {
    ...(await documentMetadata(m.title, m.description)),
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const value = Array.isArray(token) ? token[0] : token;
  const { locale, t } = await getTranslations();
  return (
    <ResetForm
      token={value ?? ""}
      locale={locale}
      t={t.auth}
      languageLabel={t.language.label}
    />
  );
}
