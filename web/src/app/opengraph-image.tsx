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
          background: "linear-gradient(90deg,#0E2A44,#1AA6B3,#B5730C)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
          <circle
            cx="20"
            cy="20"
            r="18.5"
            stroke="#B5730C"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="20"
            y1="20"
            x2="8"
            y2="8"
            stroke="#1AA6B3"
            strokeWidth="1.6"
          />
          <line
            x1="20"
            y1="20"
            x2="32"
            y2="8"
            stroke="#1AA6B3"
            strokeWidth="1.6"
          />
          <line
            x1="20"
            y1="20"
            x2="8"
            y2="32"
            stroke="#1AA6B3"
            strokeWidth="1.6"
          />
          <line
            x1="20"
            y1="20"
            x2="32"
            y2="32"
            stroke="#1AA6B3"
            strokeWidth="1.6"
          />
          <circle cx="20" cy="20" r="5.5" fill="#0E2A44" />
          <circle cx="8" cy="8" r="3" fill="#B5730C" />
          <circle cx="32" cy="8" r="3" fill="#1AA6B3" />
          <circle cx="8" cy="32" r="3" fill="#1AA6B3" />
          <circle cx="32" cy="32" r="3" fill="#B5730C" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#0E2A44" }}>
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
          color: "#0E2A44",
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
