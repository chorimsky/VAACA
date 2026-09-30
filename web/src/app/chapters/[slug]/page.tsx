import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/dictionaries";
import { Logo } from "@/components/Logo";
import { Card, Container, Eyebrow, TopRule } from "@/components/Shell";
import { CemacMap } from "@/components/CemacMap";
import { routes } from "@/lib/routes";
import { CHAPTERS, SHARED_REGULATORS, getChapter } from "@/lib/chapters";

type Params = { params: Promise<{ slug: string }> };

/**
 * The chapter slugs are a closed set, so anything outside `generateStaticParams`
 * must be a genuine 404. Without this, an unknown slug rendered the not-found
 * UI with a 200 status — a soft 404 that crawlers treat as a real page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const chapter = getChapter((await params).slug);
  if (!chapter) return {};
  return {
    title: `${chapter.name} Chapter`,
    description: chapter.lede,
  };
}

export default async function ChapterPage({ params }: Params) {
  const chapter = getChapter((await params).slug);
  if (!chapter) notFound();

  const { t, path } = await getTranslations();
  const c = t.chapters;
  const slug = chapter.slug as keyof typeof c.names;
  const page = c[slug as keyof typeof c] as {
    badge: string;
    lede: string;
    localScope: string;
    contextHeading: string;
    points: Record<string, string>;
    stepsHeading?: string;
    steps?: Record<string, { title: string; body: string }>;
    charterStep?: string;
    ctaHeading?: string;
    ctaBody?: string;
    ctaLabel?: string;
    gridStatus?: string;
  };
  const name = c.names[slug].full;

  const founding = chapter.kind === "founding";

  // Pending chapters share the same three accession steps, with only the
  // Charter step differing; the founding chapter has its own sequence.
  const steps = page.steps
    ? Object.values(page.steps)
    : [
        c.accessionSteps.convenor,
        { title: c.accessionSteps.charter.title, body: page.charterStep ?? "" },
        c.accessionSteps.intake,
      ];
  const stepsHeading =
    page.stepsHeading ?? fill(c.stepsHeadingPending, { name });
  const cta = {
    heading: page.ctaHeading ?? fill(c.ctaHeading, { name }),
    body: page.ctaBody ?? c.ctaBody,
    label: page.ctaLabel ?? c.ctaLabel,
    href: chapter.cta.href,
  };

  const badgeClass =
    chapter.badgeTone === "green"
      ? "bg-tint-green text-green"
      : "bg-tint-gold text-gold-ink";

  const facts = [
    { label: c.labels.fiu, value: chapter.fiu, accent: false },
    { label: c.labels.language, value: c.languages[slug], accent: false },
    { label: c.labels.regulators, value: SHARED_REGULATORS, accent: false },
    { label: c.labels.accession, value: page.badge, accent: true },
  ];

  return (
    <div id="top" className="bg-canvas text-body">
      <TopRule />

      {/* Chapter pages carry a lighter header than the main site nav. */}
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <div className="flex flex-wrap items-center gap-6 text-[13.5px] font-medium">
          <Link
            href={path(routes.region)}
            className="-my-1 py-1 text-body no-underline hover:text-teal-ink"
          >
            {c.labels.allChapters}
          </Link>
          <Link
            href={path(routes.membership)}
            className="rounded-md bg-navy px-4 py-[9px] font-semibold text-white no-underline hover:bg-teal-deep hover:text-white"
          >
            {t.nav.primary.membership}
          </Link>
        </div>
      </div>

      {/* CHAPTER SWITCHER — all six states, the founding one included. */}
      <div className="border-y border-line bg-canvas-alt">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2.5 px-8 py-3.5">
          <span className="mr-1 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
            {c.eyebrowChapter}
          </span>
          {CHAPTERS.map((other) => {
            const on = other.slug === chapter.slug;
            return (
              <Link
                key={other.slug}
                href={path(routes.chapter(other.slug))}
                aria-current={on ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold no-underline ${
                  on
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-body hover:border-teal hover:text-teal-ink"
                }`}
              >
                {c.names[other.slug as keyof typeof c.names].short}
              </Link>
            );
          })}
        </div>
      </div>

      <main id="main-content">
        {/* HERO */}
        <div className="vaaca-pattern mx-auto max-w-[1180px] px-8 pt-11 pb-[60px]">
          <div className="grid items-center gap-9 md:grid-cols-[1.3fr_1fr]">
            <div>
              <div
                className={`mb-[22px] inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[0.04em] uppercase ${badgeClass}`}
              >
                {page.badge}
              </div>
              <div className="mb-2.5 text-[15px] font-semibold tracking-[0.02em] text-teal-ink">
                {founding ? c.eyebrowFounding : c.eyebrowChapter}
              </div>
              <h1 className="m-0 max-w-[700px] font-serif text-[40px] leading-[1.16] font-semibold tracking-[-0.01em] text-navy">
                VAACA — {name}
              </h1>
              <p className="mt-5 max-w-[640px] text-[15.5px] leading-[1.65] text-body-soft">
                {page.lede}
              </p>
            </div>

            {/* This chapter's position in the bloc, drawn from real outlines. */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <CemacMap
                highlight={chapter.code}
                theme="light"
                className="mx-auto h-[240px] w-full"
                title={fill(c.labels.mapTitle, { name })}
              />
              <div className="mt-3 text-center text-[11.5px] text-muted">
                {chapter.name} within CEMAC
              </div>
            </div>
          </div>
        </div>

        {/* STATUS STRIP */}
        <div className="bg-navy px-8 py-10">
          <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-white/14 p-[18px]"
              >
                <div className="text-[10.5px] tracking-[0.06em] text-on-dark uppercase">
                  {fact.label}
                </div>
                {/* Brand teal reaches 5:1 on navy, so it stays here. */}
                <div
                  className={`mt-1.5 text-[15px] font-bold ${
                    fact.accent ? "text-teal-bright" : "text-white"
                  }`}
                >
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEDERATION MODEL */}
        <Container className="py-14">
          <Eyebrow>{c.labels.federationModel}</Eyebrow>
          <h2 className="m-0 mb-[30px] max-w-[700px] font-serif text-[24px] leading-[1.4] font-semibold text-navy">
            {founding ? c.labels.definesFounding : c.labels.definesPending}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            <Card className="rounded-[14px] p-6">
              <div className="mb-3 text-[15px] font-bold text-navy">
                {founding ? c.labels.replicates : c.labels.carriesOver}
              </div>
              <ul className="m-0 list-none p-0 text-[13.5px] leading-[1.9] text-body-soft">
                {Object.values(c.carriesOver).map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </Card>
            <div className="rounded-[14px] bg-canvas-alt p-6">
              <div className="mb-3 text-[15px] font-bold text-navy">
                Local to {chapter.name}
              </div>
              <div className="text-[13.5px] leading-[1.9] text-body-soft">
                {page.localScope}
              </div>
            </div>
          </div>
        </Container>

        {/* CONTEXT */}
        <div className="bg-canvas-alt px-8 py-14">
          <div className="mx-auto max-w-[1180px]">
            <Eyebrow>
              {founding ? c.labels.chapterStatus : c.labels.marketContext}
            </Eyebrow>
            <h2 className="m-0 mb-[26px] max-w-[700px] font-serif text-[24px] leading-[1.4] font-semibold text-navy">
              {page.contextHeading}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
              {Object.values(page.points).map((point) => (
                <Card
                  key={point}
                  className="px-5 py-[18px] text-[13.5px] leading-[1.6] text-body-soft"
                >
                  {point}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* NEXT STEPS */}
        <Container className="py-14">
          <Eyebrow>
            {founding ? c.labels.sequence : c.labels.pathToAccession}
          </Eyebrow>
          <h2 className="m-0 mb-[26px] max-w-[700px] font-serif text-[24px] leading-[1.4] font-semibold text-navy">
            {stepsHeading}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
            {steps.map((step, index) => (
              <Card key={step.title} className="p-[18px]">
                <div className="font-mono text-[10.5px] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-1 text-[14px] font-bold text-navy">
                  {step.title}
                </div>
                <div className="mt-1.5 text-[12.5px] leading-[1.5] text-muted">
                  {step.body}
                </div>
              </Card>
            ))}
          </div>
        </Container>

        {/* CTA */}
        <div className="bg-navy px-8 py-14 text-center">
          <div className="mx-auto max-w-[640px]">
            <div className="mb-3.5 text-[22px] font-semibold text-white">
              {cta.heading}
            </div>
            <div className="mb-[26px] text-[14px] leading-[1.6] text-on-dark">
              {cta.body}
            </div>
            <Link
              href={path(cta.href)}
              className="inline-block rounded-lg bg-teal-deep px-[26px] py-[13px] text-[14px] font-semibold text-white no-underline transition-colors hover:bg-green hover:text-white"
            >
              {cta.label}
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER — the chapter pages use a condensed variant. */}
      <footer className="bg-navy-deep px-8 pt-9 pb-6 text-on-dark">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-wrap justify-between gap-5 border-b border-white/12 pb-5">
            <div className="text-[14px] font-bold text-white">VAACA</div>
            <div className="flex flex-wrap gap-[22px] text-[13px]">
              <Link
                href={path(routes.institution)}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                {t.nav.primary.institution}
              </Link>
              <Link
                href={path(routes.membership)}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                {t.nav.primary.membership}
              </Link>
              <Link
                href={path(routes.region)}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                {c.labels.allChapters}
              </Link>
              <Link
                href={path(routes.resources)}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                {t.nav.resources}
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-5 pt-[18px] text-[12.5px]">
            <div>{t.auth.footer}</div>
            <Link
              href={path(routes.home)}
              className="text-on-dark no-underline hover:text-teal-ink"
            >
              <span aria-hidden>←</span> {t.nav.backToVaaca}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
