/**
 * Pure presentational primitives.
 *
 * Separate from `Shell`: that component awaits the request's locale, which
 * makes its module server-only. Client components (the admin queue, the member
 * dashboard) need these building blocks without dragging that in.
 */
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
