import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";

// ── Font setup ────────────────────────────────────────────────────────────────

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
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
 * Root application layout. Applies Space Grotesk (UI) and JetBrains Mono (data)
 * fonts, wraps the tree with TanStack Query and toast providers.
 *
 * Auth is managed via httpOnly cookies on the BFF — no tokens in React state.
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* Runs before paint to restore persisted theme without flash */}
      <head>
        {/* Static literal — not user/agent content, safe without sanitization */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(localStorage.getItem('sen-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
