/**
 * Content for the internal Operating System console.
 *
 * All of it is working-draft material transcribed from the design bundle. In a
 * real build most of these become tables (Document, Chapter, InstructionGap,
 * Institution — see BACKEND_NOTES.md); keeping them as typed constants here
 * means the console renders identically now and the swap is one import later.
 */

import {
  DOMAIN_IDS,
  DOMAIN_NAME,
  DOMAIN_TESTS,
  THRESHOLD_BAND,
  THRESHOLD_LABEL,
  THRESHOLDS as THRESHOLD_IDS,
} from "@/lib/member-types";

import type { Evidence } from "@/lib/evidence";

export { EVIDENCE_CLASS } from "@/lib/evidence";
export type { Evidence } from "@/lib/evidence";

export type TabId =
  | "overview"
  | "access"
  | "charter"
  | "psan"
  | "coalitiondoc"
  | "coalition"
  | "members"
  | "gaps"
  | "institutions"
  | "applications"
  | "chapters"
  | "roadmap";

export const TAB_META: Record<
  TabId,
  { nav: string; title: string; sub: string }
> = {
  overview: {
    nav: "Overview",
    title: "Overview",
    sub: "VAACA · Cameroon founding chapter",
  },
  access: {
    nav: "Access & Roles",
    title: "Access & Roles",
    sub: "Who sees each surface, who is accountable for what",
  },
  charter: {
    nav: "Charter",
    title: "Institutional Charter",
    sub: "9 parts · defines VAACA as an open, non-exclusive institutional utility",
  },
  psan: {
    nav: "Readiness Framework",
    title: "PSAN Regulatory Readiness Framework",
    sub: "3 gates · 8 domains · 10-item gap register",
  },
  coalitiondoc: {
    nav: "Coalition Architecture",
    title: "Founding Coalition & Alliance Architecture",
    sub: "Positioning, seats, institutions, sequence, risk",
  },
  coalition: {
    nav: "Seats Tracker",
    title: "Seats Tracker",
    sub: "Nine founding seats, recruitment tracker",
  },
  members: {
    nav: "Members Register",
    title: "Members Register",
    sub: "Five accession classes, open and non-exclusive",
  },
  gaps: {
    nav: "Gap Register",
    title: "Gap Register",
    sub: "Ten instruction gaps from the Readiness Framework",
  },
  institutions: {
    nav: "Institutional Map",
    title: "Institutional Map",
    sub: "Priority regulators and ministries",
  },
  applications: {
    nav: "Applications",
    title: "Applications",
    sub: "PSAN intake pipeline — decisions are made in the Admin Queue",
  },
  chapters: {
    nav: "CEMAC Chapters",
    title: "CEMAC Chapters",
    sub: "All six member states, with live intake against each",
  },
  roadmap: {
    nav: "CEMAC Roadmap",
    title: "CEMAC Roadmap",
    sub: "Six member states, phased federation",
  },
};

/**
 * Sidebar order. `"divider"` renders a rule; `"admin"` renders the outbound
 * link to the Secretariat queue, which sits inside the middle group rather
 * than at the end of the nav.
 */
export type NavEntry = TabId | "divider" | "admin";

export const NAV_ORDER: NavEntry[] = [
  "overview",
  "access",
  "charter",
  "psan",
  "coalitiondoc",
  "divider",
  "coalition",
  "members",
  "gaps",
  "institutions",
  "applications",
  "admin",
  "divider",
  "chapters",
  "roadmap",
];

export type OverviewCounts = {
  applications: number;
  pendingApplications: number;
  members: number;
  seatsFilled: number;
  statesOnboarded: number;
};

/** Headline tiles, derived from the store rather than hard-coded. */
export const overviewStats = (c: OverviewCounts) => [
  {
    label: "Applications received",
    value: String(c.applications),
    note: `${c.pendingApplications} awaiting a decision`,
    bg: "bg-[linear-gradient(150deg,#0B4944,#083733)]",
  },
  {
    label: "Founding seats filled",
    value: `${c.seatsFilled} / 9`,
    note: c.seatsFilled === 0 ? "Recruitment not yet started" : "In progress",
    bg: "bg-[linear-gradient(150deg,#1F7A4D,#175E3B)]",
  },
  {
    label: "CEMAC states onboarded",
    value: `${c.statesOnboarded} / 6`,
    note: `${c.members} member account(s)`,
    bg: "bg-[linear-gradient(155deg,#866B1B,#6C5715)]",
  },
];

export const WORK_STREAMS = [
  {
    title: "Founding Documents",
    note: "Structure & evidence tags complete. Narrative content in progress.",
  },
  {
    title: "Coalition & Seats",
    note: "9 seats defined. 0 filled — recruitment not yet started.",
  },
  {
    title: "Gap Register",
    note: "10 gaps drafted with owner and status; 2 blocked on regulator designation.",
  },
];

export const WHATS_NEW = [
  "Public Registration flow (class selection → details → review → confirmation)",
  "Member Login and a role-based Member Dashboard (Classes A–E)",
  "Access & Roles tab clarifying who sees what and who owns each gap",
  "Search and filtering added to the Gap Register and Institutional Map",
  "Six CEMAC chapter pages — Cameroon included — with a chapter switcher",
  "Chapters dashboard showing live applications and members per member state",
];

export const SECRETARIAT_POSTS = [
  {
    title: "Secretary General",
    note: "Not yet appointed — required before the Charter can be ratified.",
  },
  {
    title: "Standards & Assessment Officer",
    note: "Not yet appointed — owns Readiness Framework scoring once domains are live.",
  },
];

type Audience =
  | "Public"
  | "Public entry point"
  | "Members only"
  | "Secretariat & Council"
  | "Legal review";

export const AUDIENCE_CLASS: Record<Audience, string> = {
  Public: "bg-tint-blue text-blue",
  "Public entry point": "bg-tint-blue text-blue",
  "Members only": "bg-tint-green text-green",
  "Secretariat & Council": "bg-navy text-teal-bright",
  "Legal review": "bg-tint-gold text-gold-ink",
};

export const ACCESS_ROWS: {
  surface: string;
  audience: Audience;
  purpose: string;
}[] = [
  {
    surface: "Public site (Landing + 5 chapter pages)",
    audience: "Public",
    purpose:
      "Explains the institution, membership classes and CEMAC roadmap to anyone.",
  },
  {
    surface: "Registration",
    audience: "Public",
    purpose:
      "Anyone applies for a membership class; no login required to submit interest.",
  },
  {
    surface: "Login",
    audience: "Public entry point",
    purpose: "Authenticates existing members into their dashboard.",
  },
  {
    surface: "Member Dashboard",
    audience: "Members only",
    purpose:
      "Class A–E members track their own status, referrals, research or oversight activity — never another member’s data.",
  },
  {
    surface: "Operating System (this tool)",
    audience: "Secretariat & Council",
    purpose:
      "Internal working view of documents, seats, gaps and applications before the Association formally launches.",
  },
  {
    surface: "Founding Document System",
    audience: "Legal review",
    purpose:
      "Line-by-line review of the Charter, Readiness Framework and Coalition Architecture before ratification.",
  },
];

export const RESPONSIBILITIES = [
  {
    role: "Secretary General",
    status: "Not yet appointed",
    owns: "Overall secretariat operations, PSAN application form (G1), tax-treatment liaison (G9), member-facing communications.",
  },
  {
    role: "Standards & Assessment Officer",
    status: "Not yet appointed",
    owns: "Readiness Framework domain scoring, custody standard (G4), Applications pipeline review.",
  },
  {
    role: "Legal seat (Council)",
    status: "Vacant — recruiting",
    owns: "Regulator designation (G2), capital threshold (G5), market-abuse provisions (G7).",
  },
  {
    role: "Coordination Council (9 seats)",
    status: "0 / 9 filled",
    owns: "Charter ratification, seat recruitment, T0/T1/T2 readiness decisions, conflict-of-interest recusals.",
  },
];

export const CHARTER_PARTS: {
  n: number;
  title: string;
  tag: Evidence;
  body: string;
}[] = [
  {
    n: 1,
    title: "Founding Principle",
    tag: "V",
    body: "VAACA exists to build a credible, technically competent bridge between virtual-asset market participants and CEMAC financial regulators — not to replace, lobby against, or duplicate any existing regulator, chamber, or ministry.",
  },
  {
    n: 2,
    title: "Scope",
    tag: "P",
    body: "Phase 1 scope is confined to Cameroon: virtual asset service providers (VASPs), exchanges, custodians, and the professionals who serve them. It does not claim authority over banking, payments, or securities regulation held by COBAC, COSUMAF or BEAC.",
  },
  {
    n: 3,
    title: "Open Accession",
    tag: "V",
    body: "Membership is open and non-exclusive across five classes (A–E). No applicant meeting a class’s criteria may be refused on discretionary grounds.",
  },
  {
    n: 4,
    title: "Coordination Council",
    tag: "P",
    body: "A nine-seat Coordination Council governs the Association between general assemblies. No single seat holds a standing majority; the Convenor seat chairs but carries no additional vote.",
  },
  {
    n: 5,
    title: "Operating Capacity",
    tag: "P",
    body: "A two-role secretariat — Secretary General and Standards & Assessment Officer — is the minimum operating capacity for Phase 1. Both are salaried staff, not Council seats, and report to the Council.",
  },
  {
    n: 6,
    title: "Governance Floor",
    tag: "P",
    body: "Conflicts of interest are declared and logged before any Council vote. A seat-holder with a direct commercial stake in a matter recuses from that vote.",
  },
  {
    n: 7,
    title: "Sequence",
    tag: "V",
    body: "Ratification proceeds in three steps: (1) founding-coalition sign-off on this Charter, (2) declaration at the CBA Institutional Conference, Yaoundé, October 2026, (3) formal registration as a Cameroonian association.",
  },
  {
    n: 8,
    title: "Governance Floor for Chapter Replication",
    tag: "P",
    body: "Any future CEMAC chapter (Gabon, Congo, Chad, CAR, Equatorial Guinea) adopts this Charter’s membership classes and Council structure unmodified; only local secretariat staffing and PSAN transposition are chapter-specific.",
  },
  {
    n: 9,
    title: "What This Replaces",
    tag: "I",
    body: 'This Charter supersedes earlier "prudential regulator" framing explored before v0.1; VAACA’s Cameroon chapter is positioned as advisory and standards-setting, not as a regulator.',
  },
];

export { PSAN_GATES } from "@/lib/member-types";

/**
 * The eight readiness domains, from the framework definition rather than a
 * second copy: the public Standards page and this console had drifted apart on
 * D7 ("Tech & Ops Resilience" vs "Technology & Ops Resilience").
 */
export const DOMAINS = DOMAIN_IDS.map((id) => ({
  id,
  name: DOMAIN_NAME[id],
  tests: DOMAIN_TESTS[id],
}));

export const DOSSIER_PARTS = [
  "A — Applicant identity & ownership",
  "B — Governance & fit-and-proper",
  "C — AML/CFT program",
  "D — Technology & custody architecture",
  "E — Capital & insurance",
  "F — Consumer disclosures",
  "G — Incident-response plan",
];

/** Rendered as one line per band, as the console's table expects. */
export const THRESHOLDS = THRESHOLD_IDS.map(
  (t) =>
    `${THRESHOLD_LABEL[t]}: ${THRESHOLD_BAND[t].range}, ${THRESHOLD_BAND[t].meaning}`,
);

export const COALITION_PARTS = [
  {
    n: 1,
    title: "Positioning Decision",
    body: "VAACA’s Cameroon chapter specialises in virtual-asset standards and PSAN readiness rather than competing with BAC (community advocacy) or FINTEC (innovation sandbox) — a deliberately narrow lane to avoid mandate overlap.",
  },
  {
    n: 2,
    title: "Founding Coalition",
    body: "Nine founding seats span legal, regulated finance, payments, VASP operators, compliance, cybersecurity, academia, consumer advocacy, and an independent Convenor — see Seats Tracker for recruitment status.",
  },
  {
    n: 3,
    title: "Member Identification",
    body: "Five accession classes (A–E) run from full-voting operating VASPs through observer-status institutional members — see Members Register.",
  },
];

export const PEERS = [
  {
    name: "BAC — Blockchain Association of Cameroon",
    posture:
      "Complementary, not competing: BAC runs community education and advocacy; VAACA runs standards and regulator-facing readiness work. A joint MOU should state this division explicitly.",
  },
  {
    name: "FINTEC",
    posture:
      "Referral partner: FINTEC’s innovation-sandbox applicants who reach VASP scale are the natural pipeline into VAACA’s Readiness Framework.",
  },
];

export const RISKS: {
  risk: string;
  likelihood: string;
  tag: Evidence;
  mitigation: string;
}[] = [
  {
    risk: "BAC reads VAACA as encroachment on its advocacy mandate",
    likelihood: "Medium",
    tag: "I",
    mitigation:
      "Joint MOU distinguishing mandates, signed before public launch.",
  },
  {
    risk: "No CEMAC regulator claims jurisdiction (Gate 3 fails)",
    likelihood: "High",
    tag: "P",
    mitigation:
      "VAACA operates on an advisory-only basis until a regulator is designated; framework stays interim.",
  },
  {
    risk: "Founding seats fill with a single commercial bloc",
    likelihood: "Medium",
    tag: "I",
    mitigation:
      "Governance-floor recusal rules plus a hard cap of one seat per legal entity group.",
  },
  {
    risk: "Other CEMAC states decline to adopt the Cameroon template",
    likelihood: "Medium",
    tag: "P",
    mitigation:
      "Package the Charter and Readiness Framework as adoptable-as-is, not Cameroon-specific, from v0.1 onward.",
  },
];

// The nine Council seats now live in `lib/seat-types.ts`, alongside the
// recruitment state the Operating System edits.

export const MEMBER_CLASS_ROWS = [
  { letter: "A — Operating", who: "VASPs / exchanges", voting: "Full" },
  { letter: "B — Adjacent", who: "Banks, PSPs, telcos", voting: "Full" },
  {
    letter: "C — Professional",
    who: "Individuals (legal, compliance, security)",
    voting: "Limited",
  },
  {
    letter: "D — Academic",
    who: "Researchers, universities",
    voting: "Limited",
  },
  {
    letter: "E — Institutional",
    who: "Regulators, ministries, partners",
    voting: "Observer",
  },
];

export { INSTITUTIONS } from "@/lib/institutions";
export type { Institution } from "@/lib/institutions";

export const PIPELINE = [
  {
    n: 1,
    title: "Submitted",
    desc: "Applicant files dossier Parts A–G through the secretariat.",
  },
  {
    n: 2,
    title: "Gate Review",
    desc: "Perimeter, requalification and regulator tests (Gates 1–3) applied.",
  },
  {
    n: 3,
    title: "Domain Scoring",
    desc: "Standards & Assessment Officer scores D1–D8 against the 24-point scale.",
  },
  {
    n: 4,
    title: "Council Decision",
    desc: "Coordination Council issues a T0/T1/T2 readiness rating.",
  },
];

export const ROADMAP_PHASES = [
  {
    dot: "bg-green",
    border: "border-green",
    title: "Phase 1 — Cameroon founding chapter",
    body: "Charter, Readiness Framework and Coalition ratified; nine founding seats filled; declaration signed at the CBA Institutional Conference, Yaoundé, October 2026.",
  },
  {
    dot: "bg-doc-amber",
    border: "border-doc-line",
    title: "Phase 2 — the other five CEMAC states",
    body: "Cameroon's Charter and Readiness Framework packaged as a template chapter for Gabon, Congo, Chad, CAR and Equatorial Guinea.",
  },
  {
    dot: "bg-doc-stone",
    border: "border-doc-line",
    title: "Phase 3 — CEMAC federation",
    body: "Chapters federate under the Virtual Assets Association of Central Africa once two or more national coalitions are independently operating.",
  },
];
