import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileSettingsCard } from "@/components/portal/ProfileSettingsCard";
import { ConnectedAccountsCard } from "@/components/portal/ConnectedAccountsCard";
import { TwoFactorCard } from "@/components/portal/TwoFactorCard";

export const metadata: Metadata = {
  title: "Settings · Sentinel Seller",
  description: "Manage your seller profile, avatar, 2FA, and sign-in methods.",
};

/**
 * Seller settings: profile (name + avatar), two-factor auth, and connected
 * sign-in methods.
 */
export default function SellerSettingsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader eyebrow="Seller" title="Settings" description="Manage your profile and how you sign in." />
      <ProfileSettingsCard />
      <TwoFactorCard />
      <ConnectedAccountsCard activeMethod="email" />
    </div>
  );
}
