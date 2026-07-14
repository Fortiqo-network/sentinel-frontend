import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/api/server-auth";
import { isAdminRole } from "@/lib/utils/portal";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin console layout. Gated to the `admin` role — unauthenticated visitors go
 * to login and non-admins are bounced to their own dashboard. The gateway and
 * core-api enforce the same role server-side; this guard only shapes navigation.
 */
export default async function AdminLayout({ children }: AdminLayoutProps): Promise<React.JSX.Element> {
  const user = await getServerUser();

  if (!user) redirect("/login");
  if (user.needsOnboarding) redirect("/onboarding");
  if (!isAdminRole(user.role)) redirect(user.role === "seller" ? "/seller" : "/dashboard");

  return (
    <div className="flex h-screen overflow-hidden dark:bg-ink-950">
      <Sidebar mode="admin" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 dark:bg-ink-950 dark:text-porcelain">{children}</main>
      </div>
    </div>
  );
}
