/**
 * Staff roles, shared by server and client.
 *
 * Kept out of `lib/server/auth.ts` because that module is `server-only` — the
 * admin UI needs the labels, not the crypto.
 */
export const STAFF_ROLES = [
  "secretary_general",
  "standards_officer",
  "council_member",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_LABEL: Record<StaffRole, string> = {
  secretary_general: "Secretary General",
  standards_officer: "Standards & Assessment Officer",
  council_member: "Council Member",
};

/**
 * All three roles currently carry identical permissions, deliberately.
 *
 * BACKEND_NOTES.md's matrix has a single "Secretariat/Council staff" column
 * with "full" against every internal surface, so there is no specified
 * distinction to enforce, and inventing one would be a governance decision
 * rather than an implementation detail. The role is read for display — it
 * appears in each dashboard's top bar and drives which secretariat posts
 * `/institution` reports as appointed — and every write is attributed to the
 * acting account regardless of role.
 *
 * If the Council later needs narrower rights than the secretariat (for
 * example, viewing the applications queue without deciding on it), that check
 * belongs in the route handlers, next to the existing `getStaffSession()`
 * calls.
 */
export const isStaffRole = (value: unknown): value is StaffRole =>
  typeof value === "string" &&
  (STAFF_ROLES as readonly string[]).includes(value);
