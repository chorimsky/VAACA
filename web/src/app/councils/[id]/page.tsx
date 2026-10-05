import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { getTranslations } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/dictionaries";
import { documentMetadata } from "@/lib/i18n/metadata";
import { getCouncil } from "@/lib/server/councils";
import {
  COUNCIL_DEFINITIONS,
  COUNCIL_STATUS_TONE,
  isCouncilId,
  toPublicCouncil,
} from "@/lib/council-types";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  if (!isCouncilId(id)) return {};
  const { t } = await getTranslations();
  const copy = t.councils.names[id];
  return documentMetadata(copy.name, copy.mandate);
}

export default async function CouncilPage({ params }: Params) {
  const { id } = await params;
  if (!isCouncilId(id)) notFound();

  const record = await getCouncil(id);
  if (!record) notFound();

  const definition = COUNCIL_DEFINITIONS.find((d) => d.id === id)!;
  const council = toPublicCouncil(record, definition.chamberId);
  const { t, path } = await getTranslations();
  const c = t.councils;
  const copy = c.names[id];

  return (
    <Shell>
      <Container className="pt-14 pb-16">
        <Link
          href={path("/councils")}
          className="text-[13px] font-semibold text-navy no-underline"
        >
          <span aria-hidden>←</span> {c.backToCouncils}
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Eyebrow>
            {fill(c.convenedBy, {
              chamber: t.membership.chambers[council.chamberId].name,
            })}
          </Eyebrow>
          <Tag tone={COUNCIL_STATUS_TONE[council.status]}>
            {c.status[council.status]}
          </Tag>
        </div>

        <h1 className="m-0 mt-2 mb-3 max-w-[720px] font-serif text-[32px] leading-[1.3] font-semibold text-navy">
          {copy.name}
        </h1>
        <p className="mb-7 max-w-[680px] text-[14.5px] leading-[1.6] text-body-soft">
          {copy.mandate}
        </p>

        {council.status === "active" ? (
          <>
            <div className="mb-7 flex flex-wrap gap-3">
              {[
                { label: c.seats, value: council.seatCount },
                { label: c.filled, value: council.filled },
                { label: c.quorum, value: council.quorum },
                // The architecture requires a council to be cross-sector, so
                // how many chambers it draws from is a fact about whether it
                // is one — not decoration.
                { label: c.chambersDrawn, value: council.chambers.length },
              ].map((stat) => (
                <Card key={stat.label} className="min-w-[140px] px-5 py-3.5">
                  <div className="text-[11px] tracking-[0.06em] text-muted uppercase">
                    {stat.label}
                  </div>
                  <div className="mt-1 font-serif text-[22px] font-semibold text-navy">
                    {stat.value}
                  </div>
                </Card>
              ))}
            </div>

            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {council.seats.map((seat) => (
                <li key={seat.n}>
                  <Card className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <span>
                      <span className="block text-[13.5px] font-semibold text-navy">
                        {seat.name}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted">
                        {t.membership.chambers[seat.chamberId].name} ·{" "}
                        {seat.blocLabel}
                      </span>
                    </span>
                    <span className="text-[12.5px] text-body-soft">
                      {seat.organisation ?? "—"}
                    </span>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        ) : (
          // A council that is not active has nothing to announce: no
          // composition, no seats, no output. Saying so is the honest page.
          <Card className="max-w-[560px] px-5 py-[18px]">
            <p className="m-0 text-[13.5px] leading-[1.6] text-body-soft">
              {c.notYetStood}
            </p>
          </Card>
        )}

        <p className="mt-8 text-[12.5px] text-muted">{c.reportsTo}</p>
      </Container>
    </Shell>
  );
}
