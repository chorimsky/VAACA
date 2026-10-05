import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";
import { routes } from "@/lib/routes";
import {
  ASSESSMENT_METHODS,
  COMPETENCY_LEVELS,
  DOMAIN_ASSESSMENT,
  DOMAIN_STAGE,
  LEARNER_STAGES,
  LITERACY_CEILING,
  LITERACY_DOMAINS,
  UNDERSTAND_BEFORE_PARTICIPATING,
} from "@/lib/competency-types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return documentMetadata(t.competency.title, t.competency.lede);
}

export default async function CompetencyPage() {
  const { t, path } = await getTranslations();
  const c = t.competency;

  return (
    <Shell>
      <Container className="pt-14 pb-16">
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h1 className="m-0 mb-3 max-w-[760px] font-serif text-[34px] leading-[1.3] font-semibold tracking-[-0.01em] text-navy">
          {c.title}
        </h1>
        <p className="mb-5 max-w-[760px] text-[14.5px] leading-[1.6] text-body-soft">
          {c.lede}
        </p>
        <p className="mb-8 max-w-[760px] text-[13.5px] leading-[1.6] text-muted">
          {c.counterpart}{" "}
          <Link href={path(routes.standards)} className="font-semibold">
            {t.nav.primary.standards}
          </Link>
          .
        </p>

        <Card className="mb-10 max-w-[720px] border-teal px-6 py-5">
          <div className="font-serif text-[20px] font-semibold text-navy">
            {c.principle}
          </div>
          <p className="mt-2 mb-0 text-[13.5px] leading-[1.65] text-body-soft">
            {c.principleBody}
          </p>
        </Card>

        {/* LEVELS */}
        <Eyebrow>{c.levelsEyebrow}</Eyebrow>
        <h2 className="m-0 mt-2 mb-2.5 font-serif text-[24px] font-semibold text-navy">
          {c.levelsTitle}
        </h2>
        <p className="mb-6 max-w-[720px] text-[14px] leading-[1.6] text-body-soft">
          {c.levelsLede}
        </p>
        <ol className="m-0 mb-5 flex list-none flex-col gap-2.5 p-0">
          {COMPETENCY_LEVELS.map((level) => {
            const copy = c.levels[level.id];
            const inScope = level.n <= LITERACY_CEILING;
            return (
              <li key={level.id}>
                <Card
                  className={`flex flex-wrap items-baseline gap-x-4 gap-y-1.5 px-5 py-3.5 ${
                    inScope ? "" : "opacity-60"
                  }`}
                >
                  <span className="font-mono text-[12px] text-muted">
                    L{level.n}
                  </span>
                  <span className="text-[14px] font-bold text-navy">
                    {copy.verb}
                  </span>
                  <span className="text-[13px] text-body-soft">
                    {copy.name}
                  </span>
                  <span className="basis-full text-[12.5px] leading-[1.55] text-muted">
                    {copy.example}
                  </span>
                </Card>
              </li>
            );
          })}
        </ol>
        <p className="mb-10 max-w-[680px] text-[12.5px] leading-[1.6] text-muted">
          {c.ceiling}
        </p>

        {/* STAGES */}
        <Eyebrow>{c.stagesEyebrow}</Eyebrow>
        <h2 className="m-0 mt-2 mb-5 font-serif text-[24px] font-semibold text-navy">
          {c.stagesTitle}
        </h2>
        <ul className="m-0 mb-10 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 p-0">
          {LEARNER_STAGES.map((stage) => (
            <li key={stage}>
              <Card className="h-full px-5 py-[18px]">
                <div className="text-[13.5px] font-bold text-navy">
                  {c.stages[stage].name}
                </div>
                <div className="mt-1.5 text-[12.5px] leading-[1.55] text-muted">
                  {c.stages[stage].body}
                </div>
              </Card>
            </li>
          ))}
        </ul>

        {/* DOMAINS */}
        <Eyebrow>{c.domainsEyebrow}</Eyebrow>
        <h2 className="m-0 mt-2 mb-2.5 font-serif text-[24px] font-semibold text-navy">
          {c.domainsTitle}
        </h2>
        <p className="mb-6 max-w-[720px] text-[14px] leading-[1.6] text-body-soft">
          {c.domainsLede}
        </p>
        <ul className="m-0 mb-10 flex list-none flex-col gap-3 p-0">
          {LITERACY_DOMAINS.map((id, i) => (
            <li key={id}>
              <Card className="px-[22px] py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-[15px] font-bold text-navy">
                    <span className="font-mono text-[12px] text-muted">
                      D{i + 1}{" "}
                    </span>
                    {c.domains[id].name}
                  </span>
                  <Tag
                    tone={
                      id === UNDERSTAND_BEFORE_PARTICIPATING ? "gold" : "blue"
                    }
                  >
                    {c.assessedTo} · {c.stages[DOMAIN_STAGE[id]].name}
                  </Tag>
                </div>
                <p className="mt-2.5 mb-0 max-w-[680px] text-[14px] leading-[1.6] text-body">
                  {c.domains[id].competency}
                </p>
                <div className="mt-3 text-[12.5px] leading-[1.55] text-muted">
                  <span className="font-semibold">{c.covers}: </span>
                  {c.domains[id].covers}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px]">
                  <span className="text-muted">{c.assessedBy}:</span>
                  {DOMAIN_ASSESSMENT[id].map((method) => (
                    <span
                      key={method}
                      className="rounded-full bg-canvas-alt px-2.5 py-1 font-semibold text-body"
                    >
                      {c.methods[method]}
                    </span>
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>

        {/* MATRIX */}
        <Eyebrow>{c.matrixEyebrow}</Eyebrow>
        <h2 className="m-0 mt-2 mb-2.5 font-serif text-[24px] font-semibold text-navy">
          {c.matrixTitle}
        </h2>
        <p className="mb-5 max-w-[720px] text-[14px] leading-[1.6] text-body-soft">
          {c.matrixLede}
        </p>
        <div className="mb-10 overflow-x-auto rounded-[14px] border border-line bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b border-line bg-canvas-head px-[18px] py-3.5 text-left text-[12px] font-semibold text-navy"
                >
                  {c.domainsEyebrow}
                </th>
                {ASSESSMENT_METHODS.map((method) => (
                  <th
                    key={method}
                    scope="col"
                    className="border-b border-line bg-canvas-head px-[18px] py-3.5 text-left text-[12px] font-semibold text-navy"
                  >
                    {c.methods[method]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LITERACY_DOMAINS.map((id) => (
                <tr key={id}>
                  <th
                    scope="row"
                    className="border-b border-line px-[18px] py-[13px] text-left text-[13px] font-semibold text-navy"
                  >
                    {c.domains[id].name}
                  </th>
                  {ASSESSMENT_METHODS.map((method) => {
                    const required = DOMAIN_ASSESSMENT[id].includes(method);
                    return (
                      <td
                        key={method}
                        className="border-b border-line px-[18px] py-[13px] text-[13px] text-body-soft"
                      >
                        <span aria-hidden>{required ? "●" : "—"}</span>
                        <span className="sr-only">
                          {required ? c.assessedBy : ""}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EVIDENCE */}
        <Eyebrow>{c.evidenceEyebrow}</Eyebrow>
        <h2 className="m-0 mt-2 mb-2.5 font-serif text-[24px] font-semibold text-navy">
          {c.evidenceTitle}
        </h2>
        <p className="mb-5 max-w-[720px] text-[14.5px] leading-[1.65] text-body-soft">
          {c.evidenceBody}
        </p>
        <p className="mb-8 max-w-[720px] text-[13.5px] leading-[1.6] text-muted">
          {c.ownership}
        </p>
        <Tag tone="gold">{c.status}</Tag>
      </Container>
    </Shell>
  );
}
