import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { Agent, AgentListResponse } from "@/types/agent";
import type { User } from "@/types/user";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000";

// ── Trace ID ──────────────────────────────────────────────────────────────────

/**
 * Generates a UUID v4 suitable for use as a request trace ID.
 * Falls back to a timestamp-based ID if crypto.randomUUID is unavailable.
 */
function generateTraceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// ── Error types ───────────────────────────────────────────────────────────────

/** Structured error body returned by the Sentinel gateway. */
export interface GatewayErrorBody {
  error: string;
  message: string;
  statusCode: number;
  /** Seconds to wait before retrying (present on 429 responses). */
  retryAfter?: number;
  /** Trace ID for correlating with gateway logs. */
  traceId?: string;
}

/** Typed gateway error — wraps AxiosError with a parsed body. */
export class SentinelApiError extends Error {
  readonly statusCode: number;
  readonly body: GatewayErrorBody | undefined;
  readonly traceId: string | undefined;

  constructor(statusCode: number, body: GatewayErrorBody | undefined, traceId?: string) {
    super(body?.message ?? `Request failed with status ${statusCode}`);
    this.name = "SentinelApiError";
    this.statusCode = statusCode;
    this.body = body;
    this.traceId = traceId;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get retryAfterSeconds(): number | undefined {
    return this.body?.retryAfter;
  }
}

/**
 * Narrows a thrown value to SentinelApiError.
 * Use this in catch blocks instead of casting to `any`.
 */
export function isSentinelApiError(err: unknown): err is SentinelApiError {
  return err instanceof SentinelApiError;
}

// ── Axios instance ────────────────────────────────────────────────────────────

/**
 * Typed Axios instance pre-configured for the Sentinel gateway.
 *
 * - Injects X-Trace-Id on every request for distributed tracing.
 * - Credentials are sent as httpOnly cookies (withCredentials: true);
 *   no tokens are stored client-side.
 * - Handles 401 by redirecting to /login (token refresh is handled server-side
 *   in the BFF — if we receive a 401 here the session has truly expired).
 * - Handles 429 by surfacing the Retry-After header so the UI can back off.
 * - Wraps all error responses in {@link SentinelApiError} for typed handling.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: GATEWAY_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set("X-Trace-Id", generateTraceId());
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<GatewayErrorBody>) => {
    const statusCode = error.response?.status ?? 0;
    const body = error.response?.data;
    const traceId =
      error.response?.headers["x-trace-id"] as string | undefined;

    const apiError = new SentinelApiError(statusCode, body, traceId);

    if (statusCode === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return Promise.reject(apiError);
  },
);

// ── Typed API helpers ─────────────────────────────────────────────────────────

/**
 * Typed query parameters for listing agents from the marketplace.
 */
export interface GetAgentsParams {
  q?: string;
  tier?: string[];
  tags?: string[];
  minTrust?: number;
  maxTrust?: number;
  sort?: "trust_desc" | "trust_asc" | "newest" | "popular";
  page?: number;
  pageSize?: number;
}

/**
 * Fetches a paginated list of agent marketplace listings.
 * Validates the response via the zod schema in agents.ts before returning.
 *
 * Prefer using the typed wrappers in `src/lib/api/agents.ts` directly —
 * this helper is exposed here for convenience in server components.
 */
export async function getAgents(params?: GetAgentsParams): Promise<AgentListResponse> {
  // Dynamic import avoids circular dependency at module level.
  const { listAgents } = await import("./agents");
  return listAgents(params);
}

/**
 * Fetches a single agent listing by its slug.
 * Returns null when the gateway responds with 404.
 */
export async function getAgent(slug: string): Promise<Agent | null> {
  const { getAgentBySlug } = await import("./agents");
  return getAgentBySlug(slug);
}

/**
 * Returns featured/top-trust marketplace listings.
 * Equivalent to calling getAgents with sort=trust_desc and a small pageSize.
 */
export async function getMarketplaceListing(
  limit = 6,
): Promise<AgentListResponse> {
  return getAgents({ sort: "trust_desc", pageSize: limit, page: 1 });
}

/**
 * Returns the currently authenticated user's profile.
 * Returns null if the session cookie is absent or expired.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { getCurrentUser: fetchCurrentUser } = await import("./auth");
  return fetchCurrentUser();
}

export type { AxiosError };
