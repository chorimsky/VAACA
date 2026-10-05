import { CHAPTERS } from "./chapters";
import { CHAMBER_IDS, isChamberId, type ChamberId } from "./chambers";

/**
 * The application record shape, shared by the store, the API and the admin UI.
 *
 * Separate from `lib/server/store.ts` so the client can import the types
 * without pulling in `server-only` code.
 */

export const APPLICATION_STATUSES = [
  "submitted",
  "in_review",
  "approved",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  in_review: "In review",
  approved: "Approved",
  rejected: "Rejected",
};

/**
 * The five accession classes from Charter Part 4, with the metadata the
 * registration form renders. Previously this lived in a separate
 * `demo-account.ts` alongside a second copy of the country list, so the form
 * and the endpoint validating it were maintained independently.
 */
export const MEMBER_CLASSES = [
  { key: "A", letter: "A — Operating", who: "VASPs / exchanges" },
  { key: "B", letter: "B — Adjacent", who: "Banks, PSPs, telcos" },
  {
    key: "C",
    letter: "C — Professional",
    who: "Individuals (legal, compliance, security)",
  },
  { key: "D", letter: "D — Academic", who: "Researchers, universities" },
  {
    key: "E",
    letter: "E — Institutional",
    who: "Regulators, ministries, partners",
  },
  // F and G were added when the chambers were introduced. Civil society and
  // students had no class at all before, which meant the two groups the
  // institution most needs in the room could not complete an accession
  // request — the form had nothing for them to select.
  {
    key: "F",
    letter: "F — Civil Society",
    who: "NGOs, consumer and public-interest organizations",
  },
  {
    key: "G",
    letter: "G — Student",
    who: "Students, early-career researchers",
  },
] as const;

export const CLASS_KEYS = MEMBER_CLASSES.map((c) => c.key);
export type ClassKey = (typeof MEMBER_CLASSES)[number]["key"];

/**
 * CEMAC member states — the only accepted values on an application.
 *
 * Derived from the chapters, which are the single source of truth for the six
 * states. The form's list and this validator's list were separate arrays that
 * had to be kept in step by hand.
 */
export const COUNTRIES = CHAPTERS.map((c) => c.name);

/**
 * Which classes a chamber can accede under.
 *
 * Not a hierarchy — a narrowing. It keeps the registration form from offering a
 * university the operating class, and gives the endpoint a rule to check rather
 * than accepting any pairing a client sends.
 */
export const CHAMBER_CLASSES: Record<ChamberId, readonly ClassKey[]> = {
  financial: ["A", "B", "C", "E"],
  technology: ["A", "B", "C"],
  academia: ["D", "G"],
  "civil-society": ["F", "C"],
  professional: ["C", "D"],
  enterprise: ["B", "C"],
  international: ["E", "D", "F"],
};

export const isClassInChamber = (chamber: ChamberId, key: ClassKey) =>
  CHAMBER_CLASSES[chamber].includes(key);

export { CHAMBER_IDS, isChamberId };
export type { ChamberId };

export type AuditEvent = {
  at: string;
  actor: string;
  action: string;
  note?: string;
};

export type Application = {
  id: string;
  name: string;
  email: string;
  country: string;
  chamberId: ChamberId;
  classKey: ClassKey;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  reviewer: string | null;
  notes: string | null;
  history: AuditEvent[];
};

export const isApplicationStatus = (v: unknown): v is ApplicationStatus =>
  typeof v === "string" &&
  (APPLICATION_STATUSES as readonly string[]).includes(v);

export const isClassKey = (v: unknown): v is ClassKey =>
  typeof v === "string" && (CLASS_KEYS as readonly string[]).includes(v);
