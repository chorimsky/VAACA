import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/server/auth";
import { LogoMark } from "@/components/Logo";
import { DashboardBar } from "@/components/DashboardBar";
import { getTranslations } from "@/lib/i18n/server";
import { staffLinks } from "@/lib/dashboard-links";
import { routes } from "@/lib/routes";
import { LockIcon } from "@/components/icons";
import { countDocuments, listDocumentsForStaff } from "@/lib/server/documents";
import { DocumentLibrary } from "./DocumentLibrary";

export const metadata: Metadata = {
  title: "Founding Document System",
  robots: { index: false, follow: false },
};

const PHASES = [
  {
    dot: "bg-green",
    title: "Phase 1 — Cameroon founding chapter",
    body: "Charter, Readiness Framework and Coalition ratified; nine founding seats filled; declaration signed at the CBA Institutional Conference, Yaoundé.",
  },
  {
    dot: "bg-doc-amber",
    title: "Phase 2 — the other five CEMAC states",
    body: "Cameroon's Charter, governance floor and PSAN Readiness Framework packaged as a template chapter for CAR, Chad, Congo, Equatorial Guinea and Gabon.",
  },
  {
    dot: "bg-doc-stone",
    title: "Phase 3 — CEMAC federation",
    body: "Chapters federate under the Virtual Assets Association of Central Africa once two or more national coalitions are independently operating.",
  },
];

const COVERAGE = [
  { name: "Cameroon", status: "Founding chapter · active", active: true },
  { name: "Gabon", status: "Pending accession", active: false },
  { name: "Congo", status: "Pending accession", active: false },
  { name: "Chad", status: "Pending accession", active: false },
  { name: "Central African Rep.", status: "Pending accession", active: false },
  { name: "Equatorial Guinea", status: "Pending accession", active: false },
];

/**
 * The two document-structure figures are sums of the per-document numbers
 * below, not separately maintained totals — restating them invites drift.
 */
const totalParts = () => DOCUMENTS.reduce((n, d) => n + d.parts, 0);
const totalTags = () =>
  DOCUMENTS.reduce(
    (acc, d) => ({
      v: acc.v + d.tags.v,
      i: acc.i + d.tags.i,
      p: acc.p + d.tags.p,
    }),
    { v: 0, i: 0, p: 0 },
  );

const overviewStats = (documents: { total: number; published: number }) => [
  {
    label: "Documents in the library",
    value: String(documents.total),
    bg: "bg-[linear-gradient(150deg,#0B4944,#083733)]",
    note: `${documents.published} publicly listed`,
  },
  {
    label: "Sections structured",
    value: String(totalParts()),
    bg: "bg-[linear-gradient(150deg,#1F7A4D,#175E3B)]",
    note: `across ${DOCUMENTS.length} founding documents`,
  },
  {
    label: "Evidence tags logged (V·I·P)",
    value: String(totalTags().v + totalTags().i + totalTags().p),
    bg: "bg-[linear-gradient(155deg,#866B1B,#6C5715)]",
    note: `${totalTags().v} verified · ${totalTags().i} interpretation · ${totalTags().p} proposal`,
  },
];

const DOCUMENTS = [
  {
    n: "Document 01",
    title: "Institutional Charter",
    desc: "Defines VAACA’s Cameroon chapter as an open, non-exclusive institutional utility: membership classes, the Coordination Council, secretariat independence, and the governance floor.",
    tags: { v: 1, i: 12, p: 16 },
    parts: 9,
    partNoun: "parts",
    outline:
      "Founding Principle → Scope → Open Accession → Coordination Council → Operating Capacity → Governance Floor → Sequence → What This Replaces.",
  },
  {
    n: "Document 02",
    title: "PSAN Regulatory Readiness Framework",
    desc: "A three-gate perimeter test, eight readiness domains scored against a 24-point scale, a ten-item instruction gap register, and an interim dossier structure (Parts A–G).",
    tags: { v: 25, i: 19, p: 12 },
    parts: 11,
    partNoun: "numbered sections",
    outline:
      "Gates 1–3 (Perimeter, Requalification, Regulator) → 8 Domains (D1–D8) → Gap Register (G1–G10) → Dossier Structure → Thresholds (T0–T2).",
  },
  {
    n: "Document 03",
    title: "Founding Coalition & Alliance Architecture",
    desc: "Positions VAACA’s Cameroon chapter against BAC and FINTEC, defines nine founding seats and five member classes, and maps priority institutions and the launch sequence.",
    tags: { v: 10, i: 8, p: 18 },
    parts: 7,
    partNoun: "parts",
    outline:
      "Positioning Decision → Founding Coalition (9 seats) → Member Identification (Classes A–E) → Institutional Map → Peer/Partner Map → Sequence to Launch → Risk Register.",
  },
];

const CROSS_REF = [
  {
    concept: "Membership & seats",
    charter: "Part 4 — five accession classes (A–E)",
    framework: "— (defines who must satisfy the alignment test, not the seats)",
    coalition: "Parts 2–3 — nine founding seats, five recruitment classes",
  },
  {
    concept: "Regulatory perimeter",
    charter: "Part 2 — what VAACA does not claim",
    framework: "Gates 1–3 — perimeter, requalification, regulator tests",
    coalition: "Part 1 — lane recommendation (specialise, don't generalise)",
  },
  {
    concept: "Governance structure",
    charter: "Parts 5, 7 — Coordination Council, governance floor",
    framework: "Section 8 — how the Association uses the framework",
    coalition: "Part 2.4 — conflict architecture & recusal",
  },
  {
    concept: "Institutional targets",
    charter: "— (accession is open, not targeted)",
    framework: "Section 4 — regulator identification (COBAC, COSUMAF, BEAC…)",
    coalition: "Parts 4–5 — priority institutions & peer/partner map",
  },
  {
    concept: "Launch sequence",
    charter: "Part 8 — sequence table",
    framework: "Section 10 — immediate work items",
    coalition: "Part 6 — sequence to launch, CBA Conference, Oct 2026",
  },
];

const GAPS = [
  {
    title: "Institutional Charter",
    items: [
      "Draft the perimeter language for Part 2 (what VAACA does not claim).",
      "Fill the Part 8 sequence table — steps, actions, dependencies.",
      'Populate the Part 9 comparison ("previous design" vs. this Charter).',
    ],
  },
  {
    title: "Readiness Framework",
    items: [
      "Write anchors and artefact lists for domains D1–D8.",
      "Fill all ten rows of the Gap Register (G1–G10) with gap, status, consequence, default.",
      "Populate the Immediate Work Items table (owner, output).",
    ],
  },
  {
    title: "Coalition Architecture",
    items: [
      'Fill "why it must exist" and sourcing for all nine founding seats.',
      "Complete institution posture & sequence for the priority-institution map.",
      'Write mitigations for the Risk Register, starting with "BAC reads VAACA as encroachment."',
    ],
  },
];

export const dynamic = "force-dynamic";

/**
 * Restricted, like the other internal surfaces: this page's own footer says it
 * is "not for circulation outside the coalition until legal review is
 * complete", and the Access & Roles table classes its audience as legal review.
 */
export default async function DocumentsPage() {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login?next=/documents");

  const { locale, t } = await getTranslations();
  const [documents, documentCounts] = await Promise.all([
    listDocumentsForStaff(),
    countDocuments(),
  ]);

  return (
    <div className="min-h-screen bg-doc-canvas font-sans text-doc-ink">
      <div className="h-[3px] bg-teal" />

      {/* This surface had no sign-out and showed no signed-in identity at all —
          the only one of the four staff/member surfaces missing both. */}
      <DashboardBar
        audience="staff"
        tone="light"
        locale={locale}
        languageLabel={t.language.label}
        title="Founding Document System"
        titleHref={routes.documents}
        identity={session.email}
        links={staffLinks("documents", locale)}
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 text-[11px] font-semibold text-teal-bright">
            <LockIcon size="xs" />
            Legal review only
          </span>
        }
      />

      <div className="mx-auto flex max-w-[1180px] flex-wrap items-start justify-between gap-6 px-8 pt-7 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-navy-deep">
            <LogoMark size={32} tone="dark" />
          </div>
          <div>
            {/* The page's own heading, rather than the organisation's name —
                every other dashboard puts its h1 on the work, not the brand. */}
            <h1 className="m-0 text-[24px] font-bold tracking-[-0.01em] text-navy">
              Founding Document System
            </h1>
            <div className="mt-1 font-mono text-[11px] tracking-[0.14em] text-doc-muted uppercase">
              CEMAC-Wide Mandate · Cameroon Founding Chapter
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="mr-1.5 inline-block rounded-full bg-tint-gold px-3.5 py-1.5 text-[12px] font-semibold text-gold-ink">
            v0.1 — Skeleton Stage
          </div>
          <div className="mt-2 text-[12.5px] text-doc-muted">
            {documentCounts.total} documents · Cameroon chapter, 1 of 6 CEMAC
            states
          </div>
        </div>
      </div>

      {/* POSITIONING STRIP */}
      <div className="border-y border-doc-line bg-tint-green">
        <div className="mx-auto max-w-[1180px] px-8 py-7">
          <div className="mb-2 font-mono text-[11px] tracking-[0.14em] text-green uppercase">
            Positioning
          </div>
          <p className="m-0 max-w-[820px] text-[19px] leading-[1.4] font-semibold text-doc-ink">
            VAACA&apos;s mandate is CEMAC-wide from the outset — Cameroon,
            Central African Republic, Chad, Republic of the Congo, Equatorial
            Guinea and Gabon — built by standing up one working national chapter
            first and replicating it, not by declaring a regional body before
            any chapter operates.
          </p>

          <div className="mt-[22px] flex flex-wrap gap-4">
            {PHASES.map((phase) => (
              <div
                key={phase.title}
                className="min-w-[220px] flex-1 rounded-[14px] border border-doc-line bg-white px-[18px] py-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${phase.dot}`}
                  />
                  <span className="text-[14px] font-semibold">
                    {phase.title}
                  </span>
                </div>
                <div className="mt-1.5 text-[13px] leading-[1.5] text-doc-body">
                  {phase.body}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[26px]">
            <div className="mb-2.5 font-mono text-[11px] tracking-[0.14em] text-green uppercase">
              CEMAC coverage — 6 member states
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {COVERAGE.map((state) => (
                <div
                  key={state.name}
                  className={`rounded-xl border bg-white px-3.5 py-3 ${
                    state.active ? "border-green" : "border-doc-line"
                  }`}
                >
                  <div className="text-[13.5px] font-bold text-doc-ink">
                    {state.name}
                  </div>
                  <div
                    className={`mt-1.5 text-[11px] font-semibold ${
                      state.active ? "text-green" : "text-doc-muted"
                    }`}
                  >
                    {state.status}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[12px] leading-[1.5] text-doc-muted">
              All six sit under the same regional regulators the source
              documents already name — COBAC, COSUMAF, BEAC and GABAC — so the
              Readiness Framework&apos;s gates and domains travel to each state
              largely unchanged; only local PSAN transposition and secretariat
              staffing are chapter-specific.
            </p>
          </div>
        </div>
      </div>

      <main id="main-content" className="mx-auto max-w-[1180px] px-8 py-9">
        {/* OVERVIEW STATS */}
        <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
          {overviewStats(documentCounts).map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[20px] px-[26px] py-6 text-white shadow-[0_14px_30px_-20px_rgba(11,49,52,.55)] ${stat.bg}`}
            >
              <div className="text-[14px] opacity-90">{stat.label}</div>
              <div className="vaaca-figure mt-2.5 text-[48px] font-bold">
                {stat.value}
              </div>
              <div className="mt-1 text-[12px] opacity-75">{stat.note}</div>
            </div>
          ))}
        </div>

        <DocumentLibrary documents={documents} />

        {/* DOCUMENT CARDS */}
        <h2 className="mb-1 text-[20px] font-bold text-navy">
          The three founding documents — Cameroon chapter
        </h2>
        <p className="mb-5 text-[14px] text-doc-body">
          Written for the Cameroon chapter, inside its own Charter — the first
          chapter of VAACA, the CEMAC-wide association. Each carries a full
          structural skeleton and an evidence-tagging convention — V (Verified),
          I (Interpretation), P (Proposal) — with narrative content and register
          rows still to be drafted.
        </p>

        <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.title}
              className="flex flex-col rounded-2xl border border-doc-line bg-white px-6 py-[22px] shadow-[0_1px_3px_rgba(15,67,70,.10)]"
            >
              <div className="font-mono text-[11px] tracking-[0.12em] text-doc-muted uppercase">
                {doc.n}
              </div>
              <h3 className="m-0 mt-1 text-[18px] font-bold text-navy">
                {doc.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-doc-body">
                {doc.desc}
              </p>
              <div className="my-3.5 flex gap-1.5">
                <span className="rounded-full bg-doc-tint-v px-2.5 py-1 text-[11.5px] font-semibold text-green">
                  V · {doc.tags.v}
                </span>
                <span className="rounded-full bg-tint-gold px-2.5 py-1 text-[11.5px] font-semibold text-gold-ink">
                  I · {doc.tags.i}
                </span>
                <span className="rounded-full bg-doc-tint-p px-2.5 py-1 text-[11.5px] font-semibold text-teal-ink">
                  P · {doc.tags.p}
                </span>
              </div>
              <div className="mt-auto text-[12px] font-semibold text-doc-ink">
                {doc.parts} {doc.partNoun} drafted
              </div>
              <div className="mt-1 text-[12.5px] leading-[1.6] text-doc-muted">
                {doc.outline}
              </div>
            </div>
          ))}
        </div>

        {/* CROSS-REFERENCE MAP */}
        <h2 className="mb-1 text-[20px] font-bold text-navy">
          How the three documents connect
        </h2>
        <p className="mb-[18px] text-[14px] text-doc-body">
          Each governance concept is defined once and referenced across the set
          — a reviewer checking one claim should expect to find its counterpart
          in the other two.
        </p>

        <div className="mb-10 overflow-x-auto rounded-2xl border border-doc-line bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[
                  "Concept",
                  "Charter",
                  "Readiness Framework",
                  "Coalition Architecture",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="border-b border-doc-line bg-doc-head px-[18px] py-3.5 text-left text-[12.5px] font-semibold text-navy"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CROSS_REF.map((row, i, all) => {
                const edge =
                  i < all.length - 1 ? "border-b border-doc-line" : "";
                return (
                  <tr key={row.concept}>
                    <th
                      scope="row"
                      className={`px-[18px] py-3.5 text-left text-[13.5px] font-semibold text-doc-ink ${edge}`}
                    >
                      {row.concept}
                    </th>
                    {[row.charter, row.framework, row.coalition].map((cell) => (
                      <td
                        key={cell}
                        className={`px-[18px] py-3.5 text-[13px] text-doc-body ${edge}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GAP ANALYSIS */}
        <h2 className="mb-1 text-[20px] font-bold text-navy">
          Gap analysis — what&apos;s left to draft
        </h2>
        <p className="mb-[18px] text-[14px] text-doc-body">
          High-level, per document. Ready to hand to writers; the structural
          skeleton and evidence tags are already in place.
        </p>

        <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {GAPS.map((gap) => (
            <div
              key={gap.title}
              className="rounded-2xl border border-doc-line bg-white px-[22px] py-5"
            >
              <h3 className="m-0 mb-2.5 text-[15px] font-bold text-navy">
                {gap.title}
              </h3>
              <ol className="m-0 list-decimal pl-4 text-[13px] leading-[1.7] text-doc-body">
                {gap.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="mb-2 rounded-2xl border border-doc-line bg-tint-green px-6 py-[22px]">
          <div className="mb-2 font-mono text-[11px] tracking-[0.12em] text-green uppercase">
            Standing priority
          </div>
          <p className="m-0 max-w-[820px] text-[14.5px] leading-[1.6] text-doc-ink">
            Before any content pass: stand up the Cameroon secretariat function
            called for in Charter Part 6 (Secretary General, Standards &amp;
            Assessment Officer) — it is the operating capacity every other
            document assumes is already running, and the template the Central
            Africa federation will eventually replicate.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-5 bg-navy-deep px-8 py-6 text-doc-footer-ink">
        <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-5 text-[12.5px]">
          <div>
            Prepared for founding-coalition review. Not for circulation outside
            the coalition until legal review is complete.
          </div>
          <div>
            Virtual Assets Association of Central Africa · Cameroon founding
            chapter, 1 of 6 CEMAC states — reviewed against v0.1 source
            documents
          </div>
        </div>
      </footer>
    </div>
  );
}
