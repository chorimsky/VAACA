import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { routes } from "@/lib/routes";
import { listPublicDocuments } from "@/lib/server/documents";
import { getTranslations } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/dictionaries";
import {
  DOMAIN_IDS,
  MAX_SCORE,
  PSAN_GATES,
  THRESHOLDS,
  THRESHOLD_BAND,
} from "@/lib/member-types";

export const metadata: Metadata = {
  title: "Standards",
  description:
    "VAACA Framework 01 — the PSAN Regulatory Readiness Framework: three perimeter gates, eight readiness domains, a 24-point scale.",
};

export const dynamic = "force-dynamic";

export default async function StandardsPage() {
  const { t, path } = await getTranslations();
  const s = t.standards;
  const f = t.framework;

  // The framework this page describes is the one members are scored against,
  // so link the published text rather than describing it and stopping.
  const framework = (await listPublicDocuments()).find(
    (d) => d.id === "psan-readiness-framework",
  );

  const GATE_COPY = [f.gates.g1, f.gates.g2, f.gates.g3];

  const SUB_BRANDS = [
    {
      name: "VAACA Standards",
      desc: s.brands.standards,
      status: s.inDevelopment,
      live: true,
    },
    {
      name: "VAACA Policy",
      desc: s.brands.policy,
      status: s.planned,
      live: false,
    },
    {
      name: "VAACA Intelligence",
      desc: s.brands.intelligence,
      status: s.planned,
      live: false,
    },
    {
      name: "VAACA Academy",
      desc: s.brands.academy,
      status: s.planned,
      live: false,
    },
  ];

  return (
    <Shell active="standards">
      <Container className="pt-14 pb-16">
        <Eyebrow>{t.nav.primary.standards}</Eyebrow>
        <h1 className="m-0 mb-2.5 font-serif text-[34px] font-semibold tracking-[-0.01em] text-navy">
          {s.title}
        </h1>
        <p className="mb-[30px] max-w-[720px] text-[14.5px] leading-[1.6] text-body-soft">
          {s.lede}
        </p>

        <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          {PSAN_GATES.map((gate, i) => (
            <Card key={gate.n} className="p-[18px]">
              <div className="font-mono text-[10.5px] text-muted">
                {f.gateLabel} {gate.n}
              </div>
              <div className="mt-1 text-[14.5px] font-bold text-navy">
                {GATE_COPY[i].title}
              </div>
              <p className="mt-1.5 mb-0 text-[12.5px] leading-[1.55] text-body-soft">
                {GATE_COPY[i].body}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
          {DOMAIN_IDS.map((id) => (
            <div key={id} className="rounded-[10px] bg-canvas-alt px-3.5 py-3">
              <div className="font-mono text-[10.5px] text-muted">{id}</div>
              <div className="mt-0.5 text-[13px] font-semibold text-navy">
                {f.domains[id].name}
              </div>
              <div className="mt-1 text-[12px] leading-[1.5] text-muted">
                {f.domains[id].tests}
              </div>
            </div>
          ))}
        </div>

        {/* The page claimed a 24-point scale without ever saying what a score
            means. These are the bands the dashboard reports against. */}
        <h2 className="mt-10 mb-3 text-[18px] font-bold text-navy">
          {s.scoreMeaning}
        </h2>
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          {THRESHOLDS.map((threshold) => (
            <div
              key={threshold}
              className="rounded-xl border border-line bg-white px-[18px] py-4"
            >
              <dt className="text-[14px] font-bold text-navy">
                {f.thresholds[threshold].label}
              </dt>
              <dd className="m-0 mt-1 text-[12.5px] leading-[1.55] text-muted">
                {THRESHOLD_BAND[threshold].range} —{" "}
                {f.thresholds[threshold].meaning}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-[720px] text-[13.5px] leading-[1.6] text-body-soft">
          {fill(s.assessed, { max: MAX_SCORE })}{" "}
          <Link href={path(routes.dashboard)}>{s.assessedLink}</Link>.{" "}
          {s.capNote}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {framework?.href ? (
            <a
              href={framework.href}
              className="inline-block rounded-lg bg-teal-deep px-[22px] py-3 text-[13.5px] font-semibold text-white no-underline hover:bg-navy hover:text-white"
            >
              {s.readFramework} ({framework.sizeLabel})
            </a>
          ) : null}
          <Link
            href={path(routes.register)}
            className="inline-block rounded-lg border border-line bg-white px-[22px] py-3 text-[13.5px] font-semibold text-navy no-underline hover:border-teal"
          >
            {s.applyForMembership}
          </Link>
        </div>
      </Container>

      <Container className="pb-16">
        <Eyebrow>{s.roadmapEyebrow}</Eyebrow>
        <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
          {s.roadmapTitle}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
          {SUB_BRANDS.map((brand) => (
            <Card key={brand.name} className="p-[18px]">
              <div className="text-[14.5px] font-bold text-navy">
                {brand.name}
              </div>
              <div className="mt-1.5 text-[12.5px] leading-[1.5] text-muted">
                {brand.desc}
              </div>
              <div
                className={`mt-2.5 text-[10.5px] font-semibold ${
                  brand.live ? "text-green" : "text-muted"
                }`}
              >
                {brand.status}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Shell>
  );
}
