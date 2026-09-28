import type { DomainId } from "./member-types";

/**
 * The Instruction Gap Register — the `InstructionGap` entity in
 * BACKEND_NOTES.md, and the design's own "Living document".
 *
 * A gap is a missing regulatory instruction that caps or blocks a readiness
 * domain. Shared between the store, the API and the Operating System console.
 */

export const GAP_STATUSES = [
  "not_started",
  "in_progress",
  "blocked",
  "closed",
] as const;

export type GapStatus = (typeof GAP_STATUSES)[number];

export const GAP_STATUS_LABEL: Record<GapStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  closed: "Closed",
};

/** Reuses the console's evidence palette: closed reads verified, blocked reads interpretation. */
export const GAP_STATUS_CLASS: Record<GapStatus, string> = {
  not_started: "bg-doc-tint-p text-teal-ink",
  in_progress: "bg-doc-tint-v text-green",
  blocked: "bg-tint-gold text-gold-ink",
  closed: "bg-doc-tint-v text-green",
};

export const GAP_OWNERS = [
  "Secretary General",
  "Standards & Assessment Officer",
  "Legal seat",
  "Compliance seat",
  "Consumer seat",
  "Cybersecurity seat",
  "Convenor",
  "Unassigned",
] as const;

export type GapOwner = (typeof GAP_OWNERS)[number];

export type InstructionGap = {
  id: string;
  /** What is missing. */
  description: string;
  /** What happens to scoring while it stays open. */
  consequence: string;
  owner: GapOwner;
  status: GapStatus;
  /** Free-text progress note from the secretariat. */
  note: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

/* -------------------------------------------------------------------------- */
/* What a gap does to readiness scoring                                        */
/* -------------------------------------------------------------------------- */

/**
 * The scoring consequence each gap carries, taken from its own `consequence`
 * text in the register:
 *
 * - G3 — "D2 scores capped at 1/3 until ANIF issues sector guidance."
 * - G5 — "D4 unscoreable; framework flags as pending regulator instruction."
 * - G6 — "D5 capped; VAACA ombuds function proposed as interim measure."
 *
 * `cap` is the highest score the domain may take while the gap is open, so 0
 * means the domain cannot be scored at all. The other seven gaps constrain
 * gates or reporting rather than a single domain's score, so they cap nothing.
 *
 * This is the one place the mapping lives: the scorecard derives its caps from
 * here against the live register, so closing a gap in the Operating System
 * lifts the cap instead of leaving the two to disagree.
 */
export type GapEffect = { domain: DomainId; cap: number };

export const GAP_EFFECT: Partial<Record<string, GapEffect>> = {
  G3: { domain: "D2", cap: 1 },
  G5: { domain: "D4", cap: 0 },
  G6: { domain: "D5", cap: 1 },
};

export const isGapStatus = (v: unknown): v is GapStatus =>
  typeof v === "string" && (GAP_STATUSES as readonly string[]).includes(v);

export const isGapOwner = (v: unknown): v is GapOwner =>
  typeof v === "string" && (GAP_OWNERS as readonly string[]).includes(v);
