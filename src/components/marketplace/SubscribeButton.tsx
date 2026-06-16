"use client";

import * as React from "react";
import { listSubscriptions, subscribe, unsubscribe } from "@/lib/api/subscriptions";
import { isSentinelApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { StarIcon } from "@/components/ui/star";

interface SubscribeButtonProps {
  agentId: string;
  /** Compact icon-only toggle for marketplace cards (skips the initial fetch). */
  compact?: boolean;
  /** Dark cinematic surface styling. */
  dark?: boolean;
  className?: string;
}

/**
 * Star / save toggle for an agent. Adds or removes the agent from the buyer's
 * "My Agents" portal list. The full variant (agent detail) reflects current
 * membership on mount; the `compact` variant (cards) is an optimistic icon
 * toggle that avoids a subscription fetch per card. Prompts sign-in when the
 * visitor isn't authenticated.
 *
 * @example
 * <SubscribeButton agentId={agent.id} />
 * <SubscribeButton agentId={agent.id} compact dark />
 */
export function SubscribeButton({ agentId, compact = false, dark = false, className }: SubscribeButtonProps): React.JSX.Element {
  const [saved, setSaved] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [needsAuth, setNeedsAuth] = React.useState(false);

  React.useEffect(() => {
    if (compact) return;
    let cancelled = false;
    void (async () => {
      const subs = await listSubscriptions();
      if (!cancelled) setSaved(subs.some((a) => a.id === agentId));
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId, compact]);

  async function toggle(e?: React.MouseEvent): Promise<void> {
    e?.preventDefault();
    e?.stopPropagation();
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

  if (compact) {
    if (needsAuth) {
      return (
        <a
          href="/login"
          title="Sign in to save"
          aria-label="Sign in to save"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors text-slate-400 hover:text-amber-400",
            dark ? "border-porcelain/15 bg-ink-700" : "border-slate-200 bg-white",
            className,
          )}
        >
          <StarIcon filled={false} />
        </a>
      );
    }
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        title={saved ? "Starred — click to remove" : "Star to save"}
        aria-label={saved ? "Remove from My Agents" : "Save to My Agents"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-60",
          saved
            ? "border-amber-300 bg-amber-50 text-amber-400"
            : dark
              ? "border-porcelain/15 bg-ink-700 text-porcelain/50 hover:text-amber-400"
              : "border-slate-200 bg-white text-slate-400 hover:text-amber-400",
          className,
        )}
      >
        <StarIcon filled={saved} />
      </button>
    );
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
          ? "border-amber-300/50 bg-amber-400/10 text-amber-400 hover:bg-amber-400/15"
          : "border-porcelain/15 bg-ink-700 text-porcelain/70 hover:bg-ink-600 hover:text-porcelain",
      )}
    >
      <StarIcon filled={saved} className="h-4 w-4" />
      {busy ? "Saving…" : saved ? "Starred" : "Star to save"}
    </button>
  );
}
