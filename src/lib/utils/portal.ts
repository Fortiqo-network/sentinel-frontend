/**
 * Maps a user role to its portal home and label. Centralised so every redirect
 * and nav link routes admins to /admin, developers to /developer, and everyone
 * else to the buyer dashboard — consistently.
 */
export function portalHome(role?: string | null): string {
  if (role === "admin") return "/admin";
  if (role === "developer") return "/developer";
  return "/dashboard";
}

export function portalLabel(role?: string | null): string {
  if (role === "admin") return "Admin Console";
  if (role === "developer") return "Developer Dashboard";
  return "Buyer Dashboard";
}
