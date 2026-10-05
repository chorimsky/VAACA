import "server-only";

import { readOrSeed, writeStore } from "./persistence";
import {
  BLOC_LABEL,
  SEAT_DEFINITIONS,
  SEAT_STATUS_LABEL,
  SEAT_STATUS_TONE,
  filledCount,
  type PublicSeat,
  type SeatRecord,
  type SeatStatus,
  type StaffSeat,
} from "@/lib/seat-types";

/**
 * Recruitment state for the nine Coordination Council seats.
 *
 * The Operating System called its seats table "the recruitment tracker" while
 * every row was a hardcoded "Vacant — recruiting", so nothing could be tracked.
 * The fixed part of a seat (its name and justification) stays in
 * `seat-types.ts`; what changes — who holds it, and how far recruitment has
 * got — lives here.
 */

const SEATS = "seats.json";

const load = () =>
  readOrSeed<SeatRecord[]>(SEATS, () =>
    SEAT_DEFINITIONS.map((d) => ({
      n: d.n,
      status: "vacant" as SeatStatus,
      holder: null,
      organisation: null,
      note: null,
      updatedAt: null,
      updatedBy: null,
    })),
  );

/**
 * Pairs each stored row with its definition. A definition with no stored row
 * (a seat added after the file was seeded) still appears, as vacant.
 */
async function rows(): Promise<
  { def: (typeof SEAT_DEFINITIONS)[number]; rec: SeatRecord }[]
> {
  const stored = await load();
  return SEAT_DEFINITIONS.map((def) => ({
    def,
    rec: stored.find((r) => r.n === def.n) ?? {
      n: def.n,
      status: "vacant",
      holder: null,
      organisation: null,
      note: null,
      updatedAt: null,
      updatedBy: null,
    },
  }));
}

const toPublic = (
  def: (typeof SEAT_DEFINITIONS)[number],
  rec: SeatRecord,
): PublicSeat => ({
  n: def.n,
  name: def.name,
  why: def.why,
  bloc: def.bloc,
  blocLabel: BLOC_LABEL[def.bloc],
  status: rec.status,
  statusLabel: SEAT_STATUS_LABEL[rec.status],
  tone: SEAT_STATUS_TONE[rec.status],
  // A seat under consideration is not announced, and the holder's name is
  // never published from here — only the body a filled seat represents.
  organisation: rec.status === "filled" ? rec.organisation : null,
});

export async function listPublicSeats(): Promise<PublicSeat[]> {
  return (await rows()).map(({ def, rec }) => toPublic(def, rec));
}

export async function getSeat(n: number): Promise<StaffSeat | null> {
  return (await listSeatsForStaff()).find((s) => s.n === n) ?? null;
}

export async function listSeatsForStaff(): Promise<StaffSeat[]> {
  return (await rows()).map(({ def, rec }) => ({
    ...toPublic(def, rec),
    // Staff see the recruitment detail, including for candidate seats.
    organisation: rec.organisation,
    holder: rec.holder,
    note: rec.note,
    updatedAt: rec.updatedAt,
    updatedBy: rec.updatedBy,
  }));
}

export async function countSeatsFilled(): Promise<number> {
  return filledCount((await load()).map((r) => ({ status: r.status })));
}

export type SeatPatch = {
  status?: SeatStatus;
  holder?: string | null;
  organisation?: string | null;
  note?: string | null;
};

export async function updateSeat(
  n: number,
  patch: SeatPatch,
  actor: string,
): Promise<StaffSeat | null> {
  const def = SEAT_DEFINITIONS.find((d) => d.n === n);
  if (!def) return null;

  await load();
  const updated = await writeStore<SeatRecord[], SeatRecord>(
    SEATS,
    [],
    async (seats) => {
      const index = seats.findIndex((s) => s.n === n);
      const current: SeatRecord =
        index === -1
          ? {
              n,
              status: "vacant",
              holder: null,
              organisation: null,
              note: null,
              updatedAt: null,
              updatedBy: null,
            }
          : seats[index];

      const status = patch.status ?? current.status;
      const next: SeatRecord = {
        ...current,
        status,
        holder: patch.holder === undefined ? current.holder : patch.holder,
        organisation:
          patch.organisation === undefined
            ? current.organisation
            : patch.organisation,
        note: patch.note === undefined ? current.note : patch.note,
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      };

      // Returning a seat to vacant clears the person and body with it, so a
      // withdrawn nomination cannot linger in the record.
      if (status === "vacant") {
        next.holder = null;
        next.organisation = null;
      }

      const rowsNext = [...seats];
      if (index === -1) rowsNext.push(next);
      else rowsNext[index] = next;
      rowsNext.sort((a, b) => a.n - b.n);
      return { next: rowsNext, result: next };
    },
  );

  return {
    ...toPublic(def, updated),
    organisation: updated.organisation,
    holder: updated.holder,
    note: updated.note,
    updatedAt: updated.updatedAt,
    updatedBy: updated.updatedBy,
  };
}
