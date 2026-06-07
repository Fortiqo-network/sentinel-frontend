import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

interface DeveloperLayoutProps {
  children: React.ReactNode;
}

/**
 * Developer portal layout. Mirrors the buyer dashboard layout with developer-
 * specific sidebar links.
 */
export default function DeveloperLayout({ children }: DeveloperLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar mode="developer" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
