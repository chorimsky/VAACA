import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { TopRule } from "@/components/TopRule";
import { routes } from "@/lib/routes";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  // No alternates or canonical here: a page that does not exist should not
  // claim to be the canonical anything.
  return { title: t.errors.notFound.title404, robots: { index: false } };
}

export default async function NotFound() {
  const { t, path } = await getTranslations();
  const e = t.errors.notFound;

  const SUGGESTIONS = [
    { label: t.nav.primary.institution, href: routes.institution },
    { label: t.nav.primary.standards, href: routes.standards },
    { label: t.nav.primary.membership, href: routes.membership },
    { label: e.regionLink, href: routes.region },
    { label: t.nav.resources, href: routes.resources },
  ];

  return (
    <div id="top" className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <Link
          href={path(routes.home)}
          className="text-[13.5px] font-semibold text-navy no-underline"
        >
          <span aria-hidden>←</span> {t.nav.backToVaaca}
        </Link>
      </div>

      <main
        id="main-content"
        className="vaaca-pattern flex flex-1 items-center px-8 py-20"
      >
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="mb-2.5 font-mono text-[11px] tracking-[0.14em] text-green uppercase">
            {e.eyebrow}
          </div>
          <h1 className="m-0 max-w-[620px] font-serif text-[38px] leading-[1.2] font-semibold tracking-[-0.01em] text-navy">
            {e.title}
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.65] text-body-soft">
            {e.body}
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {SUGGESTIONS.map((item) => (
              <Link
                key={item.href}
                href={path(item.href)}
                className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-navy no-underline transition-colors hover:border-teal hover:text-teal-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href={path(routes.home)}
              className="inline-block rounded-lg bg-[linear-gradient(135deg,#0B4944,#0D554F)] px-[26px] py-3.5 text-[14.5px] font-semibold text-white no-underline shadow-[0_10px_24px_-10px_rgba(14,42,68,0.5)] transition-colors hover:bg-teal-deep hover:bg-none hover:text-white"
            >
              {e.home}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
