import { z } from "zod";
import { apiClient } from "./client";
import type { Agent, AgentListResponse } from "@/types/agent";

// ── Zod schemas (mirror sentinel-shared; update via codegen) ─────────────────

export const PricingSchema = z.object({
  model: z.enum(["per_call", "per_task", "per_outcome", "subscription", "credits"]),
  priceCredits: z.number().int().min(0).optional(),
});

export const AgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  trustScore: z.number().int().min(0).max(100),
  tier: z.enum(["verified", "managed", "registry", "proxy"]),
  tags: z.array(z.string()),
  vertical: z.string().optional(),
  pricing: PricingSchema.optional(),
  icon: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  developer: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  lastVerifiedAt: z.string().datetime().optional(),
  // Optional links surfaced on the agent detail page (provided by the gateway
  // when available; the page also derives standard integration URLs itself).
  repoUrl: z.string().url().optional(),
  homepageUrl: z.string().url().optional(),
  docsUrl: z.string().url().optional(),
  endpointUrl: z.string().url().optional(),
  metadataUrl: z.string().url().optional(),
  health: z
    .object({
      status: z.enum(["active", "inactive", "unknown"]),
      lastCheckAt: z.string().datetime().nullable().optional(),
    })
    .optional(),
  isDiscontinued: z.boolean().optional(),
});

export const AgentListResponseSchema = z.object({
  agents: z.array(AgentSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

// ── Query parameter schema ───────────────────────────────────────────────────

export const AgentListParamsSchema = z.object({
  q: z.string().optional(),
  tier: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  minTrust: z.number().int().min(0).max(100).optional(),
  maxTrust: z.number().int().min(0).max(100).optional(),
  sort: z.enum(["trust_desc", "trust_asc", "newest", "popular"]).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  includeDiscontinued: z.boolean().optional(),
});

export type AgentListParams = z.infer<typeof AgentListParamsSchema>;

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Fetches a paginated list of verified agents from the gateway.
 * Validates the response shape against the zod schema.
 */
export async function listAgents(params?: AgentListParams): Promise<AgentListResponse> {
  const response = await apiClient.get<unknown>("/v1/listings", { params });
  return AgentListResponseSchema.parse(response.data);
}

/**
 * Fetches a single agent by its ID.
 * Returns null if the gateway returns 404.
 */
export async function getAgent(id: string): Promise<Agent | null> {
  try {
    const response = await apiClient.get<unknown>(`/v1/listings/${id}`);
    return AgentSchema.parse(response.data);
  } catch {
    return null;
  }
}

/**
 * Fetches a single agent by its URL slug.
 */
export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  try {
    const response = await apiClient.get<unknown>(`/v1/listings/slug/${slug}`);
    return AgentSchema.parse(response.data);
  } catch {
    return null;
  }
}

// ── Trust report ──────────────────────────────────────────────────────────────

export const ReportDimensionSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number().int().min(0).max(100).nullable(),
  status: z.enum(["assessed", "pending", "deferred"]),
  weight: z.number().int().optional(),
});

export const AgentReportSchema = z.object({
  agentId: z.string(),
  scoreDisplay: z.number().int().min(0).max(100),
  certStatus: z.enum(["certified_managed", "certified", "provisional", "uncertified"]),
  rubricVersion: z.string().optional(),
  dimensions: z.array(ReportDimensionSchema).default([]),
  findingsSummary: z
    .object({
      critical: z.number().int(),
      high: z.number().int(),
      medium: z.number().int(),
      low: z.number().int(),
      info: z.number().int(),
    })
    .partial()
    .optional(),
  stagesDeferred: z.array(z.string()).default([]),
  generatedAt: z.string().optional(),
});

export type ReportDimension = z.infer<typeof ReportDimensionSchema>;
export type AgentReport = z.infer<typeof AgentReportSchema>;

/**
 * Fetches the full trust report for an agent. Returns null when no report API
 * is available yet (the agent page then renders the average score with honest
 * per-dimension "pending" states rather than a blank or fabricated breakdown).
 */
export async function getAgentReport(slug: string): Promise<AgentReport | null> {
  try {
    const response = await apiClient.get<unknown>(`/v1/listings/slug/${slug}/report`);
    return AgentReportSchema.parse(response.data);
  } catch {
    return null;
  }
}

// ── Use (pay-and-use) ─────────────────────────────────────────────────────────

export const UseAgentResultSchema = z.object({
  success: z.boolean(),
  agent: z.string(),
  costCredits: z.number().int(),
  balanceCredits: z.number().int().nullable(),
  // Real agents return arbitrary JSON; the UI renders it flexibly.
  output: z.unknown(),
  traceId: z.string().optional(),
});

export type UseAgentResult = z.infer<typeof UseAgentResultSchema>;

/**
 * Runs an agent (addressed as developer/slug) and charges the caller's wallet
 * in credits for one successful call. Throws a SentinelApiError with statusCode
 * 402 when credits are insufficient.
 */
export async function runAgent(developer: string, slug: string): Promise<UseAgentResult> {
  const response = await apiClient.post<unknown>(`/v1/agents/${developer}/${slug}/use`, {});
  return UseAgentResultSchema.parse(response.data);
}
