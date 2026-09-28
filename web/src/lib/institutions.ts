import type { Evidence } from "./evidence";

/**
 * The institutional map — the `Institution` entity in BACKEND_NOTES.md.
 *
 * One list, read by both the public Ecosystem page and the Operating System's
 * institutional map. The public page previously kept its own two lists which
 * disagreed with each other: ANIF carried an engagement posture without
 * appearing among the "priority institutions", while COBAC and BEAC were
 * listed as priorities with no posture at all.
 *
 * `postureTag` is the engagement stance; `tag` is the internal evidence marker
 * (Verified / Interpretation / Proposal) and is not published.
 */
export type InstitutionPosture =
  "Engage first" | "Engage early" | "Monitor" | "Inform";

export type Institution = {
  name: string;
  desc: string;
  posture: string;
  postureTag: InstitutionPosture;
  tag: Evidence;
};

export const INSTITUTIONS: Institution[] = [
  {
    name: "COSUMAF",
    desc: "CEMAC regional capital-markets regulator.",
    posture:
      "Primary Gate 3 target — the most plausible eventual PSAN licensing authority.",
    postureTag: "Engage first",
    tag: "V",
  },
  {
    name: "CNEF",
    desc: "National Economic and Financial Committee — regulates the relationship between financial consumers and credit, payment, microfinance and insurance institutions.",
    posture:
      "Relevant to consumer protection (D5) and any payment-institution requalification under Gate 2.",
    postureTag: "Engage early",
    tag: "I",
  },
  {
    name: "MINFI",
    desc: "Cameroon's Ministry of Finance.",
    posture:
      "Courtesy briefing once the Charter is ratified; not a licensing body.",
    postureTag: "Inform",
    tag: "P",
  },
  {
    name: "ANIF",
    desc: "Cameroon's financial-intelligence unit (AML/CFT reporting).",
    posture:
      "Needed to close Gap G3 (travel-rule guidance) — early technical contact.",
    postureTag: "Engage early",
    tag: "I",
  },
  {
    name: "COBAC",
    desc: "CEMAC regional banking-supervision commission.",
    posture:
      "Relevant only if an applicant is requalified as a bank/PSP under Gate 2.",
    postureTag: "Monitor",
    tag: "P",
  },
  {
    name: "BEAC",
    desc: "Central Bank of Central African States — monetary authority.",
    posture:
      "Monetary-policy interest only if a stablecoin or CBDC angle emerges.",
    postureTag: "Monitor",
    tag: "P",
  },
  {
    name: "GABAC",
    desc: "CEMAC regional AML/CFT body.",
    posture: "Standards-setting counterpart for the AML/CFT domain (D2).",
    postureTag: "Engage early",
    tag: "I",
  },
  {
    name: "MINPOSTEL / ANTIC / ART",
    desc: "Cameroon's telecom, cybersecurity and postal regulators.",
    posture: "Relevant to custody/tech-resilience domain (D3, D7) only.",
    postureTag: "Inform",
    tag: "P",
  },
  {
    name: "DGI",
    desc: "Cameroon's Directorate General of Taxation.",
    posture:
      "Needed to close Gap G9 (tax treatment) before any applicant files.",
    postureTag: "Engage early",
    tag: "I",
  },
];

/** The bodies VAACA actively engages, in engagement order. */
export const PRIORITY_INSTITUTIONS = INSTITUTIONS.filter(
  (i) => i.postureTag === "Engage first" || i.postureTag === "Engage early",
);
