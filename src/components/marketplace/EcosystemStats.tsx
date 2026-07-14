"use client";

import * as React from "react";
import { getEcosystemStats, type EcosystemStats as Stats } from "@/lib/api/agents";

function Tile({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <div className="glass ring-hairline rounded-xl px-4 py-3 text-center">
      <div className="text-2xl font-semibold text-porcelain">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-porcelain/45">{label}</div>
    </div>
  );
}

/**
 * Compact network-health bar for the marketplace — live agents, mean trust
 * score, sellers, and review volume. Public and non-money. Renders nothing until
 * the stats load or when the marketplace is empty.
 *
 * @example
 * <EcosystemStats />
 */
export function EcosystemStats(): React.JSX.Element | null {
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    void getEcosystemStats().then(setStats);
  }, []);

  if (!stats || stats.live_agents === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile value={stats.live_agents.toLocaleString()} label="Live agents" />
      <Tile
        value={stats.avg_trust_score !== null ? Math.round(stats.avg_trust_score).toString() : "—"}
        label="Avg trust"
      />
      <Tile value={stats.sellers.toLocaleString()} label="Sellers" />
      <Tile
        value={stats.total_reviews.toLocaleString()}
        label={stats.avg_rating !== null ? `Reviews · ${stats.avg_rating.toFixed(1)}★` : "Reviews"}
      />
    </div>
  );
}
