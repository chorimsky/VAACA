import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";
import { fill } from "@/lib/i18n/dictionaries";
import { getItem } from "@/lib/server/observatory";
import { say } from "@/lib/observatory-types";
import { DOMAIN_NAME } from "@/lib/member-types";
import { routes } from "@/lib/routes";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

const TONE = {
  not_started: "neutral",
  in_progress: "blue",
  blocked: "gold",
  closed: "green",
} as const;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const item = await getItem((await params).id);
  if (!item) return {};
  const { locale } = await getTranslations();
  return documentMetadata(
    say(item.title, locale) ?? "",
    say(item.whyItMatters, locale) ?? "",
  );
}

export default async function ObservatoryItemPage({ params }: Params) {
  const item = await getItem((await params).id);
  if (!item) notFound();

  const { t, path, locale } = await getTranslations();
  const o = t.observatory;

  const sections = [
    { label: o.fields.whatChanged, body: say(item.whatChanged, locale) },
    { label: o.fields.whyItMatters, body: say(item.whyItMatters, locale) },
    { label: o.fields.whoIsAffected, body: say(item.whoIsAffected, locale) },
    { label: o.fields.whatIsUnclear, body: say(item.whatIsUnclear, locale) },
  ].filter((s) => s.body);

  return (
    <Shell>
      <Container className="pt-14 pb-16">
        <Link
          href={path(routes.observatory)}
          className="text-[13px] font-semibold text-navy no-underline"
        >
          <span aria-hidden>←</span> {o.back}
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Eyebrow>{o.kinds[item.kind]}</Eyebrow>
          <Tag tone={TONE[item.status]}>{o.status[item.status]}</Tag>
        </div>

        <h1 className="m-0 mt-2 mb-4 max-w-[760px] font-serif text-[30px] leading-[1.3] font-semibold text-navy">
          {say(item.title, locale)}
        </h1>

        <div className="mb-8 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.04em] text-body-softer uppercase">
          <span>{item.country}</span>
          <span aria-hidden>·</span>
          <span>{item.institution}</span>
          <span aria-hidden>·</span>
          <span>{o.topics[item.topic]}</span>
          {item.date ? (
            <>
              <span aria-hidden>·</span>
              <span>{item.date}</span>
            </>
          ) : null}
        </div>

        {/* The effect on scoring comes first for an entry that has one: it is
            the thing a member reading this actually needs. */}
        {item.effect && item.status !== "closed" ? (
          <Card className="mb-8 max-w-[640px] border-teal px-5 py-[18px]">
            <div className="text-[11px] tracking-[0.06em] text-gold-ink uppercase">
              {o.fields.effect}
            </div>
            <p className="mt-1.5 mb-0 text-[13.5px] leading-[1.6] text-body">
              {item.effect.cap === 0
                ? fill(o.blockedDomain, {
                    domain: DOMAIN_NAME[item.effect.domain],
                  })
                : fill(o.capped, {
                    domain: DOMAIN_NAME[item.effect.domain],
                    cap: item.effect.cap,
                  })}
            </p>
          </Card>
        ) : null}

        <div className="flex max-w-[720px] flex-col gap-6">
          {sections.map((section) => (
            <div key={section.label}>
              <h2 className="m-0 mb-1.5 text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
                {section.label}
              </h2>
              <p className="m-0 text-[14.5px] leading-[1.65] text-body">
                {section.body}
              </p>
            </div>
          ))}

          <div>
            <h2 className="m-0 mb-1.5 text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
              {o.fields.response}
            </h2>
            <p className="m-0 text-[14.5px] leading-[1.65] text-body">
              {say(item.response, locale) ?? o.fields.noResponse}
            </p>
          </div>

          <div>
            <h2 className="m-0 mb-1.5 text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
              {o.fields.sources}
            </h2>
            {item.sources.length ? (
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {item.sources.map((source) => (
                  <li key={source.label} className="text-[14px]">
                    {source.url ? (
                      <a href={source.url} rel="noopener">
                        {source.label}
                      </a>
                    ) : (
                      source.label
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[14.5px] leading-[1.65] text-body-soft">
                {o.fields.noSources}
              </p>
            )}
          </div>
        </div>
      </Container>
    </Shell>
  );
}
