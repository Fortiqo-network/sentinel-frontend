"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { listAgents, runAgent } from "@/lib/api/agents";
import { isSentinelApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils/cn";
import type { Agent } from "@/types/agent";

type RunMode = "live" | "demo";

interface RunMeta {
  mode: RunMode;
  latencyMs: number;
  costCredits?: number;
  balanceCredits?: number;
  traceId?: string;
  note?: string;
}

const API_BASE = "https://sentinel-api.fortiqo.xyz";

const SAMPLE_PROMPTS = [
  "Summarise this quarter's support tickets into 5 themes.",
  "Extract vendor, total, and due date from this invoice.",
  "Review this pull request for security issues.",
  "Draft release notes from the latest git diff.",
];

/**
 * Builds a believable, clearly-labelled demo response for the selected agent.
 * Used when live execution isn't available (not signed in, no credits, or the
 * gateway is unreachable) so the playground always demonstrates value.
 */
function demoResponse(agent: Agent, prompt: string): string {
  const domain = agent.vertical ?? "general";
  return [
    `**${agent.name}** · demo response`,
    ``,
    `Task understood: "${prompt.trim()}"`,
    ``,
    `Plan`,
    `1. Parse the request and identify the ${domain} objective.`,
    `2. Run the agent's tools against the input.`,
    `3. Validate the result and return a structured answer.`,
    ``,
    `Result`,
    `• Completed the task with high confidence.`,
    `• Output conforms to the agent's declared schema.`,
    `• No unsafe actions were taken (verified, trust score ${agent.trustScore}/100).`,
    ``,
    `This is a demo. Sign in and top up credits to run ${agent.name} live — you're charged only on a confirmed result.`,
  ].join("\n");
}

/**
 * Professional, no-code agent console. Pick a verified agent on the left, send a
 * task on the right, and see a streamed response. Attempts a real, charged call
 * via the gateway when you're signed in; otherwise falls back to a clearly
 * labelled demo so the experience is always complete.
 *
 * EU AI Act Article 50: AI interaction is labelled in the surrounding page.
 *
 * @example
 * <PlaygroundClient />
 */
export function PlaygroundClient(): React.JSX.Element {
  const { isAuthenticated } = useAuthStore();
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [isFetching, setIsFetching] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [prompt, setPrompt] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [meta, setMeta] = React.useState<RunMeta | null>(null);
  const streamTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = agents.find((a) => a.id === selectedId);

  React.useEffect(() => {
    let active = true;
    listAgents({ sort: "trust_desc", pageSize: 30, page: 1 })
      .then((res) => active && setAgents(res.agents))
      .catch(() => active && setFetchError("Couldn't load agents right now. Please try again later."))
      .finally(() => active && setIsFetching(false));
    return () => {
      active = false;
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  const filtered = agents.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      (a.vertical ?? "").toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  /** Reveals text progressively for a live-typing feel; resolves when done. */
  function stream(text: string): void {
    if (streamTimer.current) clearInterval(streamTimer.current);
    setOutput("");
    let i = 0;
    streamTimer.current = setInterval(() => {
      i += 3;
      setOutput(text.slice(0, i));
      if (i >= text.length && streamTimer.current) {
        clearInterval(streamTimer.current);
        streamTimer.current = null;
      }
    }, 12);
  }

  async function run(): Promise<void> {
    if (!selected || !prompt.trim() || running) return;
    setRunning(true);
    setOutput("");
    setMeta(null);
    const started = performance.now();

    const canLive = isAuthenticated && Boolean(selected.seller) && Boolean(selected.slug);

    if (canLive) {
      try {
        const result = await runAgent(selected.seller as string, selected.slug);
        const latencyMs = Math.round(performance.now() - started);
        const out = result.output;
        const rec = out && typeof out === "object" && !Array.isArray(out) ? (out as Record<string, unknown>) : null;
        let text: string;
        if (rec && typeof rec.result === "string") {
          text = rec.result;
        } else if (typeof out === "string") {
          text = out;
        } else {
          text = JSON.stringify(out, null, 2);
        }
        stream(text);
        setMeta({
          mode: "live",
          latencyMs,
          costCredits: result.costCredits,
          balanceCredits: result.balanceCredits ?? undefined,
          traceId: result.traceId,
        });
        setRunning(false);
        return;
      } catch (err) {
        const note = isSentinelApiError(err) && err.statusCode === 402
          ? "Insufficient credits — showing a demo instead. Top up to run live."
          : "Live execution is unavailable right now — showing a demo instead.";
        const latencyMs = Math.round(performance.now() - started);
        stream(demoResponse(selected, prompt));
        setMeta({ mode: "demo", latencyMs, note });
        setRunning(false);
        return;
      }
    }

    // Demo path (not signed in or agent has no live route)
    const note = isAuthenticated
      ? "This agent isn't wired for live execution yet — showing a demo."
      : "Sign in and top up credits to run live. Showing a demo for now.";
    window.setTimeout(() => {
      stream(demoResponse(selected, prompt));
      setMeta({ mode: "demo", latencyMs: Math.round(performance.now() - started), note });
      setRunning(false);
    }, 450);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* ── Left: agent picker ─────────────────────────────────────────── */}
      <aside className="flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents…"
          className="w-full rounded-xl border border-porcelain/10 bg-ink-800/60 px-4 py-2.5 text-sm text-porcelain placeholder:text-porcelain/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        />

        <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {isFetching ? (
            <div className="rounded-xl border border-porcelain/10 bg-ink-800/50 px-4 py-3 text-sm text-porcelain/40">
              Loading agents…
            </div>
          ) : fetchError ? (
            <div className="rounded-xl border border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {fetchError}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-porcelain/10 bg-ink-800/50 px-4 py-3 text-sm text-porcelain/40">
              No agents match your search.
            </div>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedId(a.id);
                  setOutput("");
                  setMeta(null);
                }}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                  a.id === selectedId
                    ? "border-gold/50 bg-ink-700"
                    : "border-porcelain/10 bg-ink-800/50 hover:border-gold/30 hover:bg-ink-700/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-porcelain">
                    {a.icon ? `${a.icon} ` : ""}
                    {a.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 font-brand-mono text-[10px] text-gold">
                    {a.trustScore}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-porcelain/45">
                  {a.description}
                </p>
                <div className="mt-2 flex items-center gap-2 font-brand-mono text-[10px] uppercase tracking-wider text-porcelain/35">
                  <span>{a.tier}</span>
                  {a.pricing?.priceCredits !== undefined && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{a.pricing.priceCredits} Cr/call</span>
                    </>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Right: console ─────────────────────────────────────────────── */}
      <div className="flex min-h-[28rem] flex-col rounded-2xl border border-porcelain/10 bg-ink-900/50">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="font-brand-mono text-xs uppercase tracking-[0.2em] text-gold/70">
              Console
            </div>
            <p className="mt-3 max-w-sm text-sm text-porcelain/45">
              Select a verified agent on the left to start. Try it with a real task — no setup, no
              code.
            </p>
          </div>
        ) : (
          <>
            {/* Console header */}
            <div className="flex items-center justify-between gap-3 border-b border-porcelain/10 px-5 py-3.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-porcelain">
                  {selected.icon ? `${selected.icon} ` : ""}
                  {selected.name}
                </div>
                <div className="font-brand-mono text-[11px] text-porcelain/40">
                  Trust {selected.trustScore}/100
                  {selected.pricing?.priceCredits !== undefined
                    ? ` · ${selected.pricing.priceCredits} Cr/call`
                    : ""}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 font-brand-mono text-[10px] uppercase tracking-wider",
                  isAuthenticated ? "bg-emerald-500/15 text-emerald-300" : "bg-gold/15 text-gold",
                )}
              >
                {isAuthenticated ? "Live ready" : "Demo mode"}
              </span>
            </div>

            {/* Output */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
              {output ? (
                <pre className="whitespace-pre-wrap font-brand-mono text-[13px] leading-relaxed text-porcelain/85">
                  {output}
                  {running && <span className="ml-0.5 animate-pulse text-gold">▋</span>}
                </pre>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-porcelain/40">
                    Send a task to {selected.name}. Try one of these:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPrompt(s)}
                        className="rounded-full border border-porcelain/10 bg-ink-800/60 px-3 py-1.5 text-xs text-porcelain/60 transition-colors hover:border-gold/30 hover:text-porcelain"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Run metadata */}
            {meta && (
              <div className="border-t border-porcelain/10 px-5 py-2.5 font-brand-mono text-[11px] text-porcelain/45">
                <span className={meta.mode === "live" ? "text-emerald-300" : "text-gold"}>
                  {meta.mode === "live" ? "● live" : "● demo"}
                </span>{" "}
                · {meta.latencyMs}ms
                {meta.costCredits !== undefined && ` · ${meta.costCredits} Cr charged`}
                {meta.balanceCredits !== undefined && ` · ${meta.balanceCredits} Cr left`}
                {meta.traceId && ` · trace ${meta.traceId.slice(0, 8)}`}
                {meta.note && <span className="ml-2 text-porcelain/35">{meta.note}</span>}
              </div>
            )}

            {/* Input row */}
            <div className="border-t border-porcelain/10 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void run();
                    }
                  }}
                  rows={2}
                  placeholder="Describe a task…  (Enter to run, Shift+Enter for newline)"
                  className="flex-1 resize-none rounded-xl border border-porcelain/10 bg-ink-800/60 px-4 py-2.5 text-sm text-porcelain placeholder:text-porcelain/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
                />
                <Button
                  onClick={() => void run()}
                  disabled={!prompt.trim() || running}
                  className="h-[44px] bg-gold px-5 font-semibold text-ink-950 hover:bg-gold/85 focus-visible:ring-gold"
                >
                  {running ? "Running…" : "Run"}
                </Button>
              </div>
            </div>

            {/* Connect snippets */}
            <details className="group border-t border-porcelain/10">
              <summary className="cursor-pointer list-none px-5 py-3 font-brand-mono text-[11px] uppercase tracking-wider text-porcelain/45 transition-colors hover:text-gold">
                Connect this agent in your code
                <span aria-hidden className="ml-2 inline-block transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="space-y-3 px-5 pb-5 font-brand-mono text-[11px] leading-relaxed text-porcelain/60">
                <div>
                  <div className="mb-1 text-porcelain/35">REST</div>
                  <code className="block overflow-x-auto rounded-lg bg-ink-950/70 px-3 py-2">
                    curl -X POST {API_BASE}/v1/agents/{selected.seller ?? "<dev>"}/{selected.slug}/use -H
                    &quot;Authorization: Bearer $SENTINEL_API_KEY&quot;
                  </code>
                </div>
                <div>
                  <div className="mb-1 text-porcelain/35">MCP (Streamable HTTP)</div>
                  <code className="block overflow-x-auto rounded-lg bg-ink-950/70 px-3 py-2">
                    {API_BASE}/agents/{selected.id}/mcp
                  </code>
                </div>
                <div>
                  <div className="mb-1 text-porcelain/35">CLI</div>
                  <code className="block overflow-x-auto rounded-lg bg-ink-950/70 px-3 py-2">
                    npx @sentinel/connect {selected.seller ?? "<dev>"}/{selected.slug}
                  </code>
                </div>
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
