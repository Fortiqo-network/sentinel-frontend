import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/api/server-auth";
import { portalHome } from "@/lib/utils/portal";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

/**
 * Post-signup onboarding gate. New OAuth/EVM sign-ups land here to choose a role
 * (buyer or seller) and answer a few basics before the portal unlocks. Users who
 * are not signed in go to login; users who have already onboarded are sent to
 * their portal so this page is never a dead end.
 */
export default async function OnboardingPage(): Promise<React.JSX.Element> {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (!user.needsOnboarding) redirect(portalHome(user.role));

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6 text-porcelain">
      <OnboardingForm displayName={user.displayName ?? null} />
    </div>
  );
}
