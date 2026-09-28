import Link from "next/link";
import { routes } from "@/lib/routes";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Institution",
      links: [
        { label: "The Institution", href: routes.institution },
        { label: "Founders", href: routes.founders },
        { label: "Governance", href: routes.governance },
        { label: "Secretariat", href: routes.secretariat },
      ],
    },
    {
      heading: "Programs",
      links: [
        { label: "Standards", href: routes.standards },
        { label: "Ecosystem", href: routes.ecosystem },
        { label: "Membership", href: routes.membership },
        { label: "Region", href: routes.region },
      ],
    },
    {
      heading: "Access",
      links: [
        { label: "Join / Register", href: routes.register },
        { label: "Member Login", href: routes.login },
        { label: "Resources", href: routes.resources },
        // Both internal surfaces sit behind the same sign-in, so the public
        // footer offers the door rather than two locked rooms.
        { label: "Secretariat sign-in", href: "/admin/login" },
      ],
    },
  ];

export function Footer() {
  return (
    <footer className="bg-navy-deep px-8 pt-[52px] pb-6 text-on-dark">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-7 border-b border-white/12 pb-7 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-serif text-[15px] font-bold text-white">
              VAACA
            </div>
            <div className="mt-2 max-w-[240px] text-[12px] leading-[1.6] text-on-dark-soft">
              Virtual Assets Association of Central Africa — a regional
              institution, in formation, headquartered from its Cameroon
              founding chapter.
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div
              key={col.heading}
              className="flex flex-col gap-2.5 text-[13px]"
            >
              <div className="mb-0.5 text-[11px] font-semibold tracking-[0.06em] text-on-dark-faint uppercase">
                {col.heading}
              </div>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="-my-0.5 py-1 text-on-dark no-underline hover:text-teal-bright"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-5 pt-[18px] text-[12px] text-on-dark-soft">
          <div>
            VAACA · Virtual Assets Association of Central Africa · In Formation
          </div>
          <div className="max-w-[520px] md:text-right">
            Founding coalition: Info Pro Solutions · Ejara · Blockchain
            Association of Cameroon · IAFN — rattached to CFIA during the
            founding phase
          </div>
        </div>

        <div className="pt-4">
          <a
            href="#top"
            className="inline-block py-1 text-[12px] text-on-dark-faint no-underline hover:text-teal-bright"
          >
            <span aria-hidden>↑</span> Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
