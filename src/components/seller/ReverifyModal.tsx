"use client";

import * as React from "react";
import { getVerificationProgress, type VerificationProgress } from "@/lib/api/seller";

interface ReverifyModalProps {
  agentId: string;
  open: boolean;
  onClose: () => void;
  /** Called once when the job reaches a terminal state (so the page can refresh). */
  onDone?: (finalStatus: string) => void;
}

// The pipeline stages in run order, with friendly labels.
const STAGES: Array<{ key: string; label: string }> = [
  { key: "static_analysis", label: "Static analysis" },
  { key: "supply_chain", label: "Supply chain" },
  { key: "code_quality", label: "Code quality" },
  { key: "secrets", label: "Secret scan" },
  { key: "ai_review", label: "AI review" },
  { key: "dynamic", label: "Dynamic probe" },
  { key: "redteam", label: "Red-team" },
  { key: "scoring", label: "Trust scoring" },
];

const TERMINAL = new Set(["completed", "failed", "aborted"]);

function chip(state: string | undefined): { text: string; cls: string } {
  switch (state) {
    case "passed":
      return { text: "✓ passed", cls: "text-emerald-400" };
    case "failed":
      return { text: "✗ failed", cls: "text-red-400" };
    case "running":
      return { text: "● running", cls: "text-gold animate-pulse" };
    case "deferred":
      return { text: "– skipped", cls: "text-porcelain/40" };
    default:
      return { text: "pending", cls: "text-porcelain/30" };
  }
}

/**
 * A live verification-progress modal. Polls the agent's latest job every 2s and
 * renders a stage-by-stage checklist with running/passed/failed chips. Calls
 * `onDone` when the job finishes so the parent can refresh the agent's status
 * and trust score.
 */
export function ReverifyModal({ agentId, open, onClose, onDone }: ReverifyModalProps): React.JSX.Element | null {
  const [progress, setProgress] = React.useState<VerificationProgress | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    doneRef.current = false;
    setProgress(null);
    setError(null);
    let cancelled = false;

    async function poll(): Promise<void> {
      try {
        const p = await getVerificationProgress(agentId);
        if (cancelled) return;
        setProgress(p);
        if (TERMINAL.has(p.status) && !doneRef.current) {
          doneRef.current = true;
          onDone?.(p.status);
        }
      } catch {
        if (!cancelled) setError("Couldn't read verification progress. Retrying…");
      }
    }

    void poll();
    const id = window.setInterval(() => {
      if (doneRef.current) return;
      void poll();
    }, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [open, agentId, onDone]);

  if (!open) return null;

  const status = progress?.status ?? "starting";
  const isTerminal = TERMINAL.has(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-porcelain/10 bg-ink-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-porcelain">Verification</h2>
            <p className="mt-0.5 text-xs text-porcelain/50">
              {status === "completed"
                ? "Verification complete."
                : status === "failed"
                  ? "Verification failed."
                  : status === "none"
                    ? "No verification job yet — start a re-verify."
                    : "Running the trust pipeline — this can take a few minutes."}
            </p>
          </div>
          <span
            className={
              "rounded-full px-2.5 py-1 text-xs font-medium " +
              (status === "completed"
                ? "bg-emerald-500/15 text-emerald-300"
                : status === "failed"
                  ? "bg-red-500/15 text-red-300"
                  : "bg-gold/15 text-gold")
            }
          >
            {status}
          </span>
        </div>

        <ul className="mt-4 divide-y divide-porcelain/5">
          {STAGES.map((s) => {
            const c = chip(progress?.stages?.[s.key]);
            const present = progress?.stages && s.key in progress.stages;
            if (!present && !progress) return null;
            return (
              <li key={s.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-porcelain/80">{s.label}</span>
                <span className={`font-brand-mono text-xs ${c.cls}`}>{c.text}</span>
              </li>
            );
          })}
        </ul>

        {progress?.errorMessage && (
          <pre className="mt-3 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 font-brand-mono text-[11px] text-red-300">
            {progress.errorMessage}
          </pre>
        )}
        {error && <p className="mt-3 text-xs text-porcelain/50">{error}</p>}

        {isTerminal && progress?.trustScore != null && (
          <p className="mt-3 text-sm text-porcelain/70">
            Trust score:{" "}
            <span className="font-semibold text-porcelain">{Math.round(progress.trustScore * 100)}</span>/100
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-porcelain/15 px-4 py-2 text-sm text-porcelain/70 transition-colors hover:bg-ink-800"
          >
            {isTerminal ? "Done" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
