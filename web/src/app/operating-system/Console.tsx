"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { routes } from "@/lib/routes";
import { LockIcon } from "@/components/icons";
import { SignOutButton } from "@/components/DashboardBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/locale";
import { ROLE_LABEL, type StaffRole } from "@/lib/staff-roles";
import { NAV_ORDER, TAB_META, type TabId } from "@/lib/operating-system";
import type { PanelProps } from "./sections";
import {
  AccessTab,
  ApplicationsTab,
  ChaptersTab,
  CharterTab,
  CoalitionDocTab,
  GapsTab,
  InstitutionsTab,
  MembersTab,
  OverviewTab,
  PsanTab,
  RoadmapTab,
  SeatsTab,
} from "./sections";

const PANELS: Record<TabId, (props: PanelProps) => React.JSX.Element> = {
  overview: OverviewTab,
  access: AccessTab,
  charter: CharterTab,
  psan: PsanTab,
  coalitiondoc: CoalitionDocTab,
  coalition: SeatsTab,
  members: MembersTab,
  gaps: GapsTab,
  institutions: InstitutionsTab,
  applications: ApplicationsTab,
  chapters: ChaptersTab,
  roadmap: RoadmapTab,
};

/**
 * Internal secretariat console.
 *
 * Tab state is local; each panel renders working-draft content from
 * `lib/operating-system`. The route is gated server-side in `page.tsx` and
 * again in middleware, per the `staff_role` check BACKEND_NOTES.md requires.
 */
export function OperatingSystemConsole({
  locale,
  languageLabel,
  staffEmail,
  staffRole,
  ...panel
}: {
  locale: Locale;
  languageLabel: string;
  staffEmail: string;
  staffRole: StaffRole;
} & PanelProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const Panel = PANELS[tab];
  const meta = TAB_META[tab];

  return (
    <div className="flex min-h-screen flex-col bg-doc-canvas text-doc-ink lg:flex-row">
      {/* SIDEBAR — a fixed rail at lg+, a horizontally scrollable tab strip
          below it, so the console doesn't open on a full screen of nav. */}
      <div className="flex shrink-0 flex-col bg-navy text-[#F4F8EC] lg:sticky lg:top-0 lg:h-screen lg:w-[230px] lg:px-3.5 lg:py-5">
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 lg:px-2 lg:pt-1 lg:pb-[22px]">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-navy-deep">
            <LogoMark size={24} tone="dark" />
          </div>
          <div className="leading-[1.25]">
            <b className="block text-[14px]">VAACA</b>
            <span className="text-[11px] text-teal-bright">
              Operating System
            </span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-x-visible lg:px-0 lg:pb-0">
          {NAV_ORDER.map((entry, i) => {
            if (entry === "divider") {
              // Vertical tick between groups in the strip, full rule in the rail.
              return (
                <div
                  key={`rule-${i}`}
                  className="mx-1 h-6 w-px shrink-0 self-center bg-teal lg:mx-1.5 lg:my-2 lg:h-px lg:w-auto lg:self-auto"
                  role="separator"
                />
              );
            }

            if (entry === "admin") {
              return (
                <Link
                  key="admin"
                  href={routes.admin}
                  className="shrink-0 rounded-lg px-3.5 py-2.5 text-[13.5px] font-semibold whitespace-nowrap text-on-dark no-underline hover:bg-navy-grad hover:text-white lg:block"
                >
                  Admin Queue
                  <span aria-hidden>↗</span>
                </Link>
              );
            }

            return (
              <button
                key={entry}
                type="button"
                aria-current={tab === entry ? "page" : undefined}
                onClick={() => setTab(entry)}
                className={`shrink-0 cursor-pointer rounded-[10px] border-0 px-3.5 py-[11px] text-left text-[14px] whitespace-nowrap lg:w-full ${
                  tab === entry
                    ? "bg-teal font-semibold text-[#0B3134]"
                    : "bg-transparent font-medium text-doc-stone hover:bg-navy-grad hover:text-white"
                }`}
              >
                {TAB_META[entry].nav}
              </button>
            );
          })}
        </nav>

        <div className="hidden flex-1 lg:block" />

        <div className="hidden px-2 py-2.5 text-[11px] leading-[1.5] text-doc-stone lg:block">
          v0.1 · Cameroon founding chapter
          <br />1 of 6 CEMAC states
        </div>
      </div>

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-[3px] bg-teal" />

        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-doc-line bg-doc-canvas px-5 py-[22px] lg:px-9">
          <div>
            <h1 className="m-0 text-[22px] font-bold text-navy">
              {meta.title}
            </h1>
            <div className="mt-1 text-[13px] text-doc-muted">{meta.sub}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={routes.home}
              className="rounded-full border border-doc-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-navy no-underline hover:border-navy hover:bg-navy hover:text-white"
            >
              Public site
              <span aria-hidden>↗</span>
            </Link>
            <Link
              href={routes.documents}
              className="rounded-full border border-doc-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-navy no-underline hover:border-navy hover:bg-navy hover:text-white"
            >
              Document review
              <span aria-hidden>↗</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-teal-bright uppercase">
              <LockIcon size="xs" />
              {ROLE_LABEL[staffRole]}
            </div>
            <div className="rounded-full bg-tint-gold px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-gold-ink uppercase">
              Working Draft · v0.2
            </div>
            <LanguageSwitcher locale={locale} label={languageLabel} />
            <span className="text-[12.5px] text-muted">{staffEmail}</span>
            <SignOutButton
              audience="staff"
              className="text-navy hover:text-teal-ink"
            />
          </div>
        </div>

        <main id="main-content" className="flex-1 px-5 py-[30px] lg:px-9">
          <Panel {...panel} />
        </main>

        <div className="bg-navy-deep px-5 py-[18px] text-[12px] text-doc-footer-ink lg:px-9">
          Prepared for founding-coalition review. Not for circulation outside
          the coalition until legal review is complete.
        </div>
      </div>
    </div>
  );
}
