import Link from "next/link";
import { Container, Eyebrow, Shell } from "@/components/Shell";
import { HeroGraphic } from "@/components/HeroGraphic";
import { routes } from "@/lib/routes";
import { getTranslations } from "@/lib/i18n/server";

export default async function HomePage() {
  const { t, path } = await getTranslations();
  const h = t.home;

  const STATS = [
    { value: "6", label: h.stats.states },
    { value: "8", label: h.stats.domains },
    { value: "9", label: h.stats.seats },
  ];

  const SECTIONS = [
    {
      name: t.nav.primary.institution,
      desc: h.sections.institution,
      href: routes.institution,
    },
    {
      name: t.nav.primary.standards,
      desc: h.sections.standards,
      href: routes.standards,
    },
    {
      name: t.nav.primary.ecosystem,
      desc: h.sections.ecosystem,
      href: routes.ecosystem,
    },
    {
      name: t.nav.primary.membership,
      desc: h.sections.membership,
      href: routes.membership,
    },
    {
      name: t.nav.primary.governance,
      desc: h.sections.governance,
      href: routes.governance,
    },
    {
      name: t.nav.primary.region,
      desc: h.sections.region,
      href: routes.region,
    },
  ];

  return (
    <Shell>
      {/* HERO */}
      <div className="vaaca-pattern mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-11 px-8 pt-11 pb-[68px]">
        <div className="min-w-0">
          <div className="mb-[22px] inline-flex items-center gap-2 rounded-full bg-tint-green px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[0.04em] text-green uppercase">
            {h.badge}
          </div>

          <div className="mb-3 text-[15px] font-semibold tracking-[0.02em] text-teal-ink">
            {h.kicker}
          </div>

          <h1 className="m-0 max-w-[600px] font-serif text-[48px] leading-[1.12] font-semibold tracking-[-0.015em] text-navy">
            {h.title}
          </h1>

          <p className="mt-5 max-w-[560px] text-[15.5px] leading-[1.65] text-body-soft">
            {h.lede}
          </p>

          <p className="mt-4 max-w-[560px] border-l-2 border-line pl-3 text-[12.5px] leading-[1.6] text-muted">
            {h.disclaimer}
          </p>

          <div className="mt-[30px] flex flex-wrap gap-3.5">
            <Link
              href={path(routes.institution)}
              className="rounded-lg bg-[linear-gradient(135deg,#0B4944,#0D554F)] px-[26px] py-3.5 text-[14.5px] font-semibold text-white no-underline shadow-[0_10px_24px_-10px_rgba(14,42,68,0.5)] transition-colors hover:bg-teal-deep hover:bg-none hover:text-white hover:shadow-[0_10px_24px_-10px_rgba(26,166,179,0.55)]"
            >
              {h.exploreInstitution}
            </Link>
            <Link
              href={path(routes.register)}
              className="rounded-lg border border-line bg-white px-6 py-[13px] text-[14px] font-semibold text-navy no-underline transition-colors hover:border-navy"
            >
              {t.nav.join}
            </Link>
          </div>
        </div>

        <div className="min-w-0">
          <HeroGraphic
            className="h-[280px] w-full overflow-hidden rounded-2xl"
            title={h.heroGraphic}
          />

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
        <Eyebrow>{h.exploreEyebrow}</Eyebrow>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {SECTIONS.map((section) => (
            <Link
              key={section.name}
              href={path(section.href)}
              className="block rounded-[14px] border border-line bg-white p-[22px] no-underline transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-14px_rgba(14,42,68,.35)]"
            >
              <div className="text-[16px] font-bold text-navy">
                {section.name}
              </div>
              <div className="mt-2 text-[13px] leading-[1.55] text-muted">
                {section.desc}
              </div>
              <div className="mt-3.5 text-[12.5px] font-semibold text-teal-ink">
                {h.learnMore}
                <span aria-hidden>→</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Shell>
  );
}
