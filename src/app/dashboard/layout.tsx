import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/api/server-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Buyer dashboard layout. Guards against unauthenticated access and
 * redirects developers to their portal. Authenticated buyers see the
 * buyer sidebar and header.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps): Promise<React.JSX.Element> {
  const user = await getServerUser();

  if (!user) redirect("/login");
  if (user.role === "developer") redirect("/developer");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mode="buyer" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
