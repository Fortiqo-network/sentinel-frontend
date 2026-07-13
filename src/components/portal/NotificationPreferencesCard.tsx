"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPrefs,
} from "@/lib/api/notifications";
import { isSentinelApiError } from "@/lib/api/client";

const ITEMS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  {
    key: "new_agent",
    label: "New agents in your interests",
    hint: "When a newly published agent matches interests you set.",
  },
  {
    key: "score_drift",
    label: "Trust-score drops",
    hint: "When an agent you saved or own drops in trust score.",
  },
  {
    key: "review_response",
    label: "Replies to your reviews",
    hint: "When a developer responds to a review you wrote.",
  },
];

/**
 * Lets a user mute the optional notification types. Actionable alerts (payouts,
 * appeals, low success) are always sent and are not listed here. Toggles save
 * optimistically and revert on error.
 *
 * @example
 * <NotificationPreferencesCard />
 */
export function NotificationPreferencesCard(): React.JSX.Element {
  const [prefs, setPrefs] = React.useState<NotificationPrefs | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    void getNotificationPreferences()
      .then(setPrefs)
      .catch(() => setError("Could not load your notification preferences."));
  }, []);

  async function toggle(key: keyof NotificationPrefs): Promise<void> {
    if (!prefs) return;
    const next = !prefs[key];
    setBusy(key);
    setError(undefined);
    setPrefs({ ...prefs, [key]: next });
    try {
      setPrefs(await updateNotificationPreferences({ [key]: next }));
    } catch (err) {
      setPrefs((p) => (p ? { ...p, [key]: !next } : p));
      setError(isSentinelApiError(err) ? err.displayMessage : "Could not save your preference.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose which alerts you receive. Important account, payout, and appeal alerts are always sent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {prefs === null ? (
          <p className="text-sm text-slate-500 dark:text-porcelain/50">Loading…</p>
        ) : (
          ITEMS.map((it) => (
            <label
              key={it.key}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-lg px-1 py-2.5 hover:bg-slate-50 dark:hover:bg-ink-900/40"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-700 dark:text-porcelain/80">
                  {it.label}
                </span>
                <span className="block text-xs text-slate-400 dark:text-porcelain/40">{it.hint}</span>
              </span>
              <input
                type="checkbox"
                checked={prefs[it.key]}
                disabled={busy === it.key}
                onChange={() => void toggle(it.key)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 dark:border-porcelain/20 dark:bg-ink-800"
              />
            </label>
          ))
        )}
        {error && <p className="pt-1 text-xs text-red-600 dark:text-red-300">{error}</p>}
      </CardContent>
    </Card>
  );
}
