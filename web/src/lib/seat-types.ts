import type { Tone } from "@/components/Tag";

/**
 * The nine founding seats on the Coordination Council, from the Founding
 * Coalition & Alliance Architecture (Part 2).
 *
 * This is the single source of truth for the seat list. The public Governance
 * page and the Operating System's seats tracker both read it, so the two can no
 * longer describe a different Council.
 */

export const SEAT_STATUSES = ["vacant", "candidate", "filled"] as const;
export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const SEAT_STATUS_LABEL: Record<SeatStatus, string> = {
  vacant: "Vacant — recruiting",
  candidate: "Candidate identified",
  filled: "Filled",
};

export const SEAT_STATUS_TONE: Record<SeatStatus, Tone> = {
  vacant: "gold",
  candidate: "blue",
  filled: "green",
};

/**
 * The seat definitions. `why` is the justification from the Architecture —
 * fixed text, not something the secretariat edits, so it stays in code while
 * the recruitment state lives in the store.
 */
export const SEAT_DEFINITIONS = [
  {
    n: 1,
    name: "Legal — CEMAC financial markets",
    why: "Interprets PSAN and requalification exposure across the bloc.",
    /** The interest this seat represents, for the majority test below. */
    bloc: "independent",
  },
  {
    n: 2,
    name: "Regulated financial institution",
    why: "Brings a bank/PSP view of custody and settlement risk.",
    bloc: "industry",
  },
  {
    n: 3,
    name: "Payments / PSP",
    why: "Represents the mobile-money and payments corridor VAACA must not disrupt.",
    bloc: "industry",
  },
  {
    n: 4,
    name: "VASP / exchange operator",
    why: "The regulated subject the Association exists to prepare.",
    bloc: "industry",
  },
  {
    n: 5,
    name: "Compliance / AML professional",
    why: "Owns AML/CFT domain credibility with regulators.",
    bloc: "professional",
  },
  {
    n: 6,
    name: "Cybersecurity / infrastructure",
    why: "Owns custody and operational-resilience domain credibility.",
    bloc: "professional",
  },
  {
    n: 7,
    name: "Academic / research",
    why: "Independent evidence base, distinct from industry lobbying.",
    bloc: "independent",
  },
  {
    n: 8,
    name: "Consumer / market integrity",
    why: "Counterweight to seats 2–4; keeps client protection real.",
    bloc: "independent",
  },
  {
    n: 9,
    name: "Convenor",
    why: "Independent chair — no seat is president by default.",
    bloc: "independent",
  },
] as const;

export const SEAT_COUNT = SEAT_DEFINITIONS.length;

export type SeatBloc = (typeof SEAT_DEFINITIONS)[number]["bloc"];

export const BLOC_LABEL: Record<SeatBloc, string> = {
  industry: "Industry",
  professional: "Professional",
  independent: "Independent",
};

/** Recruitment state for one seat — the part the secretariat maintains. */
export type SeatRecord = {
  n: number;
  status: SeatStatus;
  /** The person holding or nominated for the seat. Never published. */
  holder: string | null;
  /** The body they represent. Published once the seat is filled. */
  organisation: string | null;
  /** Secretariat note on sourcing or conflicts. Never published. */
  note: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

/** A seat as the public Governance page sees it. */
export type PublicSeat = {
  n: number;
  name: string;
  why: string;
  bloc: SeatBloc;
  blocLabel: string;
  status: SeatStatus;
  statusLabel: string;
  tone: Tone;
  /**
   * Only for a filled seat. A candidate under consideration is not announced,
   * and the individual's name is never published from here.
   */
  organisation: string | null;
};

/** A seat as the secretariat sees it — recruitment detail included. */
export type StaffSeat = PublicSeat & {
  holder: string | null;
  note: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export const isSeatStatus = (v: unknown): v is SeatStatus =>
  typeof v === "string" && (SEAT_STATUSES as readonly string[]).includes(v);

export const isSeatNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= SEAT_COUNT;

/* -------------------------------------------------------------------------- */
/* The majority test                                                           */
/* -------------------------------------------------------------------------- */

export type BlocBalance = {
  bloc: SeatBloc;
  label: string;
  filled: number;
  /** Of the seats defined for this bloc, not of the Council. */
  total: number;
};

/**
 * The Council's own stated constraint is that "no single interest holds a
 * majority". That is a claim about *filled* seats, so it can only be checked
 * against the live register — with nine vacant seats it is vacuously true, and
 * it stops being true the moment one bloc takes five.
 */
export function blocBalance(
  seats: { n: number; status: SeatStatus }[],
): BlocBalance[] {
  const byBloc = new Map<SeatBloc, BlocBalance>();
  for (const def of SEAT_DEFINITIONS) {
    const entry = byBloc.get(def.bloc) ?? {
      bloc: def.bloc,
      label: BLOC_LABEL[def.bloc],
      filled: 0,
      total: 0,
    };
    entry.total += 1;
    if (seats.find((s) => s.n === def.n)?.status === "filled")
      entry.filled += 1;
    byBloc.set(def.bloc, entry);
  }
  return [...byBloc.values()];
}

export const filledCount = (seats: { status: SeatStatus }[]) =>
  seats.filter((s) => s.status === "filled").length;

/**
 * Whether one bloc holds a majority of the Council — more than half of all
 * nine seats, not of the seats filled so far.
 *
 * Measuring against filled seats reports a "majority" as soon as the first
 * seat is taken, which is arithmetically true and useless: a bloc can only
 * control the Council by holding five of nine. As it happens the seat
 * definitions already make that impossible — the largest bloc is defined four
 * seats wide — so this should never fire, and says so if it ever does.
 */
export function majorityHolder(
  seats: { n: number; status: SeatStatus }[],
): BlocBalance | null {
  return blocBalance(seats).find((b) => b.filled * 2 > SEAT_COUNT) ?? null;
}

/** The largest bloc the seat definitions allow, for the structural claim. */
export const largestPossibleBloc = (): BlocBalance =>
  blocBalance([]).reduce((a, b) => (b.total > a.total ? b : a));
