import type { Metadata } from "next";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { listPublicSeats } from "@/lib/server/seats";
import {
  blocBalance,
  filledCount,
  largestPossibleBloc,
  majorityHolder,
} from "@/lib/seat-types";

export const metadata: Metadata = {
  title: "Governance",
  description:
    "Nine founding seats on the Coordination Council, structured so no single interest holds a majority.",
};

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const seats = await listPublicSeats();
  const filled = filledCount(seats);
  const balance = blocBalance(seats);
  const majority = majorityHolder(seats);
  const largest = largestPossibleBloc();

  return (
    <Shell active="governance">
      <Container className="pt-14 pb-16">
        <Eyebrow>Governance</Eyebrow>
        <h1 className="m-0 mb-3 max-w-[720px] font-serif text-[32px] leading-[1.3] font-semibold text-navy">
          Nine founding seats. No single interest holds a majority.
        </h1>

        {/* The page asserts a constraint, so it should report against it
            rather than leave the reader to take it on trust. */}
        <p className="mb-2 max-w-[680px] text-[14.5px] leading-[1.6] text-body-soft">
          {filled === 0
            ? "The Council is being recruited: none of the nine seats are filled yet. Seats are published here as they are taken."
            : `${filled} of ${seats.length} seats filled.`}{" "}
          {majority
            ? `${majority.label} holds ${majority.filled} of ${seats.length} seats — a majority, which the Council's composition rule does not allow to stand.`
            : `No interest can hold a majority: the largest bloc is defined ${largest.total} seats wide, of ${seats.length}.`}
        </p>

        <dl className="mb-8 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-muted">
          {balance.map((b) => (
            <div key={b.bloc} className="flex items-baseline gap-1.5">
              <dt>{b.label}</dt>
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
                    Seat {seat.n}
                  </span>
                  <Tag tone={seat.tone}>{seat.statusLabel}</Tag>
                </div>
                <div className="mt-1 text-[14px] font-bold text-navy">
                  {seat.name}
                </div>
                <p className="mt-1.5 mb-0 text-[12.5px] leading-[1.55] text-body-soft">
                  {seat.why}
                </p>
                {seat.organisation ? (
                  <div className="mt-2.5 text-[12.5px] font-semibold text-teal-ink">
                    {seat.organisation}
                  </div>
                ) : null}
                <div className="mt-auto pt-2.5 text-[11.5px] text-muted">
                  {seat.blocLabel}
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-[680px] text-[12.5px] leading-[1.6] text-muted">
          Seat holders are named in the Founding Coalition &amp; Alliance
          Architecture once appointed. Candidates under consideration are not
          published.
        </p>
      </Container>
    </Shell>
  );
}
