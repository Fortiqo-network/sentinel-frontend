"use client";

import * as React from "react";
import { listSubscriptions, subscribe, unsubscribe } from "@/lib/api/subscriptions";
import { isSentinelApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

/**
 * Star / save toggle for an agent. Adds or removes the agent from the buyer's
 * "My Agents" portal list. Reflects current membership on mount; prompts
 * sign-in when the visitor isn't authenticated.
 *
 * @example
 * <SubscribeButton agentId={agent.id} />
 */
export function SubscribeButton({ agentId }: { agentId: string }): React.JSX.Element {
  const [saved, setSaved] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [needsAuth, setNeedsAuth] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const subs = await listSubscriptions();
      if (!cancelled) setSaved(subs.some((a) => a.id === agentId));
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  async function toggle(): Promise<void> {
    setBusy(true);
    setNeedsAuth(false);
    try {
      if (saved) {
        await unsubscribe(agentId);
        setSaved(false);
      } else {
        await subscribe(agentId);
        setSaved(true);
      }
    } catch (err) {
      if (isSentinelApiError(err) && (err.statusCode === 401 || err.statusCode === 403)) {
        setNeedsAuth(true);
      }
    } finally {
      setBusy(false);
    }
  }

  if (needsAuth) {
    return (
      <a
        href="/login"
        className="mt-2 block w-full rounded-xl border border-porcelain/15 bg-ink-700 py-2.5 text-center text-sm font-medium text-porcelain/70 transition-colors hover:bg-ink-600 hover:text-porcelain"
      >
        Sign in to save
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={cn(
        "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-center text-sm font-medium transition-colors disabled:opacity-60",
        saved
          ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold/15"
          : "border-porcelain/15 bg-ink-700 text-porcelain/70 hover:bg-ink-600 hover:text-porcelain",
      )}
    >
      <span aria-hidden="true">{saved ? "★" : "☆"}</span>
      {busy ? "Saving…" : saved ? "Saved to My Agents" : "Save to My Agents"}
    </button>
  );
}
