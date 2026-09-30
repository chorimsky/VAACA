import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TopRule } from "@/components/TopRule";
import { SignOutButton } from "@/components/DashboardBar";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * What a suspended member sees instead of their dashboard.
 *
 * Rendered rather than redirected on purpose. `redirect()` called from a page
 * that has already begun streaming cannot set a status: the response is a 200
 * with an empty shell, which shows a blank screen to anyone without
 * JavaScript. This is a real page with a real explanation, and it loads none
 * of the member's record — the enforcement is that the data is never read,
 * not that it is hidden.
 */
export function Suspended({
  t,
  backLabel,
  homeHref,
}: {
  t: Dictionary["auth"]["suspendedPage"];
  backLabel: string;
  homeHref: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <Link
          href={homeHref}
          className="text-[13.5px] font-semibold text-navy no-underline"
        >
          <span aria-hidden>←</span> {backLabel}
        </Link>
      </div>

      <main id="main-content" className="flex flex-1 items-center px-8 py-20">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="mb-2.5 font-mono text-[11px] tracking-[0.14em] text-gold-ink uppercase">
            {t.eyebrow}
          </div>
          <h1 className="m-0 font-serif text-[30px] leading-[1.25] font-semibold text-navy">
            {t.title}
          </h1>
          <p className="mt-4 text-[14.5px] leading-[1.65] text-body-soft">
            {t.body}
          </p>
          <div className="mt-7">
            <SignOutButton
              audience="member"
              redirectTo={homeHref}
              label={t.signOut}
              busyLabel={t.signOut}
              className="rounded-lg border border-line bg-white px-6 py-[13px] text-[14px] font-semibold text-navy"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
