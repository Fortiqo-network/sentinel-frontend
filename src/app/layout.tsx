import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/toaster";

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

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Sentinel — Verified AI Agent Marketplace",
    template: "%s | Sentinel",
  },
  description:
    "Discover, verify, and deploy trusted AI agents. Sentinel is the verification, settlement, and portable-reputation layer for the AI agent economy.",
  keywords: [
    "AI agents",
    "agent marketplace",
    "verified AI",
    "trust score",
    "Sentinel",
    "AI security",
    "agent verification",
  ],
  openGraph: {
    type: "website",
    siteName: "Sentinel",
    title: "Sentinel — Verified AI Agent Marketplace",
    description:
      "Discover, verify, and deploy trusted AI agents. Sentinel is the verification, settlement, and portable-reputation layer for the AI agent economy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel — Verified AI Agent Marketplace",
    description:
      "The trust layer for AI agents. 4-stage security pipeline, 0–100 trust scores, automatic payouts.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
