import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  hashPassword,
  verifyAgainstAbsentAccount,
  verifyPassword,
} from "./auth";
import { readStore, writeStore } from "./persistence";
import { listObservatory } from "./gaps";
import {
  DOMAIN_IDS,
  isScored,
  type DomainId,
  type Member,
  type MemberStatus,
  type ReadinessScore,
  type ScoreStatus,
} from "@/lib/member-types";
import type { ClassKey } from "@/lib/application-types";
import type { ChamberId } from "@/lib/chambers";

/**
 * Member accounts and their readiness scores.
 *
 * The password hash never leaves this module — everything exported returns a
 * `Member`, which has no credential field at all. That keeps it structurally
 * impossible to serialise a hash into a page or API response.
 */

type StoredMember = Member & { passwordHash: string };

const MEMBERS = "members.json";
const SCORES = "readiness.json";

/** Scores keyed by member id. */
type ScoreTable = Record<string, ReadinessScore[]>;

/** Explicitly lists the fields that may leave this module — the hash is not one. */
const publicView = (m: StoredMember): Member => ({
  id: m.id,
  name: m.name,
  email: m.email,
  country: m.country,
  chamberId: m.chamberId,
  classKey: m.classKey,
  perimeter: m.perimeter ?? null,
  status: m.status,
  createdAt: m.createdAt,
  applicationId: m.applicationId,
});

const loadMembers = () => readStore<StoredMember[]>(MEMBERS, []);
const loadScores = () => readStore<ScoreTable>(SCORES, {});

/* -------------------------------------------------------------------------- */
/* Accounts                                                                    */
/* -------------------------------------------------------------------------- */

export async function findMemberByEmail(email: string): Promise<Member | null> {
  const members = await loadMembers();
  const found = members.find((m) => m.email === email.trim().toLowerCase());
  return found ? publicView(found) : null;
}

export async function getMember(id: string): Promise<Member | null> {
  const members = await loadMembers();
  const found = members.find((m) => m.id === id);
  return found ? publicView(found) : null;
}

export async function listMembers(): Promise<Member[]> {
  return (await loadMembers()).map(publicView);
}

export async function countMembers(): Promise<
  Record<ClassKey | "total", number>
> {
  const members = await loadMembers();
  const of = (k: ClassKey) => members.filter((m) => m.classKey === k).length;
  return {
    total: members.length,
    A: of("A"),
    B: of("B"),
    C: of("C"),
    D: of("D"),
    E: of("E"),
    F: of("F"),
    G: of("G"),
  };
}

/** Member accounts grouped by country, for the chapters dashboard. */
export async function membersByCountry(): Promise<Record<string, number>> {
  const members = await loadMembers();
  const out: Record<string, number> = {};
  for (const m of members) out[m.country] = (out[m.country] ?? 0) + 1;
  return out;
}

/** Credential check. Returns the member only on a correct password. */
export async function authenticateMember(
  email: string,
  password: string,
): Promise<Member | null> {
  const members = await loadMembers();
  const found = members.find((m) => m.email === email.trim().toLowerCase());
  // An unknown address costs the same as a known one, so the response time
  // does not say which addresses are registered.
  if (!found) {
    verifyAgainstAbsentAccount(password);
    return null;
  }
  return verifyPassword(password, found.passwordHash)
    ? publicView(found)
    : null;
}

export type NewMember = {
  name: string;
  email: string;
  country: string;
  chamberId: ChamberId;
  classKey: ClassKey;
  password: string;
  applicationId: string | null;
};

export async function createMember(input: NewMember): Promise<Member> {
  return writeStore<StoredMember[], Member>(MEMBERS, [], async (members) => {
    const email = input.email.trim().toLowerCase();
    if (members.some((m) => m.email === email)) {
      throw new MemberExistsError(email);
    }

    const member: StoredMember = {
      id: `mem_${randomUUID()}`,
      name: input.name.trim(),
      email,
      country: input.country,
      chamberId: input.chamberId,
      classKey: input.classKey,
      // Gate 1 has not been run yet; the class default stands until it is.
      perimeter: null,
      status: "applicant",
      createdAt: new Date().toISOString(),
      applicationId: input.applicationId,
      passwordHash: hashPassword(input.password),
    };

    return { next: [...members, member], result: publicView(member) };
  });
}

export class MemberExistsError extends Error {
  constructor(email: string) {
    super(`An account already exists for ${email}`);
    this.name = "MemberExistsError";
  }
}

/**
 * Suspend or reinstate a member. The `suspended` status BACKEND_NOTES.md
 * defines was previously unreachable: nothing called this, so the only way to
 * reach it was by rejecting an application, which is a different thing.
 */
/**
 * Record Gate 1's finding. `null` returns the member to the class default.
 *
 * Raising or lowering this is what opens or closes a readiness assessment, so
 * it is a secretariat act with the same weight as an accession decision.
 */
export async function setMemberPerimeter(
  id: string,
  perimeter: boolean | null,
): Promise<Member | null> {
  return writeStore<StoredMember[], Member | null>(
    MEMBERS,
    [],
    async (members) => {
      const index = members.findIndex((m) => m.id === id);
      if (index === -1) return { next: members, result: null };
      const updated = { ...members[index], perimeter };
      const next = [...members];
      next[index] = updated;
      return { next, result: publicView(updated) };
    },
  );
}

export async function setMemberStatus(
  id: string,
  status: MemberStatus,
): Promise<Member | null> {
  return writeStore<StoredMember[], Member | null>(
    MEMBERS,
    [],
    async (members) => {
      const index = members.findIndex((m) => m.id === id);
      if (index === -1) return { next: members, result: null };

      const updated = { ...members[index], status };
      const next = [...members];
      next[index] = updated;
      return { next, result: publicView(updated) };
    },
  );
}

/**
 * Keeps member status in step with the accession decision.
 *
 * A rejected applicant stays an `applicant` — they were never admitted, so
 * calling them "Suspended" on their own dashboard was simply wrong. The
 * rejection lives on the application record, which the dashboard shows
 * alongside this.
 *
 * `suspended` is a separate axis that staff set deliberately (see
 * `setMemberStatus`), so a suspension is never cleared by an accession
 * decision arriving afterwards.
 */
export async function syncMemberStatusForApplication(
  applicationId: string,
  applicationStatus: string,
): Promise<void> {
  const target: MemberStatus =
    applicationStatus === "approved" ? "active" : "applicant";

  await writeStore<StoredMember[], void>(MEMBERS, [], async (members) => {
    const index = members.findIndex((m) => m.applicationId === applicationId);
    if (index === -1) return { next: members, result: undefined };
    if (members[index].status === "suspended") {
      return { next: members, result: undefined };
    }
    const next = [...members];
    next[index] = { ...next[index], status: target };
    return { next, result: undefined };
  });
}

/* -------------------------------------------------------------------------- */
/* Password resets                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Staff-issued password resets.
 *
 * There is no mail transport here, so self-service reset is not possible: the
 * secretariat issues a single-use token and passes it to the member out of
 * band. Only a SHA-256 hash of the token is stored, so the file cannot be used
 * to take over an account.
 */
type ResetRecord = {
  tokenHash: string;
  memberId: string;
  expiresAt: string;
  usedAt: string | null;
  issuedBy: string;
};

const RESETS = "resets.json";
const RESET_TTL_HOURS = 24;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** Returns the plaintext token once. It is never recoverable afterwards. */
export async function issuePasswordReset(
  memberId: string,
  issuedBy: string,
): Promise<{ token: string; expiresAt: string } | null> {
  const member = await getMember(memberId);
  if (!member) return null;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + RESET_TTL_HOURS * 60 * 60 * 1000,
  ).toISOString();

  await writeStore<ResetRecord[], void>(RESETS, [], async (rows) => ({
    // Supersede any outstanding token for this member.
    next: [
      ...rows.filter((r) => r.memberId !== memberId || r.usedAt !== null),
      {
        tokenHash: hashToken(token),
        memberId,
        expiresAt,
        usedAt: null,
        issuedBy,
      },
    ],
    result: undefined,
  }));

  return { token, expiresAt };
}

export class ResetInvalidError extends Error {
  constructor() {
    super("That reset link is invalid or has expired.");
    this.name = "ResetInvalidError";
  }
}

/** Redeems a token and sets the new password. Single use. */
export async function redeemPasswordReset(
  token: string,
  newPassword: string,
): Promise<Member> {
  const tokenHash = hashToken(token);

  const memberId = await writeStore<ResetRecord[], string>(
    RESETS,
    [],
    async (rows) => {
      const index = rows.findIndex((r) => r.tokenHash === tokenHash);
      const record = index === -1 ? null : rows[index];
      if (
        !record ||
        record.usedAt !== null ||
        Date.parse(record.expiresAt) < Date.now()
      ) {
        throw new ResetInvalidError();
      }
      const next = [...rows];
      next[index] = { ...record, usedAt: new Date().toISOString() };
      return { next, result: record.memberId };
    },
  );

  return writeStore<StoredMember[], Member>(MEMBERS, [], async (members) => {
    const index = members.findIndex((m) => m.id === memberId);
    if (index === -1) throw new ResetInvalidError();
    const updated: StoredMember = {
      ...members[index],
      passwordHash: hashPassword(newPassword),
    };
    const next = [...members];
    next[index] = updated;
    return { next, result: publicView(updated) };
  });
}

/* -------------------------------------------------------------------------- */
/* Readiness scores                                                            */
/* -------------------------------------------------------------------------- */

/** A cap a still-open gap imposes on one domain. */
export type DomainCap = {
  domain: DomainId;
  /** Highest score the domain may take; 0 means it cannot be scored at all. */
  cap: number;
  gapId: string;
  reason: string;
};

/**
 * The caps currently in force, read from the live Gap Register.
 *
 * These used to be hardcoded, which meant closing a gap in the Operating System
 * changed nothing here. Deriving them means the register is what it claims to
 * be — the thing that caps scoring — and a closed gap lifts its cap everywhere.
 * Where two open gaps hit the same domain, the tighter one wins.
 */
export async function activeCaps(): Promise<Map<DomainId, DomainCap>> {
  // Read from the Observatory rather than the gap view: the cap lives on the
  // entry itself now, so an entry that is not a gap could carry one too.
  const items = await listObservatory();
  const caps = new Map<DomainId, DomainCap>();

  for (const item of items) {
    const effect = item.effect;
    if (!effect || item.status === "closed") continue;

    const current = caps.get(effect.domain);
    if (current && current.cap <= effect.cap) continue;

    caps.set(effect.domain, {
      domain: effect.domain,
      cap: effect.cap,
      gapId: item.id,
      reason: item.whatChanged.en,
    });
  }
  return caps;
}

const capStatus = (cap: DomainCap): ScoreStatus =>
  cap.cap === 0 ? "blocked" : "capped";

const capNote = (cap: DomainCap) =>
  cap.cap === 0
    ? `Cannot be scored while ${cap.gapId} is open — ${cap.reason}`
    : `Capped at ${cap.cap}/3 while ${cap.gapId} is open — ${cap.reason}`;

/**
 * A fresh scorecard. Domains covered by an open gap start capped or blocked,
 * because the framework caps them regardless of the applicant.
 */
async function blankScorecard(): Promise<ReadinessScore[]> {
  const caps = await activeCaps();
  return DOMAIN_IDS.map((domain) => {
    const cap = caps.get(domain);
    return {
      domain,
      score: null,
      status: cap ? capStatus(cap) : "not_started",
      note: cap ? capNote(cap) : null,
      updatedBy: null,
      updatedAt: null,
    };
  });
}

export async function getScores(memberId: string): Promise<ReadinessScore[]> {
  const table = await loadScores();
  return table[memberId] ?? [];
}

/** A scorecard exists only for members inside the perimeter — see `isScored`. */
export async function ensureScorecard(
  memberId: string,
  member: { classKey: ClassKey; perimeter?: boolean | null },
): Promise<ReadinessScore[]> {
  if (!isScored(member)) return [];

  return writeStore<ScoreTable, ReadinessScore[]>(SCORES, {}, async (table) => {
    if (table[memberId]?.length) {
      return { next: table, result: table[memberId] };
    }
    const card = await blankScorecard();
    return { next: { ...table, [memberId]: card }, result: card };
  });
}

export type ScorePatch = {
  score?: number | null;
  status?: ScoreStatus;
  note?: string | null;
};

/**
 * Raised when a score would exceed what the Gap Register allows. The cap is the
 * framework's central rule — a domain whose enabling instruction does not exist
 * cannot be assessed — so it is enforced here rather than left to the UI.
 */
export class ScoreCapError extends Error {
  readonly cap: DomainCap;

  constructor(cap: DomainCap) {
    super(
      cap.cap === 0
        ? `${cap.domain} cannot be scored while ${cap.gapId} is open.`
        : `${cap.domain} is capped at ${cap.cap}/3 while ${cap.gapId} is open.`,
    );
    this.name = "ScoreCapError";
    this.cap = cap;
  }
}

export async function updateScore(
  memberId: string,
  domain: DomainId,
  patch: ScorePatch,
  actor: string,
): Promise<ReadinessScore[] | null> {
  // Read the register before taking the write lock: a capped domain must not
  // accept a score above its cap, whatever the request asks for.
  if (typeof patch.score === "number") {
    const cap = (await activeCaps()).get(domain);
    if (cap && patch.score > cap.cap) throw new ScoreCapError(cap);
  }

  return writeStore<ScoreTable, ReadinessScore[] | null>(
    SCORES,
    {},
    async (table) => {
      const card = table[memberId];
      if (!card) return { next: table, result: null };

      const index = card.findIndex((s) => s.domain === domain);
      if (index === -1) return { next: table, result: null };

      const updated: ReadinessScore = {
        ...card[index],
        score: patch.score === undefined ? card[index].score : patch.score,
        status: patch.status ?? card[index].status,
        note: patch.note === undefined ? card[index].note : patch.note,
        updatedBy: actor,
        updatedAt: new Date().toISOString(),
      };

      const nextCard = [...card];
      nextCard[index] = updated;
      return {
        next: { ...table, [memberId]: nextCard },
        result: nextCard,
      };
    },
  );
}
