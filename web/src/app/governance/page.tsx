import type { Metadata } from "next";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { listPublicSeats } from "@/lib/server/seats";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";
import { fill } from "@/lib/i18n/dictionaries";
import {
  blocBalance,
  filledCount,
  largestPossibleBloc,
  majorityHolder,
} from "@/lib/seat-types";

export async function generateMetadata(): Promise<Metadata> {
  // The title, the description and the social card all follow the
  // page's language, and the canonical URL names this page.
  const { t } = await getTranslations();
  const m = t.meta.governance;
  return {
    ...(await documentMetadata(m.title, m.description)),
  };
}

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const { t } = await getTranslations();
  const g = t.governance;
  const seats = await listPublicSeats();
  const filled = filledCount(seats);
  const balance = blocBalance(seats);
  const majority = majorityHolder(seats);
  const largest = largestPossibleBloc();

  return (
    <Shell active="governance">
      <Container className="pt-14 pb-16">
        <Eyebrow>{t.nav.primary.governance}</Eyebrow>
        <h1 className="m-0 mb-3 max-w-[720px] font-serif text-[32px] leading-[1.3] font-semibold text-navy">
          {g.title}
        </h1>

        {/* The page asserts a constraint, so it should report against it
            rather than leave the reader to take it on trust. */}
        <p className="mb-2 max-w-[680px] text-[14.5px] leading-[1.6] text-body-soft">
          {filled === 0
            ? g.recruiting
            : fill(g.filled, { filled, total: seats.length })}{" "}
          {majority
            ? fill(g.majorityHeld, {
                bloc: g.blocs[majority.bloc],
                count: majority.filled,
                total: seats.length,
              })
            : fill(g.noMajority, {
                largest: largest.total,
                total: seats.length,
              })}
        </p>

        <dl className="mb-8 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-muted">
          {balance.map((b) => (
            <div key={b.bloc} className="flex items-baseline gap-1.5">
              <dt>{g.blocs[b.bloc]}</dt>
              <dd className="m-0 font-semibold text-navy">
                {b.filled}/{b.total}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5 p-0">
          {seats.map((seat) => (
            <li key={seat.n}>
              <Card className="flex h-full flex-col px-[18px] py-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[10.5px] text-muted">
                    {g.seatLabel} {seat.n}
                  </span>
                  <Tag tone={seat.tone}>{g.seatStatus[seat.status]}</Tag>
                </div>
                <div className="mt-1 text-[14px] font-bold text-navy">
                  {g.seats[`s${seat.n}` as keyof typeof g.seats].name}
                </div>
                <p className="mt-1.5 mb-0 text-[12.5px] leading-[1.55] text-body-soft">
                  {g.seats[`s${seat.n}` as keyof typeof g.seats].why}
                </p>
                {seat.organisation ? (
                  <div className="mt-2.5 text-[12.5px] font-semibold text-teal-ink">
                    {seat.organisation}
                  </div>
                ) : null}
                <div className="mt-auto pt-2.5 text-[11.5px] text-muted">
                  {g.blocs[seat.bloc]}
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-[680px] text-[12.5px] leading-[1.6] text-muted">
          {g.publishNote}
        </p>
      </Container>
    </Shell>
  );
}
