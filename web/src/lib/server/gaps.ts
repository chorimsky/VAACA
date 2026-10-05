import "server-only";

import {
  countItems,
  filterItems,
  listItems,
  updateItem,
  type ItemPatch,
} from "./observatory";
import type { GapOwner, GapStatus, InstructionGap } from "@/lib/gap-types";
import type { ObservatoryItem } from "@/lib/observatory-types";

/**
 * The Instruction Gap Register, as a view over the Regulatory Observatory.
 *
 * The register is not a separate store any more — a gap is an observatory entry
 * whose consequence happens to be a cap on a readiness domain. This keeps the
 * shape the console, the API and the scoring rule already read, so the
 * generalisation did not require any of them to change.
 */

const toGap = (item: ObservatoryItem): InstructionGap => ({
  id: item.id,
  // The console is a staff surface and reads plain strings; the register's
  // bilingual text is picked up by the public Observatory pages instead.
  description: item.whatChanged.en,
  consequence: item.whyItMatters.en,
  owner: item.owner,
  status: item.status,
  note: item.note,
  updatedBy: item.updatedBy,
  updatedAt: item.updatedAt,
});

/** Only the entries that are gaps — the register, not the whole Observatory. */
export async function listGapItems(): Promise<ObservatoryItem[]> {
  return filterItems({ kind: "gap" });
}

export async function listGaps(): Promise<InstructionGap[]> {
  return (await listGapItems()).map(toGap);
}

/** Every entry, gaps included — what `activeCaps` measures against. */
export const listObservatory = listItems;

export async function countGaps(): Promise<{
  total: number;
  open: number;
  blocked: number;
  closed: number;
}> {
  const { total, open, blocked, closed } = await countItems();
  return { total, open, blocked, closed };
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
  const updated = await updateItem(id, patch as ItemPatch, actor);
  return updated ? toGap(updated) : null;
}
