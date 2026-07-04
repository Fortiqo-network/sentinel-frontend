import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileSettingsCard } from "@/components/portal/ProfileSettingsCard";
import { ConnectedAccountsCard } from "@/components/portal/ConnectedAccountsCard";

export const metadata: Metadata = {
  title: "Settings · Sentinel Seller",
  description: "Manage your seller profile, avatar, and sign-in methods.",
};

/**
 * Seller settings: profile (name + avatar) and connected sign-in methods.
 */
export default function SellerSettingsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader eyebrow="Seller" title="Settings" description="Manage your profile and how you sign in." />
      <ProfileSettingsCard />
      <ConnectedAccountsCard activeMethod="email" />
    </div>
  );
}
