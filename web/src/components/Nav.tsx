"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { routes, type NavKey } from "@/lib/routes";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locale";

const PRIMARY: { key: NavKey; href: string }[] = [
  { key: "institution", href: routes.institution },
  { key: "standards", href: routes.standards },
  { key: "ecosystem", href: routes.ecosystem },
  { key: "membership", href: routes.membership },
  { key: "governance", href: routes.governance },
  { key: "region", href: routes.region },
];

const MENU_ID = "primary-menu";

/**
 * Every nav destination gets the same generous hit area. The links used to be
 * their text box — 20px tall for the secondary pair — which is under the 24px
 * WCAG 2.2 asks of a target and left them smaller than the primary links
 * beside them. The negative margin keeps the bar the same height.
 */
const ITEM =
  "-my-1 rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-canvas-alt hover:text-teal-ink";

export function Nav({
  active,
  locale,
  t,
}: {
  active?: NavKey;
  locale: Locale;
  t: Dictionary;
}) {
  const href = (to: string) => localePath(locale, to);
  const SECONDARY = [
    { label: t.nav.resources, href: href(routes.resources) },
    { label: t.nav.login, href: href(routes.login) },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the menu and puts focus back on the control that opened it,
  // so a keyboard user is never left with focus inside a panel they dismissed.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Growing past the breakpoint reveals the full bar; leaving the panel open
  // behind it would strand `aria-expanded` in a state nothing on screen shows.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 880px)");
    const onChange = () => wide.matches && setOpen(false);
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [open]);

  /** Marks the page a link points at, for both the bar and the panel. */
  const currentProps = (isCurrent: boolean) =>
    isCurrent ? ({ "aria-current": "page" } as const) : {};

  return (
    <div
      className="sticky top-0 z-50 backdrop-blur-[6px] transition-[box-shadow,border-color] duration-200"
      style={{
        background: `rgba(250,250,248,${scrolled ? 0.97 : 0.9})`,
        borderBottom: `1px solid ${scrolled ? "#E3E3DD" : "transparent"}`,
        boxShadow: scrolled ? "0 6px 20px -14px rgba(11,73,68,0.35)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-4">
        <Logo />

        <nav
          aria-label={t.nav.primaryLabel}
          className="hidden flex-wrap items-center gap-2 text-[13.5px] font-medium nav:flex"
        >
          {PRIMARY.map((item) => {
            const on = item.key === active;
            return (
              <Link
                key={item.key}
                href={href(item.href)}
                {...currentProps(on)}
                className={`${ITEM} ${
                  on ? "bg-canvas-alt font-semibold text-navy" : "text-body"
                }`}
              >
                <span className="relative">
                  {t.nav.primary[item.key]}
                  {/* The state marker is drawn here rather than as a border on
                      the link, so the generous padding above does not push it
                      away from the word it belongs to. Brand gold sits at
                      2.3:1 on this bar, under the 3:1 a state indicator needs,
                      so the deeper tone carries it at 5.5:1. */}
                  {on ? (
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-teal-ink"
                    />
                  ) : null}
                </span>
              </Link>
            );
          })}
          {SECONDARY.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${ITEM} text-body`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={href(routes.register)}
            className="ml-1 rounded-md bg-navy px-4 py-[9px] font-semibold text-white no-underline transition-colors hover:bg-teal-deep hover:text-white"
          >
            {t.nav.join}
          </Link>
          <LanguageSwitcher locale={locale} label={t.language.label} />
        </nav>

        <button
          ref={toggleRef}
          type="button"
          aria-label={open ? t.nav.closeMenu : t.nav.toggleMenu}
          aria-expanded={open}
          aria-controls={MENU_ID}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white p-0 text-navy transition-colors hover:border-navy nav:hidden"
        >
          {open ? <CloseIcon size="md" /> : <MenuIcon size="md" />}
        </button>
      </div>

      {open && (
        <nav
          id={MENU_ID}
          aria-label={t.nav.primaryLabel}
          className="flex flex-col gap-0.5 border-t border-line px-5 pt-2 pb-4 nav:hidden"
        >
          {PRIMARY.map((item) => {
            const on = item.key === active;
            return (
              <Link
                key={item.key}
                href={href(item.href)}
                {...currentProps(on)}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-md px-2.5 py-3 text-[14px] no-underline ${
                  on
                    ? "bg-canvas-alt font-semibold text-navy"
                    : "font-medium text-body"
                }`}
              >
                {t.nav.primary[item.key]}
                {/* The bar shows the current page with an underline; the panel
                    says it in words, which is the clearer signal in a list. */}
                {on ? (
                  <span className="text-[11px] font-semibold text-teal-ink">
                    {t.nav.currentPage}
                  </span>
                ) : null}
              </Link>
            );
          })}
          {SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2.5 py-3 text-[14px] font-medium text-body no-underline"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={href(routes.register)}
            onClick={() => setOpen(false)}
            className="mt-2 rounded-md bg-navy px-3.5 py-3 text-center font-semibold text-white no-underline"
          >
            {t.nav.join}
          </Link>
          <div className="mt-3 flex justify-center">
            <LanguageSwitcher locale={locale} label={t.language.label} />
          </div>
        </nav>
      )}
    </div>
  );
}
