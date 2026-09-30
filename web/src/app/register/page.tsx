import type { Metadata } from "next";
import { RegistrationFlow } from "./RegistrationFlow";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";
import { CLASS_KEYS } from "@/lib/application-types";
import { CHAPTERS } from "@/lib/chapters";

export async function generateMetadata(): Promise<Metadata> {
  // The title, the description and the social card all follow the
  // page's language, and the canonical URL names this page.
  const { t } = await getTranslations();
  const m = t.meta.register;
  return {
    ...(await documentMetadata(m.title, m.description)),
  };
}

export default async function RegisterPage() {
  const { locale, t } = await getTranslations();
  const classes = CLASS_KEYS.map((key) => ({
    key,
    letter: t.framework.classes[key].letter,
    who: t.framework.classes[key].who,
  }));
  // The value posted stays the canonical English name the endpoint validates;
  // only the label is translated, so the French form does not offer a list of
  // English country names.
  const countries = CHAPTERS.map((chapter) => ({
    value: chapter.name,
    label: t.chapters.names[chapter.slug as keyof typeof t.chapters.names].full,
  }));

  return (
    <RegistrationFlow
      locale={locale}
      languageLabel={t.language.label}
      t={t.auth}
      classes={classes}
      countries={countries}
    />
  );
}
