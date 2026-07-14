"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { becomeSeller } from "@/lib/api/auth";
import { isSentinelApiError } from "@/lib/api/client";
import { isAdminRole } from "@/lib/utils/portal";

type State = "idle" | "upgrading" | "error";

/**
 * "Become a seller" upgrade panel on the buyer settings page.
 *
 * Selling is a one-way capability upgrade — the account keeps its buyer role and
 * wallet and gains the ability to list agents and earn. Once enabled there is
 * deliberately NO path back to buyer-only, so the card renders a permanent
 * "seller enabled" state instead of a toggle. Admins don't see it.
 */
export function BecomeSellerCard(): React.JSX.Element | null {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [state, setState] = React.useState<State>("idle");

  // Capability check across the additive roles array, with a fallback to the
  // resolved portal role for older sessions that predate `roles`.
  const roles = user?.roles ?? [];
  const isSeller = roles.includes("seller") || user?.role === "seller";
  const isAdmin = roles.some(isAdminRole) || isAdminRole(user?.role);

  // Admins manage the platform, not a storefront — nothing to upgrade.
  if (isAdmin) return null;

  async function handleUpgrade(): Promise<void> {
    setState("upgrading");
    try {
      const updated = await becomeSeller();
      setUser(updated);
      // Land straight in the seller portal and refresh server components so the
      // seller nav/shell renders.
      router.push("/seller");
      router.refresh();
    } catch (err) {
      setState("error");
      if (!isSentinelApiError(err)) return;
    }
  }

  if (isSeller) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selling</CardTitle>
          <CardDescription>Selling is enabled on this account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true">
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.8a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-emerald-800 dark:text-emerald-200">
              <p className="font-medium">You&apos;re a seller.</p>
              <p className="mt-0.5 text-emerald-700/90 dark:text-emerald-200/80">
                You keep full buyer access too. Seller status is permanent — it can&apos;t be switched back to buyer-only.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/seller">Go to seller dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Become a seller</CardTitle>
        <CardDescription>List AI agents on the marketplace and earn from usage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5 text-sm text-slate-600 dark:text-porcelain/70">
          <li>• Publish self-hosted, x402, or MCP agents.</li>
          <li>• Get paid per call, withdraw once you reach the payout minimum.</li>
          <li>• Keep your buyer wallet and purchases — selling is added, not swapped.</li>
        </ul>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          Enabling selling is <span className="font-medium">permanent</span> — a seller account can&apos;t be switched back to buyer-only.
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => void handleUpgrade()} disabled={state === "upgrading"}>
            {state === "upgrading" ? "Enabling…" : "Become a seller"}
          </Button>
          {state === "error" && (
            <span className="text-sm text-rose-600 dark:text-rose-300">Could not enable selling. Try again.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
