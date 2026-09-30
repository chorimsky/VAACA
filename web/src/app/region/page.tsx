import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, Shell } from "@/components/Shell";
import { CemacMap } from "@/components/CemacMap";
import { routes } from "@/lib/routes";
import { CHAPTERS, FOUNDING_CHAPTER } from "@/lib/chapters";
import { countByCountry } from "@/lib/server/store";
import { membersByCountry } from "@/lib/server/members";
import { getTranslations } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Region",
  description:
    "Cameroon's founding chapter and the five CEMAC states next in line — one region, multiple markets, a shared institutional architecture.",
};

export const dynamic = "force-dynamic";

export default async function RegionPage() {
  // The console already reported real per-country activity; the public page
  // showed a fixed label, so the two described different regions.
  const { t, path } = await getTranslations();
  const r = t.region;
  const [applications, members] = await Promise.all([
    countByCountry(),
    membersByCountry(),
  ]);
  const activity = (country: string) => ({
    applications: applications[country]?.total ?? 0,
    members: members[country] ?? 0,
  });

  return (
    <Shell active="region">
      <div className="bg-navy px-8 pt-14 pb-[68px]">
        <div className="mx-auto max-w-[1180px]">
          <Eyebrow tone="teal">{t.nav.primary.region}</Eyebrow>
          <h1 className="m-0 mb-[30px] max-w-[720px] font-serif text-[32px] leading-[1.3] font-semibold text-white">
            {r.title}
          </h1>

          <div className="mb-5 grid items-center gap-6 rounded-[14px] bg-white p-6 md:grid-cols-[260px_1fr]">
            <CemacMap
              highlight={FOUNDING_CHAPTER.code}
              theme="light"
              className="mx-auto h-[300px] w-full"
              title={r.mapTitle}
            />

            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] text-green uppercase">
                {r.coverage}
              </div>
              <p className="mt-2 mb-4 max-w-[520px] text-[13.5px] leading-[1.6] text-body-soft">
                {r.coverageNote}
              </p>
              <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
                {CHAPTERS.map((chapter) => (
                  <div key={chapter.slug} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        chapter.kind === "founding" ? "bg-teal" : "bg-line"
                      }`}
                    />
                    <div className="min-w-0">
                      <dt className="text-[12.5px] font-semibold text-navy">
                        {
                          t.chapters.names[
                            chapter.slug as keyof typeof t.chapters.names
                          ].short
                        }
                      </dt>
                      <dd className="m-0 text-[11px] text-muted">
                        {chapter.kind === "founding"
                          ? t.chapters.cameroon.gridStatus
                          : t.chapters.gridPending}
                        {activity(chapter.name).applications > 0
                          ? ` · ${fill(r.applications, { count: activity(chapter.name).applications })}`
                          : ""}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Every state links to its own chapter page, the founding one
              included — it used to point at the internal Operating System. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CHAPTERS.map((chapter) => {
              const founding = chapter.kind === "founding";
              return (
                <Link
                  key={chapter.slug}
                  href={path(routes.chapter(chapter.slug))}
                  className={`block rounded-xl border p-3.5 no-underline transition-colors hover:border-teal ${
                    founding ? "border-teal" : "border-white/16"
                  }`}
                >
                  <div className="text-[13px] font-bold text-white">
                    {
                      t.chapters.names[
                        chapter.slug as keyof typeof t.chapters.names
                      ].short
                    }
                  </div>
                  <div
                    className={`mt-1.5 text-[10.5px] font-semibold ${
                      founding ? "text-teal-bright" : "text-on-dark-mute"
                    }`}
                  >
                    {chapter.kind === "founding"
                      ? t.chapters.cameroon.gridStatus
                      : t.chapters.gridPending}
                  </div>
                  {activity(chapter.name).members > 0 ? (
                    <div className="mt-1 text-[10.5px] text-on-dark-mute">
                      {fill(r.memberAccounts, {
                        count: activity(chapter.name).members,
                      })}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
