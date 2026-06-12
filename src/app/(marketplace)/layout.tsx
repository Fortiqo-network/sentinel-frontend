import { PageShell } from "@/components/marketing/PageShell";

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
