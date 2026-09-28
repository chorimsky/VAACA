import Link from "next/link";
import { Container, Eyebrow, Shell } from "@/components/Shell";
import { HeroGraphic } from "@/components/HeroGraphic";
import { routes } from "@/lib/routes";

const STATS = [
  { value: "6", label: "CEMAC states" },
  { value: "8", label: "Readiness domains" },
  { value: "9", label: "Founding seats" },
];

const SECTIONS = [
  {
    name: "The Institution",
    desc: "Why VAACA exists, its founders, secretariat and first convening.",
    href: routes.institution,
  },
  {
    name: "Standards",
    desc: "The PSAN Regulatory Readiness Framework — gates, domains, roadmap.",
    href: routes.standards,
  },
  {
    name: "Ecosystem",
    desc: "Who VAACA connects, and its regulatory engagement posture.",
    href: routes.ecosystem,
  },
  {
    name: "Membership",
    desc: "Accession classes, the application process, and common questions.",
    href: routes.membership,
  },
  {
    name: "Governance",
    desc: "Nine founding seats — no single interest holds a majority.",
    href: routes.governance,
  },
  {
    name: "Region",
    desc: "Cameroon’s founding chapter and the five CEMAC states next in line.",
    href: routes.region,
  },
];

export default function HomePage() {
  return (
    <Shell>
      {/* HERO */}
      <div className="vaaca-pattern mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-11 px-8 pt-11 pb-[68px]">
        <div className="min-w-0">
          <div className="mb-[22px] inline-flex items-center gap-2 rounded-full bg-tint-green px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[0.04em] text-green uppercase">
            In Formation · Cameroon Founding Chapter
          </div>

          <div className="mb-3 text-[15px] font-semibold tracking-[0.02em] text-teal-ink">
            Building Trust. Setting Standards. Connecting Central Africa.
          </div>

          <h1 className="m-0 max-w-[600px] font-serif text-[48px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy">
            The regional institution organizing Central Africa&apos;s
            virtual-asset economy.
          </h1>

          <p className="mt-5 max-w-[560px] text-[15.5px] leading-[1.65] text-body-soft">
            VAACA connects industry, regulators, researchers and innovators
            around shared standards and trusted market infrastructure across the
            six CEMAC states.
          </p>

          <p className="mt-4 max-w-[560px] border-l-2 border-line pl-3 text-[12.5px] leading-[1.6] text-muted">
            VAACA is not a regulator. It does not replace BEAC, COBAC, COSUMAF,
            GABAC or national governments — it is an independent institution
            that builds standards, evidence and dialogue alongside them.
          </p>

          <div className="mt-[30px] flex flex-wrap gap-3.5">
            <Link
              href={routes.institution}
              className="rounded-lg bg-[linear-gradient(135deg,#0E2A44,#163A56)] px-[26px] py-3.5 text-[14.5px] font-semibold text-white no-underline shadow-[0_10px_24px_-10px_rgba(14,42,68,0.5)] transition-colors hover:bg-teal-deep hover:bg-none hover:text-white hover:shadow-[0_10px_24px_-10px_rgba(26,166,179,0.55)]"
            >
              Explore the Institution
            </Link>
            <Link
              href={routes.register}
              className="rounded-lg border border-line bg-white px-6 py-[13px] text-[14px] font-semibold text-navy no-underline transition-colors hover:border-navy"
            >
              Join the Association
            </Link>
          </div>
        </div>

        <div className="min-w-0">
          <HeroGraphic className="h-[280px] w-full overflow-hidden rounded-2xl" />

          <div className="mt-[22px] grid grid-cols-3">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={
                  i === 0
                    ? "border-r border-line pr-[18px] text-left"
                    : i === 1
                      ? "border-r border-line px-[18px] text-left"
                      : "pl-[18px] text-left"
                }
              >
                <div className="vaaca-figure font-serif text-[30px] font-semibold text-navy">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11.5px] tracking-[0.01em] text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION TEASERS */}
      <Container className="pt-5 pb-16">
        <Eyebrow>Explore VAACA</Eyebrow>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {SECTIONS.map((section) => (
            <Link
              key={section.name}
              href={section.href}
              className="block rounded-[14px] border border-line bg-white p-[22px] no-underline transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-14px_rgba(14,42,68,.35)]"
            >
              <div className="text-[16px] font-bold text-navy">
                {section.name}
              </div>
              <div className="mt-2 text-[13px] leading-[1.55] text-muted">
                {section.desc}
              </div>
              <div className="mt-3.5 text-[12.5px] font-semibold text-teal-ink">
                Learn more
                <span aria-hidden>→</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Shell>
  );
}
