"use client";

import * as React from "react";
import Link from "next/link";
import { runAgent } from "@/lib/api/agents";
import { isSentinelApiError } from "@/lib/api/client";

interface UseAgentButtonProps {
  seller: string;
  slug: string;
  priceLabel: string;
  /** MCP agents need a tool name + arguments; HTTP agents take a JSON input. */
  isMcp?: boolean;
}

type Feedback =
  | { kind: "ok"; text: string }
  | { kind: "insufficient" }
  | { kind: "login" }
  | { kind: "apikey" }
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
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}

/**
 * Runs an agent and charges the signed-in buyer's wallet for one successful
 * call. MCP agents require a tool name + JSON arguments; HTTP agents take a
 * free-form JSON input. Invocation authenticates with the buyer's API key, so a
 * 401 points them at the key-creation flow.
 */
export function UseAgentButton({
  seller,
  slug,
  priceLabel,
  isMcp = false,
}: UseAgentButtonProps): React.JSX.Element {
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [tool, setTool] = React.useState("");
  const [argsText, setArgsText] = React.useState(isMcp ? "{\n  \n}" : '{\n  "input": {}\n}');

  async function run(): Promise<void> {
    setFeedback(null);
    let payload: Record<string, unknown>;
    try {
      const parsed = argsText.trim() ? JSON.parse(argsText) : {};
      payload = isMcp
        ? { tool: tool.trim(), arguments: parsed }
        : (parsed as Record<string, unknown>);
    } catch {
      setFeedback({ kind: "error", text: "The JSON you entered isn't valid." });
      return;
    }
    if (isMcp && !tool.trim()) {
      setFeedback({ kind: "error", text: "Enter the MCP tool name to call." });
      return;
    }

    setBusy(true);
    try {
      const r = await runAgent(seller, slug, payload);
      const charge =
        r.costCredits > 0
          ? ` · charged ${r.costCredits} Cr, balance ${r.balanceCredits ?? "—"} Cr`
          : " · free call";
      setFeedback({ kind: "ok", text: `${formatOutput(r.output)}${charge}` });
    } catch (err) {
      if (isSentinelApiError(err) && err.statusCode === 402) setFeedback({ kind: "insufficient" });
      else if (isSentinelApiError(err) && err.statusCode === 401) setFeedback({ kind: "apikey" });
      else if (isSentinelApiError(err) && err.statusCode === 403) setFeedback({ kind: "login" });
      else if (isSentinelApiError(err) && err.statusCode === 400)
        setFeedback({ kind: "error", text: err.message });
      else setFeedback({ kind: "error", text: "Could not run the agent. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {isMcp && (
        <input
          type="text"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          placeholder="MCP tool name (e.g. agentname_action)"
          className="w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2 font-brand-mono text-xs text-porcelain placeholder:text-porcelain/30 focus:border-gold/50 focus:outline-none"
        />
      )}
      <textarea
        value={argsText}
        onChange={(e) => setArgsText(e.target.value)}
        rows={3}
        spellCheck={false}
        aria-label={isMcp ? "Tool arguments (JSON)" : "Input (JSON)"}
        className="w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2 font-brand-mono text-xs text-porcelain placeholder:text-porcelain/30 focus:border-gold/50 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="w-full rounded-xl bg-gold py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold/85 disabled:opacity-50"
      >
        {busy ? "Running…" : `Use Agent · ${priceLabel}`}
      </button>

      {feedback?.kind === "ok" && (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 font-brand-mono text-[12px] text-slate-800">
          {feedback.text}
        </pre>
      )}
      {feedback?.kind === "apikey" && (
        <p className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
          Agents are called with an API key.{" "}
          <Link href="/dashboard/api-keys" className="font-semibold underline">
            Create one here
          </Link>{" "}
          first, then run the agent.
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
