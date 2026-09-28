import "server-only";

import { readOrSeed, writeStore } from "./json-store";
import type { GapOwner, GapStatus, InstructionGap } from "@/lib/gap-types";

/**
 * The Instruction Gap Register, persisted.
 *
 * It was a read-only constant in the console; BACKEND_NOTES.md gives the
 * secretariat full edit rights over it and the design tags it a "Living
 * document", so it lives in the store and every change is attributed.
 */

const GAPS = "gaps.json";

/** The ten gaps from the Readiness Framework, as drafted in the bundle. */
const SEED: Omit<InstructionGap, "note" | "updatedBy" | "updatedAt">[] = [
  {
    id: "G1",
    description:
      "No published PSAN application form or fee schedule in Cameroon.",
    consequence:
      "Applicants cannot self-file; VAACA becomes the de facto intake point.",
    owner: "Secretary General",
    status: "in_progress",
  },
  {
    id: "G2",
    description:
      "No designated regulator for pure virtual-asset activity (vs. banking/securities).",
    consequence:
      "Gate 3 fails by default; escalation to COBAC/COSUMAF required case-by-case.",
    owner: "Legal seat",
    status: "blocked",
  },
  {
    id: "G3",
    description: "AML/CFT travel-rule guidance not adapted for virtual assets.",
    consequence: "D2 scores capped at 1/3 until ANIF issues sector guidance.",
    owner: "Compliance seat",
    status: "not_started",
  },
  {
    id: "G4",
    description:
      "No custody-specific prudential standard (cold storage, proof-of-reserves).",
    consequence: "D3 relies on VAACA’s own interim standard, not law.",
    owner: "Standards & Assessment Officer",
    status: "in_progress",
  },
  {
    id: "G5",
    description: "No minimum-capital threshold set for VASPs.",
    consequence:
      'D4 unscoreable; framework flags as "pending regulator instruction."',
    owner: "Legal seat",
    status: "not_started",
  },
  {
    id: "G6",
    description:
      "Consumer-redress channel does not exist for virtual-asset disputes.",
    consequence:
      "D5 capped; VAACA ombuds function proposed as interim measure.",
    owner: "Consumer seat",
    status: "not_started",
  },
  {
    id: "G7",
    description: "No market-abuse rule contemplates token markets.",
    consequence: "D6 relies on general commercial-law fraud provisions only.",
    owner: "Legal seat",
    status: "not_started",
  },
  {
    id: "G8",
    description: "No incident-disclosure timeline mandated for VASP breaches.",
    consequence: "D7/D8 self-reported only; no regulator deadline exists.",
    owner: "Cybersecurity seat",
    status: "not_started",
  },
  {
    id: "G9",
    description: "Tax treatment of virtual-asset gains undefined (DGI silent).",
    consequence: "Applicants file under general income-tax rules by default.",
    owner: "Secretary General",
    status: "not_started",
  },
  {
    id: "G10",
    description:
      "No cross-border recognition of a Cameroon PSAN license by other CEMAC states.",
    consequence:
      "Each of the other 5 CEMAC states requires a fresh application until federation.",
    owner: "Convenor",
    status: "blocked",
  },
];

const load = () =>
  readOrSeed<InstructionGap[]>(GAPS, () =>
    SEED.map((g) => ({ ...g, note: null, updatedBy: null, updatedAt: null })),
  );

export async function listGaps(): Promise<InstructionGap[]> {
  return load();
}

export async function countGaps(): Promise<{
  total: number;
  open: number;
  blocked: number;
  closed: number;
}> {
  const gaps = await load();
  return {
    total: gaps.length,
    open: gaps.filter((g) => g.status !== "closed").length,
    blocked: gaps.filter((g) => g.status === "blocked").length,
    closed: gaps.filter((g) => g.status === "closed").length,
  };
}

export type GapPatch = {
  status?: GapStatus;
  owner?: GapOwner;
  note?: string | null;
};

export async function updateGap(
  id: string,
  patch: GapPatch,
  actor: string,
): Promise<InstructionGap | null> {
  await load(); // seed before the first write
  return writeStore<InstructionGap[], InstructionGap | null>(
    GAPS,
    [],
    async (gaps) => {
      const index = gaps.findIndex((g) => g.id === id);
      if (index === -1) return { next: gaps, result: null };

      const updated: InstructionGap = {
        ...gaps[index],
        status: patch.status ?? gaps[index].status,
        owner: patch.owner ?? gaps[index].owner,
        note: patch.note === undefined ? gaps[index].note : patch.note,
        updatedBy: actor,
        updatedAt: new Date().toISOString(),
      };

      const next = [...gaps];
      next[index] = updated;
      return { next, result: updated };
    },
  );
}
