import { routes } from "./routes";
import { localePath, type Locale } from "./i18n/locale";

/**
 * Cross-links between the signed-in surfaces.
 *
 * Deliberately not in `components/DashboardBar.tsx`: that module is
 * `"use client"`, and a server component calling a function exported from a
 * client module throws at render time.
 */
export type BarLink = {
  label: string;
  /** Leaves the signed-in area. Renders with an outward arrow. */
  href: string;
  external?: boolean;
};

const STAFF_SURFACES: (BarLink & { key: string })[] = [
  { key: "console", label: "Operating System", href: routes.operatingSystem },
  { key: "admin", label: "Applications", href: routes.admin },
  { key: "documents", label: "Documents", href: routes.documents },
  { key: "public", label: "Public site", href: routes.home, external: true },
];

/**
 * The other staff surfaces, minus whichever one is showing.
 *
 * Every href carries the locale. Without it a French visitor's bar linked to
 * the English copy of each surface, so one click silently switched the whole
 * session back to English.
 */
export const staffLinks = (
  current: "admin" | "console" | "documents",
  locale: Locale,
): BarLink[] =>
  STAFF_SURFACES.filter((s) => s.key !== current).map(
    ({ label, href, external }) => ({
      label,
      href: localePath(locale, href),
      external,
    }),
  );
