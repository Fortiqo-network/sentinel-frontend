/**
 * TypeScript types for Sentinel agent listings.
 *
 * These types are manually maintained until the codegen pipeline from
 * sentinel-shared is wired up. Do not add business logic here — types only.
 */

/** Supported price models for agent invocation. */
export type PriceModel = "per_call" | "per_task" | "per_outcome" | "subscription" | "credits";

/** Verification tier assigned after the Sentinel pipeline completes. */
export type AgentTier = "verified" | "managed" | "registry" | "proxy";

/** Endpoint liveness, checked on a schedule — independent of the trust score. */
export type HealthStatus = "active" | "inactive" | "unknown";

/** Periodic endpoint health for an agent listing. */
export interface AgentHealth {
  status: HealthStatus;
  /** ISO timestamp of the last health check, or null if never checked. */
  lastCheckAt?: string | null;
}

/** Pricing configuration for an agent listing, in credits (1 USD = 100 credits). */
export interface Pricing {
  model: PriceModel;
  /** Price per successful call, in credits. */
  priceCredits?: number;
}

/** Public agent listing as returned by GET /v1/listings/{id}. */
export interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Calibrated 0–100 trust score. Updated continuously. */
  trustScore: number;
  tier: AgentTier;
  tags: string[];
  /** Business vertical (e.g. "Engineering", "Legal"). Optional. */
  vertical?: string;
  pricing?: Pricing;
  /** Emoji or URL for the agent avatar. */
  icon?: string;
  ownerId?: string;
  /** Owning developer's URL handle (namespaces the agent). */
  developer?: string;
  publishedAt?: string;
  lastVerifiedAt?: string;
  /** Source/repository URL (e.g. GitHub), when the developer provides it. */
  repoUrl?: string;
  /** Public homepage/landing URL for the agent, when provided. */
  homepageUrl?: string;
  /** External documentation URL, when provided. */
  docsUrl?: string;
  /** The developer-hosted endpoint URL (Tier B), when exposed. */
  endpointUrl?: string;
  /** Canonical metadata-card URL; the detail page derives this if absent. */
  metadataUrl?: string;
  /** Periodic endpoint health (active/inactive/unknown) + last check time. */
  health?: AgentHealth;
  /** True when the agent is retired/discontinued (greyed, advanced-filter only). */
  isDiscontinued?: boolean;
}

/** Paginated response from GET /v1/listings. */
export interface AgentListResponse {
  agents: Agent[];
  total: number;
  page: number;
  pageSize: number;
}

/** Severity levels used in the verification findings report. */
export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

/** Category of a verification finding. */
export type FindingCategory =
  | "static_analysis"
  | "dependencies"
  | "dynamic_testing"
  | "prompt_injection"
  | "output_validation";

/** A single finding from the verification pipeline. */
export interface VerificationFinding {
  id: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  status: "open" | "remediated" | "accepted_risk";
  remediationNote?: string;
  detectedAt: string;
}

/** Full verification report for an agent. */
export interface VerificationReport {
  agentId: string;
  trustScore: number;
  tier: AgentTier;
  certificationStatus: "certified" | "conditional" | "failed" | "pending";
  findings: VerificationFinding[];
  lastVerifiedAt: string;
  methodology: string;
}
