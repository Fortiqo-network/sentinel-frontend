import { apiClient, isSentinelApiError } from "./client";

/** One linked federated identity on the account. */
export interface LinkedIdentity {
  provider: string;
  label: string | null;
  linked_at: string;
}

/** The account's sign-in methods. */
export interface AccountLinks {
  has_password: boolean;
  email: string;
  identities: LinkedIdentity[];
}

/** Conflict payload returned when an identity is already linked elsewhere. */
export interface LinkConflict {
  code: "identity_linked_elsewhere";
  provider: string;
  label: string | null;
  message: string;
}

/** Fetch the account's linked sign-in methods. */
export async function getLinks(): Promise<AccountLinks> {
  const res = await apiClient.get<AccountLinks>("/v1/auth/links");
  return res.data;
}

/**
 * Link a Google identity. When it already belongs to another account and
 * `confirm` is false, this rejects with a {@link LinkConflict} the caller can
 * surface in a confirmation dialog before retrying with `confirm: true`.
 */
export async function linkGoogle(credential: string, confirm = false): Promise<AccountLinks> {
  const res = await apiClient.post<AccountLinks>("/v1/auth/links/google", { credential, confirm });
  return res.data;
}

/** Unlink a sign-in method (refused by the API if it is the last one). */
export async function unlinkProvider(provider: string): Promise<AccountLinks> {
  const res = await apiClient.delete<AccountLinks>(`/v1/auth/links/${provider}`);
  return res.data;
}

/** Extract the linked-elsewhere conflict from a caught 409, or null. */
export function asLinkConflict(err: unknown): LinkConflict | null {
  if (isSentinelApiError(err) && err.statusCode === 409) {
    const body = (err as { body?: { detail?: unknown } }).body;
    const detail = body?.detail;
    if (
      detail &&
      typeof detail === "object" &&
      (detail as LinkConflict).code === "identity_linked_elsewhere"
    ) {
      return detail as LinkConflict;
    }
  }
  return null;
}
