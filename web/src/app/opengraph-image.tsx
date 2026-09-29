import { ImageResponse } from "next/og";

export const alt =
  "VAACA — the regional institution organizing Central Africa's virtual-asset economy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social card. Rendered at build time; no external fonts so it can't fail. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#FAFAF8",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: "linear-gradient(90deg,#0B4944,#CAA228,#CAA228)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
          <path
            d="M 32 2 L 57.98 17 L 57.98 47 L 32 62 L 6.02 47 L 6.02 17 Z"
            stroke="#CAA228"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="2" r="3.2" fill="#CAA228" />
          <circle cx="57.98" cy="17" r="3.2" fill="#CAA228" />
          <circle cx="57.98" cy="47" r="3.2" fill="#CAA228" />
          <circle cx="32" cy="62" r="3.2" fill="#CAA228" />
          <circle cx="6.02" cy="47" r="3.2" fill="#CAA228" />
          <circle cx="6.02" cy="17" r="3.2" fill="#CAA228" />
          <path
            d="M 16 19.8 L 32 41.2 L 48 19.8"
            stroke="#0B4944"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="41.2" r="4.8" fill="#CAA228" />
          <line
            x1="18.6"
            y1="49"
            x2="45.4"
            y2="49"
            stroke="#CAA228"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#0B4944" }}>
            VAACA
          </div>
          <div style={{ fontSize: 19, color: "#6B7680" }}>
            Virtual Assets Association of Central Africa
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 58,
          lineHeight: 1.15,
          fontWeight: 600,
          color: "#0B4944",
          maxWidth: 940,
        }}
      >
        The regional institution organizing Central Africa&apos;s virtual-asset
        economy.
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 22,
          color: "#1F7A4D",
          fontWeight: 600,
        }}
      >
        <span>In Formation</span>
        <span style={{ color: "#E3E3DD" }}>·</span>
        <span style={{ color: "#6B7680" }}>Cameroon Founding Chapter</span>
        <span style={{ color: "#E3E3DD" }}>·</span>
        <span style={{ color: "#6B7680" }}>6 CEMAC states</span>
      </div>
    </div>,
    size,
  );
}
