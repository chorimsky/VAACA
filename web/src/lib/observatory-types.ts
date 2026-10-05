import {
  GAP_EFFECT,
  type GapEffect,
  type GapOwner,
  type GapStatus,
} from "./gap-types";

/**
 * The Regulatory Observatory.
 *
 * The Instruction Gap Register was the first entry in this register, not a
 * different thing: a gap is a tracked regulatory fact with a status, an owner
 * and a consequence — and the consequence happens to be a cap on a readiness
 * domain. Generalising rather than replacing keeps the one piece of this
 * machinery that already does real work: a closed gap lifts its cap on scoring
 * everywhere, enforced server-side.
 *
 * So an observatory item is a gap plus the editorial fields a reader of a
 * regulatory tracker actually needs — what changed, why it matters, who is
 * affected, what is still unclear — and `effect` is the optional field that
 * makes one of them cap a score.
 */

export const OBSERVATORY_KINDS = [
  /** Something that does not exist yet and constrains assessment. */
  "gap",
  /** A law, decree, circular or regulation. */
  "instrument",
  /** An open consultation or call for comment. */
  "consultation",
  /** A decision, licence, sanction or supervisory action. */
  "decision",
  /** A speech, communiqué or published institutional position. */
  "statement",
] as const;

export type ObservatoryKind = (typeof OBSERVATORY_KINDS)[number];

export const OBSERVATORY_TOPICS = [
  "virtual-assets",
  "stablecoins",
  "tokenization",
  "payments",
  "banking",
  "insurance",
  "capital-markets",
  "aml-cft",
  "digital-identity",
  "cybersecurity",
  "tax",
  "consumer-protection",
] as const;

export type ObservatoryTopic = (typeof OBSERVATORY_TOPICS)[number];

/**
 * Status is the gap register's, unchanged. The four values generalise cleanly:
 * an instrument in force is `closed` in the sense that matters here — nothing
 * further is awaited — and one under revision is `in_progress`.
 */
export type ObservatoryStatus = GapStatus;

export type ObservatorySource = { label: string; url: string | null };

/**
 * Entry text, in both languages.
 *
 * Register entries are data the secretariat writes, not dictionary strings, so
 * they cannot be translated the way the rest of the site is — and leaving them
 * in one language would publish the institution's regulatory tracker in English
 * to a bloc where five of six states work in French.
 */
export type Localised = { en: string; fr: string };

/** Picks a language, falling back rather than rendering nothing. */
export const say = (
  text: Localised | null,
  locale: "en" | "fr",
): string | null => (text ? text[locale] || text.en || null : null);

/** Wraps text that exists in one language only. */
const both = (value: unknown): Localised | null => {
  if (typeof value === "string") return { en: value, fr: value };
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    if (typeof row.en === "string") {
      return { en: row.en, fr: typeof row.fr === "string" ? row.fr : row.en };
    }
  }
  return null;
};

export type ObservatoryItem = {
  id: string;
  kind: ObservatoryKind;
  /** The CEMAC state, or "CEMAC" for a regional item. */
  country: string;
  /** The body responsible — COBAC, COSUMAF, ANIF, BEAC, GABAC, a ministry. */
  institution: string;
  topic: ObservatoryTopic;
  /** One line: what this entry is. The gap register's `description`. */
  title: Localised;
  /** When it happened. Null for a standing gap, which has no date. */
  date: string | null;
  status: ObservatoryStatus;
  owner: GapOwner;

  /* The four questions §15 asks of every entry. ----------------------------- */
  /** What changed. For a gap: what is missing. */
  whatChanged: Localised;
  /** Why it matters — the gap register's `consequence`. */
  whyItMatters: Localised;
  whoIsAffected: Localised | null;
  whatIsUnclear: Localised | null;

  sources: ObservatorySource[];
  /** VAACA's own institutional response, where it has taken one. */
  response: Localised | null;

  /** Present only when this entry caps a readiness domain. */
  effect: GapEffect | null;

  note: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

/**
 * The entries that exist, lowercased for URL matching.
 *
 * Middleware needs this because a real 404 can only come from a path that has
 * no route — `notFound()` inside the page, and even inside its metadata, can
 * only swap the body under a 200 once the response has committed. The same
 * mechanism answers for the chapters and the councils.
 *
 * It is the gap register for now, which is the whole Observatory. **An endpoint
 * that creates entries has to change this**: either middleware reads the store,
 * or the check moves to a manifest the store writes. Leaving it as a constant
 * would silently soft-404 every new entry.
 */
export const OBSERVATORY_ITEM_SLUGS: readonly string[] = [
  "g1",
  "g2",
  "g3",
  "g4",
  "g5",
  "g6",
  "g7",
  "g8",
  "g9",
  "g10",
];

export const isObservatoryKind = (v: unknown): v is ObservatoryKind =>
  typeof v === "string" && (OBSERVATORY_KINDS as readonly string[]).includes(v);

export const isObservatoryTopic = (v: unknown): v is ObservatoryTopic =>
  typeof v === "string" &&
  (OBSERVATORY_TOPICS as readonly string[]).includes(v);

/**
 * Fills the fields an older gap record does not carry.
 *
 * The register predates the Observatory, so stored rows have a description, a
 * consequence and nothing else. Reading them forward rather than migrating the
 * file keeps every secretariat edit that was made before this existed.
 */
export function fromStoredGap(row: Record<string, unknown>): ObservatoryItem {
  const id = String(row.id ?? "");
  return {
    id,
    kind: (row.kind as ObservatoryKind) ?? "gap",
    country: (row.country as string) ?? "Cameroon",
    institution: (row.institution as string) ?? "Unassigned",
    topic: (row.topic as ObservatoryTopic) ?? "virtual-assets",
    title: both(row.title) ?? both(row.description) ?? { en: id, fr: id },
    date: (row.date as string) ?? null,
    status: (row.status as ObservatoryStatus) ?? "not_started",
    owner: (row.owner as GapOwner) ?? "Unassigned",
    whatChanged: both(row.whatChanged) ??
      both(row.description) ?? { en: "", fr: "" },
    whyItMatters: both(row.whyItMatters) ??
      both(row.consequence) ?? { en: "", fr: "" },
    whoIsAffected: both(row.whoIsAffected),
    whatIsUnclear: both(row.whatIsUnclear),
    sources: Array.isArray(row.sources)
      ? (row.sources as ObservatorySource[])
      : [],
    response: both(row.response),
    // A row stored before the Observatory existed carries no effect, and the
    // caps it imposes on scoring must not quietly disappear when it is read.
    effect: (row.effect as GapEffect) ?? GAP_EFFECT[id] ?? null,
    note: (row.note as string) ?? null,
    updatedBy: (row.updatedBy as string) ?? null,
    updatedAt: (row.updatedAt as string) ?? null,
  };
}
