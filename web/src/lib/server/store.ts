import "server-only";

import type { ChamberId } from "@/lib/chambers";
import { randomUUID } from "node:crypto";
import { hashPassword } from "./auth";
import {
  isStoreUnavailable,
  readOrSeed,
  readStore,
  writeStore,
} from "./persistence";
import { syncMemberStatusForApplication } from "./members";
import type { StaffRole } from "@/lib/staff-roles";
import { STATUS_LABEL } from "@/lib/application-types";
import type {
  Application,
  ApplicationStatus,
  ClassKey,
} from "@/lib/application-types";

export { APPLICATION_STATUSES, STATUS_LABEL } from "@/lib/application-types";
export type {
  Application,
  ApplicationStatus,
  AuditEvent,
  ClassKey,
} from "@/lib/application-types";

/**
 * File-backed persistence for applications and staff accounts.
 *
 * This is the seam BACKEND_NOTES.md describes: everything the app reads or
 * writes goes through the functions below, so replacing JSON files with a real
 * database means rewriting this module and nothing else.
 *
 * Caveat for deployment: serverless filesystems are ephemeral and often
 * read-only, so writes will not survive on Vercel. Point `VAACA_DATA_DIR` at a
 * persistent volume, or swap this module for a database client, before running
 * anywhere but a single long-lived server.
 */

const APPLICATIONS = "applications.json";
const STAFF = "staff.json";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type StaffAccount = {
  email: string;
  name: string;
  role: StaffRole;
  passwordHash: string;
};

/* -------------------------------------------------------------------------- */
/* Applications                                                                */
/* -------------------------------------------------------------------------- */

/** Seeded on first run so the queue isn't empty before real intake opens. */
const SEED: Omit<Application, "history">[] = [
  {
    id: "app_seed_kamdem",
    name: "Kamdem Fintech Ltd.",
    email: "contact@kamdemfintech.cm",
    country: "Cameroon",
    chamberId: "technology",
    classKey: "A",
    status: "submitted",
    submittedAt: "2026-09-02T09:00:00.000Z",
    updatedAt: "2026-09-02T09:00:00.000Z",
    reviewer: null,
    notes: null,
  },
  {
    id: "app_seed_coinbridge",
    name: "Coinbridge SARL",
    email: "ops@coinbridge.cm",
    country: "Cameroon",
    chamberId: "technology",
    classKey: "A",
    status: "submitted",
    submittedAt: "2026-08-29T09:00:00.000Z",
    updatedAt: "2026-08-29T09:00:00.000Z",
    reviewer: null,
    notes: null,
  },
  {
    id: "app_seed_afriland",
    name: "Afriland Payments",
    email: "partnerships@afriland.cm",
    country: "Cameroon",
    chamberId: "financial",
    classKey: "B",
    status: "approved",
    submittedAt: "2026-08-21T09:00:00.000Z",
    updatedAt: "2026-08-24T09:00:00.000Z",
    reviewer: "secretariat@vaaca.org",
    notes: "Credentials verified against CFIA membership.",
  },
  {
    id: "app_seed_aicha",
    name: "Aïcha N.",
    email: "aicha.n@example.com",
    country: "Cameroon",
    chamberId: "professional",
    classKey: "C",
    status: "approved",
    submittedAt: "2026-08-15T09:00:00.000Z",
    updatedAt: "2026-08-18T09:00:00.000Z",
    reviewer: "secretariat@vaaca.org",
    notes: null,
  },
  {
    id: "app_seed_novachain",
    name: "NovaChain PSP",
    email: "legal@novachain.ga",
    country: "Gabon",
    chamberId: "technology",
    classKey: "A",
    status: "in_review",
    submittedAt: "2026-09-04T09:00:00.000Z",
    updatedAt: "2026-09-06T09:00:00.000Z",
    reviewer: "standards@vaaca.org",
    notes: "Awaiting Gabon chapter convenor before Gate 3 can be assessed.",
  },
  {
    id: "app_seed_eyenga",
    name: "Dr. Eyenga M.",
    email: "eyenga@univ-ydn.cm",
    country: "Cameroon",
    chamberId: "academia",
    classKey: "D",
    status: "rejected",
    submittedAt: "2026-07-30T09:00:00.000Z",
    updatedAt: "2026-08-04T09:00:00.000Z",
    reviewer: "secretariat@vaaca.org",
    notes: "Submitted under the wrong class — invited to reapply as Class D.",
  },
];

const loadApplications = () =>
  readOrSeed<Application[]>(APPLICATIONS, () =>
    SEED.map((a) => ({
      ...a,
      history: [
        { at: a.submittedAt, actor: a.email, action: "Application submitted" },
      ],
    })),
  );

export type ApplicationQuery = {
  status?: ApplicationStatus | "all";
  search?: string;
  sort?: "newest" | "oldest" | "name";
};

export async function listApplications(
  query: ApplicationQuery = {},
): Promise<Application[]> {
  const { status = "all", search = "", sort = "newest" } = query;
  const term = search.trim().toLowerCase();

  let rows = await loadApplications();

  if (status !== "all") rows = rows.filter((a) => a.status === status);
  if (term) {
    rows = rows.filter((a) =>
      [a.name, a.email, a.country, a.classKey].some((f) =>
        f.toLowerCase().includes(term),
      ),
    );
  }

  const byDate = (a: Application, b: Application) =>
    Date.parse(b.submittedAt) - Date.parse(a.submittedAt);

  if (sort === "newest") rows = [...rows].sort(byDate);
  if (sort === "oldest") rows = [...rows].sort((a, b) => byDate(b, a));
  if (sort === "name")
    rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));

  return rows;
}

export async function getApplication(id: string): Promise<Application | null> {
  const rows = await loadApplications();
  return rows.find((a) => a.id === id) ?? null;
}

export async function countByStatus(): Promise<
  Record<ApplicationStatus | "total", number>
> {
  const rows = await loadApplications();
  return {
    total: rows.length,
    submitted: rows.filter((a) => a.status === "submitted").length,
    in_review: rows.filter((a) => a.status === "in_review").length,
    approved: rows.filter((a) => a.status === "approved").length,
    rejected: rows.filter((a) => a.status === "rejected").length,
  };
}

/** Applications grouped by country, for the chapters dashboard. */
export async function countByCountry(): Promise<
  Record<string, { total: number; pending: number; approved: number }>
> {
  const rows = await loadApplications();
  const out: Record<
    string,
    { total: number; pending: number; approved: number }
  > = {};
  for (const a of rows) {
    const bucket = (out[a.country] ??= { total: 0, pending: 0, approved: 0 });
    bucket.total += 1;
    if (a.status === "submitted" || a.status === "in_review")
      bucket.pending += 1;
    if (a.status === "approved") bucket.approved += 1;
  }
  return out;
}

export type NewApplication = {
  name: string;
  email: string;
  country: string;
  chamberId: ChamberId;
  classKey: ClassKey;
};

export async function createApplication(
  input: NewApplication,
): Promise<Application> {
  await loadApplications(); // seed on first run before appending
  return writeStore<Application[], Application>(
    APPLICATIONS,
    [],
    async (rows) => {
      const now = new Date().toISOString();
      const application: Application = {
        id: `app_${randomUUID()}`,
        ...input,
        status: "submitted",
        submittedAt: now,
        updatedAt: now,
        reviewer: null,
        notes: null,
        history: [
          { at: now, actor: input.email, action: "Application submitted" },
        ],
      };
      return { next: [application, ...rows], result: application };
    },
  );
}

/**
 * Removes an application. Only used to roll back a half-finished registration —
 * accession decisions are recorded, never deleted.
 */
export async function deleteApplication(id: string): Promise<void> {
  await writeStore<Application[], void>(APPLICATIONS, [], async (rows) => ({
    next: rows.filter((a) => a.id !== id),
    result: undefined,
  }));
}

export type ApplicationPatch = {
  status?: ApplicationStatus;
  notes?: string | null;
};

export async function updateApplication(
  id: string,
  patch: ApplicationPatch,
  actor: string,
): Promise<Application | null> {
  await loadApplications();
  const updated = await writeStore<Application[], Application | null>(
    APPLICATIONS,
    [],
    async (rows) => {
      const index = rows.findIndex((a) => a.id === id);
      if (index === -1) return { next: rows, result: null };

      const current = rows[index];
      const now = new Date().toISOString();
      const history = [...current.history];

      if (patch.status && patch.status !== current.status) {
        history.push({
          at: now,
          actor,
          action: `Status changed from ${STATUS_LABEL[current.status]} to ${STATUS_LABEL[patch.status]}`,
          note: patch.notes ?? undefined,
        });
      } else if (patch.notes !== undefined && patch.notes !== current.notes) {
        history.push({ at: now, actor, action: "Notes updated" });
      }

      const next: Application = {
        ...current,
        status: patch.status ?? current.status,
        notes: patch.notes === undefined ? current.notes : patch.notes,
        reviewer: patch.status ? actor : current.reviewer,
        updatedAt: now,
        history,
      };

      const rowsNext = [...rows];
      rowsNext[index] = next;
      return { next: rowsNext, result: next };
    },
  );

  // An accession decision moves the member's own status with it.
  if (updated && patch.status) {
    await syncMemberStatusForApplication(updated.id, updated.status);
  }
  return updated;
}

/* -------------------------------------------------------------------------- */
/* Staff accounts                                                              */
/* -------------------------------------------------------------------------- */

/**
 * On first run, seed one account from env so the area is reachable without a
 * migration step. `STAFF_SEED_PASSWORD` is only read at seed time.
 */
async function loadStaff(): Promise<StaffAccount[]> {
  const existing = await readStore<StaffAccount[] | null>(STAFF, null);
  if (existing) return existing;

  const email = process.env.STAFF_SEED_EMAIL ?? "secretariat@vaaca.org";
  const password = process.env.STAFF_SEED_PASSWORD;
  if (!password) return [];

  const seeded: StaffAccount[] = [
    {
      email: email.toLowerCase(),
      name: "Secretary General",
      role: "secretary_general",
      passwordHash: hashPassword(password),
    },
  ];

  try {
    await writeStore<StaffAccount[], void>(STAFF, [], async () => ({
      next: seeded,
      result: undefined,
    }));
  } catch (error) {
    // A store that cannot be written to is not a reason for a public page to
    // fail: `/institution` reads this to say which secretariat posts are
    // filled. The account is derived from the environment on every read, so
    // sign-in keeps working — only the persisted copy is missing.
    if (!isStoreUnavailable(error)) throw error;
  }
  return seeded;
}

export async function findStaffByEmail(
  email: string,
): Promise<StaffAccount | null> {
  const staff = await loadStaff();
  return staff.find((s) => s.email === email.trim().toLowerCase()) ?? null;
}

export async function staffCount(): Promise<number> {
  return (await loadStaff()).length;
}

/**
 * Which secretariat roles are filled.
 *
 * Returns only the set of roles, never names or addresses: the public
 * Institution page needs to say whether a post is appointed, and nothing more.
 * It used to assert "Not yet appointed" for both posts from a constant, which
 * became untrue the moment an account was provisioned.
 */
export async function filledStaffRoles(): Promise<Set<StaffRole>> {
  return new Set((await loadStaff()).map((s) => s.role));
}
