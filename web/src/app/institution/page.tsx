import type { Metadata } from "next";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { NetworkIcon, ShieldIcon, StandardsIcon } from "@/components/icons";
import { filledStaffRoles } from "@/lib/server/store";
import { type StaffRole } from "@/lib/staff-roles";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  // The title, the description and the social card all follow the
  // page's language, and the canonical URL names this page.
  const { t } = await getTranslations();
  const m = t.meta.institution;
  return {
    ...(await documentMetadata(m.title, m.description)),
  };
}

/**
 * The launch seminar. Dated so the page can tell the reader whether it is still
 * ahead — a fixed "Confirmed" badge would still be advertising it as upcoming
 * years later.
 */
const SEMINAR = {
  start: "2026-09-29",
  end: "2026-09-30",
  venue: "Hilton Yaoundé, Cameroon",
};

const seminarState = (today: Date) => {
  const end = new Date(`${SEMINAR.end}T23:59:59Z`);
  const start = new Date(`${SEMINAR.start}T00:00:00Z`);
  if (today > end) return { key: "held" as const, tone: "neutral" as const };
  if (today >= start)
    return { key: "inSession" as const, tone: "green" as const };
  return { key: "confirmed" as const, tone: "green" as const };
};

export const dynamic = "force-dynamic";

export default async function InstitutionPage() {
  const { t } = await getTranslations();
  const i = t.institution;
  const appointed = await filledStaffRoles();
  const seminar = seminarState(new Date());

  const PILLARS = [
    { n: "01", ...i.pillars.trust, Icon: ShieldIcon },
    { n: "02", ...i.pillars.standards, Icon: StandardsIcon },
    { n: "03", ...i.pillars.connectivity, Icon: NetworkIcon },
  ];

  const FOUNDERS = [
    { name: "Info Pro Solutions", role: i.founders.infoPro },
    { name: "Ejara", role: i.founders.ejara },
    { name: "Blockchain Association of Cameroon", role: i.founders.bac },
    {
      name: "IAFN — African Institute of Digital Finance",
      role: i.founders.iafn,
    },
  ];

  const SECRETARIAT: { role: StaffRole; vacant: string; filled: string }[] = [
    { role: "secretary_general", ...i.posts.secretaryGeneral },
    { role: "standards_officer", ...i.posts.standardsOfficer },
  ];

  return (
    <Shell active="institution">
      <Container className="pt-14 pb-6">
        <Eyebrow>{t.nav.primary.institution}</Eyebrow>
        <h1 className="m-0 max-w-[820px] font-serif text-[38px] leading-[1.28] font-semibold tracking-[-0.01em] text-navy">
          {i.title}
        </h1>
      </Container>

      <div className="bg-[linear-gradient(160deg,#0B4944_0%,#0B4944_60%,#0C524C_100%)] px-8 pt-12 pb-[68px]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.n}
              className="rounded-2xl border border-white/12 p-7 transition-[border-color,background] duration-200 hover:border-teal/50 hover:bg-white/[0.02]"
            >
              {/* The icon inherits `text-teal-bright` from this wrapper
                  rather than hard-coding a stroke colour. */}
              <div className="mb-[18px] flex h-11 w-11 items-center justify-center rounded-xl bg-teal/[0.14] text-teal-bright">
                <pillar.Icon size="lg" />
              </div>
              <div className="mb-2 font-mono text-[11px] tracking-[0.06em] text-teal-bright">
                {pillar.n}
              </div>
              <div className="mb-2.5 text-[17px] font-bold text-white">
                {pillar.title}
              </div>
              <div className="text-[13.5px] leading-[1.65] text-on-dark-card">
                {pillar.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Container className="pt-16">
        <div id="founders" className="scroll-mt-24">
          <Eyebrow>{i.foundersEyebrow}</Eyebrow>
          <h2 className="m-0 mb-3.5 max-w-[760px] font-serif text-[26px] leading-[1.4] font-semibold text-navy">
            {i.foundersTitle}
          </h2>
          <p className="mb-[26px] max-w-[760px] text-[13.5px] leading-[1.6] text-body-soft">
            {i.foundersNote}
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            {FOUNDERS.map((founder) => (
              <Card key={founder.name} className="px-[18px] py-4">
                <div className="text-[14px] font-bold text-navy">
                  {founder.name}
                </div>
                <div className="mt-1.5 text-[12px] leading-[1.5] text-muted">
                  {founder.role}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>

      <div
        id="secretariat"
        className="mt-16 scroll-mt-24 bg-canvas-alt px-8 py-16"
      >
        <div className="mx-auto max-w-[1180px]">
          <Eyebrow>{i.secretariatEyebrow}</Eyebrow>
          <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
            {i.secretariatTitle}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            {SECRETARIAT.map((post) => {
              const isFilled = appointed.has(post.role);
              return (
                <Card key={post.role} className="px-5 py-[18px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[14.5px] font-bold text-navy">
                      {t.roles[post.role]}
                    </div>
                    <Tag tone={isFilled ? "green" : "gold"}>
                      {isFilled ? i.appointed : i.vacant}
                    </Tag>
                  </div>
                  <div className="mt-1.5 text-[12.5px] leading-[1.5] text-muted">
                    {isFilled ? post.filled : post.vacant}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Container className="py-16">
        <Eyebrow>{i.eventsEyebrow}</Eyebrow>
        <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
          {i.eventsTitle}
        </h2>
        <Card className="flex flex-wrap items-center justify-between gap-5 rounded-[14px] p-6">
          <div>
            <div className="text-[16px] font-bold text-navy">
              {i.seminarName}
            </div>
            <div className="mt-1.5 text-[13px] text-muted">
              {SEMINAR.venue} ·{" "}
              <time dateTime={SEMINAR.start}>{i.seminarDates}</time>
            </div>
            <div className="mt-1.5 text-[12.5px] leading-[1.5] text-muted">
              {i.seminarBody}
            </div>
          </div>
          <Tag
            tone={seminar.tone}
            className="px-3.5 py-1.5 tracking-[0.04em] uppercase"
          >
            {i.seminarState[seminar.key]}
          </Tag>
        </Card>
      </Container>
    </Shell>
  );
}
