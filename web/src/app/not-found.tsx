import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { TopRule } from "@/components/TopRule";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Page not found" };

const SUGGESTIONS = [
  { label: "The Institution", href: routes.institution },
  { label: "Standards", href: routes.standards },
  { label: "Membership", href: routes.membership },
  { label: "Region & chapters", href: routes.region },
  { label: "Resources", href: routes.resources },
];

export default function NotFound() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <Link
          href={routes.home}
          className="text-[13.5px] font-semibold text-navy no-underline"
        >
          <span aria-hidden>←</span> Back to VAACA
        </Link>
      </div>

      <main
        id="main-content"
        className="vaaca-pattern flex flex-1 items-center px-8 py-20"
      >
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="mb-2.5 font-mono text-[11px] tracking-[0.14em] text-green uppercase">
            Error 404
          </div>
          <h1 className="m-0 max-w-[620px] font-serif text-[38px] leading-[1.2] font-semibold tracking-[-0.01em] text-navy">
            That page isn&apos;t part of the association.
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.65] text-body-soft">
            The link may be out of date, or the page may not have been published
            yet — VAACA is in formation and this site is still growing.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {SUGGESTIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-navy no-underline transition-colors hover:border-teal hover:text-teal-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href={routes.home}
              className="inline-block rounded-lg bg-[linear-gradient(135deg,#0B4944,#0D554F)] px-[26px] py-3.5 text-[14.5px] font-semibold text-white no-underline shadow-[0_10px_24px_-10px_rgba(14,42,68,0.5)] transition-colors hover:bg-teal-deep hover:bg-none hover:text-white"
            >
              Return to the home page
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
