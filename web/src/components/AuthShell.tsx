import Link from "next/link";
import { Logo } from "./Logo";
import { TopRule } from "./TopRule";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Chrome for the standalone portal screens (login, registration): rule, a
 * light header with a single cross-link, centred body, quiet footer.
 */
export function AuthShell({
  asideText,
  asideLinkLabel,
  asideHref,
  footer,
  locale,
  languageLabel,
  align = "center",
  children,
}: {
  asideText: string;
  asideLinkLabel: string;
  asideHref: string;
  /** Already translated by the caller. */
  footer: string;
  locale: Locale;
  /** Accessible name for the language switcher, already translated. */
  languageLabel: string;
  align?: "center" | "start";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-[13.5px] font-medium">
            {asideText}{" "}
            <Link href={asideHref} className="font-bold text-navy">
              {asideLinkLabel}
            </Link>
          </div>
          {/* Every page needs a way out of the language it is in — these
              portal screens had none. */}
          <LanguageSwitcher locale={locale} label={languageLabel} />
        </div>
      </div>

      <main
        id="main-content"
        className={`flex flex-1 justify-center px-8 pt-6 pb-16 ${
          align === "center" ? "items-center" : "items-start"
        }`}
      >
        {children}
      </main>

      <div className="px-8 py-5 text-center text-[12px] text-muted">
        {footer}
      </div>
    </div>
  );
}
