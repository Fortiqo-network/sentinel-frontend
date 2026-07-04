"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { listAccessBlocks, blockUser, unblockUser, type AccessBlock } from "@/lib/api/seller";
import { isSentinelApiError } from "@/lib/api/client";

/**
 * Per-agent access control. Lets the agent owner block a specific user (by
 * email) from invoking this agent when they're misusing it, and lift the block
 * later. The gateway enforces the block on pay-and-use.
 *
 * @example
 * <AccessControlCard agentId={agent.id} />
 */
export function AccessControlCard({ agentId }: { agentId: string }): React.JSX.Element {
  const [blocks, setBlocks] = React.useState<AccessBlock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await listAccessBlocks(agentId);
        if (!cancelled) setBlocks(result);
      } catch {
        // Non-owners / transient errors leave an empty list.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  async function handleBlock(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await blockUser(agentId, email.trim(), reason.trim() || undefined);
      setBlocks((prev) => [created, ...prev.filter((b) => b.userId !== created.userId)]);
      setEmail("");
      setReason("");
    } catch (err) {
      setError(
        isSentinelApiError(err) && err.statusCode === 404
          ? "No user found with that email."
          : "Could not block that user.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnblock(userId: string): Promise<void> {
    await unblockUser(agentId, userId);
    setBlocks((prev) => prev.filter((b) => b.userId !== userId));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access control</CardTitle>
        <CardDescription>
          Block a specific user from calling this agent if they&apos;re misusing it. Blocked users get a 403
          and are never charged.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleBlock} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@email.com"
              className="sentinel-focus block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              className="sentinel-focus block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="destructive" size="sm" disabled={submitting || !email.trim()}>
              {submitting ? "Blocking…" : "Block user"}
            </Button>
            {error && <span className="text-sm text-rose-600">{error}</span>}
          </div>
        </form>

        <div className="border-t border-slate-100 pt-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading blocked users…</p>
          ) : blocks.length === 0 ? (
            <EmptyState title="No blocked users" description="Everyone can use this agent right now." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {blocks.map((b) => (
                <li key={b.userId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={b.displayName || b.email} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{b.displayName || b.email}</p>
                      <p className="truncate text-xs text-slate-400">
                        {b.email}
                        {b.reason ? ` · ${b.reason}` : ""}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleUnblock(b.userId)}>
                    Unblock
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
