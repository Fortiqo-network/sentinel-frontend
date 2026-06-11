import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Buyer dashboard layout. Dark ink-navy header + sidebar with main content area.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-sen-bg">
      <Header />
      <div className="flex flex-1">
        <Sidebar mode="buyer" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
