/**
 * Every destination the prototypes linked to, in one place.
 *
 * The design bundle linked between sibling `.dc.html` files; this maps each of
 * those to its real route so no page hard-codes a path.
 */
export const routes = {
  home: "/",
  institution: "/institution",
  founders: "/institution#founders",
  secretariat: "/institution#secretariat",
  standards: "/standards",
  competency: "/competency",
  ecosystem: "/ecosystem",
  membership: "/membership",
  governance: "/governance",
  councils: "/councils",
  observatory: "/observatory",
  region: "/region",
  resources: "/resources",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  admin: "/admin",
  operatingSystem: "/operating-system",
  documents: "/documents",
  chapter: (slug: string) => `/chapters/${slug}`,
  council: (id: string) => `/councils/${id}`,
  // Lowercase: entry ids are written G1–G10, but every URL here is canonical
  // lowercase and middleware 308s a mis-cased path.
  observatoryItem: (id: string) => `/observatory/${id.toLowerCase()}`,
} as const;

/** Nav keys that can render as the active item. */
export type NavKey =
  | "institution"
  | "standards"
  | "ecosystem"
  | "membership"
  | "governance"
  | "region";
