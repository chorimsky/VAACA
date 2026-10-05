import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";
import { listCouncils } from "@/lib/server/councils";
import {
  COUNCIL_DEFINITIONS,
  COUNCIL_STATUS_TONE,
  type CouncilId,
} from "@/lib/council-types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  // The heading is a sentence; a tab and a search result need a name.
  return documentMetadata(t.councils.eyebrow, t.councils.lede);
}

export const dynamic = "force-dynamic";

export default async function CouncilsPage() {
  const { t, path } = await getTranslations();
  const c = t.councils;
  const records = await listCouncils();
  const byId = new Map(records.map((r) => [r.id, r]));

  return (
    <Shell>
      <Container className="pt-14 pb-16">
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h1 className="m-0 mb-3 max-w-[720px] font-serif text-[34px] leading-[1.3] font-semibold tracking-[-0.01em] text-navy">
          {c.title}
        </h1>
        <p className="mb-9 max-w-[720px] text-[14.5px] leading-[1.6] text-body-soft">
          {c.lede}
        </p>

        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3.5 p-0">
          {COUNCIL_DEFINITIONS.map((definition) => {
            const id = definition.id as CouncilId;
            const record = byId.get(id);
            const status = record?.status ?? "proposed";
            return (
              <li key={id}>
                <Card className="h-full px-5 py-[18px]">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={path(`/councils/${id}`)}
                      className="text-[14.5px] font-bold text-navy no-underline"
                    >
                      {c.names[id].name}
                    </Link>
                    <Tag tone={COUNCIL_STATUS_TONE[status]}>
                      {c.status[status]}
                    </Tag>
                  </div>
                  <p className="mt-2 mb-0 text-[12.5px] leading-[1.55] text-muted">
                    {c.names[id].mandate}
                  </p>
                  <div className="mt-3 text-[12px] text-body-softer">
                    {status === "active"
                      ? `${c.seats} ${record?.seats.length ?? 0} · ${c.filled} ${
                          record?.seats.filter((s) => s.status === "filled")
                            .length ?? 0
                        } · ${c.quorum} ${record?.quorum ?? 0}`
                      : c.notYetStood}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </Container>
    </Shell>
  );
}
