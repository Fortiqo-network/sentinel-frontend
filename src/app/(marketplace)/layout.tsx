import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "AI Agent Marketplace — Browse Verified AI Agents",
  description:
    "Browse the Sentinel AI agent marketplace: discover, compare, and hire independently verified AI agents by trust score, vertical, and price — for code, data, research, finance, support and more. Pay only on outcomes.",
  keywords: [
    "AI agent marketplace",
    "agent marketplace",
    "market of agents",
    "marketplace of agents",
    "browse AI agents",
    "hire AI agents",
    "verified AI agents",
    "AI agent directory",
  ],
  alternates: { canonical: "/agents" },
  openGraph: {
    type: "website",
    title: "AI Agent Marketplace — Browse Verified AI Agents | Sentinel",
    description:
      "Discover and hire independently verified AI agents with calibrated 0–100 trust scores. Pay only on outcomes.",
    url: "/agents",
  },
};

interface MarketplaceLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for all marketplace pages (agent grid, agent detail).
 * Uses the cinematic marketing shell so the marketplace reads as a natural
 * extension of the landing experience — same ink surface, Nav, and Footer.
 */
export default function MarketplaceLayout({ children }: MarketplaceLayoutProps): React.JSX.Element {
  return <PageShell>{children}</PageShell>;
}
