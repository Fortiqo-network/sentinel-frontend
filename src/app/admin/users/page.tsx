"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAdminUsers, blockUser, unblockUser, type AdminUserRow } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

const ROLE_FILTERS = ["", "buyer", "seller", "admin"];

function roleVariant(role: string): "success" | "info" | "warning" | "default" {
  if (role === "admin") return "warning";
  if (role === "seller") return "info";
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
  const [busyId, setBusyId] = React.useState<string | null>(null);

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

  async function toggleBlock(u: AdminUserRow): Promise<void> {
    setBusyId(u.id);
    try {
      const next = u.is_active ? await blockUser(u.id) : await unblockUser(u.id);
      setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, is_active: next.is_active } : r)));
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Users" description={`${total} user${total === 1 ? "" : "s"} on the platform.`} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name…"
          className="h-9 w-64 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain dark:placeholder:text-porcelain/30 dark:focus:border-gold"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-9 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain dark:focus:border-gold"
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r === "" ? "All roles" : r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-porcelain/10 dark:bg-ink-900 dark:text-porcelain/50">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-porcelain/10">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-porcelain/40">
                  No users match.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className={u.is_active ? "" : "bg-slate-50/60 dark:bg-ink-900/40"}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-porcelain">{u.display_name || u.email}</div>
                    <div className="text-xs text-slate-400 dark:text-porcelain/40">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-slate-400 dark:text-porcelain/40">—</span>
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
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 dark:text-porcelain/40">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.roles.includes("admin") ? (
                      <span className="text-xs text-slate-300 dark:text-porcelain/30">—</span>
                    ) : u.is_active ? (
                      <Button size="sm" variant="destructive" disabled={busyId === u.id} onClick={() => toggleBlock(u)}>
                        {busyId === u.id ? "…" : "Block"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" disabled={busyId === u.id} onClick={() => toggleBlock(u)}>
                        {busyId === u.id ? "…" : "Unblock"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 dark:text-porcelain/40">
        Blocking suspends the account (the user can no longer log in) — it is reversible and the
        record is kept. Admin accounts cannot be blocked here. Agent-level moderation is under Agents.
      </p>
    </div>
  );
}
