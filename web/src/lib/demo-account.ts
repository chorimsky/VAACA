/**
 * Shared registration constants.
 *
 * The localStorage "demo account" this file used to hold is gone: members now
 * have real server-side accounts created at registration (see
 * `lib/server/members.ts`). Only the option lists the forms render remain.
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
] as const;

export type ClassKey = (typeof MEMBER_CLASSES)[number]["key"];

export const COUNTRIES = [
  "Cameroon",
  "Gabon",
  "Republic of the Congo",
  "Chad",
  "Central African Republic",
  "Equatorial Guinea",
] as const;

export const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
