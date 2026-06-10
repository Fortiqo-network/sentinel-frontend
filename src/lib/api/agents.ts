import { z } from "zod";
import { apiClient } from "./client";
import type { Agent, AgentListResponse } from "@/types/agent";

// ── Zod schemas (mirror sentinel-shared; update via codegen) ─────────────────

export const PricingSchema = z.object({
  model: z.enum(["per_task", "per_outcome", "subscription", "credits"]),
  pricePerTaskPaise: z.number().int().min(0).optional(),
  subscriptionMonthlyPaise: z.number().int().min(0).optional(),
  creditsPerTask: z.number().int().min(0).optional(),
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
  publishedAt: z.string().datetime().optional(),
  lastVerifiedAt: z.string().datetime().optional(),
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

// ── Use (pay-and-use) ─────────────────────────────────────────────────────────

export const UseAgentResultSchema = z.object({
  success: z.boolean(),
  agent: z.string(),
  costPaise: z.number().int(),
  balancePaise: z.number().int(),
  output: z.object({
    result: z.string(),
    confidence: z.number().optional(),
  }),
  traceId: z.string().optional(),
});

export type UseAgentResult = z.infer<typeof UseAgentResultSchema>;

/**
 * Invokes an agent and charges the caller's wallet for one successful call.
 * Throws a SentinelApiError with statusCode 402 when credits are insufficient.
 */
export async function runAgent(slug: string): Promise<UseAgentResult> {
  const response = await apiClient.post<unknown>(`/v1/agents/${slug}/use`, {});
  return UseAgentResultSchema.parse(response.data);
}

// ── Mock data (remove once gateway /v1/listings is live) ─────────────────────

/** Static fixture agents used during development before the gateway is live. */
export const FEATURED_AGENTS_MOCK: Agent[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "CodeReview Pro",
    slug: "codereview-pro",
    description: "Automated pull-request reviews with security, style, and correctness checks.",
    trustScore: 94,
    tier: "verified",
    tags: ["code", "devtools", "security"],
    vertical: "Engineering",
    icon: "🔍",
    pricing: { model: "per_task", pricePerTaskPaise: 5000 },
    publishedAt: "2025-10-01T00:00:00Z",
    lastVerifiedAt: "2026-06-04T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "DataSynth",
    slug: "datasynth",
    description: "Generates realistic synthetic datasets for ML training and testing.",
    trustScore: 81,
    tier: "verified",
    tags: ["data", "ml", "synthetic"],
    vertical: "Data Science",
    icon: "📊",
    pricing: { model: "credits", creditsPerTask: 10 },
    publishedAt: "2025-11-15T00:00:00Z",
    lastVerifiedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "LegalDraft",
    slug: "legaldraft",
    description: "Drafts NDAs, service agreements, and standard commercial contracts.",
    trustScore: 76,
    tier: "managed",
    tags: ["legal", "documents", "contracts"],
    vertical: "Legal",
    icon: "⚖️",
    pricing: { model: "per_task", pricePerTaskPaise: 25000 },
    publishedAt: "2026-01-20T00:00:00Z",
    lastVerifiedAt: "2026-06-05T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "SupportBot",
    slug: "supportbot",
    description: "Handles L1 customer support queries with FAQ grounding and escalation logic.",
    trustScore: 88,
    tier: "verified",
    tags: ["support", "customer-service", "chat"],
    vertical: "Support",
    icon: "💬",
    pricing: { model: "subscription", subscriptionMonthlyPaise: 299900 },
    publishedAt: "2025-09-01T00:00:00Z",
    lastVerifiedAt: "2026-06-06T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "SEOWriter",
    slug: "seowriter",
    description: "Produces SEO-optimised long-form articles with keyword research built in.",
    trustScore: 63,
    tier: "registry",
    tags: ["content", "seo", "writing"],
    vertical: "Marketing",
    icon: "✍️",
    pricing: { model: "per_task", pricePerTaskPaise: 8000 },
    publishedAt: "2026-03-10T00:00:00Z",
    lastVerifiedAt: "2026-05-28T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "InvoiceParser",
    slug: "invoiceparser",
    description: "Extracts line items, totals, and vendor data from PDF and image invoices.",
    trustScore: 91,
    tier: "verified",
    tags: ["finance", "ocr", "extraction"],
    vertical: "Finance",
    icon: "🧾",
    pricing: { model: "per_task", pricePerTaskPaise: 3000 },
    publishedAt: "2025-12-05T00:00:00Z",
    lastVerifiedAt: "2026-06-03T00:00:00Z",
  },
];
