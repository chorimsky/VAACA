"use client";

import Link from "next/link";
import { DashboardBar } from "@/components/DashboardBar";
import { localePath, type Locale } from "@/lib/i18n/locale";
import { Card } from "@/components/primitives";
import { Tag, type Tone } from "@/components/Tag";
import { routes } from "@/lib/routes";
import type { ApplicationStatus } from "@/lib/application-types";
import {
  DOMAIN_NAME,
  MAX_SCORE,
  MEMBER_STATUS_LABEL,
  SCORE_STATUS_LABEL,
  isScoredClass,
  totalScore,
  type Member,
  type ReadinessScore,
  type ScoreStatus,
} from "@/lib/member-types";
import {
  CLASS_LABEL,
  CLASS_NOTE,
  SUBLINE,
  dashboardStats,
} from "@/lib/dashboard-view";

type ApplicationView = {
  statusLabel: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  notes: string | null;
};

const SCORE_TONE: Record<ScoreStatus, Tone> = {
  not_started: "neutral",
  in_review: "blue",
  scored: "green",
  capped: "gold",
  blocked: "red",
};

const APPLICATION_TONE: Record<ApplicationStatus, Tone> = {
  submitted: "gold",
  in_review: "blue",
  approved: "green",
  rejected: "red",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * Member dashboard — the signed-in member's own record.
 *
 * All props come from the server keyed off the session; there is no class
 * switcher, because a member has exactly one class and no business seeing
 * another one's view.
 */
export function Dashboard({
  locale,
  languageLabel,
  member,
  scores,
  application,
}: {
  locale: Locale;
  languageLabel: string;
  member: Member;
  scores: ReadinessScore[];
  application: ApplicationView | null;
}) {
  const scored = isScoredClass(member.classKey) && scores.length > 0;
  const stats = dashboardStats(
    member,
    scores,
    application?.statusLabel ?? "Not submitted",
  );
  const note = CLASS_NOTE[member.classKey];

  const path = (to: string) => localePath(locale, to);

  return (
    <div className="min-h-screen bg-canvas text-body">
      <DashboardBar
        audience="member"
        locale={locale}
        languageLabel={languageLabel}
        title="VAACA Member Dashboard"
        identity={member.email}
        signOutHref={path(routes.login)}
        // A member could not previously reach the framework they are scored
        // against, or the documents they are entitled to, without leaving
        // through the logo.
        links={[
          { label: "Standards", href: path(routes.standards) },
          { label: "Documents", href: path(routes.resources) },
          { label: "Public site", href: path(routes.home), external: true },
        ]}
        badges={
          <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-[11.5px] font-semibold text-teal-bright">
            {MEMBER_STATUS_LABEL[member.status]}
          </span>
        }
      />

      <main
        id="main-content"
        className="vaaca-fade-in mx-auto max-w-[1280px] px-8 pt-9 pb-16"
      >
        <div className="mb-7">
          <div className="mb-1.5 font-mono text-[11px] tracking-[0.12em] text-green uppercase">
            {CLASS_LABEL[member.classKey]}
          </div>
          <h1 className="m-0 font-serif text-[27px] font-semibold text-navy">
            Welcome back, {member.name}
          </h1>
          <p className="mt-1.5 max-w-[680px] text-[14px] leading-[1.6] text-body-soft">
            {SUBLINE[member.classKey]}
          </p>
        </div>

        {/* STATS */}
        <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
          {stats.map((stat) => (
            <Card key={stat.label} className="px-5 py-[18px]">
              <div className="text-[11px] tracking-[0.05em] text-muted uppercase">
                {stat.label}
              </div>
              <div className="vaaca-figure mt-1.5 text-[26px] font-bold text-navy">
                {stat.value}
              </div>
              {stat.note && (
                <div className="mt-1 text-[11.5px] text-muted">{stat.note}</div>
              )}
            </Card>
          ))}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* MAIN PANEL */}
          <Card className="min-w-0 rounded-[14px] p-6">
            <h2 className="mb-4 text-[15px] font-bold text-navy">
              {scored ? "Readiness domain scores" : "Your accession request"}
            </h2>

            {scored ? (
              <>
                <div className="mb-4">
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-canvas-alt"
                    role="img"
                    aria-label={`${totalScore(scores)} of ${MAX_SCORE} readiness points`}
                  >
                    <div
                      className="h-full rounded-full bg-teal-deep"
                      style={{
                        width: `${(totalScore(scores) / MAX_SCORE) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {scores.map((s) => (
                    <div
                      key={s.domain}
                      className="flex items-start justify-between gap-3.5 rounded-[10px] bg-canvas-head px-4 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold text-navy">
                          {s.domain} · {DOMAIN_NAME[s.domain]}
                        </div>
                        <div className="mt-[3px] text-[12px] text-muted">
                          {s.note ?? "Awaiting assessment by the secretariat."}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <span className="text-[13px] font-semibold text-navy">
                          {s.score === null ? "—" : `${s.score}/3`}
                        </span>
                        <Tag tone={SCORE_TONE[s.status]}>
                          {SCORE_STATUS_LABEL[s.status]}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : application ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3.5 rounded-[10px] bg-canvas-head px-4 py-3.5">
                  <div>
                    <div className="text-[13.5px] font-semibold text-navy">
                      Accession request
                    </div>
                    <div className="mt-[3px] text-[12px] text-muted">
                      Submitted {fmtDate(application.submittedAt)} · last
                      updated {fmtDate(application.updatedAt)}
                    </div>
                  </div>
                  <Tag tone={APPLICATION_TONE[application.status]}>
                    {application.statusLabel}
                  </Tag>
                </div>

                {application.notes && (
                  <div className="rounded-[10px] bg-canvas-head px-4 py-3.5">
                    <div className="text-[13.5px] font-semibold text-navy">
                      Secretariat note
                    </div>
                    <div className="mt-[3px] text-[12.5px] leading-[1.55] text-body-soft">
                      {application.notes}
                    </div>
                  </div>
                )}

                <p className="m-0 text-[12.5px] leading-[1.6] text-muted">
                  Classes C–E are admitted on credential review and are not
                  scored against the PSAN Readiness Framework.
                </p>
              </div>
            ) : (
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                No accession request is linked to this account yet.
              </p>
            )}
          </Card>

          {/* SIDE PANEL */}
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="rounded-[14px] p-[22px]">
              <h2 className="mb-3.5 text-[14.5px] font-bold text-navy">
                Your record
              </h2>
              <dl className="m-0 grid grid-cols-[92px_1fr] gap-x-4 gap-y-2 text-[12.5px]">
                {[
                  ["Name", member.name],
                  ["Email", member.email],
                  ["Country", member.country],
                  ["Class", `Class ${member.classKey}`],
                  ["Status", MEMBER_STATUS_LABEL[member.status]],
                  ["Joined", fmtDate(member.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted">{label}</dt>
                    <dd className="m-0 font-medium break-words text-navy">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="rounded-[14px] p-[22px]">
              <h2 className="mb-3.5 text-[14.5px] font-bold text-navy">
                Quick actions
              </h2>
              <div className="flex flex-col gap-2">
                <Link
                  href={routes.standards}
                  className="rounded-lg bg-canvas-alt px-3.5 py-[11px] text-[13px] font-semibold text-navy no-underline hover:bg-[#E9EAE6] hover:text-navy"
                >
                  View the Readiness Framework
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href={routes.resources}
                  className="rounded-lg bg-canvas-alt px-3.5 py-[11px] text-[13px] font-semibold text-navy no-underline hover:bg-[#E9EAE6] hover:text-navy"
                >
                  Documents &amp; library
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href={routes.membership}
                  className="rounded-lg bg-canvas-alt px-3.5 py-[11px] text-[13px] font-semibold text-navy no-underline hover:bg-[#E9EAE6] hover:text-navy"
                >
                  Membership classes
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </Card>

            <div className="rounded-[14px] bg-navy p-[22px]">
              <div className="mb-2 text-[14px] font-bold text-white">
                {note.title}
              </div>
              <div className="text-[12.5px] leading-[1.6] text-on-dark">
                {note.body}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
