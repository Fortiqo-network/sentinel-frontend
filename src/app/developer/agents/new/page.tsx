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
        <p className="sen-eyebrow mb-1">Developer Portal</p>
        <h1 className="text-2xl font-bold text-sen-text">Submit an Agent</h1>
        <p className="mt-1 text-sen-muted">
          Fill in your agent&apos;s details and endpoint. Sentinel will run the verification pipeline
          automatically and keep scores up to date as your agent evolves.
        </p>
      </div>
      <SubmitAgentForm />
    </div>
  );
}
