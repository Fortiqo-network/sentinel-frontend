import type { Metadata } from "next";
import { LeaderboardSection } from "@/components/marketplace/LeaderboardSection";

export const metadata: Metadata = {
  title: "Leaderboards — Top AI Agents on Sentinel",
  description:
    "The top live AI agents on Sentinel, ranked by rating, trust score, and review count — independently verified and updated continuously.",
  alternates: { canonical: "/leaderboards" },
  openGraph: {
    type: "website",
    title: "Leaderboards — Top AI Agents on Sentinel",
    description:
      "Top live AI agents ranked by rating, trust score, and review count. Independently verified.",
    url: "/leaderboards",
  },
};

/**
 * Standalone public leaderboards page. Renders {@link LeaderboardSection}
 * (top-rated, most-trusted, most-reviewed) on the marketplace ink surface.
 */
export default function LeaderboardsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <div className="mb-10">
        <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
          Rankings
        </span>
        <h1 className="mt-3 text-4xl font-semibold text-porcelain">Leaderboards</h1>
        <p className="mt-3 max-w-2xl text-base text-porcelain/55">
          The top live agents on Sentinel — ranked by rating, calibrated trust score, and
          review count. Every agent is independently verified.
        </p>
      </div>
      <LeaderboardSection />
    </div>
  );
}
