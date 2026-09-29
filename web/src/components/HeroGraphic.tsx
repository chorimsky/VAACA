import { CEMAC_STATES, getCemacState } from "@/lib/cemac-geo";

const HUB = getCemacState("CMR").centroid;
const SPOKES = CEMAC_STATES.filter((s) => s.code !== "CMR");

// The map is 655×1000; scaled to 0.4 it is 262×400, centred in a 1000×510 frame.
const SCALE = 0.4;
const OFFSET_X = 369;
const OFFSET_Y = 55;

/**
 * Landing hero artwork.
 *
 * Fills the prototype's empty "Institutional photography" slot with something
 * the site can actually assert: the six CEMAC states, drawn from real outlines,
 * wired back to the Cameroon founding chapter in the same radiating-node motif
 * as the VAACA mark. It is deliberately a diagram, not a stand-in for
 * photography — swap it for real imagery whenever that exists.
 */
export function HeroGraphic({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 510"
      className={className}
      role="img"
      aria-label="The six CEMAC member states, connected to Cameroon's founding chapter"
      preserveAspectRatio="xMidYMid slice"
    >
      <title>
        The six CEMAC member states, connected to Cameroon&apos;s founding
        chapter
      </title>

      <defs>
        <linearGradient id="vaaca-hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B4944" />
          <stop offset="60%" stopColor="#0B4944" />
          <stop offset="100%" stopColor="#0C524C" />
        </linearGradient>
        <radialGradient id="vaaca-hero-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#CAA228" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#CAA228" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1000" height="510" fill="url(#vaaca-hero-bg)" />
      <ellipse
        cx="500"
        cy="255"
        rx="330"
        ry="240"
        fill="url(#vaaca-hero-glow)"
      />

      {/* Faint graticule, for depth rather than information. */}
      <g stroke="#FFFFFF" strokeOpacity="0.045" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={(i + 1) * 51}
            x2="1000"
            y2={(i + 1) * 51}
          />
        ))}
        {Array.from({ length: 19 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={(i + 1) * 50}
            y1="0"
            x2={(i + 1) * 50}
            y2="510"
          />
        ))}
      </g>

      <g transform={`translate(${OFFSET_X} ${OFFSET_Y}) scale(${SCALE})`}>
        {/* Outlines */}
        {CEMAC_STATES.map((state) => {
          const hub = state.code === "CMR";
          return (
            <path
              key={state.code}
              d={state.path}
              fill={hub ? "#CAA228" : "#FFFFFF"}
              fillOpacity={hub ? 0.9 : 0.08}
              stroke={hub ? "#E4CA79" : "#FFFFFF"}
              strokeOpacity={hub ? 0.9 : 0.22}
              strokeWidth={hub ? 8 : 5}
              strokeLinejoin="round"
            />
          );
        })}

        {/* Spokes back to the founding chapter — the mark's motif at region scale. */}
        <g stroke="#E4CA79" strokeOpacity="0.55" strokeWidth="5">
          {SPOKES.map((state) => (
            <line
              key={`spoke-${state.code}`}
              x1={HUB[0]}
              y1={HUB[1]}
              x2={state.centroid[0]}
              y2={state.centroid[1]}
            />
          ))}
        </g>

        {SPOKES.map((state) => (
          <circle
            key={`node-${state.code}`}
            cx={state.centroid[0]}
            cy={state.centroid[1]}
            r={13}
            fill="#CAA228"
          />
        ))}

        <circle cx={HUB[0]} cy={HUB[1]} r={26} fill="#FAFAF8" />
        <circle cx={HUB[0]} cy={HUB[1]} r={14} fill="#0B4944" />
      </g>
    </svg>
  );
}
