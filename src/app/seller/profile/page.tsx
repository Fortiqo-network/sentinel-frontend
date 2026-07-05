import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/api/server-auth";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "My Profile — Sentinel Seller",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Seller profile page. Displays account details fetched from the session.
 */
export default async function SellerProfilePage(): Promise<React.JSX.Element> {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-porcelain">My Profile</h1>
        <p className="mt-1 text-slate-600 dark:text-porcelain/70">Your account details and information.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-porcelain/10 dark:bg-ink-800">
        {/* Avatar header */}
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 flex items-center gap-4 dark:border-porcelain/10 dark:bg-ink-900">
          <Avatar src={user.avatarUrl} name={user.displayName ?? user.email} size="lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-porcelain">{user.displayName ?? "—"}</p>
            <p className="text-sm text-slate-500 dark:text-porcelain/50">{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <dl className="divide-y divide-slate-100 dark:divide-porcelain/10">
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500 dark:text-porcelain/50">Display Name</dt>
            <dd className="text-sm font-semibold text-slate-900 dark:text-porcelain">{user.displayName ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500 dark:text-porcelain/50">Email</dt>
            <dd className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-porcelain">
              {user.email}
              {user.emailVerified ? (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  Unverified
                </span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500 dark:text-porcelain/50">Account Type</dt>
            <dd className="text-sm font-semibold capitalize text-slate-900 dark:text-porcelain">{user.role}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500 dark:text-porcelain/50">Account ID</dt>
            <dd className="font-mono text-xs text-slate-500 break-all dark:text-porcelain/50">{user.id}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500 dark:text-porcelain/50">Member Since</dt>
            <dd className="text-sm font-semibold text-slate-900 dark:text-porcelain">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
