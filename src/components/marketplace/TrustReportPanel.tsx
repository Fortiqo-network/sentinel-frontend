"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, ShieldCheck, X } from "lucide-react";
import type { AgentReport, ReportDimension } from "@/lib/api/agents";
import { cn } from "@/lib/utils/cn";

interface TrustReportPanelProps {
  agentName: string;
  /** Average (overall) trust score, 0–100. */
  trustScore: number;
  /** Certification tier label already derived by the page. */
  certLabel: string;
  lastVerifiedAt?: string | null;
  /** Full report when available; null renders honest per-dimension pending states. */
  report?: AgentReport | null;
}

/** Canonical rubric-v2 dimensions and their default state before a full report exists. */
const DEFAULT_DIMENSIONS: ReportDimension[] = [
  { key: "static", label: "Static security (SAST + secrets)", score: null, status: "assessed", weight: 20 },
  { key: "supply_chain", label: "Supply chain (CVE / license)", score: null, status: "assessed", weight: 15 },
  { key: "code_quality", label: "Code quality", score: null, status: "pending", weight: 15 },
  { key: "ai_review", label: "AI codebase review", score: null, status: "pending", weight: 15 },
  { key: "dynamic", label: "Dynamic behaviour", score: null, status: "deferred", weight: 10 },
  { key: "redteam", label: "Red-team resistance", score: null, status: "deferred", weight: 10 },
  { key: "reliability", label: "Reliability (golden tasks)", score: null, status: "deferred", weight: 10 },
  { key: "performance", label: "Latency / performance", score: null, status: "deferred", weight: 5 },
];

const STATUS_META: Record<ReportDimension["status"], { label: string; cls: string }> = {
  assessed: { label: "Assessed", cls: "bg-emerald-900/30 text-emerald-400 border-emerald-700/30" },
  pending: { label: "Pending", cls: "bg-ink-700 text-porcelain/50 border-porcelain/10" },
  deferred: { label: "Deferred", cls: "bg-amber-900/30 text-amber-400 border-amber-700/30" },
};

function band(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Trusted";
  if (score >= 50) return "Developing";
  return "Unproven";
}

function ringColor(score: number): string {
  return score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-400" : "stroke-red-500";
}

function ScoreRing({ score }: { score: number }): React.JSX.Element {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circ;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Trust score ${score} of 100`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(236,234,227,0.10)" strokeWidth="9" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        className={ringColor(score)}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" textAnchor="middle" style={{ fontSize: "28px", fontWeight: 700, fill: "#ECEAE3" }}>
        {Math.round(score)}
      </text>
      <text x="60" y="78" textAnchor="middle" style={{ fontSize: "11px", fill: "rgba(236,234,227,0.45)" }}>
        / 100
      </text>
    </svg>
  );
}

/**
 * "View full trust report" button + modal. Always available on the agent page:
 * shows the average trust score prominently and every verification dimension with
 * its honest status (assessed / pending / deferred) — sub-scores render only when
 * a real report supplies them, never fabricated.
 *
 * @example
 * <TrustReportPanel agentName="CodeReview Pro" trustScore={82} certLabel="Certified" />
 */
export function TrustReportPanel({
  agentName,
  trustScore,
  certLabel,
  lastVerifiedAt,
  report,
}: TrustReportPanelProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const dimensions = report && report.dimensions.length > 0 ? report.dimensions : DEFAULT_DIMENSIONS;
  const score = report ? report.scoreDisplay : trustScore;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-porcelain/15 bg-ink-700 px-4 py-2.5 text-sm font-medium text-porcelain/80 transition-colors hover:border-gold/40 hover:text-porcelain"
      >
        <FileText className="h-4 w-4" /> View full trust report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-porcelain/10 bg-ink-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <div>
                  <h2 className="text-lg font-bold text-porcelain">Trust report</h2>
                  <p className="text-xs text-porcelain/45">{agentName}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-porcelain/50 hover:text-porcelain">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Average score */}
            <div className="mt-5 flex items-center gap-5 rounded-xl bg-ink-800/60 p-5 ring-1 ring-porcelain/10">
              <ScoreRing score={score} />
              <div>
                <p className="font-brand-mono text-xs uppercase tracking-[0.18em] text-gold">Average trust score</p>
                <p className="mt-1 text-2xl font-bold text-porcelain">{band(score)}</p>
                <p className="mt-1 text-sm text-porcelain/55">
                  {certLabel}
                  {report?.rubricVersion ? ` · rubric ${report.rubricVersion}` : ""}
                </p>
                <p className="mt-1 text-xs text-porcelain/40">
                  Weighted average across all verification dimensions below.
                </p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="mt-5">
              <p className="mb-2 font-brand-mono text-xs uppercase tracking-[0.16em] text-porcelain/45">
                Dimensions
              </p>
              <ul className="space-y-2">
                {dimensions.map((d) => {
                  const meta = STATUS_META[d.status];
                  return (
                    <li
                      key={d.key}
                      className="flex items-center justify-between gap-3 rounded-lg border border-porcelain/10 bg-ink-800/40 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-porcelain/80">{d.label}</p>
                        {d.weight != null && (
                          <p className="text-[11px] text-porcelain/35">Weight {d.weight}%</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {d.score != null && (
                          <span className="font-brand-mono text-sm font-semibold text-porcelain">{d.score}</span>
                        )}
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            meta.cls,
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Findings summary */}
            {report?.findingsSummary && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {(["critical", "high", "medium", "low", "info"] as const).map((sev) => (
                  <span key={sev} className="rounded-md bg-ink-800 px-2 py-1 text-porcelain/60">
                    {sev}: {report.findingsSummary?.[sev] ?? 0}
                  </span>
                ))}
              </div>
            )}

            {/* Honest disclosure */}
            <p className="mt-5 rounded-lg border border-porcelain/10 bg-ink-800/40 px-3 py-2.5 text-xs leading-relaxed text-porcelain/55">
              Detailed per-dimension scores populate as the verification pipeline completes. Stages marked
              <span className="text-amber-400"> Deferred</span> need the secure runtime sandbox and are disclosed
              rather than scored — the overall score reflects only the stages that have actually run.
              {lastVerifiedAt ? ` Last verified ${new Date(lastVerifiedAt).toLocaleDateString("en-IN")}.` : ""}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/docs/trust/verification-process" className="text-gold hover:underline">
                How verification works ↗
              </Link>
              <Link href="/docs/trust/trust-scores" className="text-gold hover:underline">
                Trust score methodology ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
