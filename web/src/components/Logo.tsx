import Link from "next/link";
import { routes } from "@/lib/routes";

/**
 * The VAACA mark: a pointy-top hexagon with a node at each vertex, a V whose
 * arms meet at a filled node, and a rule beneath it.
 *
 * Geometry is measured from the supplied artwork — hexagon circumradius 30 in
 * a 64 viewBox, side nodes at ±R/2, the V's arms converging on the centre node
 * at 37° from vertical, the rule at 0.57R below centre.
 *
 * Stroke weights are the one deliberate departure. The artwork is 1280px wide
 * with an 11px hexagon outline — a hairline that disappears entirely by the
 * 28–36px this renders at in a header. The weights below are scaled up so the
 * mark still reads as itself at that size.
 */

const GOLD = "#CAA228";

/** Hexagon vertices, clockwise from the top, for centre (32,32) and R = 30. */
const NODES: [number, number][] = [
  [32, 2],
  [57.98, 17],
  [57.98, 47],
  [32, 62],
  [6.02, 47],
  [6.02, 17],
];

const HEX_PATH = `M ${NODES.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;

export function LogoMark({
  size = 36,
  tone = "light",
}: {
  size?: number;
  /**
   * Which surface the mark sits on. The V is white in the artwork, which is
   * drawn on the brand green — on a light surface it would vanish, so it takes
   * the brand green instead.
   */
  tone?: "light" | "dark";
}) {
  const vee = tone === "dark" ? "#FFFFFF" : "#0B4944";
  // Below ~28px the rule beneath the V lands within a pixel of the hexagon's
  // lower edge and the two merge into a smudge. The mark reads better without
  // it at that size, so it is dropped rather than drawn illegibly.
  const showRule = size >= 28;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      role="presentation"
    >
      <path
        d={HEX_PATH}
        stroke={GOLD}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />
      {NODES.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" fill={GOLD} />
      ))}

      {/* The V, drawn before the centre node so the node caps the junction. */}
      <path
        d="M 16 19.8 L 32 41.2 L 48 19.8"
        stroke={vee}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32" cy="41.2" r="4.8" fill={GOLD} />

      {showRule ? (
        <line
          x1="18.6"
          y1="49"
          x2="45.4"
          y2="49"
          stroke={GOLD}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

/** Mark plus the two-line wordmark, linking home. */
export function Logo() {
  return (
    <Link href={routes.home} className="flex items-center gap-3 no-underline">
      <LogoMark />
      <div className="leading-[1.2]">
        <b className="text-[16px] tracking-[0.01em] text-navy">VAACA</b>
        <div className="text-[10.5px] tracking-[0.02em] text-muted">
          Virtual Assets Association of Central Africa
        </div>
      </div>
    </Link>
  );
}
