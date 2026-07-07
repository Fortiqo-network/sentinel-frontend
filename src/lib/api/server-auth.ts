import { cookies } from "next/headers";
import { GATEWAY_URL, SESSION_COOKIE } from "@/lib/bff/gateway";
import { UserSchema } from "@/lib/api/auth";
import type { User } from "@/types/user";

/**
 * Reads the session cookie server-side and fetches the current user from the
 * gateway.
 *
 * Returns null ONLY for a definitive "not authenticated" outcome — no session
 * cookie, or the gateway answering 401/403 (invalid/expired token). Layouts
 * redirect to /login on null, so this distinction matters: a transient upstream
 * problem (5xx / network / timeout) must NOT be reported as null, or a brief
 * backend hiccup would log a valid user out on the next protected navigation
 * (the reported "sometimes throws me to login" bug). Transient failures are
 * retried a few times; if they persist, this throws (the nearest error boundary
 * renders and the session is preserved) rather than silently logging out.
 *
 * Import only from server components and route handlers.
 */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const attempts = 3;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(`${GATEWAY_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      // Definitive auth failure — the session is invalid/expired. Log out.
      if (res.status === 401 || res.status === 403) return null;
      if (res.ok) return UserSchema.parse(await res.json());
      // Anything else (5xx/502/503) is a transient upstream problem — retry.
    } catch {
      // Network error / timeout — transient — retry.
    }
    if (attempt < attempts - 1) {
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  // Persistent upstream failure: do not force a logout on a backend blip.
  throw new Error("auth_service_unavailable");
}
