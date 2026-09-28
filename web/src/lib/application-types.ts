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

export const CLASS_KEYS = ["A", "B", "C", "D", "E"] as const;
export type ClassKey = (typeof CLASS_KEYS)[number];

/** CEMAC member states — the only accepted values on an application. */
export const COUNTRIES = [
  "Cameroon",
  "Gabon",
  "Republic of the Congo",
  "Chad",
  "Central African Republic",
  "Equatorial Guinea",
] as const;

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
