"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  LOCALES,
  LOCALE_LABEL,
  localePath,
  splitLocale,
  type Locale,
} from "@/lib/i18n/locale";

/**
 * Switches between English and French.
 *
 * It navigates to the same page in the other locale rather than toggling a
 * setting in place, because each locale has its own address — so the URL a
 * visitor copies after switching is the one that reproduces what they see.
 */
export function LanguageSwitcher({
  locale,
  tone = "light",
  label,
}: {
  locale: Locale;
  tone?: "light" | "dark";
  /** Accessible name for the group, already translated. */
  label: string;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // The rewrite means `usePathname()` can report either the prefixed or the
  // bare path depending on how the page was reached; normalise before
  // rebuilding, so switching never stacks a second prefix.
  const { path } = splitLocale(pathname);

  // Both halves set a background. Leaving `bg-transparent` in the shared class
  // list and only overriding it here does not work: Tailwind resolves two
  // utilities for the same property by stylesheet order, not by the order they
  // appear in the attribute, so the transparent one won and the active
  // language rendered as white text on a light bar — invisible.
  const styles =
    tone === "dark"
      ? {
          on: "bg-white/20 text-white",
          off: "bg-transparent text-on-dark hover:text-white",
        }
      : {
          on: "bg-navy text-white",
          off: "bg-transparent text-body hover:text-navy",
        };

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full p-0.5"
      role="group"
      aria-label={label}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-current={active ? "true" : undefined}
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                router.push(localePath(option, path));
                router.refresh();
              })
            }
            className={`-my-1 cursor-pointer rounded-full border-none px-2.5 py-1 text-[12px] font-semibold disabled:cursor-wait ${
              active ? styles.on : styles.off
            }`}
          >
            {/* The name of each language in that language, which is what a
                reader looking for their own can actually recognise. */}
            {LOCALE_LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
