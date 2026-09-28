"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, where the
 * normal error page can't render. It must supply its own <html>/<body>, so it
 * stays dependency-free and inline-styled.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF8",
          color: "#33393E",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "32px",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              height: 3,
              marginBottom: 28,
              background: "linear-gradient(90deg,#0E2A44,#1AA6B3,#B5730C)",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 600,
              color: "#0E2A44",
            }}
          >
            VAACA is temporarily unavailable.
          </h1>
          <p style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.65 }}>
            An unexpected error stopped the site from loading. Please try again.
          </p>
          {error.digest && (
            <p style={{ marginTop: 10, fontSize: 12, color: "#6B7680" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              cursor: "pointer",
              border: "none",
              borderRadius: 8,
              background: "#0E2A44",
              color: "#fff",
              padding: "13px 26px",
              fontSize: 14.5,
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
