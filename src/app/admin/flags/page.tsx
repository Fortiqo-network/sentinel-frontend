"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { getFeatureFlags, setFeatureFlag, type FeatureFlag } from "@/lib/api/admin";
import { isSentinelApiError } from "@/lib/api/client";

/**
 * Admin feature-flag / runtime-config console. Bool flags toggle instantly;
 * int/string flags edit inline and save. Backed by /v1/admin/flags.
 */
export default function AdminFlagsPage(): React.JSX.Element {
  const [flags, setFlags] = React.useState<FeatureFlag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setFlags(await getFeatureFlags());
      setError(null);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Unable to load flags.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save(key: string, value: unknown): Promise<void> {
    setBusyKey(key);
    setNote(null);
    try {
      const updated = await setFeatureFlag(key, value);
      setFlags((prev) => prev.map((f) => (f.key === key ? updated : f)));
      setNote(`Updated "${updated.label}".`);
    } catch (err) {
      setError(isSentinelApiError(err) ? err.message : "Could not update flag.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Feature flags" description="Toggle platform behaviour at runtime." />

      {note && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">{note}</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400 dark:text-porcelain/40">Loading…</div>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <div key={f.key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-porcelain/10 dark:bg-ink-800">
              <div className="min-w-0">
                <div className="font-medium text-slate-900 dark:text-porcelain">{f.label}</div>
                <div className="mt-0.5 text-sm text-slate-500 dark:text-porcelain/50">{f.description}</div>
                <div className="mt-1 font-mono text-xs text-slate-400 dark:text-porcelain/40">{f.key}</div>
              </div>
              <div className="shrink-0">
                {f.type === "bool" ? (
                  <Button
                    size="sm"
                    variant={f.value ? "secondary" : "outline"}
                    disabled={busyKey === f.key}
                    onClick={() => save(f.key, !f.value)}
                  >
                    {f.value ? "On" : "Off"}
                  </Button>
                ) : (
                  <InlineValue
                    initial={
                      typeof f.value === "string"
                        ? f.value
                        : f.value == null
                          ? ""
                          : JSON.stringify(f.value)
                    }
                    busy={busyKey === f.key}
                    onSave={(v) => save(f.key, v)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineValue({
  initial,
  busy,
  onSave,
}: {
  initial: string;
  busy: boolean;
  onSave: (v: string) => void;
}): React.JSX.Element {
  const [value, setValue] = React.useState(initial);
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-28 rounded-md border border-slate-200 px-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain dark:placeholder:text-porcelain/30 dark:focus:border-gold"
      />
      <Button size="sm" variant="outline" disabled={busy || value === initial} onClick={() => onSave(value)}>
        Save
      </Button>
    </div>
  );
}
