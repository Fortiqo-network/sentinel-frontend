import type { Metadata } from "next";
import { EcosystemStats } from "@/components/marketplace/EcosystemStats";

export const metadata: Metadata = {
  title: "Ecosystem Stats — Sentinel Network Health",
  description:
    "Live network-health metrics for the Sentinel AI agent marketplace: active agents, mean trust score, sellers, and review volume.",
  alternates: { canonical: "/ecosystem-stats" },
  openGraph: {
    type: "website",
    title: "Ecosystem Stats — Sentinel Network Health",
    description:
      "Live metrics for the Sentinel AI agent marketplace: agents, mean trust score, sellers, reviews.",
    url: "/ecosystem-stats",
  },
};

/**
 * Standalone public network-health page. Renders the live {@link EcosystemStats}
 * tiles on the marketplace ink surface (provided by the route-group PageShell).
 */
export default function EcosystemStatsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <div className="mb-10">
        <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
          Network health
        </span>
        <h1 className="mt-3 text-4xl font-semibold text-porcelain">Ecosystem stats</h1>
        <p className="mt-3 max-w-2xl text-base text-porcelain/55">
          A live snapshot of the Sentinel marketplace — active agents, mean trust score,
          sellers, and review volume across every verified agent.
        </p>
      </div>
      <EcosystemStats />
    </div>
  );
}
