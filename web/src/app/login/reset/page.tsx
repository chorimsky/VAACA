import type { Metadata } from "next";
import { ResetForm } from "./ResetForm";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const value = Array.isArray(token) ? token[0] : token;
  const { locale, t } = await getTranslations();
  return <ResetForm token={value ?? ""} locale={locale} t={t.auth} />;
}
