import type { Metadata } from "next";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { NetworkIcon, ShieldIcon, StandardsIcon } from "@/components/icons";
import { filledStaffRoles } from "@/lib/server/store";
import { ROLE_LABEL, type StaffRole } from "@/lib/staff-roles";

export const metadata: Metadata = {
  title: "The Institution",
  description:
    "Why VAACA exists, its four founding organizations, the secretariat it still needs, and the launch seminar in Yaoundé.",
};

const PILLARS = [
  {
    n: "01",
    title: "Trust",
    body: "Governance, transparency and conflict-of-interest rules built into the Charter from the first draft.",
    Icon: ShieldIcon,
  },
  {
    n: "02",
    title: "Standards",
    body: "The PSAN Regulatory Readiness Framework — gates, domains and evidence thresholds regulators can rely on.",
    Icon: StandardsIcon,
  },
  {
    n: "03",
    title: "Connectivity",
    body: "One chapter model, built to replicate across all six CEMAC states under a single institutional architecture.",
    Icon: NetworkIcon,
  },
];

const FOUNDERS = [
  {
    name: "Info Pro Solutions",
    role: "RegTech — compliance and reporting infrastructure",
  },
  {
    name: "Ejara",
    role: "Licensed operator — regulated digital asset access",
  },
  {
    name: "Blockchain Association of Cameroon",
    role: "National industry association",
  },
  {
    name: "IAFN — African Institute of Digital Finance",
    role: "Technical secretariat and evidence base",
  },
];

/**
 * The two posts Charter Part 6 requires. Whether each is appointed is read
 * from the provisioned staff accounts rather than asserted here.
 */
const SECRETARIAT: { role: StaffRole; vacant: string; filled: string }[] = [
  {
    role: "secretary_general",
    vacant: "Not yet appointed — required before the Charter can be ratified.",
    filled: "Appointed. The Charter can proceed to ratification.",
  },
  {
    role: "standards_officer",
    vacant:
      "Not yet appointed — owns Readiness Framework scoring once domains are live.",
    filled: "Appointed. Owns Readiness Framework scoring.",
  },
];

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
  if (today > end) return { label: "Held", tone: "neutral" as const };
  if (today >= start) return { label: "In session", tone: "green" as const };
  return { label: "Confirmed", tone: "green" as const };
};

export const dynamic = "force-dynamic";

export default async function InstitutionPage() {
  const appointed = await filledStaffRoles();
  const seminar = seminarState(new Date());

  return (
    <Shell active="institution">
      <Container className="pt-14 pb-6">
        <Eyebrow>The Institution</Eyebrow>
        <h1 className="m-0 max-w-[820px] font-serif text-[38px] leading-[1.28] font-semibold tracking-[-0.01em] text-navy">
          VAACA exists to organize, professionalize, standardize and connect
          Central Africa&apos;s virtual-asset ecosystem — not to run it.
        </h1>
      </Container>

      <div className="bg-[linear-gradient(160deg,#0E2A44_0%,#0E2A44_60%,#123350_100%)] px-8 pt-12 pb-[68px]">
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
          <Eyebrow>Founders</Eyebrow>
          <h2 className="m-0 mb-3.5 max-w-[760px] font-serif text-[26px] leading-[1.4] font-semibold text-navy">
            Constituted by four organizations. Anchored, not improvised.
          </h2>
          <p className="mb-[26px] max-w-[760px] text-[13.5px] leading-[1.6] text-body-soft">
            During its founding phase, VAACA is rattached as an auxiliary organ
            to the Cameroon Fintech Association (CFIA) — an established national
            anchor rather than institutional legitimacy built from nothing.
            VAACA commits to an autonomous regional constitution once national
            chapters exist in at least three CEMAC member states.
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
          <Eyebrow>Secretariat</Eyebrow>
          <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
            The operating capacity every founding document assumes is already
            running.
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            {SECRETARIAT.map((post) => {
              const isFilled = appointed.has(post.role);
              return (
                <Card key={post.role} className="px-5 py-[18px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[14.5px] font-bold text-navy">
                      {ROLE_LABEL[post.role]}
                    </div>
                    <Tag tone={isFilled ? "green" : "gold"}>
                      {isFilled ? "Appointed" : "Vacant"}
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
        <Eyebrow>Events</Eyebrow>
        <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
          The launch seminar is the first VAACA convening.
        </h2>
        <Card className="flex flex-wrap items-center justify-between gap-5 rounded-[14px] p-6">
          <div>
            <div className="text-[16px] font-bold text-navy">
              Institutional Launch Seminar — under ministerial patronage
            </div>
            <div className="mt-1.5 text-[13px] text-muted">
              {SEMINAR.venue} ·{" "}
              <time dateTime={SEMINAR.start}>September 29–30, 2026</time>
            </div>
            <div className="mt-1.5 text-[12.5px] leading-[1.5] text-muted">
              Day one convenes CEMAC regulators on convergence and standards;
              VAACA&apos;s mandate, founding members and CFIA affiliation are
              presented on day two.
            </div>
          </div>
          <Tag
            tone={seminar.tone}
            className="px-3.5 py-1.5 tracking-[0.04em] uppercase"
          >
            {seminar.label}
          </Tag>
        </Card>
      </Container>
    </Shell>
  );
}
