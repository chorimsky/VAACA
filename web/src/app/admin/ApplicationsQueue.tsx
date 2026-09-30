"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardBar } from "@/components/DashboardBar";
import { staffLinks } from "@/lib/dashboard-links";
import { Card } from "@/components/primitives";
import { Tag, type Tone } from "@/components/Tag";
import { routes } from "@/lib/routes";
import { LockIcon } from "@/components/icons";
import { ROLE_LABEL, type StaffRole } from "@/lib/staff-roles";
import type { Locale } from "@/lib/i18n/locale";
import type { Application, ApplicationStatus } from "@/lib/application-types";
import {
  DOMAIN_NAME,
  MAX_SCORE,
  MEMBER_STATUS_LABEL,
  SCORE_STATUS_LABEL,
  totalScore,
  type MemberStatus,
  type ReadinessScore,
  type ScoreStatus,
} from "@/lib/member-types";

/** Membership standing, distinct from the accession decision. */
const MEMBER_STATUS_TONE: Record<MemberStatus, Tone> = {
  applicant: "blue",
  active: "green",
  suspended: "red",
};

type Counts = Record<ApplicationStatus | "total", number>;

/** The member account and readiness card behind an application, when it has one. */
type Scorecard = {
  memberId: string;
  status: MemberStatus;
  scores: ReadinessScore[];
} | null;

const SCORE_TONE: Record<ScoreStatus, Tone> = {
  not_started: "neutral",
  in_review: "blue",
  scored: "green",
  capped: "gold",
  blocked: "red",
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  in_review: "In review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_TONE: Record<ApplicationStatus, Tone> = {
  submitted: "gold",
  in_review: "blue",
  approved: "green",
  rejected: "red",
};

const FILTERS: (ApplicationStatus | "all")[] = [
  "all",
  "submitted",
  "in_review",
  "approved",
  "rejected",
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
] as const;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const countOf = (rows: Application[]): Counts => ({
  total: rows.length,
  submitted: rows.filter((a) => a.status === "submitted").length,
  in_review: rows.filter((a) => a.status === "in_review").length,
  approved: rows.filter((a) => a.status === "approved").length,
  rejected: rows.filter((a) => a.status === "rejected").length,
});

/**
 * Secretariat applications queue.
 *
 * Every change goes through `PATCH /api/applications/:id`, which re-checks the
 * session on the server and appends an attributed history entry — these buttons
 * are a view onto that, not the authority for it.
 */
export function ApplicationsQueue({
  locale,
  languageLabel,
  staffEmail,
  staffRole,
  initialApplications,
  initialCounts,
  scorecards: initialScorecards,
}: {
  locale: Locale;
  languageLabel: string;
  staffEmail: string;
  staffRole: StaffRole;
  initialApplications: Application[];
  initialCounts: Counts;
  scorecards: Record<string, Scorecard>;
}) {
  const router = useRouter();

  const [applications, setApplications] = useState(initialApplications);
  const [counts, setCounts] = useState(initialCounts);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [scorecards, setScorecards] =
    useState<Record<string, Scorecard>>(initialScorecards);
  const [resetLink, setResetLink] = useState<{
    id: string;
    url: string;
  } | null>(null);

  const selected = useMemo(
    () => applications.find((a) => a.id === selectedId) ?? null,
    [applications, selectedId],
  );
  const selectedNotes = selected?.notes ?? "";

  // Reset the note box when the open application (or its saved notes) changes.
  // Adjusting state during render is React's documented alternative to an
  // effect here — it re-renders before committing, with no extra paint.
  const [noteKey, setNoteKey] = useState<string | null>(null);
  const currentNoteKey = `${selectedId ?? ""}:${selectedNotes}`;
  if (noteKey !== currentNoteKey) {
    setNoteKey(currentNoteKey);
    setNoteDraft(selectedNotes);
  }

  const refresh = useCallback(async () => {
    const params = new URLSearchParams({ sort });
    if (filter !== "all") params.set("status", filter);
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(`/api/applications?${params}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Could not load applications.");
        return;
      }
      const data = (await res.json()) as { applications: Application[] };
      setApplications(data.applications);
      setError(null);
    } catch {
      setError("Could not reach the server.");
    }
  }, [filter, search, sort, router]);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(refresh, 220);
    return () => clearTimeout(id);
  }, [refresh]);

  const syncCounts = useCallback(async () => {
    const res = await fetch("/api/applications", { cache: "no-store" });
    if (!res.ok) return;
    const all = (await res.json()) as { applications: Application[] };
    setCounts(countOf(all.applications));
  }, []);

  const patch = async (
    id: string,
    body: { status?: ApplicationStatus; notes?: string | null },
  ) => {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "That change could not be saved.");
        return;
      }
      const { application } = (await res.json()) as {
        application: Application;
      };

      // A status change can move a row out of the current filter.
      if (filter !== "all" && application.status !== filter) {
        setApplications((prev) => prev.filter((a) => a.id !== application.id));
        if (selectedId === application.id) setSelectedId(null);
      } else {
        setApplications((prev) =>
          prev.map((a) => (a.id === application.id ? application : a)),
        );
      }
      await syncCounts();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPendingId(null);
    }
  };

  /** Score one readiness domain for the member behind an application. */
  const scoreDomain = async (
    applicationId: string,
    memberId: string,
    domain: string,
    value: number | null,
  ) => {
    setPendingId(applicationId);
    setError(null);
    try {
      const res = await fetch(`/api/members/${memberId}/scores`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          score: value,
          status: value === null ? "not_started" : "scored",
        }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "That score could not be saved.");
        return;
      }
      const { scores } = (await res.json()) as { scores: ReadinessScore[] };
      setScorecards((prev) => {
        const card = prev[applicationId];
        return {
          ...prev,
          // Keep the member's standing; only the scores changed here.
          [applicationId]: {
            memberId,
            status: card?.status ?? "applicant",
            scores,
          },
        };
      });
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPendingId(null);
    }
  };

  /**
   * Issues a single-use reset link for the member behind an application. There
   * is no mail transport, so the link is shown once for the secretariat to pass
   * on out of band.
   */
  /**
   * Suspend or reinstate a member. Separate from the accession decision: that
   * records whether they were admitted, this whether an admitted member is in
   * good standing.
   */
  const setMemberStanding = async (
    applicationId: string,
    memberId: string,
    status: MemberStatus,
  ) => {
    setPendingId(applicationId);
    setError(null);
    try {
      const res = await fetch(`/api/members/${memberId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "That change could not be saved.");
        return;
      }
      const { member } = (await res.json()) as {
        member: { status: MemberStatus };
      };
      setScorecards((prev) => {
        const card = prev[applicationId];
        if (!card) return prev;
        return { ...prev, [applicationId]: { ...card, status: member.status } };
      });
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPendingId(null);
    }
  };

  const issueReset = async (applicationId: string, memberId: string) => {
    setPendingId(applicationId);
    setError(null);
    try {
      const res = await fetch(`/api/members/${memberId}/reset`, {
        method: "POST",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Could not issue a reset link.");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      setResetLink({ id: applicationId, url });
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPendingId(null);
    }
  };

  const stats = [
    { label: "Total", value: counts.total },
    { label: "Submitted", value: counts.submitted },
    { label: "In review", value: counts.in_review },
    { label: "Approved", value: counts.approved },
    { label: "Rejected", value: counts.rejected },
  ];

  return (
    <div className="min-h-screen bg-canvas text-body">
      <DashboardBar
        audience="staff"
        locale={locale}
        languageLabel={languageLabel}
        title="Secretariat Admin"
        titleHref={routes.admin}
        identity={staffEmail}
        links={staffLinks("admin", locale)}
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] whitespace-nowrap text-teal-bright uppercase">
            <LockIcon size="xs" />
            {ROLE_LABEL[staffRole]}
          </span>
        }
      />

      <main
        id="main-content"
        className="vaaca-fade-in mx-auto max-w-[1280px] px-8 pt-8 pb-16"
      >
        <div className="mb-2 font-mono text-[11px] tracking-[0.14em] text-green uppercase">
          Applications Queue
        </div>
        <h1 className="m-0 mb-1.5 font-serif text-[27px] font-semibold text-navy">
          Review membership applications
        </h1>
        <p className="mb-[26px] max-w-[680px] text-[14px] leading-[1.6] text-body-soft">
          Decisions are saved against your account and recorded in each
          application&apos;s history. Applications arrive here from the public
          registration form.
        </p>

        <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5">
          {stats.map((stat) => (
            <Card key={stat.label} className="px-[18px] py-4">
              <div className="text-[11px] tracking-[0.05em] text-muted uppercase">
                {stat.label}
              </div>
              <div className="vaaca-figure mt-[5px] text-[24px] font-bold text-navy">
                {stat.value}
              </div>
            </Card>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={`cursor-pointer rounded-full px-4 py-2 text-[12.5px] font-semibold ${
                  on
                    ? "border-none bg-navy text-white"
                    : "border border-line bg-white text-muted"
                }`}
              >
                {f === "all" ? "All" : STATUS_LABEL[f]}
              </button>
            );
          })}

          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, country…"
              aria-label="Search applications"
              className="min-w-[220px] rounded-lg border border-line px-3.5 py-2.5 text-[13px] focus:outline-2 focus:outline-offset-1 focus:outline-teal"
            />
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as (typeof SORTS)[number]["value"])
              }
              aria-label="Sort applications"
              className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] focus:outline-2 focus:outline-offset-1 focus:outline-teal"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-tint-red px-3.5 py-2.5 text-[13px] text-red"
          >
            {error}
          </p>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* QUEUE */}
          <div className="flex min-w-0 flex-col gap-3">
            {applications.map((app) => {
              const busy = pendingId === app.id;
              const open = selectedId === app.id;
              return (
                <Card
                  key={app.id}
                  className={`px-[22px] py-[18px] transition-colors ${
                    open ? "border-teal" : ""
                  } ${busy ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedId(open ? null : app.id)}
                      aria-expanded={open}
                      className="min-w-0 cursor-pointer border-none bg-transparent p-0 text-left"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[14.5px] font-bold text-navy">
                          {app.name}
                        </span>
                        <span className="rounded-full bg-canvas-alt px-2.5 py-[3px] text-[11px] font-semibold text-muted">
                          Class {app.classKey}
                        </span>
                        {/* Status sits with the identity, not with the actions:
                            it describes the row, and keeping the right-hand
                            group to buttons alone stops it wrapping unevenly
                            as names change length. */}
                        <Tag
                          tone={STATUS_TONE[app.status]}
                          className="px-2.5 py-[3px]"
                        >
                          {STATUS_LABEL[app.status]}
                        </Tag>
                      </span>
                      <span className="mt-[5px] block text-[12.5px] text-muted">
                        {app.email} · {app.country} · Submitted{" "}
                        {fmtDate(app.submittedAt)}
                      </span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {app.status === "submitted" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => patch(app.id, { status: "in_review" })}
                          className="cursor-pointer rounded-[7px] border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-navy disabled:cursor-not-allowed"
                        >
                          Start review
                        </button>
                      )}

                      {app.status !== "approved" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => patch(app.id, { status: "approved" })}
                          className="cursor-pointer rounded-[7px] border-none bg-green px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>
                      )}

                      {app.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => patch(app.id, { status: "rejected" })}
                          className="cursor-pointer rounded-[7px] border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-red disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {applications.length === 0 && (
              <Card className="p-8 text-center text-[13.5px] text-muted">
                {search.trim() || filter !== "all"
                  ? "No applications match these filters."
                  : "No applications yet. They arrive here from the public registration form."}
              </Card>
            )}
          </div>

          {/* DETAIL */}
          <div className="min-w-0 lg:sticky lg:top-6">
            {selected ? (
              <Card className="rounded-[14px] p-6">
                <div className="mb-1 font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">
                  Application detail
                </div>
                <h2 className="m-0 text-[17px] font-bold text-navy">
                  {selected.name}
                </h2>

                <dl className="mt-4 grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-[12.5px]">
                  {[
                    ["Email", selected.email],
                    ["Country", selected.country],
                    ["Class", `Class ${selected.classKey}`],
                    ["Status", STATUS_LABEL[selected.status]],
                    ["Submitted", fmtDateTime(selected.submittedAt)],
                    ["Last updated", fmtDateTime(selected.updatedAt)],
                    ["Reviewer", selected.reviewer ?? "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-muted">{label}</dt>
                      <dd className="m-0 font-medium break-words text-navy">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5">
                  <label
                    htmlFor="reviewer-notes"
                    className="mb-1.5 block text-[12.5px] font-semibold text-navy"
                  >
                    Reviewer notes
                  </label>
                  <textarea
                    id="reviewer-notes"
                    rows={3}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Context for the next reviewer…"
                    className="w-full rounded-lg border border-line px-3 py-2.5 text-[13px] focus:outline-2 focus:outline-offset-1 focus:outline-teal"
                  />
                  <button
                    type="button"
                    disabled={
                      pendingId === selected.id || noteDraft === selectedNotes
                    }
                    onClick={() =>
                      patch(selected.id, { notes: noteDraft.trim() || null })
                    }
                    className="mt-2 cursor-pointer rounded-lg border-none bg-navy px-4 py-2 text-[12.5px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#B9C0C6]"
                  >
                    Save notes
                  </button>
                </div>

                {(() => {
                  const card = scorecards[selected.id];
                  if (!card) return null;
                  const link =
                    resetLink?.id === selected.id ? resetLink.url : null;
                  return (
                    <div className="mt-5 rounded-lg bg-canvas-head px-3.5 py-3">
                      <div className="text-[12.5px] font-semibold text-navy">
                        Member account
                      </div>
                      <p className="mt-1 text-[11.5px] leading-[1.5] text-muted">
                        Members cannot reset their own password — issue a
                        single-use link and pass it on directly.
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Tag tone={MEMBER_STATUS_TONE[card.status]}>
                          {MEMBER_STATUS_LABEL[card.status]}
                        </Tag>
                        <button
                          type="button"
                          disabled={pendingId === selected.id}
                          onClick={() => issueReset(selected.id, card.memberId)}
                          className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-navy disabled:cursor-not-allowed"
                        >
                          Issue password reset
                        </button>
                        <button
                          type="button"
                          disabled={pendingId === selected.id}
                          onClick={() =>
                            setMemberStanding(
                              selected.id,
                              card.memberId,
                              card.status === "suspended"
                                ? // Reinstating returns an admitted member to
                                  // active, and anyone else to applicant.
                                  selected.status === "approved"
                                  ? "active"
                                  : "applicant"
                                : "suspended",
                            )
                          }
                          className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-navy disabled:cursor-not-allowed"
                        >
                          {card.status === "suspended"
                            ? "Reinstate member"
                            : "Suspend member"}
                        </button>
                      </div>
                      {link && (
                        <div className="mt-2">
                          <code className="block rounded bg-white px-2.5 py-2 font-mono text-[11px] break-all text-navy">
                            {link}
                          </code>
                          <p className="mt-1 text-[11px] text-muted">
                            Valid for 24 hours, single use. It is not shown
                            again.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {(() => {
                  const card = scorecards[selected.id];
                  if (!card) return null;
                  const total = totalScore(card.scores);
                  return (
                    <div className="mt-6">
                      <div className="mb-2 flex items-baseline justify-between">
                        <div className="font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">
                          Readiness scoring
                        </div>
                        <div className="text-[12px] font-semibold text-navy">
                          {total} / {MAX_SCORE}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {card.scores.map((s) => (
                          <div
                            key={s.domain}
                            className="rounded-lg bg-canvas-head px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12.5px] font-semibold text-navy">
                                {s.domain} · {DOMAIN_NAME[s.domain]}
                              </span>
                              <Tag tone={SCORE_TONE[s.status]}>
                                {SCORE_STATUS_LABEL[s.status]}
                              </Tag>
                            </div>
                            <div
                              className="mt-2 flex items-center gap-1.5"
                              role="group"
                              aria-label={`Score ${s.domain}`}
                            >
                              {[0, 1, 2, 3].map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  disabled={pendingId === selected.id}
                                  aria-pressed={s.score === v}
                                  onClick={() =>
                                    scoreDomain(
                                      selected.id,
                                      card.memberId,
                                      s.domain,
                                      v,
                                    )
                                  }
                                  className={`h-7 w-7 cursor-pointer rounded-md text-[12px] font-semibold disabled:cursor-not-allowed ${
                                    s.score === v
                                      ? "border-none bg-navy text-white"
                                      : "border border-line bg-white text-muted"
                                  }`}
                                >
                                  {v}
                                </button>
                              ))}
                              <button
                                type="button"
                                disabled={pendingId === selected.id}
                                onClick={() =>
                                  scoreDomain(
                                    selected.id,
                                    card.memberId,
                                    s.domain,
                                    null,
                                  )
                                }
                                className="ml-1 cursor-pointer border-none bg-transparent p-0 text-[11.5px] font-semibold text-muted disabled:cursor-not-allowed"
                              >
                                Clear
                              </button>
                            </div>
                            {s.note && (
                              <div className="mt-1.5 text-[11.5px] leading-[1.5] text-muted">
                                {s.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[11.5px] leading-[1.5] text-muted">
                        Scores are visible to this member on their own
                        dashboard.
                      </p>
                    </div>
                  );
                })()}

                <div className="mt-6">
                  <div className="mb-2 font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase">
                    History
                  </div>
                  <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {[...selected.history].reverse().map((event, i) => (
                      <li
                        key={`${event.at}-${i}`}
                        className="border-l-2 border-line pl-3 text-[12px] leading-[1.5]"
                      >
                        <div className="font-semibold text-navy">
                          {event.action}
                        </div>
                        <div className="text-muted">
                          {fmtDateTime(event.at)} · {event.actor}
                        </div>
                        {event.note && (
                          <div className="mt-1 text-body-soft italic">
                            “{event.note}”
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </Card>
            ) : (
              <Card className="rounded-[14px] p-6 text-[13px] leading-[1.6] text-muted">
                Select an application to see its full record, reviewer notes and
                decision history.
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
