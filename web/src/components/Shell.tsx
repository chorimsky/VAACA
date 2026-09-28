import { Nav } from "./Nav";
import { Footer } from "./Footer";
import type { NavKey } from "@/lib/routes";

/** The tricolour hairline that opens every page. */
export function TopRule() {
  return (
    <div className="h-[3px] bg-[linear-gradient(90deg,#0E2A44,#1AA6B3,#B5730C)]" />
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
 * `tone="teal"` is only used on navy sections, where brand teal reaches 5:1.
 * On light surfaces the green tone is the accessible one.
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
        tone === "teal" ? "text-teal" : "text-green"
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
