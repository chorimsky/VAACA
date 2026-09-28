import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Eyebrow, Shell } from "@/components/Shell";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Five accession classes, open and non-exclusive, with no discretionary refusal. How to apply and what membership does and does not mean.",
};

const CLASSES = [
  { letter: "A — Operating", who: "VASPs / exchanges", voting: "Full" },
  { letter: "B — Adjacent", who: "Banks, PSPs, telcos", voting: "Full" },
  {
    letter: "C — Professional",
    who: "Individuals (legal, compliance, security)",
    voting: "Limited",
  },
  {
    letter: "D — Academic",
    who: "Researchers, universities",
    voting: "Limited",
  },
  {
    letter: "E — Institutional",
    who: "Regulators, ministries, partners",
    voting: "Observer",
  },
];

const STEPS = [
  { n: "Step 1", label: "Identify your class" },
  { n: "Step 2", label: "Submit accession request to the secretariat" },
  { n: "Step 3", label: "Classes A/B complete the Readiness self-assessment" },
];

const FAQS = [
  {
    q: "Is VAACA a regulator?",
    a: "No. VAACA does not license, supervise or enforce. It builds standards and evidence that regulators can rely on.",
  },
  {
    q: "Who can join?",
    a: "Any organization or individual meeting one of the five accession classes — membership is open and non-exclusive.",
  },
  {
    q: "Why start with Cameroon?",
    a: "One working chapter is easier to get right than six at once. Cameroon’s Charter and Readiness Framework are built to be adopted as-is by the other CEMAC states.",
  },
  {
    q: "How is VAACA funded?",
    a: "Not yet defined publicly — funding model will be published once the secretariat is appointed and the Charter is ratified.",
  },
];

export default function MembershipPage() {
  return (
    <Shell active="membership">
      <Container className="pt-14 pb-10">
        <Eyebrow>Membership</Eyebrow>
        <h1 className="m-0 mb-3 max-w-[720px] font-serif text-[34px] leading-[1.3] font-semibold tracking-[-0.01em] text-navy">
          Open and non-exclusive. Five classes, no discretionary refusal.
        </h1>
        <p className="mb-[30px] max-w-[720px] text-[14.5px] leading-[1.6] text-body-soft">
          Any applicant that meets a class&apos;s criteria is admitted.
          Membership status is never a substitute for regulatory authorization.
        </p>

        <div className="mb-6 overflow-x-auto rounded-[14px] border border-line bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Class", "Who", "Voting"].map((h) => (
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
              {CLASSES.map((cls) => (
                <tr key={cls.letter}>
                  <th
                    scope="row"
                    className="border-b border-line px-[18px] py-[13px] text-left text-[13.5px] font-semibold text-navy"
                  >
                    {cls.letter}
                  </th>
                  <td className="border-b border-line px-[18px] py-[13px] text-[13px] text-body-soft">
                    {cls.who}
                  </td>
                  <td className="border-b border-line px-[18px] py-[13px] text-[13px] text-body-soft">
                    {cls.voting}
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
              <div className="font-mono text-[10.5px] text-muted">{step.n}</div>
              <div className="mt-1 text-[13.5px] font-semibold text-navy">
                {step.label}
              </div>
            </div>
          ))}
        </div>

        <Link
          href={routes.register}
          className="inline-block rounded-lg bg-[linear-gradient(135deg,#0E2A44,#163A56)] px-[26px] py-3.5 text-[14.5px] font-semibold text-white no-underline transition-colors hover:bg-teal-deep hover:bg-none hover:text-white"
        >
          Start an Application
          <span aria-hidden>↗</span>
        </Link>
      </Container>

      <div className="bg-canvas-alt px-8 py-16">
        <div className="mx-auto max-w-[1180px]">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="m-0 mb-[26px] max-w-[720px] text-[24px] leading-[1.4] font-semibold text-navy">
            Common questions.
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
