import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { routes } from "@/lib/routes";
import { getTranslations } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/dictionaries";
import { CLASS_KEYS } from "@/lib/application-types";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Five accession classes, open and non-exclusive, with no discretionary refusal. How to apply and what membership does and does not mean.",
};

export default async function MembershipPage() {
  const { t, path } = await getTranslations();
  const m = t.membership;

  const VOTING = {
    A: m.voting.full,
    B: m.voting.full,
    C: m.voting.limited,
    D: m.voting.limited,
    E: m.voting.observer,
  } as const;

  const STEPS = [
    { n: 1, label: m.steps.s1 },
    { n: 2, label: m.steps.s2 },
    { n: 3, label: m.steps.s3 },
  ];

  const FAQS = [
    m.faqs.regulator,
    m.faqs.whoCanJoin,
    m.faqs.whyCameroon,
    m.faqs.funding,
  ];

  return (
    <Shell active="membership">
      <Container className="pt-14 pb-10">
        <Eyebrow>{t.nav.primary.membership}</Eyebrow>
        <h1 className="m-0 mb-3 max-w-[720px] font-serif text-[34px] leading-[1.3] font-semibold tracking-[-0.01em] text-navy">
          {m.title}
        </h1>
        <p className="mb-[30px] max-w-[720px] text-[14.5px] leading-[1.6] text-body-soft">
          {m.lede}
        </p>

        <div className="mb-6 overflow-x-auto rounded-[14px] border border-line bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[m.table.class, m.table.who, m.table.voting].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="border-b border-line bg-canvas-head px-[18px] py-3.5 text-left text-[12px] font-semibold text-navy"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASS_KEYS.map((key) => (
                <tr key={key}>
                  <th
                    scope="row"
                    className="border-b border-line px-[18px] py-[13px] text-left text-[13.5px] font-semibold text-navy"
                  >
                    {t.framework.classes[key].letter}
                  </th>
                  <td className="border-b border-line px-[18px] py-[13px] text-[13px] text-body-soft">
                    {t.framework.classes[key].who}
                  </td>
                  <td className="border-b border-line px-[18px] py-[13px] text-[13px] text-body-soft">
                    {VOTING[key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-[34px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="rounded-xl bg-canvas-alt px-[18px] py-4"
            >
              <div className="font-mono text-[10.5px] text-muted">
                {fill(m.stepLabel, { n: step.n })}
              </div>
              <div className="mt-1 text-[13.5px] font-semibold text-navy">
                {step.label}
              </div>
            </div>
          ))}
        </div>

        <Link
          href={path(routes.register)}
          className="inline-block rounded-lg bg-[linear-gradient(135deg,#0B4944,#0D554F)] px-[26px] py-3.5 text-[14.5px] font-semibold text-white no-underline transition-colors hover:bg-teal-deep hover:bg-none hover:text-white"
        >
          {m.startApplication}
          <span aria-hidden>↗</span>
        </Link>
      </Container>

      <div className="bg-canvas-alt px-8 py-16">
        <div className="mx-auto max-w-[1180px]">
          <Eyebrow>{m.questionsEyebrow}</Eyebrow>
          <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
            {m.questionsTitle}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {FAQS.map((faq) => (
              <Card key={faq.q} className="px-5 py-[18px]">
                <div className="text-[14px] font-bold text-navy">{faq.q}</div>
                <div className="mt-2 text-[13px] leading-[1.55] text-body-soft">
                  {faq.a}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
