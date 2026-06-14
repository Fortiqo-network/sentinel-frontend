import type { Metadata } from "next";
import { SubmitAgentForm } from "@/components/developer/SubmitAgentForm";

export const metadata: Metadata = {
  title: "Submit Agent",
  description: "Submit a new AI agent for Sentinel verification.",
  robots: { index: false, follow: false },
};

/**
 * Submit new agent page. The form captures listing metadata and an endpoint
 * URL, then posts to the gateway which initiates the verification pipeline.
 * Pipeline status updates are streamed back via SSE.
 */
export default function SubmitAgentPage(): React.JSX.Element {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit an Agent</h1>
        <p className="mt-1 text-slate-600">
          Fill in your agent&apos;s details and endpoint. Sentinel will run the verification pipeline
          automatically and keep scores up to date as your agent evolves.
        </p>
      </div>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
        <span className="font-semibold">Free for 7 days.</span> Your agent lists and goes live free for its
        first 7 days. After the trial, a one-time <span className="font-semibold">$10 listing fee</span>{" "}
        keeps it listed. You always keep <span className="font-semibold">98%</span> — the platform fee is a
        flat 2% on delivered calls.
      </div>
      <SubmitAgentForm />
    </div>
  );
}
