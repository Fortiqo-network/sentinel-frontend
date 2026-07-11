"use client";

import { WalletPanel } from "@/components/portal/WalletPanel";
import { RegistrationFeeCard } from "@/components/portal/RegistrationFeeCard";

/**
 * Seller wallet page — the same money surface as the buyer Billing page (add
 * funds, redeem promo codes, invoices) plus the one-time seller registration
 * fee. Sellers keep a buyer wallet: one balance funds both agent calls and the
 * registration fee.
 */
export default function SellerWalletPage(): React.JSX.Element {
  return (
    <WalletPanel
      title="Wallet"
      description="Add funds, redeem codes, and manage your one-time registration fee."
      returnPath="/seller/wallet"
      extra={<RegistrationFeeCard />}
    />
  );
}
