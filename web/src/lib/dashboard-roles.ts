import type { Tone } from "@/components/Tag";
import type { ClassKey } from "./application-types";

/** Why a quick action isn't live yet — the site is pre-launch throughout. */
const NO_SECRETARIAT = "Available once the secretariat is appointed.";
const NO_INTAKE = "Available once member intake opens.";
const NO_MEMBERS = "Available once the members register is populated.";

/**
 * Per-class dashboard content.
 *
 * In the prototype the class came from a `?role=` query param; BACKEND_NOTES
 * flags that as a demo shortcut and says the real build reads it from the
 * authenticated session. The shape below is what that endpoint should return.
 */
export type RoleView = {
  /** Short label for the "Preview as" switcher. */
  switcherLabel: string;
  classLabel: string;
  greeting: string;
  subline: string;
  stats: { label: string; value: string; note?: string }[];
  mainTitle: string;
  mainItems: { title: string; sub: string; tag: string; tone: Tone }[];
  /** A quick action links out when a real destination exists today;
   *  otherwise it renders disabled with `pending` explaining why. */
  actions: { label: string; href?: string; pending?: string }[];
  noteTitle: string;
  noteBody: string;
};

export const ROLE_VIEWS: Record<ClassKey, RoleView> = {
  A: {
    switcherLabel: "VASP Operator",
    classLabel: "Class A — Operating VASP",
    greeting: "Welcome back, Kamdem Fintech Ltd.",
    subline:
      "Track your PSAN Regulatory Readiness score and respond to secretariat requests.",
    stats: [
      { label: "Readiness score", value: "11 / 24" },
      { label: "Rating", value: "T2" },
      { label: "Open action items", value: "3" },
    ],
    mainTitle: "Readiness domain scores",
    mainItems: [
      {
        title: "D1 · Governance",
        sub: "Board structure and policies submitted",
        tag: "Scored 2/3",
        tone: "green",
      },
      {
        title: "D2 · AML/CFT",
        sub: "Awaiting ANIF travel-rule guidance (Gap G3)",
        tag: "Capped 1/3",
        tone: "gold",
      },
      {
        title: "D3 · Custody & Security",
        sub: "Cold-storage attestation under review",
        tag: "In review",
        tone: "blue",
      },
      {
        title: "D5 · Consumer Protection",
        sub: "No redress channel exists yet (Gap G6)",
        tag: "Blocked",
        tone: "red",
      },
    ],
    actions: [
      { label: "Upload compliance document", pending: NO_SECRETARIAT },
      { label: "Message the secretariat", pending: NO_SECRETARIAT },
      { label: "View full Readiness Framework", href: "/standards" },
    ],
    noteTitle: "Status",
    noteBody:
      "Your application is active but not yet regulator-ready. 3 of 10 CAVAA-tracked instruction gaps directly cap your score.",
  },

  B: {
    switcherLabel: "Adjacent Institution",
    classLabel: "Class B — Adjacent Institution",
    greeting: "Welcome back, Afriland Payments",
    subline:
      "Manage your referral pipeline and partnership touchpoints with VASP applicants.",
    stats: [
      { label: "Active referrals", value: "2" },
      { label: "Partnership MOUs", value: "1" },
      { label: "Working groups", value: "1" },
    ],
    mainTitle: "Referral pipeline",
    mainItems: [
      {
        title: "Coinbridge SARL",
        sub: "Referred to Readiness Framework intake",
        tag: "Stage 2",
        tone: "blue",
      },
      {
        title: "NovaChain PSP",
        sub: "Awaiting compliance introduction call",
        tag: "Stage 1",
        tone: "neutral",
      },
      {
        title: "AML/CFT working group",
        sub: "Monthly technical session, next Oct 14",
        tag: "Ongoing",
        tone: "green",
      },
    ],
    actions: [
      { label: "Refer a new applicant", pending: NO_INTAKE },
      { label: "View MOU status", pending: NO_SECRETARIAT },
      { label: "Join a working group", pending: NO_SECRETARIAT },
    ],
    noteTitle: "Role",
    noteBody:
      "As an adjacent institution, you hold full voting rights but are not directly scored against the Readiness Framework.",
  },

  C: {
    switcherLabel: "Professional",
    classLabel: "Class C — Professional Member",
    greeting: "Welcome back, Aïcha N.",
    subline:
      "Track your certifications, working-group participation and training credits.",
    stats: [
      { label: "CE credits", value: "6 / 10" },
      { label: "Certifications", value: "1" },
      { label: "Working groups", value: "2" },
    ],
    mainTitle: "Professional development",
    mainItems: [
      {
        title: "PSAN Readiness Assessor (Level 1)",
        sub: "Certified — expires Sept 2027",
        tag: "Active",
        tone: "green",
      },
      {
        title: "AML/CFT working group",
        sub: "Contributing to travel-rule guidance draft",
        tag: "Ongoing",
        tone: "blue",
      },
      {
        title: "Consumer Protection working group",
        sub: "Not yet joined",
        tag: "Open",
        tone: "neutral",
      },
    ],
    actions: [
      { label: "Log continuing-education hours", pending: NO_SECRETARIAT },
      { label: "Join a working group", pending: NO_SECRETARIAT },
      { label: "Download member directory", pending: NO_MEMBERS },
    ],
    noteTitle: "Voting status",
    noteBody:
      "Class C members hold limited voting rights on professional-standards matters only.",
  },

  D: {
    switcherLabel: "Academic",
    classLabel: "Class D — Academic / Research",
    greeting: "Welcome back, Dr. Eyenga M.",
    subline:
      "Access the research library and submit data requests to the secretariat.",
    stats: [
      { label: "Papers published", value: "2" },
      { label: "Data requests", value: "1 pending" },
      { label: "Academy courses", value: "0" },
    ],
    mainTitle: "Research activity",
    mainItems: [
      {
        title: "CEMAC VASP Market Sizing (2026)",
        sub: "Submitted for secretariat review",
        tag: "In review",
        tone: "blue",
      },
      {
        title: "AML/CFT typologies dataset",
        sub: "Access request pending approval",
        tag: "Pending",
        tone: "gold",
      },
      {
        title: "VAACA Academy — Readiness Framework 101",
        sub: "Not yet launched",
        tag: "Planned",
        tone: "neutral",
      },
    ],
    actions: [
      { label: "Submit a paper", pending: NO_SECRETARIAT },
      { label: "Request dataset access", pending: NO_SECRETARIAT },
      { label: "Propose a research partnership", pending: NO_SECRETARIAT },
    ],
    noteTitle: "Access",
    noteBody:
      "Academic members hold limited voting rights and priority access to anonymized market data once VAACA Intelligence launches.",
  },

  E: {
    switcherLabel: "Institutional Partner",
    classLabel: "Class E — Institutional Partner",
    greeting: "Welcome back, COSUMAF Liaison Office",
    subline:
      "Observer-status access to aggregate readiness data and consultation activity.",
    stats: [
      { label: "Active applicants tracked", value: "1" },
      { label: "Consultations open", value: "2" },
      { label: "Briefings this quarter", value: "1" },
    ],
    mainTitle: "Regulatory engagement",
    mainItems: [
      {
        title: "Aggregate Readiness Framework report",
        sub: "Q3 2026 — no case-level applicant data included",
        tag: "Published",
        tone: "green",
      },
      {
        title: "Consultation: custody prudential standard",
        sub: "VAACA response drafted, awaiting your comments",
        tag: "Open",
        tone: "blue",
      },
      {
        title: "Founding Declaration briefing",
        sub: "Yaoundé, October 2026",
        tag: "Scheduled",
        tone: "neutral",
      },
    ],
    actions: [
      { label: "Comment on a consultation", pending: NO_SECRETARIAT },
      { label: "Request a briefing", pending: NO_SECRETARIAT },
      { label: "Download aggregate report", href: "/resources" },
    ],
    noteTitle: "Observer status",
    noteBody:
      "Institutional members do not vote and never receive case-level applicant data — only aggregate, anonymized reporting.",
  },
};

export const ROLE_KEYS = Object.keys(ROLE_VIEWS) as ClassKey[];
