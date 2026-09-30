import type { CemacCode } from "./cemac-geo";

/**
 * The six CEMAC member states — the single source of truth for every
 * country-facing surface: the public Region page, the chapter pages, the
 * chapter switcher, the map highlight and the Operating System's chapters
 * dashboard.
 *
 * Cameroon is a chapter like the others, marked `founding`. It previously had
 * no entry at all, which left the public "Cameroon" link pointing at the
 * internal Operating System.
 *
 * Per BACKEND_NOTES.md these belong in a `Chapter` table rather than five
 * near-identical page templates.
 */

/**
 * A value that is a statement rather than a name — the chapter pages translate
 * it, where every other entry here is a proper noun that stays as it is.
 */
export const TBC = "To be confirmed";

export type ChapterKind = "founding" | "pending";

export type Chapter = {
  slug: string;
  code: CemacCode;
  kind: ChapterKind;
  /** Label in the region grid, switcher and map. */
  shortName: string;
  name: string;
  badge: string;
  /** Founding reads as progress (green); pending reads as awaiting (gold). */
  badgeTone: "green" | "gold";
  eyebrow: string;
  lede: string;
  fiu: string;
  language: string;
  accessionStatus: string;
  /** Short status for the region grid. */
  gridStatus: string;
  localScope: string;
  contextHeading: string;
  contextPoints: string[];
  /** Heading above the three next-step cards. */
  stepsHeading: string;
  steps: { n: string; title: string; body: string }[];
  cta: { heading: string; body: string; label: string; href: string };
};

const ACCESSION_STEPS = (charterStep: string) => [
  {
    n: "01",
    title: "Identify a local convenor",
    body: "A founding contact from industry, academia or government to lead accession locally.",
  },
  { n: "02", title: "Adopt the Charter", body: charterStep },
  {
    n: "03",
    title: "Open Readiness intake",
    body: "Begin scoring local applicants against the same 8-domain framework.",
  },
];

const REGISTER_CTA = (name: string) => ({
  heading: `Want to convene the ${name} chapter?`,
  body: "Contact the secretariat to register interest as a founding local convenor.",
  label: "Register Interest",
  href: "/register",
});

export const CHAPTERS: Chapter[] = [
  {
    slug: "cameroon",
    code: "CMR",
    kind: "founding",
    shortName: "Cameroon",
    name: "Cameroon",
    badge: "Founding chapter · active",
    badgeTone: "green",
    eyebrow: "CEMAC Founding Chapter",
    lede: "The first working chapter of VAACA. Cameroon's Charter, Readiness Framework and founding coalition are drafted here, and packaged so the other five CEMAC states can adopt them as-is.",
    fiu: "ANIF",
    language: "French / English",
    accessionStatus: "Founding chapter · active",
    gridStatus: "Founding chapter",
    localScope:
      "The two-role secretariat called for in Charter Part 6 (Secretary General, Standards & Assessment Officer), the nine-seat Coordination Council, and affiliation to the Cameroon Fintech Association (CFIA) during the founding phase.",
    contextHeading:
      "Everything the other five chapters will inherit is being built here first.",
    contextPoints: [
      "Charter, Readiness Framework and Coalition Architecture drafted",
      "Nine founding seats defined — recruitment not yet started",
      "Secretariat not yet appointed; required before the Charter can be ratified",
    ],
    stepsHeading: "Three steps before the Charter can be ratified.",
    steps: [
      {
        n: "01",
        title: "Appoint the secretariat",
        body: "Secretary General and Standards & Assessment Officer — the operating capacity every founding document assumes is already running.",
      },
      {
        n: "02",
        title: "Fill the nine founding seats",
        body: "No single interest may hold a majority; the Convenor chairs but carries no additional vote.",
      },
      {
        n: "03",
        title: "Sign the founding declaration",
        body: "At the CBA Institutional Conference in Yaoundé, October 2026, followed by registration as a Cameroonian association.",
      },
    ],
    cta: {
      heading: "Join the Cameroon founding chapter",
      body: "Membership is open and non-exclusive across five accession classes. Any applicant meeting a class's criteria is admitted.",
      label: "Apply for membership",
      href: "/register",
    },
  },
  {
    slug: "gabon",
    code: "GAB",
    kind: "pending",
    shortName: "Gabon",
    name: "Gabon",
    badge: "Priority replication target",
    badgeTone: "green",
    eyebrow: "CEMAC Chapter",
    lede: "CEMAC’s financial hub, with existing capital-markets activity and the region’s deepest banking sector — the most plausible second chapter after Cameroon.",
    fiu: "ANIF-Gabon",
    language: "French",
    accessionStatus: "Priority replication target",
    gridStatus: "Pending",
    localScope:
      "Local FIU contact (ANIF-Gabon), transposition of the Readiness Framework into Gabonese instruments, and a local convenor from Libreville’s financial-services community.",
    contextHeading:
      "Gabon already hosts CEMAC’s largest capital markets — virtual-asset activity likely exists ahead of any framework.",
    contextPoints: [
      "Home to COSUMAF’s primary listed-market activity",
      "Established banking and insurance sector with cross-border reach",
      "No chapter contact identified yet",
    ],
    stepsHeading: "Three steps before Gabon becomes an active chapter.",
    steps: ACCESSION_STEPS(
      "Ratify the founding Charter as drafted for Cameroon, with Gabon-specific institutional references.",
    ),
    cta: REGISTER_CTA("Gabon"),
  },
  {
    slug: "congo",
    code: "COG",
    kind: "pending",
    shortName: "Congo",
    name: "Republic of the Congo",
    badge: "Pending accession",
    badgeTone: "gold",
    eyebrow: "CEMAC Chapter",
    lede: "Shares COBAC, COSUMAF, BEAC and GABAC oversight with Cameroon; no chapter contact has been identified yet.",
    fiu: "ANIF-Congo",
    language: "French",
    accessionStatus: "Pending accession",
    gridStatus: "Pending",
    localScope:
      "Local FIU contact (ANIF-Congo) and a founding convenor from Brazzaville or Pointe-Noire’s business community.",
    contextHeading:
      "An oil-dependent economy exploring diversification — virtual-asset interest is nascent but regulatory contacts are unestablished.",
    contextPoints: [
      "No known VASP activity publicly reported",
      "Regional regulators identical to Cameroon’s",
      "Convenor search not yet started",
    ],
    stepsHeading:
      "Three steps before Republic of the Congo becomes an active chapter.",
    steps: ACCESSION_STEPS(
      "Ratify the founding Charter as drafted for Cameroon, with Congo-specific institutional references.",
    ),
    cta: REGISTER_CTA("Republic of the Congo"),
  },
  {
    slug: "chad",
    code: "TCD",
    kind: "pending",
    shortName: "Chad",
    name: "Chad",
    badge: "Pending accession",
    badgeTone: "gold",
    eyebrow: "CEMAC Chapter",
    lede: "Shares COBAC, COSUMAF, BEAC and GABAC oversight with Cameroon; no chapter contact has been identified yet.",
    fiu: "ANIF-Tchad",
    language: "French / Arabic",
    accessionStatus: "Pending accession",
    gridStatus: "Pending",
    localScope:
      "Local FIU contact (ANIF-Tchad), and consideration of Arabic-language materials alongside French for northern regions.",
    contextHeading:
      "The most nascent digital-finance market of the six CEMAC states — infrastructure and connectivity gaps precede any regulatory question.",
    contextPoints: [
      "Lowest financial-inclusion baseline in CEMAC",
      "No known VASP activity publicly reported",
      "Convenor search not yet started",
    ],
    stepsHeading: "Three steps before Chad becomes an active chapter.",
    steps: ACCESSION_STEPS(
      "Ratify the founding Charter as drafted for Cameroon, with Chad-specific institutional references.",
    ),
    cta: REGISTER_CTA("Chad"),
  },
  {
    slug: "car",
    code: "CAF",
    kind: "pending",
    shortName: "C.A.R.",
    name: "Central African Republic",
    badge: "Pending accession",
    badgeTone: "gold",
    eyebrow: "CEMAC Chapter",
    lede: "Shares COBAC, COSUMAF, BEAC and GABAC oversight with Cameroon; no chapter contact has been identified yet.",
    fiu: "ANIF-RCA",
    language: "French / Sango",
    accessionStatus: "Pending accession",
    gridStatus: "Pending",
    localScope:
      "Local FIU contact (ANIF-RCA) and a founding convenor — complicated by the only CEMAC state with an existing sovereign crypto initiative to account for.",
    contextHeading:
      "The one CEMAC state with prior national crypto legislation — any chapter here must reconcile with that existing framework, not start from zero.",
    contextPoints: [
      "Prior national digital-currency legislation exists",
      "Framework alignment work needed before Charter adoption",
      "Convenor search not yet started",
    ],
    stepsHeading:
      "Three steps before Central African Republic becomes an active chapter.",
    steps: ACCESSION_STEPS(
      "Ratify the founding Charter with an added reconciliation annex for existing national digital-currency law.",
    ),
    cta: REGISTER_CTA("Central African Republic"),
  },
  {
    slug: "equatorial-guinea",
    code: "GNQ",
    kind: "pending",
    shortName: "Eq. Guinea",
    name: "Equatorial Guinea",
    badge: "Pending accession · translation required",
    badgeTone: "gold",
    eyebrow: "CEMAC Chapter",
    lede: "The only CEMAC state with Spanish as a working language — the Charter and Readiness Framework require translation before accession can proceed.",
    // Equatorial Guinea has not designated one; the page translates this.
    fiu: TBC,
    language: "Spanish / French",
    accessionStatus: "Pending accession · translation required",
    gridStatus: "Pending",
    localScope:
      "Spanish translation of the Charter and Readiness Framework, a confirmed FIU contact, and a founding convenor from Malabo or Bata.",
    contextHeading:
      "Language is the binding constraint here, not market readiness — no regulatory or convenor work can start until materials exist in Spanish.",
    contextPoints: [
      "Spanish translation not yet commissioned",
      "FIU contact not yet confirmed",
      "Convenor search not yet started",
    ],
    stepsHeading:
      "Three steps before Equatorial Guinea becomes an active chapter.",
    steps: ACCESSION_STEPS(
      "Ratify the founding Charter once translated into Spanish alongside the French original.",
    ),
    cta: REGISTER_CTA("Equatorial Guinea"),
  },
];

export const getChapter = (slug: string) =>
  CHAPTERS.find((c) => c.slug === slug);

export const FOUNDING_CHAPTER = CHAPTERS.find((c) => c.kind === "founding")!;
export const PENDING_CHAPTERS = CHAPTERS.filter((c) => c.kind === "pending");

/** Country name → chapter, for counting applications by country. */
export const chapterForCountry = (country: string) =>
  CHAPTERS.find((c) => c.name === country);

/** Shared across every chapter — regional architecture that doesn't vary. */
export const CARRIES_OVER = [
  "Charter & governance architecture",
  "PSAN Regulatory Readiness Framework (8 domains)",
  "Perimeter, requalification & regulator gates",
  "Regional regulators: COBAC, COSUMAF, BEAC, GABAC",
];

export const SHARED_REGULATORS = "COBAC · COSUMAF · BEAC · GABAC";
