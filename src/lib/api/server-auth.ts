import { cookies } from "next/headers";
import { GATEWAY_URL, SESSION_COOKIE } from "@/lib/bff/gateway";
import { UserSchema } from "@/lib/api/auth";
import type { User } from "@/types/user";

/**
 * Reads the session cookie server-side and fetches the current user from the
 * gateway. Returns null if the user is unauthenticated or on any network/parse
 * error. Import only from server components and route handlers.
 */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${GATEWAY_URL}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return UserSchema.parse(await res.json());
  } catch {
    return null;
  }
}
