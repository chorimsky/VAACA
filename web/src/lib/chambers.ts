/**
 * The seven institutional chambers.
 *
 * A chamber answers *which part of the ecosystem you belong to*. The accession
 * class answers *how you take part*. They are independent axes on purpose: a
 * bank and a university can both hold a full vote, and two organisations in the
 * same chamber can participate on very different terms.
 *
 * Collapsing them into one list was the obvious shortcut and it loses the thing
 * the readiness framework depends on — whether an applicant's activity falls
 * inside the virtual-asset perimeter. That question is about the activity, not
 * about the sector it sits in.
 *
 * Names and descriptions are translated; only the ids live here, because the id
 * is what gets stored on a record and must never move.
 */

export const CHAMBER_IDS = [
  "financial",
  "technology",
  "academia",
  "civil-society",
  "professional",
  "enterprise",
  "international",
] as const;

export type ChamberId = (typeof CHAMBER_IDS)[number];

export const isChamberId = (v: unknown): v is ChamberId =>
  typeof v === "string" && (CHAMBER_IDS as readonly string[]).includes(v);
