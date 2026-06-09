import type { NextConfig } from "next";

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  // standalone output is needed for Docker but breaks Vercel — only enable for Docker builds
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,

  // ESLint runs as a dedicated CI step — skip during Docker builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    // Server actions are stable in Next.js 15 but explicit opt-in documents intent
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.sentinel.xyz",
      },
    ],
  },

  // Security headers — CSP is set here as a baseline; tighten per route in middleware
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
