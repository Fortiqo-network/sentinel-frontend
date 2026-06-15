"use client";

import * as React from "react";
import Link from "next/link";
import { runAgent } from "@/lib/api/agents";
import { isSentinelApiError } from "@/lib/api/client";

interface UseAgentButtonProps {
  developer: string;
  slug: string;
  priceLabel: string;
}

type Feedback =
  | { kind: "ok"; text: string }
  | { kind: "insufficient" }
  | { kind: "login" }
  | { kind: "error"; text: string };

/** Render an agent's arbitrary JSON output as readable text. */
function formatOutput(output: unknown): string {
  if (output && typeof output === "object" && !Array.isArray(output)) {
    const rec = output as Record<string, unknown>;
    if (typeof rec.result === "string") return rec.result;
    if (typeof rec.output === "string") return rec.output;
  }
  if (typeof output === "string") return output;
  try {
    return JSON.stringify(output);
  } catch {
    return String(output);
  }
}

/**
 * Runs an agent and charges the signed-in buyer's wallet for one successful
 * call, surfacing the result, cost, and remaining balance.
 *
 * @example
 * <UseAgentButton developer="acme" slug="codereview-pro" priceLabel="5 Cr / call" />
 */
export function UseAgentButton({
  developer,
  slug,
  priceLabel,
}: UseAgentButtonProps): React.JSX.Element {
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);

  async function run(): Promise<void> {
    setBusy(true);
    setFeedback(null);
    try {
      const r = await runAgent(developer, slug);
      const charge =
        r.costCredits > 0
          ? ` · charged ${r.costCredits} Cr, balance ${r.balanceCredits ?? "—"} Cr`
          : " · free call";
      setFeedback({ kind: "ok", text: `${formatOutput(r.output)}${charge}` });
    } catch (err) {
      if (isSentinelApiError(err) && err.statusCode === 402)
        setFeedback({ kind: "insufficient" });
      else if (isSentinelApiError(err) && err.statusCode === 401)
        setFeedback({ kind: "login" });
      else
        setFeedback({ kind: "error", text: "Could not run the agent. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="w-full rounded-xl bg-gold py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/85 disabled:opacity-50"
      >
        {busy ? "Running…" : `Use Agent · ${priceLabel}`}
      </button>

      {feedback?.kind === "ok" && (
        <p className="rounded-lg border border-emerald-700/30 bg-emerald-900/25 px-3 py-2 text-xs text-emerald-400">
          {feedback.text}
        </p>
      )}
      {feedback?.kind === "insufficient" && (
        <p className="rounded-lg border border-amber-700/30 bg-amber-900/25 px-3 py-2 text-xs text-amber-400">
          Not enough credits.{" "}
          <Link href="/dashboard/billing" className="font-medium underline">
            Top up
          </Link>{" "}
          to continue.
        </p>
      )}
      {feedback?.kind === "login" && (
        <p className="rounded-lg border border-porcelain/10 bg-ink-700 px-3 py-2 text-xs text-porcelain/60">
          Please{" "}
          <Link href="/login" className="font-medium text-gold underline">
            log in
          </Link>{" "}
          to use this agent.
        </p>
      )}
      {feedback?.kind === "error" && (
        <p className="rounded-lg border border-red-700/40 bg-red-900/25 px-3 py-2 text-xs text-red-400">
          {feedback.text}
        </p>
      )}
    </div>
  );
}
