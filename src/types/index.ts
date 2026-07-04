/**
 * Sentinel — Consolidated type definitions.
 *
 * This barrel re-exports all domain types and adds supplementary types that
 * span multiple domains. Individual domain type files remain authoritative;
 * this file avoids duplication by re-exporting them.
 *
 * Do not add business logic here — types only.
 */

// ── Re-exports from domain type files ────────────────────────────────────────

export type {
  PriceModel,
  AgentTier,
  Pricing,
  Agent,
  AgentListResponse,
  FindingSeverity,
  FindingCategory,
  VerificationFinding,
  VerificationReport,
} from "./agent";

export type {
  UserRole,
  User,
  SessionState,
} from "./user";

export type {
  CreditBalance,
  LedgerEntryType,
  LedgerEntry,
  InvoiceStatus,
  Invoice,
  Payout,
  EarningsSummary,
} from "./billing";

// ── Imports for use in extended types below ───────────────────────────────────

import type { AgentTier, Pricing, VerificationFinding } from "./agent";
import type { LedgerEntryType } from "./billing";

// ── Agent (extended) ──────────────────────────────────────────────────────────

/** Certification status returned by the verification pipeline. */
export type CertStatus =
  | "certified_managed"
  | "certified"
  | "conditional"
  | "failed"
  | "pending"
  | "not_submitted";

/** Publication lifecycle status of an agent. */
export type AgentStatus = "draft" | "pending_review" | "live" | "suspended" | "archived";

/** Owner summary embedded in agent listings. */
export interface AgentOwner {
  id: string;
  displayName: string;
  companyName?: string;
  avatarUrl?: string;
  /** Verified seller badge. */
  isVerifiedSeller: boolean;
}

/**
 * Full agent detail entity as returned by GET /v1/listings/{id}.
 * Extends the base Agent type with runtime fields.
 */
export interface AgentDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Extended markdown description rendered on the detail page. */
  longDescription?: string;
  trustScore: number;
  certStatus: CertStatus;
  /** Verification pipeline tier. */
  tier: AgentTier;
  status: AgentStatus;
  tags: string[];
  /** Business vertical (e.g. "Engineering", "Legal"). */
  vertical?: string;
  /** Pricing configuration. */
  pricing?: Pricing;
  /** Emoji or absolute URL for the agent avatar. */
  icon?: string;
  owner: AgentOwner;
  publishedAt?: string;
  lastVerifiedAt?: string;
  /** Number of unique buyers. */
  buyerCount?: number;
  /** Total invocations (all time). */
  invocationCount?: number;
}

// ── Trust report ──────────────────────────────────────────────────────────────

/** Result of a single verification stage within the pipeline. */
export interface StageResult {
  /** Machine-readable stage identifier. */
  stage:
    | "static_analysis"
    | "dependency_scan"
    | "dynamic_testing"
    | "prompt_injection";
  /** Human-readable stage label. */
  label: string;
  /** Pass/warn/fail status for this stage. */
  status: "pass" | "warn" | "fail" | "skipped";
  /** Score contribution from this stage (0–25 for a 4-stage pipeline). */
  score: number;
  /** Maximum possible score for this stage. */
  maxScore: number;
  /** Summary message. */
  summary: string;
  /** ISO datetime of when this stage completed. */
  completedAt: string;
  /** Individual findings produced by this stage. */
  findingCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

/**
 * Full trust report for a verified agent.
 * Returned by GET /v1/listings/{id}/trust-report.
 */
export interface TrustReport {
  agentId: string;
  /** Calibrated 0–100 overall trust score. */
  trustScore: number;
  certStatus: CertStatus;
  /** Ordered list of pipeline stage results. */
  stageResults: StageResult[];
  /** All findings across all stages. */
  findings: VerificationFinding[];
  /** Verification methodology version (e.g. "v2.1"). */
  methodologyVersion: string;
  /** ISO datetime of report generation. */
  generatedAt: string;
  /** ISO datetime this report expires / next re-verification due. */
  expiresAt?: string;
}

// ── Verification job ──────────────────────────────────────────────────────────

/** Status lifecycle for a verification job. */
export type VerificationJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Verification job entity.
 * Returned by POST /v1/agents/{id}/verify and GET /v1/jobs/{jobId}.
 */
export interface VerificationJob {
  id: string;
  agentId: string;
  status: VerificationJobStatus;
  /** Which pipeline stage is currently executing. */
  currentStage?: StageResult["stage"];
  /** Progress percentage (0–100). */
  progress: number;
  /** ISO datetime the job was created. */
  createdAt: string;
  /** ISO datetime the job started executing. */
  startedAt?: string;
  /** ISO datetime the job completed (success or failure). */
  completedAt?: string;
  /** Error message if status === "failed". */
  errorMessage?: string;
  /** Partial stage results available during execution. */
  stageResults: StageResult[];
}

// ── Transaction / ledger ──────────────────────────────────────────────────────

/** How a credit balance was topped up. */
export type TopUpMethod = "razorpay" | "stripe" | "manual_adjustment";

/** Extended ledger entry with payment context. */
export interface Transaction {
  id: string;
  /** Debit or credit. */
  type: LedgerEntryType;
  /** Amount in credits (1 USD = 100 credits). */
  amountCredits: number;
  /** Formatted human-readable amount (pre-computed by gateway). */
  amountFormatted: string;
  description: string;
  /** Agent that was invoked (debit entries only). */
  agentId?: string;
  agentName?: string;
  /** Razorpay/Stripe payment ID (credit entries only). */
  paymentId?: string;
  topUpMethod?: TopUpMethod;
  /** ISO datetime of the transaction. */
  createdAt: string;
  /** Running balance after this entry, in credits. */
  runningBalanceCredits?: number;
}

/** Paginated list of transactions. */
export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

// ── API key ───────────────────────────────────────────────────────────────────

/** Scopes that can be granted to an API key. */
export type ApiKeyScope = "invoke" | "read_listings" | "manage_agents" | "billing";

/**
 * API key metadata (the raw key is only returned once at creation time).
 * Returned by GET /v1/api-keys.
 */
export interface ApiKey {
  id: string;
  /** Display label set by the user. */
  name: string;
  /** Obfuscated key preview, e.g. "sk-•••••••••••XYZ". */
  keyPreview: string;
  scopes: ApiKeyScope[];
  /** ISO datetime the key was last used to make an authenticated request. */
  lastUsedAt?: string;
  /** Optional ISO datetime after which the key is automatically revoked. */
  expiresAt?: string;
  /** ISO datetime the key was created. */
  createdAt: string;
  /** Whether the key has been revoked. */
  isRevoked: boolean;
}

/** Response returned once when a new API key is created — includes the raw key. */
export interface ApiKeyCreatedResponse {
  apiKey: ApiKey;
  /**
   * The raw secret key. Only returned at creation time.
   * Store it immediately — the gateway does not store or re-expose it.
   */
  rawKey: string;
}

// ── Utility types ─────────────────────────────────────────────────────────────

/** Generic paginated response shape. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

/** Represents a loading/error/success async state. */
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
