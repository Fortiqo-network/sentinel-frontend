"use client";

import * as React from "react";
import type { Agent } from "@/types/agent";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { listAgents } from "@/lib/api/agents";
import { cn } from "@/lib/utils/cn";

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
 * Agent discovery page. Fetches live agents from the gateway
 * (`GET /v1/listings`) on mount, then applies filters client-side for instant
 * interaction. The filter panel manages local state, hence "use client".
 */
export default function AgentsPage(): React.JSX.Element {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    listAgents({ sort: "trust_desc", pageSize: 100, page: 1 })
      .then((res) => {
        if (active) {
          setAgents(res.agents);
          setError(null);
        }
      })
      .catch(() => {
        if (active) setError("Could not load agents. Please try again shortly.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredAgents = React.useMemo(
    () => applyFilters(agents, filters),
    [agents, filters],
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
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl" aria-hidden="true">
                ⚠️
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Something went wrong
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">{error}</p>
            </div>
          ) : filteredAgents.length === 0 ? (
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
