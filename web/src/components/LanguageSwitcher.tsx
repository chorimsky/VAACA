"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  LOCALES,
  LOCALE_LABEL,
  LOCALE_TAG,
  localePath,
  splitLocale,
  type Locale,
} from "@/lib/i18n/locale";

/**
 * Switches between English and French.
 *
 * These are links, not buttons. Each locale has its own address, so the other
 * language is a place — which means it should behave like one: openable in a
 * new tab, copyable from the context menu, followable by a crawler, and
 * working with no JavaScript at all. As buttons calling `router.push` it did
 * none of those.
 *
 * The href carries the current query string, because losing it is not
 * cosmetic: switching language on `/login?next=/dashboard` used to drop the
 * destination and send the visitor somewhere else after signing in.
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
  const searchParams = useSearchParams();

  // The rewrite means `usePathname()` can report either the prefixed or the
  // bare path depending on how the page was reached; normalise before
  // rebuilding, so switching never stacks a second prefix.
  const { path } = splitLocale(pathname);

  /**
   * The query travels with the switch, but a `next` destination has to move
   * languages too — otherwise choosing English on `/fr/login?next=/fr/dashboard`
   * signs you in and drops you back on the French page you just left.
   */
  const queryFor = (option: Locale) => {
    const params = new URLSearchParams(searchParams.toString());
    const next = params.get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) {
      params.set("next", localePath(option, splitLocale(next).path));
    }
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  // Both halves set a background. Leaving `bg-transparent` in the shared class
  // list and only overriding it here does not work: Tailwind resolves two
  // utilities for the same property by stylesheet order, not by the order they
  // appear in the attribute, so the transparent one won and the active
  // language rendered as white text on a light bar — invisible.
  const styles =
    tone === "dark"
      ? {
          on: "bg-white/20 text-white",
          off: "bg-transparent text-on-dark hover:bg-white/10 hover:text-white",
        }
      : {
          on: "bg-navy text-white",
          off: "bg-transparent text-body hover:bg-canvas-alt hover:text-navy",
        };

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full p-0.5"
      role="group"
      aria-label={label}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        const href = `${localePath(option, path)}${queryFor(option)}`;
        return (
          <Link
            key={option}
            href={href}
            // `hreflang` tells a crawler what it will find there; `lang` tells
            // a screen reader to say "Français" with a French voice rather
            // than reading it as English.
            hrefLang={LOCALE_TAG[option]}
            lang={LOCALE_TAG[option]}
            // The other language is this same page in another translation —
            // which is what `rel="alternate"` says.
            rel={active ? undefined : "alternate"}
            // The active link points at the page already open, so `page` is
            // the precise value; `true` would only say "current in this set".
            aria-current={active ? "page" : undefined}
            className={`-my-1 rounded-full px-2.5 py-1 text-[12px] font-semibold no-underline transition-colors ${
              active ? styles.on : styles.off
            }`}
          >
            {/* The name of each language in that language, which is what a
                reader looking for their own can actually recognise. */}
            {LOCALE_LABEL[option]}
          </Link>
        );
      })}
    </div>
  );
}
