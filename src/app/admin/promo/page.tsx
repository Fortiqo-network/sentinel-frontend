"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  getPromoCodes,
  createPromoCode,
  setPromoActive,
  deletePromoCode,
  type PromoCode,
} from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

/**
 * Admin promo (referral) code manager. Create codes that grant wallet credits,
 * disable or delete them. Free credits are promo-only — there is no automatic
 * signup grant — so this is the single lever for buyer-acquisition credits.
 */
export default function AdminPromoPage(): React.JSX.Element {
  const [codes, setCodes] = React.useState<PromoCode[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [code, setCode] = React.useState("");
  const [usd, setUsd] = React.useState("10");
  const [maxRedemptions, setMaxRedemptions] = React.useState("");
  const [note, setNote] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      setCodes(await getPromoCodes());
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Could not load promo codes.");
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createPromoCode({
        code: code.trim(),
        usd: Number(usd),
        max_redemptions: maxRedemptions.trim() ? Number(maxRedemptions) : null,
        note: note.trim() || null,
      });
      setCode("");
      setUsd("10");
      setMaxRedemptions("");
      setNote("");
      await load();
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Could not create the code.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: PromoCode): Promise<void> {
    try {
      await setPromoActive(c.code, !c.active);
      await load();
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Could not update the code.");
    }
  }

  async function remove(c: PromoCode): Promise<void> {
    if (!window.confirm(`Delete promo code ${c.code}? Past redemptions are kept.`)) return;
    try {
      await deletePromoCode(c.code);
      await load();
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Could not delete the code.");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Promo / referral codes"
        description="Grant wallet credits with a code. Free credits are promo-only — this is the acquisition lever."
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => void handleCreate(e)}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-5 dark:border-porcelain/10 dark:bg-ink-800"
      >
        <label className="space-y-1 sm:col-span-1">
          <span className="text-xs text-slate-500 dark:text-porcelain/50">Code</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="WELCOME10" className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-slate-500 dark:text-porcelain/50">USD grant</span>
          <input type="number" min={1} value={usd} onChange={(e) => setUsd(e.target.value)} required className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-slate-500 dark:text-porcelain/50">Max uses</span>
          <input type="number" min={1} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} placeholder="∞" className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-slate-500 dark:text-porcelain/50">Note</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="optional" className={inputCls} />
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Creating…" : "Create code"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-porcelain/40">
            <tr className="border-b border-slate-100 dark:border-porcelain/10">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Grant</th>
              <th className="px-4 py-3">Redeemed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-porcelain/5">
            {codes === null ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Loading…</td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-porcelain/40">
                  No promo codes yet — create one above.
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c.code} className="text-slate-700 dark:text-porcelain/80">
                  <td className="px-4 py-3 font-brand-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3">${c.usd} · {c.credits.toLocaleString()} Cr</td>
                  <td className="px-4 py-3">
                    {c.times_redeemed}
                    {c.max_redemptions != null ? ` / ${c.max_redemptions}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-medium " +
                        (c.active
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-porcelain/50")
                      }
                    >
                      {c.active ? "active" : "disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 dark:text-porcelain/40">{c.note ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void toggle(c)}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-porcelain/15 dark:text-porcelain/70 dark:hover:bg-ink-700"
                      >
                        {c.active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(c)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
