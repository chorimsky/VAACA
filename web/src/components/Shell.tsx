import { Nav } from "./Nav";
import { Footer } from "./Footer";
import type { NavKey } from "@/lib/routes";

/** The tricolour hairline that opens every page. */
export function TopRule() {
  return (
    <div className="h-[3px] bg-[linear-gradient(90deg,#0B4944,#CAA228,#CAA228)]" />
  );
}

/**
 * Standard page chrome: rule, sticky nav, content, footer.
 * Used by every public page except the standalone ones (login, register,
 * resources, dashboard, admin), which carry their own lighter header.
 */
export function Shell({
  active,
  children,
}: {
  active?: NavKey;
  children: React.ReactNode;
}) {
  return (
    <div id="top" className="bg-canvas text-body">
      <TopRule />
      <Nav active={active} />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}

/** Centred 1180px column with the prototypes' 32px side gutter. */
export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto max-w-[1180px] px-8 ${className}`}>{children}</div>
  );
}

/**
 * The mono, letterspaced section label above each heading.
 *
 * `tone="teal"` is the accent tone, used only on dark sections. It renders in
 * `teal-bright` rather than the brand gold itself: the gold reaches 4.3:1 on
 * the brand green, which carries a fill but not 11px text.
 */
export function Eyebrow({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "teal";
}) {
  return (
    <div
      className={`mb-2.5 font-mono text-[11px] tracking-[0.14em] uppercase ${
        tone === "teal" ? "text-teal-bright" : "text-green"
      }`}
    >
      {children}
    </div>
  );
}

/** White surface card with the standard hairline border. */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-line bg-white ${className}`}>
      {children}
    </div>
  );
}
