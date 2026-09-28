/** Evidence tag: Verified / Interpretation / Proposal. */
export type Evidence = "V" | "I" | "P";

export const EVIDENCE_CLASS: Record<Evidence, string> = {
  V: "bg-doc-tint-v text-green",
  I: "bg-tint-gold text-gold-ink",
  P: "bg-doc-tint-p text-teal-ink",
};
