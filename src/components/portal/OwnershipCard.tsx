"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getOwnership,
  requestOwnershipChallenge,
  verifyOwnership,
  type OwnershipChallenge,
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
export function OwnershipCard({ agentId }: { agentId: string }): React.JSX.Element {
  const [status, setStatus] = React.useState<OwnershipStatus | null>(null);
  const [challenge, setChallenge] = React.useState<OwnershipChallenge | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    void getOwnership(agentId).then(setStatus).catch(() => undefined);
  }, [agentId]);

  async function getChallenge(): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      setChallenge(await requestOwnershipChallenge(agentId));
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
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
              <li>Generate a challenge token below.</li>
              <li>Serve it as plain text from your endpoint&apos;s <code className="rounded bg-slate-100 px-1">/.well-known/sentinel-challenge</code>.</li>
              <li>Click <span className="font-medium">Verify</span>.</li>
            </ol>

            {challenge && (
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div>
                  <span className="text-slate-500">Serve at:</span>{" "}
                  <code className="break-all text-slate-800">{challenge.well_known_url}</code>
                </div>
                <div>
                  <span className="text-slate-500">Token:</span>{" "}
                  <code className="break-all font-mono text-slate-800">{challenge.challenge_token}</code>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void getChallenge()} disabled={busy} variant="outline" size="sm">
                {challenge ? "Regenerate token" : "Get challenge"}
              </Button>
              <Button onClick={() => void runVerify()} disabled={busy} size="sm">
                {busy ? "Working…" : "Verify"}
              </Button>
            </div>
          </>
        )}

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
  );
}
