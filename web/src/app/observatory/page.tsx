import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";
import { fill } from "@/lib/i18n/dictionaries";
import { countItems, filterItems } from "@/lib/server/observatory";
import {
  OBSERVATORY_KINDS,
  OBSERVATORY_TOPICS,
  isObservatoryKind,
  isObservatoryTopic,
  say,
} from "@/lib/observatory-types";
import { GAP_STATUSES, isGapStatus } from "@/lib/gap-types";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return documentMetadata(t.observatory.eyebrow, t.observatory.lede);
}

export const dynamic = "force-dynamic";

const TONE = {
  not_started: "neutral",
  in_progress: "blue",
  blocked: "gold",
  closed: "green",
} as const;

export default async function ObservatoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const { t, path, locale } = await getTranslations();
  const o = t.observatory;

  // Anything unrecognised reads as "all" rather than filtering to nothing: a
  // stale link should show the register, not an empty page.
  const kind = isObservatoryKind(one("kind")) ? one("kind")! : "all";
  const topic = isObservatoryTopic(one("topic")) ? one("topic")! : "all";
  const status = isGapStatus(one("status")) ? one("status")! : "all";

  const [items, counts] = await Promise.all([
    filterItems({
      kind: kind as never,
      topic: topic as never,
      status: status as never,
    }),
    countItems(),
  ]);

  const query = (next: Record<string, string>) => {
    const search = new URLSearchParams({ kind, topic, status, ...next });
    for (const [k, v] of [...search]) if (v === "all") search.delete(k);
    const s = search.toString();
    return `${path(routes.observatory)}${s ? `?${s}` : ""}`;
  };

  const FILTERS: {
    label: string;
    param: string;
    current: string;
    values: readonly string[];
    name: (v: string) => string;
  }[] = [
    {
      label: o.filters.kind,
      param: "kind",
      current: kind,
      values: OBSERVATORY_KINDS,
      name: (v) => o.kinds[v as keyof typeof o.kinds],
    },
    {
      label: o.filters.topic,
      param: "topic",
      current: topic,
      values: OBSERVATORY_TOPICS,
      name: (v) => o.topics[v as keyof typeof o.topics],
    },
    {
      label: o.filters.status,
      param: "status",
      current: status,
      values: GAP_STATUSES,
      name: (v) => o.status[v as keyof typeof o.status],
    },
  ];

  return (
    <Shell>
      <Container className="pt-14 pb-16">
        <Eyebrow>{o.eyebrow}</Eyebrow>
        <h1 className="m-0 mb-3 max-w-[760px] font-serif text-[34px] leading-[1.3] font-semibold tracking-[-0.01em] text-navy">
          {o.title}
        </h1>
        <p className="mb-6 max-w-[760px] text-[14.5px] leading-[1.6] text-body-soft">
          {o.lede}
        </p>

        {counts.capping > 0 && (
          <p className="mb-8 max-w-[640px] rounded-lg bg-tint-gold px-4 py-3 text-[13px] leading-[1.6] text-gold-ink">
            {fill(o.cappingNote, { n: counts.capping })}
          </p>
        )}

        {/* Links, not a form: each filtered view is a place with its own URL. */}
        <div className="mb-8 flex flex-col gap-3">
          {FILTERS.map((filter) => (
            <div
              key={filter.param}
              className="flex flex-wrap items-baseline gap-2"
            >
              <span className="min-w-[72px] text-[11px] tracking-[0.06em] text-muted uppercase">
                {filter.label}
              </span>
              <nav aria-label={filter.label}>
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {["all", ...filter.values].map((value) => {
                    const on = filter.current === value;
                    return (
                      <li key={value}>
                        <Link
                          href={query({ [filter.param]: value })}
                          aria-current={on ? "true" : undefined}
                          className={`-my-0.5 inline-block rounded-full px-3 py-1.5 text-[12px] font-semibold no-underline ${
                            on
                              ? "bg-navy text-white"
                              : "bg-canvas-alt text-body hover:text-navy"
                          }`}
                        >
                          {value === "all" ? o.filters.all : filter.name(value)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        {items.length === 0 ? (
          <Card className="max-w-[560px] px-5 py-[18px]">
            <p className="m-0 text-[13.5px] text-body-soft">{o.empty}</p>
          </Card>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {items.map((item) => (
              <li key={item.id}>
                <Card className="px-5 py-[18px]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link
                      href={path(routes.observatoryItem(item.id))}
                      className="max-w-[640px] text-[14.5px] font-bold text-navy no-underline"
                    >
                      {say(item.title, locale)}
                    </Link>
                    <Tag tone={TONE[item.status]}>{o.status[item.status]}</Tag>
                  </div>
                  <p className="mt-2 mb-0 max-w-[680px] text-[12.5px] leading-[1.6] text-muted">
                    {say(item.whyItMatters, locale)}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.04em] text-body-softer uppercase">
                    <span>{o.kinds[item.kind]}</span>
                    <span aria-hidden>·</span>
                    <span>{item.country}</span>
                    <span aria-hidden>·</span>
                    <span>{item.institution}</span>
                    <span aria-hidden>·</span>
                    <span>{o.topics[item.topic]}</span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Shell>
  );
}
