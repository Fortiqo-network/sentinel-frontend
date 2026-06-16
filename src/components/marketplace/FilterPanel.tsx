"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface FilterPanelProps {
  initialFilters?: {
    tier?: string;
    tag?: string;
    minTrust?: string;
    maxTrust?: string;
    q?: string;
    sort?: string;
    includeDiscontinued?: string;
  };
  className?: string;
}

const TIERS = [
  { value: "verified", label: "Verified" },
  { value: "managed", label: "Managed" },
  { value: "registry", label: "Registry" },
  { value: "proxy", label: "Proxy" },
];

const SORT_OPTIONS = [
  { value: "trust_desc", label: "Highest Trust" },
  { value: "trust_asc", label: "Lowest Trust" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
];

const POPULAR_TAGS = ["code", "data", "legal", "support", "finance", "content", "ml", "devtools"];

/**
 * Marketplace filter panel. Manages filter state via URL search params so
 * filters are bookmarkable and shareable. Server components read from searchParams;
 * this client component pushes updates.
 */
export function FilterPanel({ initialFilters = {}, className }: FilterPanelProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedTiers, setSelectedTiers] = React.useState<string[]>(
    initialFilters.tier ? [initialFilters.tier] : [],
  );
  const [selectedTags, setSelectedTags] = React.useState<string[]>(
    initialFilters.tag ? [initialFilters.tag] : [],
  );
  const [minTrust, setMinTrust] = React.useState(initialFilters.minTrust ?? "0");
  const [sort, setSort] = React.useState(initialFilters.sort ?? "trust_desc");
  const [includeDiscontinued, setIncludeDiscontinued] = React.useState(
    initialFilters.includeDiscontinued === "true",
  );

  const applyFilters = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedTiers.length > 0) {
      params.set("tier", selectedTiers.join(","));
    } else {
      params.delete("tier");
    }

    if (selectedTags.length > 0) {
      params.set("tag", selectedTags.join(","));
    } else {
      params.delete("tag");
    }

    if (minTrust !== "0") {
      params.set("minTrust", minTrust);
    } else {
      params.delete("minTrust");
    }

    params.set("sort", sort);

    if (includeDiscontinued) {
      params.set("includeDiscontinued", "true");
    } else {
      params.delete("includeDiscontinued");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [selectedTiers, selectedTags, minTrust, sort, includeDiscontinued, router, pathname, searchParams]);

  const resetFilters = React.useCallback(() => {
    setSelectedTiers([]);
    setSelectedTags([]);
    setMinTrust("0");
    setSort("trust_desc");
    setIncludeDiscontinued(false);
    router.push(pathname);
  }, [router, pathname]);

  const toggleTier = (tier: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Sort */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Sort By</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="sort"
                value={value}
                checked={sort === value}
                onChange={() => setSort(value)}
                className="accent-indigo-500"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Tier */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Tier</h3>
        <div className="space-y-1">
          {TIERS.map(({ value, label }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selectedTiers.includes(value)}
                onChange={() => toggleTier(value)}
                className="accent-indigo-500"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Min trust score */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Min Trust Score: <span className="text-indigo-600">{minTrust}</span>
        </h3>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={minTrust}
          onChange={(e) => setMinTrust(e.target.value)}
          className="w-full accent-indigo-500"
          aria-label={`Minimum trust score: ${minTrust}`}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>0</span>
          <span>100</span>
        </div>
      </section>

      {/* Tags */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                selectedTags.includes(tag)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Advanced */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Advanced</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={includeDiscontinued}
            onChange={() => setIncludeDiscontinued((v) => !v)}
            className="accent-indigo-500"
          />
          Include discontinued agents
        </label>
      </section>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={applyFilters} className="flex-1 bg-indigo-500 hover:bg-indigo-400">
          Apply
        </Button>
        <Button size="sm" variant="ghost" onClick={resetFilters}>
          Reset
        </Button>
      </div>
    </div>
  );
}
