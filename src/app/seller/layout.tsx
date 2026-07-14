import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/api/server-auth";
import { isAdminRole } from "@/lib/utils/portal";

interface SellerLayoutProps {
  children: React.ReactNode;
}

/**
 * Seller portal layout. Guards against unauthenticated access and
 * redirects buyers to their dashboard. Authenticated sellers see the
 * seller sidebar and header.
 */
export default async function SellerLayout({ children }: SellerLayoutProps): Promise<React.JSX.Element> {
  const user = await getServerUser();

  if (!user) redirect("/login");
  if (user.needsOnboarding) redirect("/onboarding");
  if (user.role === "buyer") redirect("/dashboard");
  if (isAdminRole(user.role)) redirect("/admin");

  return (
    <div className="flex h-screen overflow-hidden dark:bg-ink-950">
      <Sidebar mode="seller" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 dark:bg-ink-950 dark:text-porcelain">{children}</main>
      </div>
    </div>
  );
}
