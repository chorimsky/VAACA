import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { routes } from "@/lib/routes";
import { listPublicDocuments } from "@/lib/server/documents";
import {
  DOMAIN_IDS,
  DOMAIN_NAME,
  DOMAIN_TESTS,
  MAX_SCORE,
  PSAN_GATES,
  THRESHOLD_BAND,
  THRESHOLD_LABEL,
  THRESHOLDS,
} from "@/lib/member-types";

export const metadata: Metadata = {
  title: "Standards",
  description:
    "VAACA Framework 01 — the PSAN Regulatory Readiness Framework: three perimeter gates, eight readiness domains, a 24-point scale.",
};

const SUB_BRANDS = [
  {
    name: "VAACA Standards",
    desc: "Frameworks, guidelines and readiness certification.",
    status: "In development",
    live: true,
  },
  {
    name: "VAACA Policy",
    desc: "Regulatory intelligence and consultation responses.",
    status: "Planned",
    live: false,
  },
  {
    name: "VAACA Intelligence",
    desc: "Market research and country-level data.",
    status: "Planned",
    live: false,
  },
  {
    name: "VAACA Academy",
    desc: "Professional training and certification.",
    status: "Planned",
    live: false,
  },
];

export const dynamic = "force-dynamic";

export default async function StandardsPage() {
  // The framework this page describes is the one members are scored against,
  // so link the published text rather than describing it and stopping.
  const framework = (await listPublicDocuments()).find(
    (d) => d.id === "psan-readiness-framework",
  );

  return (
    <Shell active="standards">
      <Container className="pt-14 pb-16">
        <Eyebrow>Standards</Eyebrow>
        <h1 className="m-0 mb-2.5 font-serif text-[34px] font-semibold tracking-[-0.01em] text-navy">
          VAACA Framework 01 — PSAN Regulatory Readiness
        </h1>
        <p className="mb-[30px] max-w-[720px] text-[14.5px] leading-[1.6] text-body-soft">
          Three perimeter gates decide whether an activity is in scope. Eight
          readiness domains, scored on a 24-point scale, decide whether it can
          be presented to a regulator today.
        </p>

        <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          {PSAN_GATES.map((gate) => (
            <Card key={gate.n} className="p-[18px]">
              <div className="font-mono text-[10.5px] text-muted">
                Gate {gate.n}
              </div>
              <div className="mt-1 text-[14.5px] font-bold text-navy">
                {gate.title}
              </div>
              <p className="mt-1.5 mb-0 text-[12.5px] leading-[1.55] text-body-soft">
                {gate.body}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
          {DOMAIN_IDS.map((id) => (
            <div key={id} className="rounded-[10px] bg-canvas-alt px-3.5 py-3">
              <div className="font-mono text-[10.5px] text-muted">{id}</div>
              <div className="mt-0.5 text-[13px] font-semibold text-navy">
                {DOMAIN_NAME[id]}
              </div>
              <div className="mt-1 text-[12px] leading-[1.5] text-muted">
                {DOMAIN_TESTS[id]}
              </div>
            </div>
          ))}
        </div>

        {/* The page claimed a 24-point scale without ever saying what a score
            means. These are the bands the dashboard reports against. */}
        <h2 className="mt-10 mb-3 text-[18px] font-bold text-navy">
          What a score means
        </h2>
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          {THRESHOLDS.map((t) => (
            <div
              key={t}
              className="rounded-xl border border-line bg-white px-[18px] py-4"
            >
              <dt className="text-[14px] font-bold text-navy">
                {THRESHOLD_LABEL[t]}
              </dt>
              <dd className="m-0 mt-1 text-[12.5px] leading-[1.55] text-muted">
                {THRESHOLD_BAND[t].range} — {THRESHOLD_BAND[t].meaning}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-[720px] text-[13.5px] leading-[1.6] text-body-soft">
          Class A and B members are assessed against all eight domains, out of{" "}
          {MAX_SCORE} points, and can follow their own score on the{" "}
          <Link href={routes.dashboard}>member dashboard</Link>. Where a
          regulatory instruction does not yet exist, the framework caps the
          affected domain rather than scoring it optimistically.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {framework?.href ? (
            <a
              href={framework.href}
              className="inline-block rounded-lg bg-teal-deep px-[22px] py-3 text-[13.5px] font-semibold text-white no-underline hover:bg-navy hover:text-white"
            >
              Read the framework ({framework.sizeLabel})
            </a>
          ) : null}
          <Link
            href={routes.register}
            className="inline-block rounded-lg border border-line bg-white px-[22px] py-3 text-[13.5px] font-semibold text-navy no-underline hover:border-teal"
          >
            Apply for membership
          </Link>
        </div>
      </Container>

      <Container className="pb-16">
        <Eyebrow>Roadmap</Eyebrow>
        <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
          What VAACA is building next.
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
