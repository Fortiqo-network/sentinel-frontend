"use client";

import * as React from "react";
import Link from "next/link";
import { runAgent } from "@/lib/api/agents";
import { isSentinelApiError } from "@/lib/api/client";

interface UseAgentButtonProps {
  slug: string;
  priceLabel: string;
}

type Feedback =
  | { kind: "ok"; text: string }
  | { kind: "insufficient" }
  | { kind: "login" }
  | { kind: "error"; text: string };

/**
 * Runs an agent and charges the signed-in buyer's wallet for one successful
 * call, surfacing the result, the cost, and the remaining balance.
 *
 * @example
 * <UseAgentButton slug="codereview-pro" priceLabel="₹5.00 / call" />
 */
export function UseAgentButton({ slug, priceLabel }: UseAgentButtonProps): React.JSX.Element {
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);

  async function run(): Promise<void> {
    setBusy(true);
    setFeedback(null);
    try {
      const r = await runAgent(slug);
      setFeedback({
        kind: "ok",
        text: `${r.output.result} Charged ₹${(r.costPaise / 100).toFixed(2)}; balance ₹${(r.balancePaise / 100).toFixed(2)}.`,
      });
    } catch (err) {
      if (isSentinelApiError(err) && err.statusCode === 402) setFeedback({ kind: "insufficient" });
      else if (isSentinelApiError(err) && err.statusCode === 401) setFeedback({ kind: "login" });
      else setFeedback({ kind: "error", text: "Could not run the agent. Please try again." });
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
        className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {busy ? "Running…" : `Use Agent · ${priceLabel}`}
      </button>

      {feedback?.kind === "ok" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{feedback.text}</p>
      )}
      {feedback?.kind === "insufficient" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Not enough credits.{" "}
          <Link href="/dashboard/billing" className="font-medium underline">Top up</Link> to continue.
        </p>
      )}
      {feedback?.kind === "login" && (
        <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Please <Link href="/login" className="font-medium underline">log in</Link> to use this agent.
        </p>
      )}
      {feedback?.kind === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{feedback.text}</p>
      )}
    </div>
  );
}
