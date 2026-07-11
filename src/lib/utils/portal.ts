/**
 * Maps a user role to its portal home and label. Centralised so every redirect
 * and nav link routes admins to /admin, sellers to /seller, and everyone
 * else to the buyer dashboard — consistently.
 */
export function portalHome(role?: string | null): string {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller";
  return "/dashboard";
}

export function portalLabel(role?: string | null): string {
  if (role === "admin") return "Admin Console";
  if (role === "seller") return "Seller Dashboard";
  return "Buyer Dashboard";
}

/**
 * Where to send a user right after login/register. The first-login wizard
 * (/onboarding) intercepts anyone with something left to complete: a forced
 * password rotation (admin-created accounts), the role/questions onboarding,
 * or Terms & Conditions acceptance. `?pw=1` offers the optional password step
 * on the account's very first sign-in.
 */
export function postAuthDestination(user: {
  role?: string | null;
  needsOnboarding?: boolean;
  mustChangePassword?: boolean;
  termsAcceptedAt?: string | null;
  firstLogin?: boolean;
}): string {
  const isAdmin = user.role === "admin";
  const needsWizard =
    user.mustChangePassword === true ||
    (!isAdmin && (user.needsOnboarding === true || !user.termsAcceptedAt));
  if (needsWizard) return user.firstLogin ? "/onboarding?pw=1" : "/onboarding";
  return portalHome(user.role);
}
