import type { MetadataRoute } from "next";
import { CHAPTERS } from "@/lib/chapters";
import { routes } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";
import { LOCALES, localePath } from "@/lib/i18n/locale";

/**
 * Public pages only. The internal surfaces (operating system, admin, document
 * review) and the member portal are deliberately excluded — they also carry
 * `robots: noindex` in their own metadata.
 *
 * Each page is listed once per locale, with `alternates.languages` pointing at
 * its counterpart, so a search engine indexes the French pages as French
 * rather than as duplicates of the English ones.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: { path: string; priority: number }[] = [
    { path: routes.home, priority: 1 },
    { path: routes.institution, priority: 0.9 },
    { path: routes.standards, priority: 0.9 },
    { path: routes.ecosystem, priority: 0.8 },
    { path: routes.membership, priority: 0.9 },
    { path: routes.governance, priority: 0.8 },
    { path: routes.region, priority: 0.8 },
    { path: routes.resources, priority: 0.7 },
    { path: routes.register, priority: 0.7 },
    { path: routes.login, priority: 0.4 },
    ...CHAPTERS.map((c) => ({ path: routes.chapter(c.slug), priority: 0.6 })),
  ];

  const absolute = (locale: (typeof LOCALES)[number], path: string) => {
    const localised = localePath(locale, path);
    return `${SITE_URL}${localised === "/" ? "" : localised}`;
  };

  return pages.flatMap(({ path, priority }) =>
    LOCALES.map((locale) => ({
      url: absolute(locale, path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((other) => [other, absolute(other, path)]),
        ),
      },
    })),
  );
}
