"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { listAdminUsers, type AdminUserRow } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

const ROLE_FILTERS = ["", "buyer", "developer", "admin"];

function roleVariant(role: string): "success" | "info" | "warning" | "default" {
  if (role === "admin") return "warning";
  if (role === "developer") return "info";
  if (role === "buyer") return "success";
  return "default";
}

/**
 * Admin users console — browse and search every platform user with their roles
 * and account state. Block/suspend is surfaced as a disabled control until the
 * user-moderation endpoints land on the backend.
 */
export default function AdminUsersPage(): React.JSX.Element {
  const [rows, setRows] = React.useState<AdminUserRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminUsers({ q: q.trim() || undefined, role: role || undefined, pageSize: 100 });
      setRows(result.users);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [q, role]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Users" description={`${total} user${total === 1 ? "" : "s"} on the platform.`} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name…"
          className="h-9 w-64 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-9 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r === "" ? "All roles" : r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No users match.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className={u.is_active ? "" : "bg-slate-50/60"}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{u.display_name || u.email}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        u.roles.map((r) => (
                          <Badge key={r} variant={roleVariant(r)}>
                            {r}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="text-xs font-medium text-emerald-600">Active</span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled
                      title="User moderation is coming soon"
                      className="inline-flex h-8 cursor-not-allowed items-center rounded-md bg-slate-100 px-3 text-xs font-medium text-slate-400"
                    >
                      Block
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Blocking and suspending users is coming soon — the user-moderation endpoints are still being
        built. Agent-level moderation is available under Agents.
      </p>
    </div>
  );
}
