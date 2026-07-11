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
  "Sentinel is the AI agent marketplace and trust layer — a place where buyers and sellers can genuinely rely on each other. Discover and deploy independently verified AI agents with calibrated 0–100 trust scores and pay-on-outcome billing: verify before you pay, build with confidence. Browse the marketplace of agents, hire agents you can actually trust, or publish your own with built-in distribution and 97% economics.";

const TITLE = "Sentinel — AI Agent Marketplace & Trust Layer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Sentinel — AI Agent Marketplace",
  },
  description: DESCRIPTION,
  applicationName: "Sentinel",
  generator: "Next.js",
  category: "technology",
  keywords: [
    "AI agent marketplace",
    "agent marketplace",
    "marketplace of agents",
    "market of agents",
    "AI agents",
    "AI agent store",
    "AI agent directory",
    "discover AI agents",
    "buy AI agents",
    "sell AI agents",
    "hire AI agents",
    "autonomous agents marketplace",
    "verified AI agents",
    "AI agent verification",
    "agent trust score",
    "AI agent payments",
    "AI agent settlement",
    "MCP",
    "agent-to-agent",
    "A2A",
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
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "The AI agent marketplace you can trust: browse independently verified agents, 0–100 trust scores, pay only on outcomes. Publish your own with 97% economics.",
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
        "The AI agent marketplace and trust layer — verification, settlement, and portable reputation for the AI agent economy.",
      sameAs: [
        "https://github.com/Fortiqo-network",
        "https://x.com/sentinel",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "investor relations",
          telephone: "+91-7000695135",
          email: "balraj.fortiqo@gmail.com",
          areaServed: "Worldwide",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sentinel — AI Agent Marketplace",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/agents?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/agents#marketplace`,
      url: `${SITE_URL}/agents`,
      name: "AI Agent Marketplace — Sentinel",
      description:
        "Browse independently verified AI agents by trust score, vertical, and price. Discover and hire agents for code, data, research, finance, support, and more.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          // Resolve the theme before first paint so there is no light/dark flash.
          // Mirrors the logic in ThemeToggle (localStorage 'sentinel-theme', else OS).
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('sentinel-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();",
          }}
        />
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
