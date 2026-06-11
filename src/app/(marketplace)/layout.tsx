import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface MarketplaceLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for all marketplace pages (agent grid, agent detail).
 * Includes the top navigation header and site footer.
 */
export default function MarketplaceLayout({ children }: MarketplaceLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-sen-bg">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
