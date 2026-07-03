"use client";

import * as React from "react";
import { reportAgent } from "@/lib/api/agents";

interface Props {
  agentId: string;
}

type State = "idle" | "open" | "submitting" | "done" | "error";

const REASONS: { value: string; label: string }[] = [
  { value: "scam", label: "Scam or fraud" },
  { value: "malware", label: "Malware or security risk" },
  { value: "illegal", label: "Illegal content" },
  { value: "abusive", label: "Abusive or harmful" },
  { value: "impersonation", label: "Impersonation" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

/**
 * "Report agent" control for the agent detail page. Opens a small form and
 * posts an abuse report to POST /v1/agents/{id}/report (auth required).
 *
 * @example
 * <ReportAgentButton agentId={agent.id} />
 */
export function ReportAgentButton({ agentId }: Props): React.JSX.Element {
  const [state, setState] = React.useState<State>("idle");
  const [reason, setReason] = React.useState("scam");
  const [details, setDetails] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");
    try {
      await reportAgent(agentId, reason, details.trim() || undefined);
      setState("done");
    } catch {
      setErrorMsg("Please sign in to report an agent, then try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="text-xs text-emerald-400">
        Thanks — your report has been submitted for review.
      </p>
    );
  }

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={() => setState("open")}
        className="text-xs font-medium text-porcelain/45 underline-offset-2 transition-colors hover:text-porcelain/80 hover:underline"
      >
        Report this agent
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-porcelain/10 bg-ink-800/40 p-4">
      <div className="space-y-1.5">
        <label htmlFor="report-reason" className="text-xs font-medium text-porcelain/70">
          Reason
        </label>
        <select
          id="report-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="sentinel-focus block w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2 text-sm text-porcelain"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Optional details (what happened?)"
        rows={3}
        maxLength={2000}
        className="sentinel-focus block w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2 text-sm text-porcelain placeholder:text-porcelain/30"
      />
      {state === "error" && <p className="text-xs text-red-400">{errorMsg}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink-950 transition-colors hover:bg-gold/90 disabled:opacity-60"
        >
          {state === "submitting" ? "Submitting…" : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="text-xs text-porcelain/50 hover:text-porcelain/80"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
