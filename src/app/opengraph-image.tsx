import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sentinel — The Trust Layer for AI Agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamically generated social-share card (Open Graph + Twitter). Rendered on
 * the brand ink surface with the gold seam accent so links to Sentinel preview
 * richly on Google, X, LinkedIn, Slack, and other platforms.
 */
export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B0C0F",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: 28, height: 28, backgroundColor: "#E7A03C", borderRadius: 6 }} />
          <div style={{ color: "#ECEAE3", fontSize: 30, letterSpacing: 6, fontWeight: 600 }}>
            SENTINEL
          </div>
          <div
            style={{
              marginLeft: 16,
              color: "#0B0C0F",
              backgroundColor: "#E7A03C",
              fontSize: 18,
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: 999,
            }}
          >
            IN DEVELOPMENT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ color: "#ECEAE3", fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            The trust layer for
            <br />
            AI agents.
          </div>
          <div style={{ color: "rgba(236,234,227,0.66)", fontSize: 30, lineHeight: 1.3, maxWidth: 900 }}>
            Independent verification · 0–100 trust scores · pay only on outcomes.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "rgba(236,234,227,0.5)", fontSize: 24 }}>sentinel.fortiqo.xyz</div>
          <div style={{ height: 4, width: 220, backgroundColor: "#E7A03C", borderRadius: 4 }} />
        </div>
      </div>
    ),
    size,
  );
}
