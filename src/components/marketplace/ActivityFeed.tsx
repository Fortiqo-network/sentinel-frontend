"use client";

import * as React from "react";
import Link from "next/link";
import { getActivityFeed, type ActivityItem } from "@/lib/api/agents";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Public liveness feed for the marketplace — recent verification events for live
 * agents, newest first. Renders nothing until loaded or when there is no
 * activity yet.
 *
 * @example
 * <ActivityFeed />
 */
export function ActivityFeed(): React.JSX.Element | null {
  const [items, setItems] = React.useState<ActivityItem[] | null>(null);

  React.useEffect(() => {
    void getActivityFeed(10).then(setItems);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-porcelain">Recent activity</h2>
      <ul className="glass ring-hairline divide-y divide-porcelain/10 rounded-2xl">
        {items.map((it, i) => (
          <li
            key={`${it.agent_slug}-${it.at}-${i}`}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <Link
                href={`/agents/${it.agent_slug}`}
                className="text-sm font-medium text-porcelain hover:text-gold"
              >
                {it.agent_name}
              </Link>
              <span className="ml-2 text-xs text-porcelain/40">
                verified{it.seller_handle ? ` · @${it.seller_handle}` : ""}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {it.trust_score !== null && (
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                  {Math.round(it.trust_score)}
                </span>
              )}
              <span className="text-xs text-porcelain/40">{timeAgo(it.at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
