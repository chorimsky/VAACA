/**
 * Status pill. The prototypes carried an inline background/colour pair on every
 * badge; those five pairings are named here so a status reads as a tone rather
 * than a hex code.
 */
export type Tone = "green" | "gold" | "blue" | "neutral" | "red";

export const TONE_CLASS: Record<Tone, string> = {
  green: "bg-tint-green text-green",
  gold: "bg-tint-gold text-gold-ink",
  blue: "bg-tint-blue text-blue",
  neutral: "bg-canvas-alt text-muted",
  red: "bg-tint-red text-red",
};

export function Tag({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`rounded-full px-[11px] py-1 text-[11px] font-semibold whitespace-nowrap ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
