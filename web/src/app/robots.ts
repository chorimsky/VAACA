import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { LOCALES, localePath } from "@/lib/i18n/locale";

const PRIVATE = ["/operating-system", "/admin", "/documents", "/dashboard"];

/**
 * Keeps crawlers out of the internal and member-only surfaces. This is a
 * courtesy signal, not access control — those routes still need the
 * server-side `staff_role` check described in BACKEND_NOTES.md.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Once per locale: `/fr/admin` is the same surface as `/admin`, and a
      // rule naming only the English path leaves the French one crawlable.
      disallow: LOCALES.flatMap((locale) =>
        PRIVATE.map((path) => localePath(locale, path)),
      ),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
