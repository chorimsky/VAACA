import "server-only";

import { headers } from "next/headers";

import { dictionary, type Dictionary } from "./dictionaries";
import {
  DEFAULT_LOCALE,
  LOCALE_HEADER,
  isLocale,
  localePath,
  type Locale,
} from "./locale";

/**
 * The locale for the current request, read from the header middleware sets
 * when it rewrites a `/fr/...` URL onto the shared route tree.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The locale and its dictionary, which is what most pages actually want. */
export async function getTranslations(): Promise<{
  locale: Locale;
  t: Dictionary;
  /** Builds a link in the current locale. */
  path: (to: string) => string;
}> {
  const locale = await getLocale();
  return {
    locale,
    t: dictionary(locale),
    path: (to: string) => localePath(locale, to),
  };
}
