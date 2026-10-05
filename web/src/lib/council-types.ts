import type { Tone } from "@/components/Tag";
import type { ChamberId } from "./chambers";
import {
  BLOC_LABEL,
  blocBalanceOf,
  capturableBy,
  type SeatBloc,
  type SeatStatus,
} from "./seat-types";

/**
 * The sector councils.
 *
 * A council that exists only as a name on a page is furniture. What makes one
 * operational is that it can be *refused*: a council may not be activated until
 * it has a composition no single interest can capture, a quorum that its seats
 * can actually meet, and enough of those seats filled to reach it. Until then
 * it stays `proposed`, and a proposed council publishes nothing.
 *
 * The seat compositions are deliberately **not** written here. Twelve councils
 * at five or more seats each is sixty appointments' worth of governance, and
 * that is the Coordination Council's to decide, not something to hard-code
 * ahead of them. What is written here is the rule those decisions have to
 * satisfy.
 */

export const COUNCIL_STATUSES = ["proposed", "active", "dormant"] as const;
export type CouncilStatus = (typeof COUNCIL_STATUSES)[number];

export const COUNCIL_STATUS_TONE: Record<CouncilStatus, Tone> = {
  proposed: "neutral",
  active: "green",
  dormant: "gold",
};

/**
 * The twelve from the institutional architecture, each attached to the chamber
 * it draws from. Ids are stored on records and must never move; names and
 * mandates are translated.
 */
/**
 * The chamber that convenes each council. It is *not* the council's
 * composition — the architecture requires every council to be cross-sector, and
 * `activationBlockers` enforces that against the seats. This only says whose
 * agenda the council sits on.
 */
export const COUNCIL_DEFINITIONS = [
  { id: "banking-payments", chamberId: "financial" },
  { id: "microfinance-inclusion", chamberId: "financial" },
  { id: "insurance-risk", chamberId: "financial" },
  { id: "capital-markets", chamberId: "financial" },
  { id: "fintech-infrastructure", chamberId: "technology" },
  { id: "digital-identity-cyber", chamberId: "technology" },
  { id: "digital-assets", chamberId: "technology" },
  { id: "sme-real-economy", chamberId: "enterprise" },
  { id: "academic-research", chamberId: "academia" },
  { id: "civil-society", chamberId: "civil-society" },
  { id: "professional-standards", chamberId: "professional" },
  { id: "payments-settlement", chamberId: "financial" },
] as const satisfies readonly { id: string; chamberId: ChamberId }[];

export type CouncilId = (typeof COUNCIL_DEFINITIONS)[number]["id"];

export const COUNCIL_IDS = COUNCIL_DEFINITIONS.map((c) => c.id);

export const isCouncilId = (v: unknown): v is CouncilId =>
  typeof v === "string" && (COUNCIL_IDS as readonly string[]).includes(v);

export const isCouncilStatus = (v: unknown): v is CouncilStatus =>
  typeof v === "string" && (COUNCIL_STATUSES as readonly string[]).includes(v);

/** A seat on a sector council, as the secretariat defines it. */
export type CouncilSeat = {
  n: number;
  /** What the seat represents. Free text — each council's own composition. */
  name: string;
  bloc: SeatBloc;
  /** Which chamber the seat is drawn from. The cross-sector test counts these. */
  chamberId: ChamberId;
  status: SeatStatus;
  /** Published only once the seat is filled; the individual never is. */
  organisation: string | null;
};

export type CouncilRecord = {
  id: CouncilId;
  status: CouncilStatus;
  /** Minimum seats that must be filled for the council to decide anything. */
  quorum: number;
  seats: CouncilSeat[];
  activatedAt: string | null;
  activatedBy: string | null;
};

/** The minimum a deliberative body can be and still be one. */
export const MIN_COUNCIL_SEATS = 5;
export const MIN_QUORUM = 3;

/**
 * How many chambers a council has to draw from.
 *
 * The architecture is explicit that a council must not be composed only of one
 * chamber, and the reason is the whole point of the institution: a council of
 * banks discussing tokenisation produces a banking position, not a regional
 * one. Three is the smallest number that makes a room genuinely cross-sector
 * rather than a sector plus a guest.
 */
export const MIN_CHAMBERS_REPRESENTED = 3;

/**
 * Why a council cannot be activated, in the order a reader would ask.
 *
 * An empty list is the only thing that may move a council to `active`. The
 * check is the whole point of the entity: without it, "activated" means
 * somebody set a field.
 */
export function activationBlockers(council: CouncilRecord): string[] {
  const blockers: string[] = [];
  const seats = council.seats;

  if (seats.length < MIN_COUNCIL_SEATS) {
    blockers.push(
      `Composition not set: ${seats.length} of at least ${MIN_COUNCIL_SEATS} seats defined.`,
    );
    // Everything below is measured against the composition, so stop here
    // rather than piling on consequences of the same missing decision.
    return blockers;
  }

  const capturable = capturableBy(seats);
  if (capturable) {
    blockers.push(
      `Composition is capturable: ${BLOC_LABEL[capturable]} holds more than half the seats.`,
    );
  }

  const chambers = new Set(seats.map((s) => s.chamberId));
  if (chambers.size < MIN_CHAMBERS_REPRESENTED) {
    blockers.push(
      `Composition is not cross-sector: seats drawn from ${chambers.size} of at least ${MIN_CHAMBERS_REPRESENTED} chambers.`,
    );
  }

  if (council.quorum < MIN_QUORUM) {
    blockers.push(
      `Quorum of ${council.quorum} is below the minimum of ${MIN_QUORUM}.`,
    );
  }
  if (council.quorum > seats.length) {
    blockers.push(
      `Quorum of ${council.quorum} cannot be met by ${seats.length} seats.`,
    );
  }

  const filled = seats.filter((s) => s.status === "filled").length;
  if (filled < council.quorum) {
    blockers.push(
      `${filled} of ${council.quorum} seats needed for quorum are filled.`,
    );
  }

  return blockers;
}

/** A council as the public page sees it. */
export type PublicCouncil = {
  id: CouncilId;
  chamberId: ChamberId;
  status: CouncilStatus;
  tone: Tone;
  quorum: number;
  seatCount: number;
  filled: number;
  /** Only for an active council — a proposed one has nothing to announce. */
  seats: {
    n: number;
    name: string;
    blocLabel: string;
    chamberId: ChamberId;
    organisation: string | null;
  }[];
  balance: { label: string; filled: number; total: number }[];
  /** The chambers this council actually draws from. */
  chambers: ChamberId[];
};

export function toPublicCouncil(
  council: CouncilRecord,
  chamberId: ChamberId,
): PublicCouncil {
  const published = council.status === "active";
  return {
    id: council.id,
    chamberId,
    status: council.status,
    tone: COUNCIL_STATUS_TONE[council.status],
    quorum: council.quorum,
    seatCount: council.seats.length,
    filled: council.seats.filter((s) => s.status === "filled").length,
    seats: published
      ? council.seats.map((s) => ({
          n: s.n,
          name: s.name,
          blocLabel: BLOC_LABEL[s.bloc],
          chamberId: s.chamberId,
          organisation: s.status === "filled" ? s.organisation : null,
        }))
      : [],
    chambers: published
      ? [...new Set(council.seats.map((s) => s.chamberId))]
      : [],
    balance: published
      ? blocBalanceOf(council.seats, council.seats).map((b) => ({
          label: b.label,
          filled: b.filled,
          total: b.total,
        }))
      : [],
  };
}
