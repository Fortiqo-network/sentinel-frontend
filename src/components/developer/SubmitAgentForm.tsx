"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAgent } from "@/lib/api/developer";
import type { CreateAgentRequest } from "@/lib/api/developer";
import { isSentinelApiError } from "@/lib/api/client";

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,126}[a-z0-9]$/;

/**
 * Agent submission form for the developer portal. Captures listing metadata
 * and posts to the gateway via {@link createAgent}, then redirects to the
 * developer agents list on success. Slug is validated client-side against the
 * same pattern the gateway enforces to give fast feedback before the round-trip.
 */
export function SubmitAgentForm(): React.JSX.Element {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const form = new FormData(e.currentTarget);
    const field = (key: string): string => {
      const value = form.get(key);
      return typeof value === "string" ? value.trim() : "";
    };

    const name = field("name");
    const slug = field("slug");
    const description = field("description");
    const vertical = field("vertical");
    const tier = (field("tier") || "proxy") as CreateAgentRequest["tier"];
    const tags = field("tags")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (name.length < 1 || name.length > 256) {
      setError("Name must be between 1 and 256 characters.");
      return;
    }

    if (!SLUG_PATTERN.test(slug)) {
      setError(
        "Slug must be 3-128 characters using lowercase letters, numbers, and hyphens, and start and end with a letter or number.",
      );
      return;
    }

    const body: CreateAgentRequest = {
      slug,
      name,
      tier,
      ...(description ? { description } : {}),
      ...(vertical ? { vertical } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    };

    setSubmitting(true);
    try {
      await createAgent(body);
      router.push("/developer/agents");
    } catch (err) {
      if (isSentinelApiError(err)) {
        setError(err.displayMessage);
      } else {
        setError("Submission failed. Please check your details and try again.");
      }
      setSubmitting(false);
    }
  };

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
            hint="URL-safe identifier. Lowercase letters, numbers, and hyphens (3-128 chars). Must be unique across Sentinel."
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
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tier
            </label>
            <select
              name="tier"
              defaultValue="proxy"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="proxy">Proxy</option>
              <option value="managed">Managed</option>
            </select>
          </div>
          <Input
            label="Vertical (optional)"
            name="vertical"
            placeholder="e.g. Engineering, Legal, Finance"
          />
          <Input
            label="Tags (optional)"
            name="tags"
            placeholder="e.g. code-review, security, ci"
            hint="Comma-separated list."
          />

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-400"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit for Verification"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
