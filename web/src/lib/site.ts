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

export const SITE_DESCRIPTION =
  "The regional institution organizing Central Africa's virtual-asset economy. VAACA connects industry, regulators, researchers and innovators around shared standards across the six CEMAC states.";
