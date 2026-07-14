import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/api/server-auth";
import { isAdminRole, portalHome } from "@/lib/utils/portal";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

/**
 * The first-login gate. Every new account lands here after its first sign-in:
 * an optional password change (forced for admin-created accounts), the
 * buyer/seller role choice, the onboarding questions, and the required Terms &
 * Conditions acceptance. Users who are not signed in go to login; users with
 * nothing left to complete are sent to their portal so this page is never a
 * dead end. Admins only see the password step.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ pw?: string }>;
}): Promise<React.JSX.Element> {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const isAdmin = isAdminRole(user.role);
  const mustChangePassword = user.mustChangePassword === true;
  const needsProfile = !isAdmin && (user.needsOnboarding === true || !user.termsAcceptedAt);
  if (!mustChangePassword && !needsProfile) redirect(portalHome(user.role));

  // ?pw=1 is set by the login/register forms on the account's FIRST sign-in —
  // the optional "change your password now" step is offered to everyone then.
  const { pw } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6 text-porcelain">
      <OnboardingForm
        displayName={user.displayName ?? null}
        mustChangePassword={mustChangePassword}
        isAdmin={isAdmin}
        offerPasswordChange={mustChangePassword || pw === "1"}
      />
    </div>
  );
}
