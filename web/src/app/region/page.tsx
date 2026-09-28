import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, Shell } from "@/components/Shell";
import { CemacMap } from "@/components/CemacMap";
import { routes } from "@/lib/routes";
import { CHAPTERS, FOUNDING_CHAPTER } from "@/lib/chapters";
import { countByCountry } from "@/lib/server/store";
import { membersByCountry } from "@/lib/server/members";

export const metadata: Metadata = {
  title: "Region",
  description:
    "Cameroon's founding chapter and the five CEMAC states next in line — one region, multiple markets, a shared institutional architecture.",
};

export const dynamic = "force-dynamic";

export default async function RegionPage() {
  // The console already reported real per-country activity; the public page
  // showed a fixed label, so the two described different regions.
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
          <Eyebrow tone="teal">Region</Eyebrow>
          <h1 className="m-0 mb-[30px] max-w-[720px] font-serif text-[32px] leading-[1.3] font-semibold text-white">
            One region. Multiple markets. A shared institutional architecture.
          </h1>

          <div className="mb-5 grid items-center gap-6 rounded-[14px] bg-white p-6 md:grid-cols-[260px_1fr]">
            <CemacMap
              highlight={FOUNDING_CHAPTER.code}
              theme="light"
              className="mx-auto h-[300px] w-full"
              title="The six CEMAC member states, with Cameroon as the founding chapter"
            />

            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] text-green uppercase">
                CEMAC coverage
              </div>
              <p className="mt-2 mb-4 max-w-[520px] text-[13.5px] leading-[1.6] text-body-soft">
                All six member states sit under the same regional regulators —
                COBAC, COSUMAF, BEAC and GABAC — so the Readiness Framework
                travels between them largely unchanged. Only local PSAN
                transposition and secretariat staffing are chapter-specific.
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
                        {chapter.shortName}
                      </dt>
                      <dd className="m-0 text-[11px] text-muted">
                        {chapter.gridStatus}
                        {activity(chapter.name).applications > 0
                          ? ` · ${activity(chapter.name).applications} application(s)`
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
                  href={routes.chapter(chapter.slug)}
                  className={`block rounded-xl border p-3.5 no-underline transition-colors hover:border-teal ${
                    founding ? "border-teal" : "border-white/16"
                  }`}
                >
                  <div className="text-[13px] font-bold text-white">
                    {chapter.shortName}
                  </div>
                  <div
                    className={`mt-1.5 text-[10.5px] font-semibold ${
                      founding ? "text-teal-bright" : "text-on-dark-mute"
                    }`}
                  >
                    {chapter.gridStatus}
                  </div>
                  {activity(chapter.name).members > 0 ? (
                    <div className="mt-1 text-[10.5px] text-on-dark-mute">
                      {activity(chapter.name).members} member account(s)
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
