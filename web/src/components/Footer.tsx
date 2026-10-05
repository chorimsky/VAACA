import Link from "next/link";
import { routes } from "@/lib/routes";
import { getTranslations } from "@/lib/i18n/server";

export async function Footer() {
  const { t, path } = await getTranslations();
  const f = t.footer;

  const COLUMNS = [
    {
      heading: f.headings.institution,
      links: [
        { label: f.links.theInstitution, href: routes.institution },
        { label: f.links.founders, href: routes.founders },
        { label: f.links.governance, href: routes.governance },
        { label: f.links.councils, href: routes.councils },
        { label: f.links.secretariat, href: routes.secretariat },
      ],
    },
    {
      heading: f.headings.programs,
      links: [
        { label: f.links.standards, href: routes.standards },
        { label: f.links.ecosystem, href: routes.ecosystem },
        { label: f.links.membership, href: routes.membership },
        { label: f.links.region, href: routes.region },
      ],
    },
    {
      heading: f.headings.access,
      links: [
        { label: f.links.register, href: routes.register },
        { label: f.links.memberLogin, href: routes.login },
        { label: f.links.resources, href: routes.resources },
        // Both internal surfaces sit behind the same sign-in, so the public
        // footer offers the door rather than two locked rooms.
        { label: f.links.staffLogin, href: "/admin/login" },
      ],
    },
  ];

  return (
    <footer className="bg-navy-deep px-8 pt-[52px] pb-6 text-on-dark">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-7 border-b border-white/12 pb-7 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-serif text-[15px] font-bold text-white">
              VAACA
            </div>
            <div className="mt-2 max-w-[240px] text-[12px] leading-[1.6] text-on-dark-soft">
              {f.blurb}
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
                  href={path(link.href)}
                  className="-my-0.5 py-1 text-on-dark no-underline hover:text-teal-bright"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-5 pt-[18px] text-[12px] text-on-dark-soft">
          <div>{f.tagline}</div>
          <div className="max-w-[520px] md:text-right">{f.coalition}</div>
        </div>

        <div className="pt-4">
          <a
            href="#top"
            className="inline-block py-1 text-[12px] text-on-dark-faint no-underline hover:text-teal-bright"
          >
            <span aria-hidden>↑</span> {t.nav.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
