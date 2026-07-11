"use client";

import { WalletPanel } from "@/components/portal/WalletPanel";

/**
 * Buyer billing page — the shared wallet panel (balance, add funds, promo
 * redemption, invoices) with buyer-facing copy.
 */
export default function BillingPage(): React.JSX.Element {
  return (
    <WalletPanel
      title="Billing"
      description="Manage credits, top up your wallet, and view invoices."
      returnPath="/dashboard/billing"
    />
  );
}
