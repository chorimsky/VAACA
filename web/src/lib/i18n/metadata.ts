import "server-only";

import type { Metadata } from "next";

import { getLocale, getPath } from "./server";
import { LOCALES, LOCALE_TAG, DEFAULT_LOCALE, localePath } from "./locale";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const absolute = (locale: (typeof LOCALES)[number], path: string) => {
  const localised = localePath(locale, path);
  return `${SITE_URL}${localised === "/" ? "" : localised}`;
};

/**
 * The parts of a page's metadata that depend on *which* page it is and *which*
 * language it is being read in: the canonical URL, the `hreflang` alternates,
 * and the social cards.
 *
 * It lives in one place because the pieces have to agree. Declaring the social
 * card once in the root layout meant every page shared the home page's title,
 * and declaring `canonical` there meant every page claimed to be the home page.
 * Middleware passes the route down on a header, so both are answerable per
 * request — which is also why a page's metadata cannot be a static object.
 */
export async function documentMetadata(
  title: string,
  description: string,
): Promise<Metadata> {
  const locale = await getLocale();
  const path = await getPath();

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      // Each page points at its own counterpart, so the two languages are
      // indexed as translations of one another rather than as duplicates.
      languages: {
        ...Object.fromEntries(
          LOCALES.map((l) => [LOCALE_TAG[l], absolute(l, path)]),
        ),
        "x-default": absolute(DEFAULT_LOCALE, path),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: absolute(locale, path),
      locale: LOCALE_TAG[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => LOCALE_TAG[l],
      ),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
