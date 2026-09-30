/**
 * Locales.
 *
 * English is served at the root (`/standards`) and French under a prefix
 * (`/fr/standards`), so every URL that existed before still resolves and a
 * French page has its own shareable, indexable address.
 *
 * The prefix is handled by a rewrite in middleware rather than an
 * `app/[locale]/` directory: the rewrite keeps `/fr/...` in the address bar
 * while the existing route tree serves it, and the locale travels to the
 * server on a request header. Five of the six CEMAC states are francophone,
 * so French is a first-class language here, not an afterthought.
 */

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The header middleware sets so server components can read the locale. */
export const LOCALE_HEADER = "x-vaaca-locale";

/** Remembers a visitor's choice across visits. */
export const LOCALE_COOKIE = "vaaca_locale";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** The `hreflang` / `<html lang>` value. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en",
  fr: "fr",
};

export const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/**
 * Splits a pathname into its locale prefix and the route beneath it.
 * `/fr/standards` -> `{ locale: "fr", path: "/standards" }`
 * `/standards`    -> `{ locale: "en", path: "/standards" }`
 */
export function splitLocale(pathname: string): {
  locale: Locale;
  path: string;
  prefixed: boolean;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    const rest = `/${segments.slice(1).join("/")}`;
    return { locale: first, path: rest === "/" ? "/" : rest, prefixed: true };
  }
  return { locale: DEFAULT_LOCALE, path: pathname, prefixed: false };
}

/**
 * The address of `path` in `locale`. The default locale is unprefixed, so
 * this is the inverse of `splitLocale`.
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Picks the best locale from an `Accept-Language` header. */
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}
