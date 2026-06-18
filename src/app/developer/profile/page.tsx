import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerUser } from "@/lib/api/server-auth";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "My Profile — Sentinel Developer",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Developer profile page. Displays account details fetched from the session.
 */
export default async function DeveloperProfilePage(): Promise<React.JSX.Element> {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-slate-600">Your account details and information.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Avatar header */}
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 flex items-center gap-4">
          <Avatar src={user.avatarUrl} name={user.displayName ?? user.email} size="lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900">{user.displayName ?? "—"}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <dl className="divide-y divide-slate-100">
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500">Display Name</dt>
            <dd className="text-sm font-semibold text-slate-900">{user.displayName ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {user.email}
              {user.emailVerified ? (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Unverified
                </span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500">Account Type</dt>
            <dd className="text-sm font-semibold capitalize text-slate-900">{user.role}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500">Account ID</dt>
            <dd className="font-mono text-xs text-slate-500 break-all">{user.id}</dd>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm font-medium text-slate-500">Member Since</dt>
            <dd className="text-sm font-semibold text-slate-900">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
