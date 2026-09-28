import Link from "next/link";
import { Logo } from "./Logo";
import { TopRule } from "./Shell";

/**
 * Chrome for the standalone portal screens (login, registration): rule, a
 * light header with a single cross-link, centred body, quiet footer.
 */
export function AuthShell({
  asideText,
  asideLinkLabel,
  asideHref,
  align = "center",
  children,
}: {
  asideText: string;
  asideLinkLabel: string;
  asideHref: string;
  align?: "center" | "start";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <div className="text-[13.5px] font-medium">
          {asideText}{" "}
          <Link href={asideHref} className="font-bold text-navy">
            {asideLinkLabel}
          </Link>
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
        VAACA · Virtual Assets Association of Central Africa · In Formation
      </div>
    </div>
  );
}
