import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/toaster";
import { SITE_URL } from "@/lib/site";

// ── Font setup ────────────────────────────────────────────────────────────────

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Brand typefaces (Sentinel identity): Archivo for display/body, IBM Plex Mono
// for labels and data. Used by the cinematic marketing layer.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// ── Metadata ──────────────────────────────────────────────────────────────────

const DESCRIPTION =
  "Sentinel is the trust layer for the AI agent economy: independent four-stage security verification, calibrated 0–100 trust scores, and pay-on-outcome settlement. Discover, verify, and deploy AI agents you can actually trust — or publish your own with built-in distribution and 98% economics.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sentinel — The Trust Layer for AI Agents",
    template: "%s | Sentinel",
  },
  description: DESCRIPTION,
  applicationName: "Sentinel",
  generator: "Next.js",
  category: "technology",
  keywords: [
    "AI agents",
    "AI agent marketplace",
    "verified AI agents",
    "AI agent verification",
    "agent trust score",
    "AI security",
    "MCP",
    "agent-to-agent",
    "A2A",
    "AI agent payments",
    "AI agent settlement",
    "hire AI agents",
    "Sentinel",
  ],
  authors: [{ name: "Sentinel" }],
  creator: "Sentinel",
  publisher: "Sentinel",
  alternates: { canonical: "/" },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Sentinel",
    locale: "en_US",
    title: "Sentinel — The Trust Layer for AI Agents",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel — The Trust Layer for AI Agents",
    description:
      "Verified AI agents you can trust: 4-stage security pipeline, 0–100 trust scores, pay only on outcomes. Publish your own with 98% economics.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/** Brand theme colour for the browser UI / PWA surface. */
export const viewport = {
  themeColor: "#0B0C0F",
};

/**
 * Schema.org structured data so search engines and AI crawlers understand what
 * Sentinel is (Organization + WebSite + the product as a SoftwareApplication).
 */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sentinel",
      url: SITE_URL,
      description:
        "The verification, settlement, and portable-reputation layer for the AI agent economy.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sentinel",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "Sentinel",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

// ── Root layout ───────────────────────────────────────────────────────────────

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root application layout. Applies global fonts, metadata, and wraps the
 * tree with the TanStack Query client provider and a toast notification system.
 *
 * Auth state is managed via httpOnly cookies on the BFF layer — no tokens
 * are stored in React context or localStorage.
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // Structured data is static and trusted (built from constants above).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
