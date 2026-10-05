import "server-only";

import { readOrSeed, writeStore } from "./json-store";
import {
  COUNCIL_DEFINITIONS,
  activationBlockers,
  type CouncilId,
  type CouncilRecord,
  type CouncilSeat,
  type CouncilStatus,
} from "@/lib/council-types";

const COUNCILS = "councils.json";

/**
 * Sector councils.
 *
 * All twelve are seeded `proposed` with no composition. That is the honest
 * starting state and the one the architecture asks for — councils are meant to
 * be stood up against strategic priorities, not all at once — and it means the
 * page says "proposed" rather than implying twelve working bodies exist.
 */
const seed = (): CouncilRecord[] =>
  COUNCIL_DEFINITIONS.map((definition) => ({
    id: definition.id,
    status: "proposed" as CouncilStatus,
    quorum: 0,
    seats: [],
    activatedAt: null,
    activatedBy: null,
  }));

const load = () => readOrSeed<CouncilRecord[]>(COUNCILS, seed);

export async function listCouncils(): Promise<CouncilRecord[]> {
  return load();
}

export async function getCouncil(
  id: string,
): Promise<CouncilRecord | undefined> {
  return (await load()).find((c) => c.id === id);
}

/** Raised when activation is refused, carrying the reasons. */
export class CouncilNotReadyError extends Error {
  readonly blockers: string[];

  constructor(blockers: string[]) {
    super(`Council cannot be activated: ${blockers.join(" ")}`);
    this.name = "CouncilNotReadyError";
    this.blockers = blockers;
  }
}

/**
 * Set a council's composition and quorum. Does not activate it — a composition
 * can be drafted and revised while the council stays proposed.
 */
export async function setCouncilComposition(
  id: CouncilId,
  seats: CouncilSeat[],
  quorum: number,
): Promise<CouncilRecord | null> {
  return writeStore<CouncilRecord[], CouncilRecord | null>(
    COUNCILS,
    seed(),
    async (rows) => {
      const index = rows.findIndex((c) => c.id === id);
      if (index === -1) return { next: rows, result: null };
      const updated: CouncilRecord = { ...rows[index], seats, quorum };
      const next = [...rows];
      next[index] = updated;
      return { next, result: updated };
    },
  );
}

/**
 * Move a council between proposed, active and dormant.
 *
 * Activation is the one transition that can be refused: a council whose
 * composition one bloc could capture, or whose quorum its seats cannot meet,
 * is not a council. Standing down is always allowed — a body that has stopped
 * meeting should be able to say so.
 */
export async function setCouncilStatus(
  id: CouncilId,
  status: CouncilStatus,
  actor: string,
): Promise<CouncilRecord | null> {
  return writeStore<CouncilRecord[], CouncilRecord | null>(
    COUNCILS,
    seed(),
    async (rows) => {
      const index = rows.findIndex((c) => c.id === id);
      if (index === -1) return { next: rows, result: null };

      const current = rows[index];
      if (status === "active") {
        const blockers = activationBlockers(current);
        if (blockers.length) throw new CouncilNotReadyError(blockers);
      }

      const updated: CouncilRecord = {
        ...current,
        status,
        activatedAt:
          status === "active" ? new Date().toISOString() : current.activatedAt,
        activatedBy: status === "active" ? actor : current.activatedBy,
      };
      const next = [...rows];
      next[index] = updated;
      return { next, result: updated };
    },
  );
}
