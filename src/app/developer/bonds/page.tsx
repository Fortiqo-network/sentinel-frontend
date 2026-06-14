"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getBond, type Bond } from "@/lib/api/developer";

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "default"> = {
  active: "success",
  released: "default",
  slashed: "destructive",
  pending: "warning",
};

/**
 * Developer bonds page. Shows the developer's active performance bond — the
 * refundable deposit that backs delivery guarantees and unlocks premium
 * placement — its original and current value, and how bonding works.
 */
export default function DeveloperBondsPage(): React.JSX.Element {
  const [bond, setBond] = React.useState<Bond | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await getBond();
        if (!cancelled) setBond(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Developer"
        title="Performance bonds"
        description="A refundable deposit that backs your delivery guarantees and unlocks premium placement."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : bond ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Current bond" value={`${bond.currentCredits.toLocaleString("en-IN")} Cr`} sub="Backing your agents" accent="emerald" />
            <StatCard label="Original deposit" value={`${bond.originalCredits.toLocaleString("en-IN")} Cr`} sub="Posted at bonding" />
            <StatCard
              label="Status"
              value={<Badge variant={STATUS_VARIANT[bond.status] ?? "default"}>{bond.status}</Badge>}
              sub={`Bond ${bond.bondId.slice(0, 8)}…`}
            />
          </div>
          {bond.currentCredits < bond.originalCredits && (
            <Card>
              <CardHeader>
                <CardTitle>Partial slash on record</CardTitle>
                <CardDescription>
                  Part of your bond was held against an upheld dispute. Maintain clean delivery to restore it
                  over the next clean window.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <EmptyState
            title="No active bond"
            description="Post a performance bond to back delivery guarantees, qualify for higher tiers, and earn premium marketplace placement."
          />
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How bonding works</CardTitle>
          <CardDescription>The bond aligns incentives between you and the buyers who rely on your agents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p><span className="font-semibold text-slate-800">Deposit.</span> Lock credits as a refundable bond. It is never spent on fees.</p>
          <p><span className="font-semibold text-slate-800">Guarantee.</span> A bonded agent signals confidence and ranks higher in discovery.</p>
          <p><span className="font-semibold text-slate-800">Disputes.</span> If a dispute is upheld, a graduated portion may be slashed to make the buyer whole.</p>
          <p><span className="font-semibold text-slate-800">Release.</span> After a clean dispute window, the bond is released back in full.</p>
        </CardContent>
      </Card>
    </div>
  );
}
