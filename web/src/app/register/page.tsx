import type { Metadata } from "next";
import { RegistrationFlow } from "./RegistrationFlow";
import { getTranslations } from "@/lib/i18n/server";
import { CLASS_KEYS } from "@/lib/application-types";

export const metadata: Metadata = {
  title: "Join / Register",
  description:
    "Apply for VAACA membership — choose your accession class, submit your details and register your interest ahead of the Charter's ratification.",
};

export default async function RegisterPage() {
  const { locale, t } = await getTranslations();
  const classes = CLASS_KEYS.map((key) => ({
    key,
    letter: t.framework.classes[key].letter,
    who: t.framework.classes[key].who,
  }));
  return <RegistrationFlow locale={locale} t={t.auth} classes={classes} />;
}
