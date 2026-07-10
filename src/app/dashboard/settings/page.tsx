import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileSettingsCard } from "@/components/portal/ProfileSettingsCard";
import { ConnectedAccountsCard } from "@/components/portal/ConnectedAccountsCard";
import { BecomeSellerCard } from "@/components/portal/BecomeSellerCard";

export const metadata: Metadata = {
  title: "Settings · Sentinel",
  description: "Manage your Sentinel profile, avatar, and sign-in methods.",
};

/**
 * Buyer settings: profile (name + avatar), connected sign-in methods, and the
 * one-way "become a seller" upgrade.
 */
export default function BuyerSettingsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile and how you sign in." />
      <ProfileSettingsCard />
      <BecomeSellerCard />
      <ConnectedAccountsCard activeMethod="email" />
    </div>
  );
}
