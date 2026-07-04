"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  listAdminSellers,
  settleSeller,
  blockUser,
  unblockUser,
  unitsToCredits,
  type AdminSellerRow,
} from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

function credits(units: number): string {
  return `${unitsToCredits(units).toLocaleString("en-US")} Cr`;
}

/**
 * Admin sellers console — accrued (payable) vs withdrawable (available)
 * balances per seller, with a Settle action that moves payable → available so
 * the seller can withdraw it from their portal.
 */
export default function AdminSellersPage(): React.JSX.Element {
  const [rows, setRows] = React.useState<AdminSellerRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminSellers({ q: q.trim() || undefined, pageSize: 100 });
      setRows(result.sellers);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load sellers.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function toggleBlock(d: AdminSellerRow): Promise<void> {
    setBusyId(d.id);
    setNotice(null);
    try {
      const next = d.is_active ? await blockUser(d.id) : await unblockUser(d.id);
      setRows((prev) => prev.map((r) => (r.id === d.id ? { ...r, is_active: next.is_active } : r)));
    } catch (err) {
      setNotice(isSentinelApiError(err) ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSettle(id: string): Promise<void> {
    setBusyId(id);
    setNotice(null);
    try {
      const result = await settleSeller(id);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, payable_units: 0, available_units: result.available_units } : r,
        ),
      );
      setNotice(
        result.settled_units > 0
          ? `Settled ${credits(result.settled_units)} for the seller.`
          : "Nothing to settle — payable balance was already zero.",
      );
    } catch (err) {
      setNotice(isSentinelApiError(err) ? err.message : "Settlement failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Sellers"
        description={`${total} seller${total === 1 ? "" : "s"}. Settle accrued earnings into withdrawable balances.`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name…"
          className="h-9 w-64 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
        />
      </div>

      {notice && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{notice}</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Agents</th>
              <th className="px-4 py-3 text-right font-medium">Payable</th>
              <th className="px-4 py-3 text-right font-medium">Available</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No sellers match.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className={d.is_active ? "" : "bg-slate-50/60"}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{d.display_name || d.email}</div>
                    <div className="text-xs text-slate-400">{d.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{d.agents}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-600">{credits(d.payable_units)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">{credits(d.available_units)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busyId === d.id || d.payable_units <= 0}
                        onClick={() => handleSettle(d.id)}
                      >
                        {busyId === d.id ? "…" : "Settle"}
                      </Button>
                      {d.is_active ? (
                        <Button size="sm" variant="destructive" disabled={busyId === d.id} onClick={() => toggleBlock(d)}>
                          Block
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled={busyId === d.id} onClick={() => toggleBlock(d)}>
                          Unblock
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Payable is accrued from delivered calls and awaits settlement; available is withdrawable by
        the seller. Balances show as 0 if the billing service is unavailable.
      </p>
    </div>
  );
}
