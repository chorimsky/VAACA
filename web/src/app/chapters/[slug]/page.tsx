import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Card, Container, Eyebrow, TopRule } from "@/components/Shell";
import { CemacMap } from "@/components/CemacMap";
import { routes } from "@/lib/routes";
import {
  CARRIES_OVER,
  CHAPTERS,
  SHARED_REGULATORS,
  getChapter,
} from "@/lib/chapters";

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

  const founding = chapter.kind === "founding";

  const badgeClass =
    chapter.badgeTone === "green"
      ? "bg-tint-green text-green"
      : "bg-tint-gold text-gold-ink";

  const facts = [
    { label: "National FIU", value: chapter.fiu, accent: false },
    { label: "Working language", value: chapter.language, accent: false },
    { label: "Shared regulators", value: SHARED_REGULATORS, accent: false },
    { label: "Accession status", value: chapter.accessionStatus, accent: true },
  ];

  return (
    <div id="top" className="bg-canvas text-body">
      <TopRule />

      {/* Chapter pages carry a lighter header than the main site nav. */}
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <div className="flex flex-wrap items-center gap-6 text-[13.5px] font-medium">
          <Link
            href={routes.region}
            className="-my-1 py-1 text-body no-underline hover:text-teal-ink"
          >
            All Chapters
          </Link>
          <Link
            href={routes.membership}
            className="rounded-md bg-navy px-4 py-[9px] font-semibold text-white no-underline hover:bg-teal-deep hover:text-white"
          >
            Membership
          </Link>
        </div>
      </div>

      {/* CHAPTER SWITCHER — all six states, the founding one included. */}
      <div className="border-y border-line bg-canvas-alt">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2.5 px-8 py-3.5">
          <span className="mr-1 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
            CEMAC Chapters
          </span>
          {CHAPTERS.map((c) => {
            const on = c.slug === chapter.slug;
            return (
              <Link
                key={c.slug}
                href={routes.chapter(c.slug)}
                aria-current={on ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold no-underline ${
                  on
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-body hover:border-teal hover:text-teal-ink"
                }`}
              >
                {c.shortName}
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
                {chapter.badge}
              </div>
              <div className="mb-2.5 text-[15px] font-semibold tracking-[0.02em] text-teal-ink">
                {chapter.eyebrow}
              </div>
              <h1 className="m-0 max-w-[700px] font-serif text-[40px] leading-[1.16] font-semibold tracking-[-0.01em] text-navy">
                VAACA — {chapter.name}
              </h1>
              <p className="mt-5 max-w-[640px] text-[15.5px] leading-[1.65] text-body-soft">
                {chapter.lede}
              </p>
            </div>

            {/* This chapter's position in the bloc, drawn from real outlines. */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <CemacMap
                highlight={chapter.code}
                theme="light"
                className="mx-auto h-[240px] w-full"
                title={`${chapter.name} within the six CEMAC member states`}
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
          <Eyebrow>Federation Model</Eyebrow>
          <h2 className="m-0 mb-[30px] max-w-[700px] font-serif text-[24px] leading-[1.4] font-semibold text-navy">
            {founding
              ? "What this chapter defines, and what each other chapter keeps local."
              : "What replicates from the Cameroon chapter, and what stays local."}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            <Card className="rounded-[14px] p-6">
              <div className="mb-3 text-[15px] font-bold text-navy">
                {founding
                  ? "Replicates to every chapter"
                  : "Carries over unchanged"}
              </div>
              <ul className="m-0 list-none p-0 text-[13.5px] leading-[1.9] text-body-soft">
                {CARRIES_OVER.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </Card>
            <div className="rounded-[14px] bg-canvas-alt p-6">
              <div className="mb-3 text-[15px] font-bold text-navy">
                Local to {chapter.name}
              </div>
              <div className="text-[13.5px] leading-[1.9] text-body-soft">
                {chapter.localScope}
              </div>
            </div>
          </div>
        </Container>

        {/* CONTEXT */}
        <div className="bg-canvas-alt px-8 py-14">
          <div className="mx-auto max-w-[1180px]">
            <Eyebrow>{founding ? "Chapter Status" : "Market Context"}</Eyebrow>
            <h2 className="m-0 mb-[26px] max-w-[700px] font-serif text-[24px] leading-[1.4] font-semibold text-navy">
              {chapter.contextHeading}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
              {chapter.contextPoints.map((point) => (
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
            {founding ? "Sequence to Ratification" : "Path to Accession"}
          </Eyebrow>
          <h2 className="m-0 mb-[26px] max-w-[700px] font-serif text-[24px] leading-[1.4] font-semibold text-navy">
            {chapter.stepsHeading}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
            {chapter.steps.map((step) => (
              <Card key={step.n} className="p-[18px]">
                <div className="font-mono text-[10.5px] text-muted">
                  {step.n}
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
              {chapter.cta.heading}
            </div>
            <div className="mb-[26px] text-[14px] leading-[1.6] text-on-dark">
              {chapter.cta.body}
            </div>
            <Link
              href={chapter.cta.href}
              className="inline-block rounded-lg bg-teal-deep px-[26px] py-[13px] text-[14px] font-semibold text-white no-underline transition-colors hover:bg-green hover:text-white"
            >
              {chapter.cta.label}
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
                href={routes.institution}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                Institution
              </Link>
              <Link
                href={routes.membership}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                Membership
              </Link>
              <Link
                href={routes.region}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                All Chapters
              </Link>
              <Link
                href={routes.resources}
                className="text-on-dark no-underline hover:text-teal-ink"
              >
                Resources
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-5 pt-[18px] text-[12.5px]">
            <div>
              VAACA · Virtual Assets Association of Central Africa · In
              Formation
            </div>
            <Link
              href={routes.home}
              className="text-on-dark no-underline hover:text-teal-ink"
            >
              <span aria-hidden>←</span> Back to VAACA
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
