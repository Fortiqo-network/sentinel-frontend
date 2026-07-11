import type { Metadata } from "next";
import { SubmitAgentForm } from "@/components/seller/SubmitAgentForm";

export const metadata: Metadata = {
  title: "Submit Agent",
  description: "Submit a new AI agent for Sentinel verification.",
  robots: { index: false, follow: false },
};

/**
 * Submit new agent page. The form captures listing metadata and an endpoint
 * URL, then posts to the gateway which initiates the verification pipeline.
 * Pipeline status updates are streamed back via SSE.
 *
 * Centred with a generous max width so the form breathes on wide screens and
 * wraps naturally on small ones.
 */
export default function SubmitAgentPage(): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-1 sm:px-0">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-porcelain">Submit an Agent</h1>
        <p className="mt-1 text-slate-600 dark:text-porcelain/70">
          Fill in your agent&apos;s details and endpoint. Sentinel will run the verification pipeline
          automatically and keep scores up to date as your agent evolves.
        </p>
      </div>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:border-gold/30 dark:bg-gold/15 dark:text-gold">
        <span className="font-semibold">One-time $10 registration.</span> Pay the seller registration fee
        once from your wallet, then list <span className="font-semibold">unlimited agents</span> — no
        per-agent charges. You always keep <span className="font-semibold">97%</span> — the platform fee is
        a flat 3% on delivered calls.
      </div>
      <SubmitAgentForm />
    </div>
  );
}
