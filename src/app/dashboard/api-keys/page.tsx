"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listKeys, createKey, revokeKey, type ApiKey } from "@/lib/api/keys";
import { getCurrentUser } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ApiKeysPage(): React.JSX.Element {
  const [accountId, setAccountId] = React.useState<string | null>(null);
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newName, setNewName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [createdSecret, setCreatedSecret] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setKeys(await listKeys());
    } catch {
      setError("Could not load your API keys.");
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void Promise.allSettled([getCurrentUser(), listKeys()]).then(([user, ks]) => {
      if (!active) return;
      if (user.status === "fulfilled" && user.value) setAccountId(user.value.id);
      if (ks.status === "fulfilled") setKeys(ks.value);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(): Promise<void> {
    if (newName.trim().length === 0) return;
    setCreating(true);
    setError(null);
    setCreatedSecret(null);
    try {
      const created = await createKey(newName.trim());
      setCreatedSecret(created.key);
      setNewName("");
      await refresh();
    } catch (err) {
      setError(isSentinelApiError(err) ? err.displayMessage : "Could not create the key.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string): Promise<void> {
    setError(null);
    try {
      await revokeKey(id);
      await refresh();
    } catch {
      setError("Could not revoke the key.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
        <p className="mt-1 text-slate-600">Create keys to call Sentinel agents from your own apps.</p>
      </div>

      {accountId && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Account ID (sentinel_account_id)</p>
          <p className="mt-0.5 font-mono text-sm text-slate-800">{accountId}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create a Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Key name (e.g. Production server)"
              maxLength={128}
              className="h-9 flex-1 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <Button
              className="bg-indigo-600 hover:bg-indigo-500"
              disabled={creating || newName.trim().length === 0}
              onClick={() => void handleCreate()}
            >
              {creating ? "Creating…" : "+ Create Key"}
            </Button>
          </div>

          {createdSecret && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">
                Copy your key now — it will not be shown again.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded bg-white px-2 py-1 font-mono text-xs text-slate-800">
                  {createdSecret}
                </code>
                <Button
                  className="shrink-0 bg-slate-800 hover:bg-slate-700"
                  onClick={() => void navigator.clipboard?.writeText(createdSecret)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-slate-500">No API keys yet. Create one above to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">Key</th>
                    <th className="py-2 pr-4 font-semibold">Created</th>
                    <th className="py-2 pr-4 font-semibold">Last Used</th>
                    <th className="py-2 pr-4 font-semibold">Status</th>
                    <th className="py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{k.name}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-slate-500">{k.prefix}…</td>
                      <td className="py-3 pr-4 text-slate-600">{formatDate(k.createdAt)}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatDate(k.lastUsedAt)}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            k.isActive
                              ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                              : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                          }
                        >
                          {k.isActive ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {k.isActive && (
                          <button
                            type="button"
                            onClick={() => void handleRevoke(k.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-500"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
