import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileSettingsCard } from "@/components/portal/ProfileSettingsCard";
import { ConnectedAccountsCard } from "@/components/portal/ConnectedAccountsCard";

export const metadata: Metadata = {
  title: "Settings · Sentinel Developer",
  description: "Manage your developer profile, avatar, and sign-in methods.",
};

/**
 * Developer settings: profile (name + avatar) and connected sign-in methods.
 */
export default function DeveloperSettingsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader eyebrow="Developer" title="Settings" description="Manage your profile and how you sign in." />
      <ProfileSettingsCard />
      <ConnectedAccountsCard activeMethod="email" />
    </div>
  );
}
