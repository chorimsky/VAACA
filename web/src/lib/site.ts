/**
 * Canonical origin for absolute URLs (sitemap, robots, social cards).
 *
 * Set NEXT_PUBLIC_SITE_URL in the deployment environment. Vercel injects
 * VERCEL_PROJECT_PRODUCTION_URL, which is used as a fallback so preview and
 * production builds still emit correct absolute URLs without extra config.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "VAACA";

// The site description is no longer a constant here: it has to be translated,
// so it lives with the rest of the copy in `meta.home` in the dictionaries.
