import type { NextConfig } from "next";

/**
 * Baseline Content-Security-Policy, shipped in Report-Only mode (M1).
 *
 * It permits first-party resources, the Sentinel API origin, and the payment
 * providers' checkout scripts/frames. `'unsafe-inline'` is currently required by
 * Next.js' inline bootstrap/styles; the hardening follow-up is nonce-based
 * script-src. Enforce (rename the header to `Content-Security-Policy`) only after
 * violation reports confirm nothing legitimate is blocked.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://sentinel-api.fortiqo.xyz https://api.razorpay.com https://api.stripe.com",
  "frame-src https://checkout.razorpay.com https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  // standalone output is needed for Docker but breaks Vercel — only enable for Docker builds
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,

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

  // Documentation lives on the standalone docs site (docs.fortiqo.xyz).
  async redirects() {
    return [{ source: "/docs", destination: "https://docs.fortiqo.xyz", permanent: false }];
  },

  // Security headers. HSTS is enforced (L2). CSP ships Report-Only (M1): an
  // enforcing policy is deferred until violation reports confirm the allowlist
  // (notably the payment providers' checkout scripts) so it cannot break payments.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: CSP_REPORT_ONLY,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
