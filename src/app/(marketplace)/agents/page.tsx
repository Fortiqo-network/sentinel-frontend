"use client";

import * as React from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { Agent } from "@/types/agent";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { listAgents, getFeaturedAgents } from "@/lib/api/agents";
import { EcosystemStats } from "@/components/marketplace/EcosystemStats";
import { LeaderboardSection } from "@/components/marketplace/LeaderboardSection";
import { ActivityFeed } from "@/components/marketplace/ActivityFeed";
import { getCategories } from "@/lib/api/categories";
import { cn } from "@/lib/utils/cn";

// ── Filter / sort types ───────────────────────────────────────────────────────

type TrustTier = "certified_managed" | "certified" | "provisional" | "all";
type PricingModel = "per_task" | "per_outcome" | "subscription" | "credits" | "all";
type SortKey = "trust_score" | "newest" | "popular";
// Category slugs are DB-managed (fetched from /v1/categories); a plain string
// keeps the type open while CATEGORY_OPTIONS remains the offline fallback.
type Category = string;

interface Filters {
  query: string;
  category: Category;
  trustTier: TrustTier;
  pricingModel: PricingModel;
  sort: SortKey;
  includeDiscontinued: boolean;
}

// ── Filter helpers ────────────────────────────────────────────────────────────

function deriveTrustTier(agent: Agent): TrustTier {
  if (agent.tier === "managed" && agent.trustScore >= 75) return "certified_managed";
  if (agent.trustScore >= 75) return "certified";
  if (agent.trustScore >= 50) return "provisional";
  return "all";
}

function applyFilters(agents: Agent[], filters: Filters): Agent[] {
  // The text query is handled server-side (ranked full-text + fuzzy match), so
  // it is intentionally NOT re-filtered here — a client-side substring pass
  // would drop the stemmed/typo matches the backend deliberately surfaced.
  let result = [...agents];

  if (filters.category !== "all") {
    result = result.filter((a) => a.tags.includes(filters.category));
  }

  if (filters.trustTier !== "all") {
    result = result.filter((a) => deriveTrustTier(a) === filters.trustTier);
  }

  if (filters.pricingModel !== "all") {
    result = result.filter((a) => a.pricing?.model === filters.pricingModel);
  }

  // While searching, keep the server's relevance ranking; only apply the chosen
  // sort when there is no active query.
  if (filters.query.trim() === "") {
    if (filters.sort === "trust_score") {
      result.sort((a, b) => b.trustScore - a.trustScore);
    } else if (filters.sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
      );
    }
  }

  // Discontinued agents always trail live ones, regardless of the chosen sort.
  const liveAgents = result.filter((a) => !a.isDiscontinued);
  const discontinuedAgents = result.filter((a) => a.isDiscontinued);
  return [...liveAgents, ...discontinuedAgents];
}

// ── Search bar ────────────────────────────────────────────────────────────────

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
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite"
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
        className="h-10 w-full rounded-lg border border-ink-600 bg-ink-800 py-2 pl-9 pr-4 text-sm text-porcelain placeholder:text-graphite focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
        aria-label="Search agents"
      />
    </div>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
  categoryOptions: Array<{ value: Category; label: string }>;
}

const CATEGORY_OPTIONS: Array<{ value: Category; label: string }> = [
  { value: "all",        label: "All Categories" },
  { value: "code",       label: "Code & Dev Tools" },
  { value: "data",       label: "Data & Analytics" },
  { value: "research",   label: "Research" },
  { value: "content",    label: "Content" },
  { value: "automation", label: "Automation" },
  { value: "legal",      label: "Legal" },
  { value: "finance",    label: "Finance" },
  { value: "support",    label: "Support" },
];

const TRUST_TIER_OPTIONS: Array<{ value: TrustTier; label: string; accent: string }> = [
  { value: "all",               label: "All Tiers",        accent: "" },
  { value: "certified_managed", label: "Certified Managed", accent: "text-sentinel-300" },
  { value: "certified",         label: "Certified (≥75)",   accent: "text-emerald-400" },
  { value: "provisional",       label: "Provisional (≥50)", accent: "text-amber-400" },
];

const PRICING_OPTIONS: Array<{ value: PricingModel; label: string }> = [
  { value: "all",          label: "All Models" },
  { value: "per_task",     label: "Per Call" },
  { value: "per_outcome",  label: "Per Token" },
  { value: "subscription", label: "Subscription" },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "trust_score", label: "Trust Score" },
  { value: "newest",      label: "Newest" },
  { value: "popular",     label: "Most Popular" },
];

function FilterSection({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <fieldset>
      <legend className="mb-2.5 font-brand-mono text-xs uppercase tracking-[0.2em] text-gold/80">
        {legend}
      </legend>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  );
}

function FilterOption({
  name,
  value,
  checked,
  label,
  accent,
  onChange,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  accent?: string;
  onChange: () => void;
}): React.JSX.Element {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-porcelain/65 transition-colors hover:bg-ink-700 hover:text-porcelain/90">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-gold"
      />
      <span className={accent ?? undefined}>{label}</span>
    </label>
  );
}

function FilterPanel({ filters, onChange, resultCount, categoryOptions }: FilterPanelProps): React.JSX.Element {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.trustTier !== "all" ||
    filters.pricingModel !== "all";

  return (
    <aside className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-porcelain/60">
          {resultCount} {resultCount === 1 ? "agent" : "agents"}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({ ...filters, category: "all", trustTier: "all", pricingModel: "all" })
            }
            className="font-brand-mono text-xs text-gold hover:text-gold/70"
          >
            Clear
          </button>
        )}
      </div>

      <FilterSection legend="Category">
        {categoryOptions.map(({ value, label }) => (
          <FilterOption
            key={value}
            name="category"
            value={value}
            checked={filters.category === value}
            label={label}
            onChange={() => update("category", value)}
          />
        ))}
      </FilterSection>

      <FilterSection legend="Trust Tier">
        {TRUST_TIER_OPTIONS.map(({ value, label, accent }) => (
          <FilterOption
            key={value}
            name="trustTier"
            value={value}
            checked={filters.trustTier === value}
            label={label}
            accent={accent || undefined}
            onChange={() => update("trustTier", value)}
          />
        ))}
      </FilterSection>

      <FilterSection legend="Pricing Model">
        {PRICING_OPTIONS.map(({ value, label }) => (
          <FilterOption
            key={value}
            name="pricingModel"
            value={value}
            checked={filters.pricingModel === value}
            label={label}
            onChange={() => update("pricingModel", value)}
          />
        ))}
      </FilterSection>

      <FilterSection legend="Sort By">
        {SORT_OPTIONS.map(({ value, label }) => (
          <FilterOption
            key={value}
            name="sort"
            value={value}
            checked={filters.sort === value}
            label={label}
            onChange={() => update("sort", value)}
          />
        ))}
      </FilterSection>

      <FilterSection legend="Advanced">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-porcelain/65 transition-colors hover:bg-ink-700 hover:text-porcelain/90">
          <input
            type="checkbox"
            checked={filters.includeDiscontinued}
            onChange={() => update("includeDiscontinued", !filters.includeDiscontinued)}
            className="accent-gold"
          />
          <span>Include discontinued</span>
        </label>
      </FilterSection>
    </aside>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl glass ring-hairline text-3xl"
        aria-hidden="true"
      >
        🔍
      </div>
      <h3 className="mt-5 text-lg font-semibold text-porcelain">No agents match your filters</h3>
      <p className="mt-2 max-w-sm text-sm text-porcelain/50">
        Try adjusting your search query, trust tier, or category to find verified agents.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg border border-ink-600 bg-ink-800 px-4 text-sm font-medium text-porcelain/70 transition-colors hover:bg-ink-700 hover:text-porcelain"
      >
        Reset all filters
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = {
  query:        "",
  category:     "all",
  trustTier:    "all",
  pricingModel: "all",
  sort:         "trust_score",
  includeDiscontinued: false,
};

/**
 * Agent discovery page. Fetches live agents from the gateway on mount, then
 * applies filters client-side for instant interaction. Rendered inside the
 * cinematic PageShell so it reads as a seamless extension of the homepage.
 */
export default function AgentsPage(): React.JSX.Element {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Debounce the search box so each keystroke doesn't hit the backend.
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(filters.query.trim()), 250);
    return () => clearTimeout(id);
  }, [filters.query]);

  // DB-managed categories — cached and shared across visits; keep the hardcoded
  // fallback if the API is empty (e.g. not yet deployed) so the filter never blanks.
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60_000,
  });
  const categoryOptions = React.useMemo<Array<{ value: Category; label: string }>>(() => {
    const cats = categoriesQuery.data ?? [];
    if (cats.length === 0) return CATEGORY_OPTIONS;
    return [
      { value: "all", label: "All Categories" },
      ...cats.map((c) => ({ value: c.slug, label: c.name })),
    ];
  }, [categoriesQuery.data]);

  // Editorially-curated featured agents (browse-only highlight) — cached.
  const featuredQuery = useQuery({
    queryKey: ["featured-agents", 6],
    queryFn: () => getFeaturedAgents(6),
    staleTime: 5 * 60_000,
  });
  const featured = featuredQuery.data ?? [];

  // The agent list, keyed by the active query + discontinued flag so each search
  // caches separately and revisiting one is instant. keepPreviousData holds the
  // last results on screen while a new search loads, so there's no spinner flash.
  const agentsQuery = useQuery({
    queryKey: ["marketplace-agents", debouncedQuery, filters.includeDiscontinued],
    queryFn: () =>
      listAgents({
        q: debouncedQuery || undefined,
        sort: "trust_desc",
        pageSize: 100,
        page: 1,
        includeDiscontinued: filters.includeDiscontinued,
      }),
    placeholderData: keepPreviousData,
  });
  const agents = React.useMemo(() => agentsQuery.data?.agents ?? [], [agentsQuery.data]);
  const loading = agentsQuery.isPending;
  const error = agentsQuery.isError ? "Could not load agents. Please try again shortly." : null;

  const filteredAgents = React.useMemo(() => applyFilters(agents, filters), [agents, filters]);

  const resetFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      {/* Page header */}
      <div className="mb-10">
        <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
          Marketplace
        </span>
        <h1 className="mt-3 text-4xl font-semibold text-porcelain">
          AI Agent Marketplace
        </h1>
        <p className="mt-3 max-w-2xl text-base text-porcelain/55">
          Every agent is independently verified. Browse by trust tier, category, or pricing model
          and invoke through REST, MCP, chat, or A2A.
        </p>
      </div>

      {/* Network-health stats */}
      <div className="mb-8">
        <EcosystemStats />
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
        <span className="text-sm text-porcelain/50">
          {filteredAgents.length} {filteredAgents.length === 1 ? "agent" : "agents"}
        </span>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
            mobileFiltersOpen
              ? "border-gold/30 bg-gold/10 text-gold"
              : "border-ink-600 bg-ink-800 text-porcelain/70 hover:bg-ink-700",
          )}
          aria-expanded={mobileFiltersOpen}
          aria-controls="filter-panel-mobile"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M1.5 3.75a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75ZM3.5 8a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3.5 8Zm2 4.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div
          id="filter-panel-mobile"
          className="mb-6 overflow-hidden rounded-2xl glass ring-hairline p-5 lg:hidden shadow-sm"
        >
          <FilterPanel filters={filters} onChange={setFilters} resultCount={filteredAgents.length} categoryOptions={categoryOptions} />
        </div>
      )}

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Sidebar — desktop only */}
        <div
          id="filter-panel"
          className="hidden shrink-0 lg:block"
          aria-label="Filter agents"
        >
          <div className="sticky top-32 w-56 overflow-hidden rounded-2xl glass ring-hairline p-5">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              resultCount={filteredAgents.length}
              categoryOptions={categoryOptions}
            />
          </div>
        </div>

        {/* Agent grid */}
        <div className="min-w-0 flex-1">
          {/* Editorially-featured agents — browse-only highlight (hidden while searching/filtering). */}
          {featured.length > 0 && filters.query.trim() === "" && filters.category === "all" && (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold/80">
                Featured
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featured.map((agent) => (
                  <AgentCard key={`featured-${agent.id}`} agent={agent} variant="dark" />
                ))}
              </div>
            </section>
          )}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 animate-pulse rounded-2xl bg-ink-800 ring-hairline"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl glass ring-hairline text-3xl"
                aria-hidden="true"
              >
                ⚠️
              </div>
              <h3 className="mt-5 text-lg font-semibold text-porcelain">Something went wrong</h3>
              <p className="mt-2 max-w-sm text-sm text-porcelain/50">{error}</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} variant="dark" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl space-y-16 px-5 pb-24">
        <LeaderboardSection />
        <ActivityFeed />
      </div>
    </div>
  );
}
