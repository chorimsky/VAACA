import { CEMAC_STATES, CEMAC_VIEWBOX, type CemacCode } from "@/lib/cemac-geo";

type Props = {
  /** Which state reads as "active". Cameroon is the founding chapter. */
  highlight?: CemacCode;
  /** Light map for pale surfaces, dark for the navy sections. */
  theme?: "light" | "dark";
  showLabels?: boolean;
  className?: string;
  /** Accessible description; the map is decorative-with-meaning, not a control. */
  title?: string;
};

const PALETTE = {
  light: {
    fill: "#E8EAE4",
    stroke: "#FAFAF8",
    activeFill: "#1AA6B3",
    activeStroke: "#0E2A44",
    label: "#6B7680",
    activeLabel: "#0E2A44",
    leader: "#A8B0B6",
  },
  dark: {
    fill: "#17405F",
    stroke: "#0E2A44",
    activeFill: "#1AA6B3",
    activeStroke: "#5FE0E0",
    label: "#8CA0AE",
    activeLabel: "#FFFFFF",
    leader: "#3C5E7A",
  },
} as const;

/**
 * The six CEMAC member states, drawn from real Natural Earth outlines.
 *
 * Replaces the prototype's empty "CEMAC regional map" slot: the map is data the
 * site already owns, so it can be drawn rather than photographed.
 */
export function CemacMap({
  highlight = "CMR",
  theme = "light",
  showLabels = true,
  className = "",
  title = "Map of the six CEMAC member states",
}: Props) {
  const c = PALETTE[theme];

  return (
    <svg
      viewBox={CEMAC_VIEWBOX}
      className={className}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{title}</title>

      {CEMAC_STATES.map((state) => {
        const on = state.code === highlight;
        return (
          <path
            key={state.code}
            d={state.path}
            fill={on ? c.activeFill : c.fill}
            stroke={on ? c.activeStroke : c.stroke}
            strokeWidth={on ? 5 : 3}
            strokeLinejoin="round"
          />
        );
      })}

      {showLabels &&
        CEMAC_STATES.map((state) => {
          const on = state.code === highlight;
          const [cx, cy] = state.centroid;
          const [dx, dy] = state.labelOffset ?? [0, 0];
          const lx = cx + dx;
          const ly = cy + dy;

          return (
            <g key={`${state.code}-label`}>
              {state.labelOffset && (
                <>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={lx + 46}
                    y2={ly - 10}
                    stroke={c.leader}
                    strokeWidth={3}
                  />
                  <circle cx={cx} cy={cy} r={7} fill={c.leader} />
                </>
              )}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fontSize={34}
                fontWeight={on ? 700 : 600}
                fill={on ? c.activeLabel : c.label}
                style={{ fontFamily: "inherit" }}
              >
                {state.short}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
