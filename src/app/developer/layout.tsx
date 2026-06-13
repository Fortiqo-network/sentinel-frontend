import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/api/server-auth";

interface DeveloperLayoutProps {
  children: React.ReactNode;
}

/**
 * Developer portal layout. Guards against unauthenticated access and
 * redirects buyers to their dashboard. Authenticated developers see the
 * developer sidebar and header.
 */
export default async function DeveloperLayout({ children }: DeveloperLayoutProps): Promise<React.JSX.Element> {
  const user = await getServerUser();

  if (!user) redirect("/login");
  if (user.role === "buyer") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <Sidebar mode="developer" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
