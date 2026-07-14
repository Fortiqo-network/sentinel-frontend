import type { Metadata } from "next";
import { ActivityFeed } from "@/components/marketplace/ActivityFeed";

export const metadata: Metadata = {
  title: "Live Activity — Recent Verifications on Sentinel",
  description:
    "A live feed of recent verification activity across the Sentinel AI agent marketplace — see agents being verified and scored in real time.",
  alternates: { canonical: "/activity" },
  openGraph: {
    type: "website",
    title: "Live Activity — Recent Verifications on Sentinel",
    description:
      "A live feed of recent verification activity across the Sentinel AI agent marketplace.",
    url: "/activity",
  },
};

/**
 * Standalone public activity page. Renders the live {@link ActivityFeed} of
 * recent verification events on the marketplace ink surface.
 */
export default function ActivityPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <div className="mb-10">
        <span className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">
          Live feed
        </span>
        <h1 className="mt-3 text-4xl font-semibold text-porcelain">Activity</h1>
        <p className="mt-3 max-w-2xl text-base text-porcelain/55">
          Recent verification activity across the Sentinel marketplace — agents being
          independently verified and scored, as it happens.
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
