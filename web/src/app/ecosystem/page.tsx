import type { Metadata } from "next";
import { Container, Eyebrow, Shell } from "@/components/Shell";
import { INSTITUTIONS, PRIORITY_INSTITUTIONS } from "@/lib/institutions";

export const metadata: Metadata = {
  title: "Ecosystem",
  description:
    "Who VAACA connects across CEMAC — banks, VASPs, fintechs, regulators and academia — and its engagement posture with COSUMAF, COBAC, BEAC and GABAC.",
};

const GROUPS = [
  "Banks",
  "VASPs & Exchanges",
  "Fintechs & PSPs",
  "Regulators",
  "Investors",
  "Academia",
  "Legal & Compliance",
  "Consumers",
];

export default function EcosystemPage() {
  return (
    <Shell active="ecosystem">
      <Container className="pt-14 pb-16">
        <Eyebrow>Ecosystem</Eyebrow>
        <h1 className="m-0 mb-[26px] max-w-[720px] font-serif text-[34px] leading-[1.3] font-semibold tracking-[-0.01em] text-navy">
          One ecosystem, connected around shared standards.
        </h1>

        <div className="mb-[34px] flex flex-wrap gap-2.5">
          {GROUPS.map((group) => (
            <div
              key={group}
              className="rounded-full border border-line bg-white px-[18px] py-[9px] text-[13.5px] font-semibold text-navy"
            >
              {group}
            </div>
          ))}
        </div>

        <div className="mb-4 text-[13px] font-semibold tracking-[0.06em] text-muted uppercase">
          Priority institutions
        </div>
        {/* Derived from the engagement posture below, so the two can no longer
            disagree about who is a priority. */}
        <ul className="m-0 flex list-none flex-wrap overflow-hidden rounded-xl border border-line bg-white p-0">
          {PRIORITY_INSTITUTIONS.map((inst, i) => (
            <li
              key={inst.name}
              className={`min-w-[110px] flex-1 px-4 py-[18px] text-center text-[14.5px] font-bold text-navy ${
                i < PRIORITY_INSTITUTIONS.length - 1
                  ? "border-r border-line"
                  : ""
              }`}
            >
              {inst.name}
            </li>
          ))}
        </ul>
      </Container>

      <div className="bg-canvas-alt px-8 py-16">
        <div className="mx-auto max-w-[1180px]">
          <Eyebrow>Policy &amp; Regulatory Engagement</Eyebrow>
          <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
            Engagement posture, not lobbying.
          </h2>
          <dl className="m-0 overflow-hidden rounded-[14px] border border-line bg-white">
            {INSTITUTIONS.map((item, i) => (
              <div
                key={item.name}
                className={`grid gap-x-5 gap-y-1 px-[22px] py-[18px] sm:grid-cols-[160px_1fr] ${
                  i < INSTITUTIONS.length - 1 ? "border-b border-line-soft" : ""
                }`}
              >
                <dt>
                  <span className="block text-[14px] font-bold text-navy">
                    {item.name}
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold text-teal-ink">
                    {item.postureTag}
                  </span>
                </dt>
                <dd className="m-0">
                  <span className="block text-[13px] leading-[1.55] text-body-softer">
                    {item.posture}
                  </span>
                  <span className="mt-1 block text-[12px] leading-[1.5] text-muted">
                    {item.desc}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Shell>
  );
}
