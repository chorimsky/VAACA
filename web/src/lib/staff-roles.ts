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

export const isStaffRole = (value: unknown): value is StaffRole =>
  typeof value === "string" &&
  (STAFF_ROLES as readonly string[]).includes(value);
