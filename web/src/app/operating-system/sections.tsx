"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DocCard,
  DocTable,
  SectionHeading,
  TabIntro,
} from "@/components/DocPanel";
import { routes } from "@/lib/routes";
import type { StaffSeat } from "@/lib/seat-types";
import { SeatsTracker } from "./SeatsTracker";
import type { ClassKey } from "@/lib/application-types";
import { CHAPTERS } from "@/lib/chapters";
import {
  GAP_OWNERS,
  GAP_STATUSES,
  GAP_STATUS_CLASS,
  GAP_STATUS_LABEL,
  type GapOwner,
  type GapStatus,
  type InstructionGap,
} from "@/lib/gap-types";
import {
  ACCESS_ROWS,
  AUDIENCE_CLASS,
  CHARTER_PARTS,
  COALITION_PARTS,
  DOMAINS,
  DOSSIER_PARTS,
  EVIDENCE_CLASS,
  INSTITUTIONS,
  MEMBER_CLASS_ROWS,
  overviewStats,
  PEERS,
  PIPELINE,
  PSAN_GATES,
  RESPONSIBILITIES,
  RISKS,
  ROADMAP_PHASES,
  SECRETARIAT_POSTS,
  THRESHOLDS,
  WHATS_NEW,
  WORK_STREAMS,
  type Evidence,
  type OverviewCounts,
} from "@/lib/operating-system";

const CELL = "px-4 py-3.5 text-[13px] text-doc-body";
const CELL_KEY = "px-4 py-3.5 text-left text-[13px] font-semibold text-doc-ink";
const ROW = "border-b border-doc-line";
const INPUT =
  "rounded-lg border border-doc-line px-3.5 py-2.5 text-[13px] focus:outline-2 focus:outline-offset-1 focus:outline-teal";

function EvidenceTag({ tag }: { tag: Evidence }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${EVIDENCE_CLASS[tag]}`}
    >
      {tag}
    </span>
  );
}

/** Numbered document part — shared by the Charter and Coalition tabs. */
function PartCard({
  kind,
  n,
  title,
  body,
  tag,
}: {
  kind: string;
  n: number;
  title: string;
  body: string;
  tag?: Evidence;
}) {
  return (
    <DocCard className="mb-3.5 px-[22px] py-[18px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-[11px] text-doc-muted">
          {kind} {n}
        </span>
        <span className="text-[15px] font-bold text-navy">{title}</span>
        {tag && <EvidenceTag tag={tag} />}
      </div>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-doc-body">{body}</p>
    </DocCard>
  );
}

/** Live per-country activity behind the chapters dashboard. */
export type ChapterActivity = {
  applications: Record<
    string,
    { total: number; pending: number; approved: number }
  >;
  members: Record<string, number>;
};

export type PanelProps = {
  gaps: InstructionGap[];
  seats: StaffSeat[];
  counts: OverviewCounts;
  memberCounts: Record<ClassKey | "total", number>;
  chapterActivity: ChapterActivity;
};

export function OverviewTab({ counts }: PanelProps) {
  return (
    <>
      <div className="mb-[30px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[18px]">
        {overviewStats(counts).map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[18px] px-6 py-[22px] text-white ${stat.bg}`}
          >
            <div className="text-[13px] opacity-90">{stat.label}</div>
            <div className="vaaca-figure mt-2 text-[42px] font-bold">
              {stat.value}
            </div>
            <div className="mt-1 text-[12px] opacity-75">{stat.note}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-doc-line bg-tint-green px-6 py-[22px]">
        <div className="mb-2 font-mono text-[11px] tracking-[0.12em] text-green uppercase">
          What running this Association requires right now
        </div>
        <p className="m-0 max-w-[820px] text-[14px] leading-[1.6] text-doc-ink">
          Stand up the Cameroon secretariat (Secretary General, Standards &amp;
          Assessment Officer) called for in the Charter — it is the operating
          capacity every founding document assumes is already running, and the
          template the other five CEMAC chapters will replicate.
        </p>
      </div>

      <h2 className="mb-3.5 text-[16px] font-bold text-navy">
        Where each work-stream stands
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {WORK_STREAMS.map((item) => (
          <DocCard key={item.title} className="px-5 py-[18px]">
            <div className="text-[13.5px] font-semibold">{item.title}</div>
            <div className="mt-1.5 text-[12.5px] text-doc-muted">
              {item.note}
            </div>
          </DocCard>
        ))}
      </div>

      <h2 className="mt-[26px] mb-3.5 text-[16px] font-bold text-navy">
        What&apos;s new in v0.2
      </h2>
      <DocCard className="mb-[26px] px-5 py-[18px]">
        <ul className="m-0 list-none p-0 text-[13px] leading-[1.9] text-doc-body">
          {WHATS_NEW.map((item) => (
            <li key={item}>— {item}</li>
          ))}
        </ul>
      </DocCard>

      <h2 className="mt-[26px] mb-3.5 text-[16px] font-bold text-navy">
        Secretariat status
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {SECRETARIAT_POSTS.map((post) => (
          <DocCard key={post.title} className="px-5 py-[18px]">
            <div className="text-[13.5px] font-semibold">{post.title}</div>
            <div className="mt-1.5 text-[12.5px] text-doc-muted">
              {post.note}
            </div>
          </DocCard>
        ))}
      </div>
    </>
  );
}

export function AccessTab() {
  return (
    <>
      <TabIntro>
        Who can see each VAACA surface, and who inside the secretariat is
        accountable for keeping it current.
      </TabIntro>

      <SectionHeading>Access by surface</SectionHeading>
      <div className="mb-[26px]">
        <DocTable headers={["Surface", "Audience", "Purpose"]}>
          {ACCESS_ROWS.map((row) => (
            <tr key={row.surface}>
              <th scope="row" className={`${CELL_KEY} ${ROW}`}>
                {row.surface}
              </th>
              <td className={`px-4 py-3 ${ROW}`}>
                <span
                  className={`rounded-full px-2.5 py-[3px] text-[11px] font-bold ${AUDIENCE_CLASS[row.audience]}`}
                >
                  {row.audience}
                </span>
              </td>
              <td className={`${CELL} ${ROW}`}>{row.purpose}</td>
            </tr>
          ))}
        </DocTable>
      </div>

      <SectionHeading>Who is responsible for what</SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {RESPONSIBILITIES.map((item) => (
          <DocCard key={item.role} className="px-5 py-[18px]">
            <div className="text-[14.5px] font-bold text-navy">{item.role}</div>
            <div className="mt-1 text-[12.5px] text-doc-muted">
              {item.status}
            </div>
            <div className="mt-2.5 text-[13px] leading-[1.6] text-doc-body">
              {item.owns}
            </div>
          </DocCard>
        ))}
      </div>
    </>
  );
}

export function CharterTab() {
  return (
    <>
      <TabIntro>
        Institutional Charter — 9 parts. Tags mark each part&apos;s evidence
        status: <b className="text-green">V</b> verified against source
        material, <b className="text-gold-ink">I</b> interpretation,{" "}
        <b className="text-teal-ink">P</b> proposal drafted for this build.
      </TabIntro>
      {CHARTER_PARTS.map((part) => (
        <PartCard key={part.n} kind="Part" {...part} />
      ))}
    </>
  );
}

export function PsanTab({ gaps }: PanelProps) {
  return (
    <>
      <TabIntro>
        PSAN Regulatory Readiness Framework — 3 perimeter gates, 8 readiness
        domains, a 10-item gap register, and a 3-tier threshold scale.
      </TabIntro>

      {PSAN_GATES.map((gate) => (
        <PartCard key={gate.n} kind="Gate" {...gate} />
      ))}

      <SectionHeading className="mt-[22px]">
        8 Readiness Domains — scored 0–3, 24-point scale
      </SectionHeading>
      <div className="mb-[22px]">
        <DocTable headers={["Domain", "What it tests"]}>
          {DOMAINS.map((d) => (
            <tr key={d.id}>
              <th scope="row" className={`${CELL_KEY} ${ROW} text-[13.5px]`}>
                {d.id} — {d.name}
              </th>
              <td className={`${CELL} ${ROW}`}>{d.tests}</td>
            </tr>
          ))}
        </DocTable>
      </div>

      <SectionHeading>Gap Register (G1–G10)</SectionHeading>
      <div className="mb-[22px]">
        <DocTable headers={["ID", "Gap", "Default if unresolved"]}>
          {gaps.map((g) => (
            <tr key={g.id}>
              <th scope="row" className={`${CELL_KEY} ${ROW}`}>
                {g.id}
              </th>
              <td className={`${CELL} ${ROW}`}>{g.description}</td>
              <td className={`px-4 py-3.5 text-[13px] text-doc-muted ${ROW}`}>
                {g.consequence}
              </td>
            </tr>
          ))}
        </DocTable>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <DocCard className="px-5 py-[18px]">
          <div className="mb-2.5 text-[14px] font-bold text-navy">
            Dossier structure (Parts A–G)
          </div>
          <div className="text-[13px] leading-[1.7] text-doc-body">
            {DOSSIER_PARTS.join(" · ")}
          </div>
        </DocCard>
        <DocCard className="px-5 py-[18px]">
          <div className="mb-2.5 text-[14px] font-bold text-navy">
            Thresholds (T0–T2)
          </div>
          <div className="text-[13px] leading-[1.7] text-doc-body">
            {THRESHOLDS.join(" · ")}
          </div>
        </DocCard>
      </div>
    </>
  );
}

export function CoalitionDocTab() {
  return (
    <>
      <TabIntro>
        Founding Coalition &amp; Alliance Architecture — 7 parts. Positions
        VAACA&apos;s Cameroon chapter against peer bodies, then maps the
        coalition, institutions and launch sequence.
      </TabIntro>

      {COALITION_PARTS.map((part) => (
        <PartCard key={part.n} kind="Part" {...part} />
      ))}

      <SectionHeading className="mt-[22px]">
        Peer &amp; partner map
      </SectionHeading>
      <div className="mb-[22px] grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {PEERS.map((peer) => (
          <DocCard key={peer.name} className="px-[18px] py-4">
            <div className="text-[14px] font-bold text-navy">{peer.name}</div>
            <div className="mt-1.5 text-[12.5px] leading-[1.5] text-doc-muted">
              {peer.posture}
            </div>
          </DocCard>
        ))}
      </div>

      <SectionHeading>Risk register</SectionHeading>
      <DocTable headers={["Risk", "Likelihood", "Mitigation"]}>
        {RISKS.map((r) => (
          <tr key={r.risk}>
            <th scope="row" className={`${CELL_KEY} ${ROW}`}>
              {r.risk}
            </th>
            <td className={`px-4 py-3 ${ROW}`}>
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${EVIDENCE_CLASS[r.tag]}`}
              >
                {r.likelihood}
              </span>
            </td>
            <td className={`${CELL} ${ROW}`}>{r.mitigation}</td>
          </tr>
        ))}
      </DocTable>
    </>
  );
}

export function SeatsTab({ seats }: PanelProps) {
  return (
    <>
      <TabIntro>
        Nine seats, defined in the Founding Coalition &amp; Alliance
        Architecture. This is the recruitment register: status, holder and
        sourcing notes are saved against your account, and the public Governance
        page publishes a seat&apos;s organisation once it is filled.
      </TabIntro>
      <SeatsTracker seats={seats} />
    </>
  );
}

export function MembersTab({ memberCounts }: PanelProps) {
  return (
    <>
      <TabIntro>
        Five accession classes from Charter Part 4. Open, non-exclusive
        membership — this register is public once the Association is operating.
      </TabIntro>

      <DocTable headers={["Class", "Who", "Voting", "Members"]}>
        {MEMBER_CLASS_ROWS.map((cls) => (
          <tr key={cls.letter}>
            <th scope="row" className={`${CELL_KEY} ${ROW} text-[13.5px]`}>
              {cls.letter}
            </th>
            <td className={`${CELL} ${ROW}`}>{cls.who}</td>
            <td className={`${CELL} ${ROW}`}>{cls.voting}</td>
            <td className={`px-4 py-3.5 text-[13px] text-doc-muted ${ROW}`}>
              {memberCounts[cls.letter.charAt(0) as ClassKey] ?? 0}
            </td>
          </tr>
        ))}
      </DocTable>

      <div className="mt-[22px] flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-doc-line bg-tint-green px-[22px] py-5">
        <div>
          <div className="mb-2 font-mono text-[11px] tracking-[0.12em] text-green uppercase">
            How to join
          </div>
          <ol className="m-0 max-w-[640px] list-decimal pl-4 text-[13.5px] leading-[1.7] text-doc-ink">
            <li>Identify your class (A–E) above.</li>
            <li>Register your interest through the public application form.</li>
            <li>
              Class A/B members complete the PSAN Readiness self-assessment;
              Classes C–E are admitted on credential review only.
            </li>
          </ol>
        </div>
        <Link
          href={routes.register}
          className="rounded-lg bg-green px-5 py-[11px] text-[13px] font-semibold whitespace-nowrap text-white no-underline hover:bg-[#145E39] hover:text-white"
        >
          Open application form
          <span aria-hidden>↗</span>
        </Link>
      </div>
    </>
  );
}

export function GapsTab({ gaps: initialGaps }: PanelProps) {
  const [gaps, setGaps] = useState(initialGaps);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GapStatus | "all">("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const open = gaps.find((g) => g.id === openId) ?? null;
  const openNote = open?.note ?? "";

  // Reset the note box when a different gap is opened — adjusting state during
  // render rather than in an effect.
  const [noteKey, setNoteKey] = useState<string | null>(null);
  const key = `${openId ?? ""}:${openNote}`;
  if (noteKey !== key) {
    setNoteKey(key);
    setNoteDraft(openNote);
  }

  const patch = async (
    id: string,
    body: { status?: GapStatus; owner?: GapOwner; note?: string | null },
  ) => {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/gaps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "That change could not be saved.");
        return;
      }
      const { gap } = (await res.json()) as { gap: InstructionGap };
      setGaps((prev) => prev.map((g) => (g.id === gap.id ? gap : g)));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPendingId(null);
    }
  };

  const term = search.trim().toLowerCase();
  const visible = gaps.filter((g) => {
    const matches =
      !term ||
      g.description.toLowerCase().includes(term) ||
      g.owner.toLowerCase().includes(term) ||
      g.id.toLowerCase().includes(term);
    return matches && (statusFilter === "all" || g.status === statusFilter);
  });

  const openCount = gaps.filter((g) => g.status !== "closed").length;

  return (
    <>
      <TabIntro>
        Ten instruction gaps from the Readiness Framework — {openCount} still
        open. Changing a status or owner here is saved against your account;
        this register is the live one, not a snapshot.
      </TabIntro>

      <div className="mb-4 flex flex-wrap gap-2.5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gaps or owners…"
          aria-label="Search gaps or owners"
          className={`${INPUT} min-w-[200px] flex-1`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as GapStatus | "all")}
          aria-label="Filter by status"
          className={`${INPUT} bg-white`}
        >
          <option value="all">All statuses</option>
          {GAP_STATUSES.map((st) => (
            <option key={st} value={st}>
              {GAP_STATUS_LABEL[st]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-tint-red px-3.5 py-2.5 text-[13px] text-red"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((gap) => {
          const busy = pendingId === gap.id;
          const isOpen = openId === gap.id;
          return (
            <DocCard
              key={gap.id}
              className={`px-5 py-4 ${busy ? "opacity-60" : ""} ${
                isOpen ? "border-teal" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : gap.id)}
                  className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-bold text-doc-ink">
                      {gap.id}
                    </span>
                    <span className="text-[13.5px] font-semibold text-doc-ink">
                      {gap.description}
                    </span>
                  </span>
                  <span className="mt-1 block text-[12.5px] text-doc-muted">
                    {gap.consequence}
                  </span>
                </button>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${GAP_STATUS_CLASS[gap.status]}`}
                >
                  {GAP_STATUS_LABEL[gap.status]}
                </span>
              </div>

              {isOpen && (
                <div className="mt-4 border-t border-doc-line pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-semibold text-doc-ink">
                        Status
                      </span>
                      <select
                        value={gap.status}
                        disabled={busy}
                        onChange={(e) =>
                          patch(gap.id, {
                            status: e.target.value as GapStatus,
                          })
                        }
                        className={`${INPUT} bg-white`}
                      >
                        {GAP_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {GAP_STATUS_LABEL[st]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-semibold text-doc-ink">
                        Owner
                      </span>
                      <select
                        value={gap.owner}
                        disabled={busy}
                        onChange={(e) =>
                          patch(gap.id, { owner: e.target.value as GapOwner })
                        }
                        className={`${INPUT} bg-white`}
                      >
                        {GAP_OWNERS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 flex flex-col gap-1.5">
                    <span className="text-[12px] font-semibold text-doc-ink">
                      Progress note
                    </span>
                    <textarea
                      rows={2}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="What has moved on this gap…"
                      className={`${INPUT} w-full`}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy || noteDraft === openNote}
                    onClick={() =>
                      patch(gap.id, { note: noteDraft.trim() || null })
                    }
                    className="mt-2 cursor-pointer rounded-lg border-none bg-navy px-4 py-2 text-[12.5px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#B9C0C6]"
                  >
                    Save note
                  </button>

                  {gap.updatedBy && gap.updatedAt && (
                    <p className="mt-3 text-[11.5px] text-doc-muted">
                      Last updated by {gap.updatedBy} on{" "}
                      {new Date(gap.updatedAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              )}
            </DocCard>
          );
        })}

        {visible.length === 0 && (
          <DocCard className="p-6 text-center text-[13px] text-doc-muted">
            No gaps match your search.
          </DocCard>
        )}
      </div>
    </>
  );
}

export function InstitutionsTab() {
  const [search, setSearch] = useState("");
  const term = search.toLowerCase();
  const visible = INSTITUTIONS.filter(
    (i) =>
      !term ||
      i.name.toLowerCase().includes(term) ||
      i.desc.toLowerCase().includes(term),
  );

  return (
    <>
      <TabIntro>
        Priority regulators and ministries named in the Founding Coalition &amp;
        Alliance Architecture (Part 4), with engagement posture for Phase 1.
      </TabIntro>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search institutions…"
        aria-label="Search institutions"
        className={`${INPUT} mb-4 box-border w-full`}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {visible.map((inst) => (
          <DocCard key={inst.name} className="px-5 py-[18px]">
            <div className="text-[14.5px] font-bold text-navy">{inst.name}</div>
            <div className="mt-1.5 text-[12.5px] leading-[1.5] text-doc-muted">
              {inst.desc}
            </div>
            <div className="mt-2 text-[12.5px] leading-[1.5] text-doc-body">
              {inst.posture}
            </div>
            <div className="mt-2.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${EVIDENCE_CLASS[inst.tag]}`}
              >
                {inst.postureTag}
              </span>
            </div>
          </DocCard>
        ))}
      </div>
    </>
  );
}

export function ApplicationsTab() {
  return (
    <>
      <TabIntro>
        The intake pipeline a PSAN applicant moves through. Interest
        registration is open via the public site; secretariat review begins once
        the Charter is ratified.
      </TabIntro>

      <div className="mb-3.5 flex justify-end">
        <Link
          href={routes.register}
          className="rounded-full bg-navy px-4 py-2 text-[12.5px] font-semibold text-white no-underline hover:bg-teal-deep hover:text-white"
        >
          View applicant intake form
          <span aria-hidden>↗</span>
        </Link>
      </div>

      <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
        {PIPELINE.map((stage) => (
          <DocCard key={stage.n} className="px-[18px] py-4">
            <div className="font-mono text-[11px] text-doc-muted">
              Stage {stage.n}
            </div>
            <div className="mt-1 text-[14px] font-bold text-navy">
              {stage.title}
            </div>
            <div className="mt-1.5 text-[12.5px] leading-[1.5] text-doc-body">
              {stage.desc}
            </div>
          </DocCard>
        ))}
      </div>

      <DocCard className="rounded-2xl p-8 text-center text-[13.5px] text-doc-muted">
        0 applications logged — secretariat review table activates once the
        Charter is ratified.
      </DocCard>
    </>
  );
}

export function ChaptersTab({ chapterActivity }: PanelProps) {
  return (
    <>
      <TabIntro>
        All six CEMAC member states, with live intake against each. Every state
        shares COBAC, COSUMAF, BEAC and GABAC with Cameroon; only the national
        FIU/ministry contact and local PSAN transposition differ per chapter.
      </TabIntro>

      <DocTable
        headers={[
          "Chapter",
          "Status",
          "National FIU",
          "Language",
          "Applications",
          "Members",
        ]}
      >
        {CHAPTERS.map((c) => {
          const apps = chapterActivity.applications[c.name] ?? {
            total: 0,
            pending: 0,
            approved: 0,
          };
          const members = chapterActivity.members[c.name] ?? 0;
          const founding = c.kind === "founding";

          return (
            <tr key={c.slug}>
              <th scope="row" className={`${CELL_KEY} ${ROW} text-[13.5px]`}>
                <Link
                  href={routes.chapter(c.slug)}
                  className="font-semibold text-navy no-underline hover:text-teal-ink"
                >
                  {c.name}
                </Link>
              </th>
              <td className={`px-4 py-3.5 ${ROW}`}>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                    founding
                      ? "bg-doc-tint-v text-green"
                      : "bg-tint-gold text-gold-ink"
                  }`}
                >
                  {founding ? "Active" : "Pending accession"}
                </span>
              </td>
              <td className={`${CELL} ${ROW}`}>{c.fiu}</td>
              <td className={`${CELL} ${ROW}`}>{c.language}</td>
              <td className={`${CELL} ${ROW}`}>
                {apps.total === 0 ? (
                  <span className="text-doc-muted">None yet</span>
                ) : (
                  <>
                    <span className="font-semibold text-doc-ink">
                      {apps.total}
                    </span>{" "}
                    <span className="text-doc-muted">
                      ({apps.pending} pending · {apps.approved} approved)
                    </span>
                  </>
                )}
              </td>
              <td className={`${CELL} ${ROW}`}>
                {members === 0 ? (
                  <span className="text-doc-muted">—</span>
                ) : (
                  <span className="font-semibold text-doc-ink">{members}</span>
                )}
              </td>
            </tr>
          );
        })}
      </DocTable>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {CHAPTERS.filter((c) => c.kind === "pending").map((c) => (
          <DocCard key={c.slug} className="px-5 py-[18px]">
            <div className="flex items-center justify-between gap-3">
              <Link
                href={routes.chapter(c.slug)}
                className="text-[15px] font-bold text-navy no-underline hover:text-teal-ink"
              >
                {c.name}
              </Link>
              <span className="rounded-full bg-tint-gold px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-gold-ink">
                {c.badge}
              </span>
            </div>
            <div className="mt-2 text-[12.5px] leading-[1.6] text-doc-muted">
              {c.localScope}
            </div>
          </DocCard>
        ))}
      </div>
    </>
  );
}

export function RoadmapTab({ chapterActivity }: PanelProps) {
  return (
    <>
      <div className="mb-[26px] flex flex-wrap gap-4">
        {ROADMAP_PHASES.map((phase) => (
          <div
            key={phase.title}
            className={`min-w-[220px] flex-1 rounded-[14px] border bg-white px-5 py-[18px] ${phase.border}`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${phase.dot}`} />
              <span className="text-[14px] font-semibold">{phase.title}</span>
            </div>
            <div className="mt-2 text-[13px] leading-[1.5] text-doc-body">
              {phase.body}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3.5 text-[16px] font-bold text-navy">CEMAC coverage</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CHAPTERS.map((c) => {
          const founding = c.kind === "founding";
          const apps = chapterActivity.applications[c.name]?.total ?? 0;
          return (
            <Link
              key={c.slug}
              href={routes.chapter(c.slug)}
              className={`rounded-xl border bg-white px-3.5 py-3 no-underline hover:border-teal ${
                founding ? "border-green" : "border-doc-line"
              }`}
            >
              <div className="text-[13px] font-bold text-doc-ink">
                {c.shortName}
              </div>
              <div
                className={`mt-1.5 text-[11px] font-semibold ${
                  founding ? "text-green" : "text-doc-muted"
                }`}
              >
                {founding ? "Founding chapter · active" : "Pending accession"}
              </div>
              <div className="mt-1 text-[11px] text-doc-muted">
                {apps === 0 ? "No applications" : `${apps} application(s)`}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
