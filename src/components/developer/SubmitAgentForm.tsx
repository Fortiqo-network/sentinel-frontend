"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAgent } from "@/lib/api/developer";
import type { CreateAgentRequest } from "@/lib/api/developer";
import { CREDITS_PER_USD } from "@/lib/site";
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
  const [tier, setTier] = React.useState<CreateAgentRequest["tier"]>("proxy");
  const isManaged = tier === "managed";

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
    // Managed agents are hosted by Sentinel — they never carry a developer endpoint.
    const endpointUrl = isManaged ? "" : field("endpointUrl");
    const priceRaw = field("price");
    const priceCurrency = field("priceCurrency") || "credits";
    const promoCode = field("promoCode");
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

    if (endpointUrl && !/^https?:\/\//i.test(endpointUrl)) {
      setError("Endpoint URL must start with http:// or https://");
      return;
    }

    const priceAmount = priceRaw ? parseFloat(priceRaw) : 0;
    if (priceRaw && (Number.isNaN(priceAmount) || priceAmount < 0)) {
      setError("Price per call must be a non-negative number.");
      return;
    }

    // Fixed peg: 1 USD = 100 credits. Convert at submit; the credit cost is stored
    // in metadata so no conversion is needed at call time.
    const price =
      priceCurrency === "usd" ? Math.round(priceAmount * CREDITS_PER_USD) : Math.round(priceAmount);

    const accessConfig: Record<string, unknown> = {};
    if (endpointUrl) accessConfig.endpoint_url = endpointUrl;
    if (price > 0) accessConfig.price_per_call_units = price * 100;

    const body: CreateAgentRequest = {
      slug,
      name,
      tier,
      ...(description ? { description } : {}),
      ...(vertical ? { vertical } : {}),
      ...(tags.length > 0 ? { tags } : {}),
      ...(Object.keys(accessConfig).length > 0 ? { access_config: accessConfig } : {}),
      ...(promoCode ? { promo_code: promoCode } : {}),
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">How will your agent run?</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTier("proxy")}
                aria-pressed={!isManaged}
                className={
                  "rounded-xl border p-4 text-left transition-colors " +
                  (!isManaged
                    ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300"
                    : "border-slate-200 bg-white hover:border-slate-300")
                }
              >
                <div className="text-sm font-semibold text-slate-900">Connect your hosted agent</div>
                <p className="mt-1 text-xs text-slate-500">
                  You run it. Give us the URL and Sentinel routes each call to your endpoint.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setTier("managed")}
                aria-pressed={isManaged}
                className={
                  "rounded-xl border p-4 text-left transition-colors " +
                  (isManaged
                    ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300"
                    : "border-slate-200 bg-white hover:border-slate-300")
                }
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Let Sentinel host it
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    Early access
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Upload your agent — Sentinel verifies, runs it, and assigns the endpoint for you.
                </p>
              </button>
            </div>
          </div>

          {isManaged ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Sentinel-hosted agents don&apos;t need an endpoint URL or ownership proof — we generate and
              control the endpoint, and health/ownership are satisfied automatically. Package upload is
              rolling out in early access; until your build is accepted, the listing stays in review.
            </div>
          ) : (
            <Input
              label="Agent endpoint URL"
              name="endpointUrl"
              type="url"
              placeholder="https://your-agent.example.com/invoke"
              hint="Where Sentinel sends each call (POST JSON {input}) and returns the agent's real output. You can also set this later and prove ownership from the agent page."
            />
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Price per call (optional)
            </label>
            <div className="flex gap-2">
              <input
                name="price"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 5"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
              <select
                name="priceCurrency"
                defaultValue="credits"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="credits">Credits</option>
                <option value="usd">USD</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Charged from the buyer&apos;s wallet only on a successful call. USD is converted at
              1 USD = 100 credits. Leave blank for free.
            </p>
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
          <Input
            label="Promo code (optional)"
            name="promoCode"
            placeholder="e.g. SENTINEL1"
            hint="SENTINEL1 waives the one-time $10 listing fee — your agent lists free."
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
