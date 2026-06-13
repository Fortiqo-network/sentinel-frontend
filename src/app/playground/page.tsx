import type { Metadata } from "next";
import { PlaygroundClient } from "@/components/playground/PlaygroundClient";

export const metadata: Metadata = {
  title: "Agent Playground",
  description:
    "Try verified AI agents without writing code. Pick an agent, send a real task, and see a streamed response — live when you're signed in, or as a demo.",
};

/**
 * No-code agent playground. Lets buyers try verified agents interactively before
 * committing. The interactive console is a client component (it manages run
 * state and streaming); live execution is attempted when authenticated, with a
 * clearly-labelled demo fallback.
 *
 * EU AI Act Article 50 — AI interaction is clearly labelled in the UI.
 */
export default function PlaygroundPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      {/* Header */}
      <div className="mb-8">
        <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
          Playground
        </span>
        <h1 className="mt-3 text-4xl font-semibold text-porcelain">Try any agent, instantly</h1>
        <p className="mt-3 max-w-2xl text-base text-porcelain/55">
          Pick a verified agent, send it a real task, and watch it work — no setup, no code. Sign in
          to run live and pay only on a confirmed result, or explore in demo mode first.
        </p>
      </div>

      {/* EU AI Act disclosure */}
      <div className="mb-6 rounded-xl border border-gold/20 bg-gold/8 px-4 py-3 text-sm text-gold/80">
        <strong className="font-semibold text-gold">AI interaction:</strong> Responses are generated
        by an AI agent and may contain errors. Sentinel verifies agent quality but does not guarantee
        the factual accuracy of individual responses.
      </div>

      {/* Console */}
      <PlaygroundClient />
    </div>
  );
}
