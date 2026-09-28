import { routes } from "./routes";

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

/** The other staff surfaces, minus whichever one is showing. */
export const staffLinks = (
  current: "admin" | "console" | "documents",
): BarLink[] =>
  STAFF_SURFACES.filter((s) => s.key !== current).map(
    ({ label, href, external }) => ({ label, href, external }),
  );
