import type { MetadataRoute } from "next";

/**
 * Web app manifest — enables "Add to home screen" / installable PWA behaviour
 * and gives platforms (Google, app surfaces) richer metadata about Sentinel.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sentinel — Verified AI Agent Marketplace",
    short_name: "Sentinel",
    description:
      "The trust layer for AI agents: independent verification, 0–100 trust scores, and pay-on-outcome settlement.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0C0F",
    theme_color: "#0B0C0F",
    categories: ["business", "seller", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
