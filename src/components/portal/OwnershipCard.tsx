"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getOwnership,
  requestOwnershipChallenge,
  updateAgent,
  verifyOwnership,
  type OwnershipChallenge,
  type OwnershipMethod,
  type OwnershipStatus,
} from "@/lib/api/developer";
import { isSentinelApiError } from "@/lib/api/client";

const NONE_BADGE = { label: "Not verified", cls: "bg-slate-100 text-slate-600" };
const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  verified: { label: "Verified", cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
  none: NONE_BADGE,
};

/**
 * Endpoint-ownership proof for a developer's agent. Issues a challenge token the
 * developer serves from `/.well-known/sentinel-challenge`, then verifies it
 * (SSRF-guarded server-side). Listing requires ownership once verified.
 *
 * @example
 * <OwnershipCard agentId={agent.id} />
 */
export function OwnershipCard({
  agentId,
  endpointUrl,
}: {
  agentId: string;
  endpointUrl?: string | null;
}): React.JSX.Element {
  const [status, setStatus] = React.useState<OwnershipStatus | null>(null);
  const [challenge, setChallenge] = React.useState<OwnershipChallenge | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [endpoint, setEndpoint] = React.useState(endpointUrl ?? "");
  const [savedEndpoint, setSavedEndpoint] = React.useState(endpointUrl ?? "");
  const [savingEndpoint, setSavingEndpoint] = React.useState(false);
  const [endpointNote, setEndpointNote] = React.useState<string | undefined>();
  const [method, setMethod] = React.useState<OwnershipMethod>("well_known");

  React.useEffect(() => {
    void getOwnership(agentId).then(setStatus).catch(() => undefined);
  }, [agentId]);

  async function saveEndpoint(): Promise<void> {
    const url = endpoint.trim();
    if (!/^https?:\/\//i.test(url)) {
      setEndpointNote("Enter a valid URL starting with https://");
      return;
    }
    setSavingEndpoint(true);
    setEndpointNote(undefined);
    try {
      await updateAgent(agentId, { access_config: { endpoint_url: url } });
      setSavedEndpoint(url);
      setEndpointNote("Endpoint saved. You can now generate a challenge.");
    } catch (err) {
      setEndpointNote(isSentinelApiError(err) ? err.displayMessage : "Could not save the endpoint.");
    } finally {
      setSavingEndpoint(false);
    }
  }

  async function getChallenge(): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      setChallenge(await requestOwnershipChallenge(agentId, method));
    } catch (err) {
      setError(isSentinelApiError(err) ? err.displayMessage : "Could not issue a challenge.");
    } finally {
      setBusy(false);
    }
  }

  async function runVerify(): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      setStatus(await verifyOwnership(agentId));
    } catch (err) {
      setError(isSentinelApiError(err) ? err.displayMessage : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  const badge = STATUS_STYLE[status?.status ?? "none"] ?? NONE_BADGE;
  const verified = status?.verified ?? false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Endpoint ownership</CardTitle>
            <CardDescription>
              Prove you control this agent&apos;s endpoint. Required before it can be listed.
            </CardDescription>
          </div>
          <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {verified ? (
          <p className="text-sm text-emerald-700">Ownership is verified. Nothing more to do.</p>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Agent endpoint URL</label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://your-agent.example.com"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <Button onClick={() => void saveEndpoint()} disabled={savingEndpoint} variant="outline" size="sm">
                  {savingEndpoint ? "Saving…" : "Save endpoint"}
                </Button>
              </div>
              <p className="text-xs text-slate-400">Required first — pick a proof method below.</p>
              {endpointNote && <p className="text-xs text-slate-500">{endpointNote}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Proof method</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("well_known")}
                  className={
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                    (method === "well_known"
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300")
                  }
                >
                  Well-known file (HTTP)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("dns_txt")}
                  className={
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                    (method === "dns_txt"
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300")
                  }
                >
                  DNS TXT record
                </button>
              </div>
              <p className="text-xs text-slate-400">
                {method === "dns_txt"
                  ? "Can't add a route to your app? Prove control by publishing a DNS TXT record on your domain instead."
                  : "Serve the token as plain text from your endpoint's /.well-known/sentinel-challenge."}
              </p>
            </div>

            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
              <li>Generate a challenge token below.</li>
              {method === "dns_txt" ? (
                <li>Publish it as a DNS <span className="font-medium">TXT</span> record at the name shown.</li>
              ) : (
                <li>Serve it as plain text from your endpoint&apos;s <code className="rounded bg-slate-100 px-1">/.well-known/sentinel-challenge</code>.</li>
              )}
              <li>Click <span className="font-medium">Verify</span> (DNS can take a few minutes to propagate).</li>
            </ol>

            {challenge && (
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                {challenge.method === "dns_txt" ? (
                  <div>
                    <span className="text-slate-500">TXT record name:</span>{" "}
                    <code className="break-all text-slate-800">{challenge.dns_txt_name}</code>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-500">Serve at:</span>{" "}
                    <code className="break-all text-slate-800">{challenge.well_known_url}</code>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">{challenge.method === "dns_txt" ? "TXT value:" : "Token:"}</span>{" "}
                  <code className="break-all font-mono text-slate-800">{challenge.challenge_token}</code>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void getChallenge()} disabled={busy || !savedEndpoint} variant="outline" size="sm">
                {challenge ? "Regenerate token" : "Get challenge"}
              </Button>
              <Button onClick={() => void runVerify()} disabled={busy || !savedEndpoint} size="sm">
                {busy ? "Working…" : "Verify"}
              </Button>
            </div>
            {!savedEndpoint && (
              <p className="text-xs text-amber-600">Save the agent endpoint URL above to enable the challenge.</p>
            )}
          </>
        )}

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
  );
}
