import type { ClassKey } from "./application-types";

/**
 * Member and readiness-score shapes, shared by the store, the API and the
 * dashboard. Mirrors the `Member` and `ReadinessScore` entities in
 * BACKEND_NOTES.md.
 */

export const MEMBER_STATUSES = ["applicant", "active", "suspended"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  applicant: "Applicant",
  active: "Active member",
  suspended: "Suspended",
};

export type Member = {
  id: string;
  name: string;
  email: string;
  country: string;
  classKey: ClassKey;
  status: MemberStatus;
  createdAt: string;
  /** The accession request this member registered with. */
  applicationId: string | null;
};

/* -------------------------------------------------------------------------- */
/* Readiness scoring — PSAN Framework, 8 domains × 0–3 = 24 points             */
/* -------------------------------------------------------------------------- */

export const DOMAIN_IDS = [
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

export const DOMAIN_NAME: Record<DomainId, string> = {
  D1: "Governance",
  D2: "AML/CFT",
  D3: "Custody & Security",
  D4: "Capital & Solvency",
  D5: "Consumer Protection",
  D6: "Market Integrity",
  D7: "Technology & Ops Resilience",
  D8: "Reporting & Disclosure",
};

/** What each domain assesses — shown on the public Standards page and in the console. */
export const DOMAIN_TESTS: Record<DomainId, string> = {
  D1: "Board/management structure, fit-and-proper controls, documented decision rights.",
  D2: "Customer due diligence, transaction monitoring, suspicious-activity reporting to ANIF.",
  D3: "Key management, cold/hot wallet segregation, incident response.",
  D4: "Minimum capital, client-asset segregation, insolvency-remote custody.",
  D5: "Disclosures, complaint handling, redress mechanisms.",
  D6: "Market-abuse controls, conflicts-of-interest management.",
  D7: "Change management, uptime, disaster recovery, third-party dependencies.",
  D8: "Regulatory reporting cadence, audit trail, public disclosures.",
};

/**
 * The three perimeter gates. A gate decides whether an activity is in scope at
 * all; the domains above decide whether it is ready.
 */
export const PSAN_GATES = [
  {
    n: 1,
    title: "Perimeter Test",
    body: "Does the applicant’s activity fall inside the virtual-asset perimeter at all, or is it already licensed under banking, payments, or securities law?",
  },
  {
    n: 2,
    title: "Requalification Test",
    body: "Could the activity be requalified as a security, e-money, or payment service under existing law — bypassing the PSAN category entirely?",
  },
  {
    n: 3,
    title: "Regulator Test",
    body: "Which body has actual jurisdiction today — COBAC, COSUMAF, or a future CEMAC-level virtual-asset authority — and is that body currently equipped to receive an application?",
  },
] as const;

export const MAX_SCORE = DOMAIN_IDS.length * 3;

/**
 * `capped` and `blocked` come from the Gap Register: a domain can't score above
 * its cap while the instruction gap behind it is open.
 */
export const SCORE_STATUSES = [
  "not_started",
  "in_review",
  "scored",
  "capped",
  "blocked",
] as const;
export type ScoreStatus = (typeof SCORE_STATUSES)[number];

export const SCORE_STATUS_LABEL: Record<ScoreStatus, string> = {
  not_started: "Not started",
  in_review: "In review",
  scored: "Scored",
  capped: "Capped",
  blocked: "Blocked",
};

export type ReadinessScore = {
  domain: DomainId;
  /** 0–3, or null when the domain has not been scored. */
  score: number | null;
  status: ScoreStatus;
  /** Why it is capped or blocked, usually naming a gap (G1–G10). */
  note: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type Threshold = "T0" | "T1" | "T2";

export const THRESHOLD_LABEL: Record<Threshold, string> = {
  T0: "T0 — Not ready",
  T1: "T1 — Conditionally ready",
  T2: "T2 — Regulator-ready",
};

/** The band, and what it means for a dossier. */
export const THRESHOLD_BAND: Record<
  Threshold,
  { range: string; meaning: string }
> = {
  T0: { range: `below 8/${MAX_SCORE}`, meaning: "gaps unaddressed" },
  T1: {
    range: `8–17/${MAX_SCORE}`,
    meaning: "viable with regulator sign-off",
  },
  T2: {
    range: `18–${MAX_SCORE}/${MAX_SCORE}`,
    meaning: "dossier submittable as-is",
  },
};

export const THRESHOLDS: Threshold[] = ["T0", "T1", "T2"];

/** Thresholds from the Readiness Framework: <8 T0, 8–17 T1, 18–24 T2. */
export function thresholdFor(total: number): Threshold {
  if (total >= 18) return "T2";
  if (total >= 8) return "T1";
  return "T0";
}

export const totalScore = (scores: ReadinessScore[]) =>
  scores.reduce((sum, s) => sum + (s.score ?? 0), 0);

/** Domains needing attention: anything not cleanly scored. */
export const openDomains = (scores: ReadinessScore[]) =>
  scores.filter((s) => s.status !== "scored");

/** Only operating and adjacent classes are scored against the framework. */
export const isScoredClass = (classKey: ClassKey) =>
  classKey === "A" || classKey === "B";

export const isMemberStatus = (v: unknown): v is MemberStatus =>
  typeof v === "string" && (MEMBER_STATUSES as readonly string[]).includes(v);

export const isDomainId = (v: unknown): v is DomainId =>
  typeof v === "string" && (DOMAIN_IDS as readonly string[]).includes(v);

export const isScoreStatus = (v: unknown): v is ScoreStatus =>
  typeof v === "string" && (SCORE_STATUSES as readonly string[]).includes(v);
