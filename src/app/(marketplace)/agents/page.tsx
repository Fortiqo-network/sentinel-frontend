"use client";

import * as React from "react";
import type { Agent } from "@/types/agent";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { cn } from "@/lib/utils/cn";

// ── Extended mock data ────────────────────────────────────────────────────────

const ALL_AGENTS_MOCK: Agent[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "CodeReview Pro",
    slug: "codereview-pro",
    description:
      "Automated pull-request reviews with security, style, and correctness checks. Integrates with GitHub, GitLab, and Bitbucket via webhook. Returns structured JSON findings with fix suggestions.",
    trustScore: 94,
    tier: "verified",
    tags: ["code", "devtools", "security", "github"],
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
    description:
      "Generates statistically realistic synthetic datasets for ML training and testing. Supports tabular, time-series, and text modalities. DPDP-compliant anonymisation built in.",
    trustScore: 81,
    tier: "verified",
    tags: ["data", "ml", "synthetic", "privacy"],
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
    description:
      "Drafts NDAs, service agreements, and standard commercial contracts under Indian law. Backed by a team of practising advocates. Reviewed every 90 days for regulatory changes.",
    trustScore: 76,
    tier: "managed",
    tags: ["legal", "documents", "contracts", "compliance"],
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
    description:
      "Handles L1 customer support queries with FAQ grounding and intelligent escalation logic. Integrates with Freshdesk, Zendesk, and Intercom. Reduces average handle time by 60%.",
    trustScore: 88,
    tier: "verified",
    tags: ["support", "customer-service", "chat", "automation"],
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
    description:
      "Produces SEO-optimised long-form articles with keyword research built in. Targets Google Search Console data via API and auto-adjusts heading structure for topical authority.",
    trustScore: 63,
    tier: "registry",
    tags: ["content", "seo", "writing", "marketing"],
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
    description:
      "Extracts line items, totals, GST breakdowns, and vendor data from PDF and image invoices. Handles multi-language documents and returns structured JSON ready for Tally or SAP import.",
    trustScore: 91,
    tier: "verified",
    tags: ["finance", "ocr", "extraction", "gst"],
    vertical: "Finance",
    icon: "🧾",
    pricing: { model: "per_task", pricePerTaskPaise: 3000 },
    publishedAt: "2025-12-05T00:00:00Z",
    lastVerifiedAt: "2026-06-03T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "ResearchDigest",
    slug: "researchdigest",
    description:
      "Ingests academic PDFs and produces structured literature reviews, citation graphs, and hypothesis summaries. Ideal for R&D teams running patent landscapes or market studies.",
    trustScore: 79,
    tier: "verified",
    tags: ["research", "summarisation", "academic", "pdf"],
    vertical: "Research",
    icon: "🔬",
    pricing: { model: "credits", creditsPerTask: 25 },
    publishedAt: "2026-02-14T00:00:00Z",
    lastVerifiedAt: "2026-06-02T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    name: "PipelineOrchestrator",
    slug: "pipeline-orchestrator",
    description:
      "Chains multiple Sentinel agents into declarative DAG workflows. Handles retry logic, fan-out parallelism, and webhook callbacks. Deploy multi-step automations in minutes.",
    trustScore: 85,
    tier: "managed",
    tags: ["automation", "orchestration", "workflow", "devtools"],
    vertical: "Engineering",
    icon: "🤖",
    pricing: { model: "subscription", subscriptionMonthlyPaise: 499900 },
    publishedAt: "2026-04-01T00:00:00Z",
    lastVerifiedAt: "2026-06-06T00:00:00Z",
  },
];

// ── Filter/sort types ─────────────────────────────────────────────────────────

type TrustTier = "certified_managed" | "certified" | "provisional" | "all";
type PricingModel = "per_task" | "per_outcome" | "subscription" | "credits" | "all";
type SortKey = "trust_score" | "newest" | "popular";
type Category =
  | "all"
  | "code"
  | "data"
  | "research"
  | "content"
  | "automation"
  | "legal"
  | "finance"
  | "support";

interface Filters {
  query: string;
  category: Category;
  trustTier: TrustTier;
  pricingModel: PricingModel;
  sort: SortKey;
}

// ── Filter helpers ────────────────────────────────────────────────────────────

function deriveTrustTier(agent: Agent): TrustTier {
  if (agent.tier === "managed" && agent.trustScore >= 75) return "certified_managed";
  if (agent.trustScore >= 75) return "certified";
  if (agent.trustScore >= 50) return "provisional";
  return "all"; // below threshold — treated as uncertified
}

function applyFilters(agents: Agent[], filters: Filters): Agent[] {
  let result = [...agents];

  if (filters.query.trim() !== "") {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (filters.category !== "all") {
    result = result.filter((a) => a.tags.includes(filters.category));
  }

  if (filters.trustTier !== "all") {
    result = result.filter((a) => deriveTrustTier(a) === filters.trustTier);
  }

  if (filters.pricingModel !== "all") {
    result = result.filter((a) => a.pricing?.model === filters.pricingModel);
  }

  if (filters.sort === "trust_score") {
    result.sort((a, b) => b.trustScore - a.trustScore);
  } else if (filters.sort === "newest") {
    result.sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
    );
  }
  // "popular" uses insertion order as proxy

  return result;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps): React.JSX.Element {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="search"
        placeholder="Search agents by name, description or tag…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label="Search agents"
      />
    </div>
  );
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}

const CATEGORY_OPTIONS: Array<{ value: Category; label: string }> = [
  { value: "all", label: "All Categories" },
  { value: "code", label: "Code & Dev Tools" },
  { value: "data", label: "Data & Analytics" },
  { value: "research", label: "Research" },
  { value: "content", label: "Content" },
  { value: "automation", label: "Automation" },
  { value: "legal", label: "Legal" },
  { value: "finance", label: "Finance" },
  { value: "support", label: "Support" },
];

const TRUST_TIER_OPTIONS: Array<{ value: TrustTier; label: string; colour: string }> = [
  { value: "all", label: "All Tiers", colour: "" },
  { value: "certified_managed", label: "Certified Managed", colour: "text-indigo-700" },
  { value: "certified", label: "Certified (≥75)", colour: "text-emerald-700" },
  { value: "provisional", label: "Provisional (≥50)", colour: "text-amber-700" },
];

const PRICING_OPTIONS: Array<{ value: PricingModel; label: string }> = [
  { value: "all", label: "All Models" },
  { value: "per_task", label: "Per Call" },
  { value: "per_outcome", label: "Per Token" },
  { value: "subscription", label: "Subscription" },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "trust_score", label: "Trust Score" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
];

function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps): React.JSX.Element {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.trustTier !== "all" ||
    filters.pricingModel !== "all";

  return (
    <aside className="w-full space-y-5 lg:w-56 lg:shrink-0">
      {/* Result count */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {resultCount} {resultCount === 1 ? "agent" : "agents"}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                category: "all",
                trustTier: "all",
                pricingModel: "all",
              })
            }
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Category */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Category
        </legend>
        <div className="space-y-1">
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="category"
                value={value}
                checked={filters.category === value}
                onChange={() => update("category", value)}
                className="accent-indigo-500"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Trust Tier */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Trust Tier
        </legend>
        <div className="space-y-1">
          {TRUST_TIER_OPTIONS.map(({ value, label, colour }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="trustTier"
                value={value}
                checked={filters.trustTier === value}
                onChange={() => update("trustTier", value)}
                className="accent-indigo-500"
              />
              <span className={colour || undefined}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Pricing Model */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pricing Model
        </legend>
        <div className="space-y-1">
          {PRICING_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="pricingModel"
                value={value}
                checked={filters.pricingModel === value}
                onChange={() => update("pricingModel", value)}
                className="accent-indigo-500"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Sort */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sort By
        </legend>
        <div className="space-y-1">
          {SORT_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="sort"
                value={value}
                checked={filters.sort === value}
                onChange={() => update("sort", value)}
                className="accent-indigo-500"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl" aria-hidden="true">
        🔍
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">No agents match your filters</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Try adjusting your search query, trust tier, or category to find verified agents.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        Reset all filters
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = {
  query: "",
  category: "all",
  trustTier: "all",
  pricingModel: "all",
  sort: "trust_score",
};

/**
 * Agent discovery page. Fully client-rendered to support instant filter
 * interaction without a server round-trip. Switch to server-side once the
 * gateway /v1/listings endpoint is live and can accept query params.
 *
 * @note This page is intentionally "use client" because the filter panel
 *       manages local state. Once gateway is live, extract the filter panel
 *       as a client island and keep the grid server-rendered.
 */
export default function AgentsPage(): React.JSX.Element {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const filteredAgents = React.useMemo(
    () => applyFilters(ALL_AGENTS_MOCK, filters),
    [filters],
  );

  const resetFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Agent Marketplace</h1>
        <p className="mt-2 text-slate-500">
          Every agent is independently verified. Browse by trust tier, category, or price model.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <SearchBar
          value={filters.query}
          onChange={(q) => setFilters((f) => ({ ...f, query: q }))}
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <span className="text-sm text-slate-500">
          {filteredAgents.length} {filteredAgents.length === 1 ? "agent" : "agents"}
        </span>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
            mobileFiltersOpen
              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
          aria-expanded={mobileFiltersOpen}
          aria-controls="filter-panel"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M1.5 3.75a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75ZM3.5 8a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3.5 8Zm2 4.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Mobile filters */}
      {mobileFiltersOpen && (
        <div
          id="filter-panel-mobile"
          className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 lg:hidden"
        >
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            resultCount={filteredAgents.length}
          />
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-8">
        {/* Sidebar — desktop only */}
        <div
          id="filter-panel"
          className="hidden lg:block"
          aria-label="Filter agents"
        >
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            resultCount={filteredAgents.length}
          />
        </div>

        {/* Agent grid */}
        <div className="min-w-0 flex-1">
          {filteredAgents.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
