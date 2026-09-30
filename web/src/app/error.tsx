"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { TopRule } from "@/components/TopRule";
import { routes } from "@/lib/routes";

/**
 * Route-level error boundary. Catches render/runtime failures in any page and
 * offers a retry rather than dropping the visitor on a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with the project's reporting sink when one exists.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
      </div>

      <main id="main-content" className="flex flex-1 items-center px-8 py-20">
        <div className="mx-auto w-full max-w-[640px]">
          <div className="mb-2.5 font-mono text-[11px] tracking-[0.14em] text-gold-ink uppercase">
            Something went wrong
          </div>
          <h1 className="m-0 font-serif text-[30px] leading-[1.25] font-semibold text-navy">
            This page failed to load.
          </h1>
          <p className="mt-4 text-[14.5px] leading-[1.65] text-body-soft">
            The problem has been logged. You can try again, or head back to the
            home page.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-[12px] text-muted">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer rounded-lg border-none bg-navy px-[26px] py-3.5 text-[14.5px] font-semibold text-white"
            >
              Try again
            </button>
            <Link
              href={routes.home}
              className="rounded-lg border border-line bg-white px-6 py-[13px] text-[14px] font-semibold text-navy no-underline transition-colors hover:border-navy"
            >
              Back to VAACA
            </Link>
          </div>
        </div>
      </main>

      <div className="px-8 py-5 text-center text-[12px] text-muted">
        VAACA · Virtual Assets Association of Central Africa · In Formation
      </div>
    </div>
  );
}
