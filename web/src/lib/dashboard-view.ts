import type { ClassKey } from "./application-types";
import type { Member, ReadinessScore } from "./member-types";
import {
  MAX_SCORE,
  THRESHOLD_LABEL,
  isScoredClass,
  openDomains,
  thresholdFor,
  totalScore,
} from "./member-types";

/**
 * Turns a member's own record into the dashboard's headline figures.
 *
 * The prototype hard-coded a persona per class; this derives the same shape
 * from real data, so what a member sees is their own standing and nobody
 * else's.
 */

export type Stat = { label: string; value: string; note?: string };

export const CLASS_LABEL: Record<ClassKey, string> = {
  A: "Class A — Operating VASP",
  B: "Class B — Adjacent Institution",
  C: "Class C — Professional Member",
  D: "Class D — Academic / Research",
  E: "Class E — Institutional Partner",
};

/** What each class's dashboard is for, and what it may never contain. */
export const CLASS_NOTE: Record<ClassKey, { title: string; body: string }> = {
  A: {
    title: "Status",
    body: "Your readiness score is assessed against the PSAN framework. Domains capped or blocked by an open instruction gap cannot be raised until that gap closes.",
  },
  B: {
    title: "Role",
    body: "As an adjacent institution you hold full voting rights, and you are scored against the framework where your activity falls inside the perimeter.",
  },
  C: {
    title: "Voting status",
    body: "Class C members hold limited voting rights on professional-standards matters only, and are not scored against the Readiness Framework.",
  },
  D: {
    title: "Access",
    body: "Academic members hold limited voting rights and priority access to anonymized market data once VAACA Intelligence launches.",
  },
  E: {
    title: "Observer status",
    body: "Institutional members do not vote and never receive case-level applicant data — only aggregate, anonymized reporting.",
  },
};

export const SUBLINE: Record<ClassKey, string> = {
  A: "Track your PSAN Regulatory Readiness score and respond to secretariat requests.",
  B: "Track your readiness assessment and your partnership touchpoints with VASP applicants.",
  C: "Track your accession status, certifications and working-group participation.",
  D: "Track your accession status and access to the research library.",
  E: "Observer-status access to aggregate readiness data and consultation activity.",
};

export function dashboardStats(
  member: Member,
  scores: ReadinessScore[],
  applicationStatusLabel: string,
): Stat[] {
  if (isScoredClass(member.classKey) && scores.length) {
    const total = totalScore(scores);
    const threshold = thresholdFor(total);
    const open = openDomains(scores).length;
    return [
      { label: "Readiness score", value: `${total} / ${MAX_SCORE}` },
      { label: "Rating", value: threshold, note: THRESHOLD_LABEL[threshold] },
      {
        label: "Domains outstanding",
        value: String(open),
        note: open ? "Not yet cleanly scored" : "All domains scored",
      },
    ];
  }

  return [
    { label: "Membership class", value: `Class ${member.classKey}` },
    { label: "Application", value: applicationStatusLabel },
    {
      label: "Member since",
      value: new Date(member.createdAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }),
    },
  ];
}
