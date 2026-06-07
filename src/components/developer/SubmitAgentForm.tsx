"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SubmitState = "idle" | "submitting" | "success" | "error";

/**
 * Agent submission form for the developer portal. Captures listing metadata
 * and an endpoint URL, then posts to the gateway which initiates the
 * verification pipeline. Pipeline status is streamed back via SSE.
 *
 * TODO: wire up react-hook-form + zod schema from sentinel-shared codegen.
 */
export function SubmitAgentForm(): React.JSX.Element {
  const [state, setState] = React.useState<SubmitState>("idle");
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("submitting");
    setError(undefined);
    try {
      // TODO: POST to /api/developer/agents → gateway /v1/agents
      await new Promise((r) => setTimeout(r, 1200));
      setState("success");
    } catch {
      setError("Submission failed. Please check your details and try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h2 className="text-lg font-semibold text-slate-900">Agent Submitted</h2>
          <p className="text-sm text-slate-600">
            Your agent has been queued for verification. The pipeline usually completes within 30 minutes.
            You&apos;ll receive an email when the trust score is ready.
          </p>
          <Button
            variant="secondary"
            onClick={() => setState("idle")}
          >
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
          <Input
            label="Agent Name"
            name="name"
            placeholder="e.g. CodeReview Pro"
            required
            hint="Public display name shown on the marketplace."
          />
          <Input
            label="Slug"
            name="slug"
            placeholder="e.g. codereview-pro"
            required
            hint="URL-safe identifier. Must be unique across Sentinel."
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="What does this agent do? Be specific — this is the public-facing description."
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>
          <Input
            label="Agent Endpoint URL"
            name="endpointUrl"
            type="url"
            placeholder="https://api.example.com/agent"
            required
            hint="The URL Sentinel will use to run verification tests."
          />
          <Input
            label="Vertical (optional)"
            name="vertical"
            placeholder="e.g. Engineering, Legal, Finance"
          />

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-400"
            disabled={state === "submitting"}
          >
            {state === "submitting" ? "Submitting…" : "Submit for Verification"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
