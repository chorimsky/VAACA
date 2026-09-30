"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { routes, type NavKey } from "@/lib/routes";
import { MenuIcon } from "@/components/icons";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sticky top-0 z-50 backdrop-blur-[6px] transition-[box-shadow,border-color] duration-200"
      style={{
        background: `rgba(250,250,248,${scrolled ? 0.97 : 0.9})`,
        borderBottom: `1px solid ${scrolled ? "#E3E3DD" : "transparent"}`,
        boxShadow: scrolled ? "0 6px 20px -14px rgba(14,42,68,0.35)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-4">
        <Logo />

        <nav
          aria-label="Primary"
          className="hidden flex-wrap items-center gap-5 text-[13.5px] font-medium nav:flex"
        >
          {PRIMARY.map((item) => {
            const on = item.key === active;
            return (
              <Link
                key={item.key}
                href={href(item.href)}
                aria-current={on ? "page" : undefined}
                className={`border-b-2 pb-1 no-underline hover:text-teal-ink ${
                  on
                    ? "border-teal font-semibold text-navy"
                    : "border-transparent font-medium text-body"
                }`}
              >
                {t.nav.primary[item.key]}
              </Link>
            );
          })}
          {SECONDARY.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-body no-underline hover:text-teal-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={href(routes.register)}
            className="rounded-md bg-navy px-4 py-[9px] font-semibold text-white no-underline hover:bg-teal-deep hover:text-white"
          >
            {t.nav.join}
          </Link>
          <LanguageSwitcher locale={locale} label={t.language.label} />
        </nav>

        <button
          type="button"
          aria-label={t.nav.toggleMenu}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white p-0 text-navy nav:hidden"
        >
          <MenuIcon size="md" />
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-0.5 border-t border-line px-5 pt-2 pb-4 nav:hidden">
          {PRIMARY.map((item) => (
            <Link
              key={item.key}
              href={href(item.href)}
              onClick={() => setOpen(false)}
              className="px-1 py-2.5 text-[14px] font-medium text-body no-underline"
            >
              {t.nav.primary[item.key]}
            </Link>
          ))}
          {SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-1 py-2.5 text-[14px] font-medium text-body no-underline"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={href(routes.register)}
            onClick={() => setOpen(false)}
            className="mt-2 rounded-md bg-navy px-3.5 py-2.5 text-center font-semibold text-white no-underline"
          >
            {t.nav.join}
          </Link>
          <div className="mt-3 flex justify-center">
            <LanguageSwitcher locale={locale} label={t.language.label} />
          </div>
        </div>
      )}
    </div>
  );
}
