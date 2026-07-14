"use client";

import * as React from "react";
import { AgentCard } from "./AgentCard";
import { getLeaderboard, type Leaderboard } from "@/lib/api/agents";
import type { Agent } from "@/types/agent";

const TABS = [
  { key: "topRated", label: "Top rated" },
  { key: "mostTrusted", label: "Most trusted" },
  { key: "mostReviewed", label: "Most reviewed" },
] as const;

/**
 * Public "Top agents" leaderboard with three ranking tabs (rating, trust score,
 * review count). Reuses `AgentCard`; renders nothing until loaded or when the
 * marketplace has no ranked agents.
 *
 * @example
 * <LeaderboardSection />
 */
export function LeaderboardSection(): React.JSX.Element | null {
  const [board, setBoard] = React.useState<Leaderboard | null>(null);
  const [tab, setTab] = React.useState<(typeof TABS)[number]["key"]>("topRated");

  React.useEffect(() => {
    void getLeaderboard(6).then(setBoard);
  }, []);

  if (!board) return null;
  const total = board.topRated.length + board.mostTrusted.length + board.mostReviewed.length;
  if (total === 0) return null;

  const agents: Agent[] = board[tab];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-porcelain">Top agents</h2>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors " +
                (tab === t.key
                  ? "bg-gold/15 text-gold"
                  : "text-porcelain/50 hover:text-porcelain/80")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {agents.length === 0 ? (
        <p className="text-sm text-porcelain/40">No agents in this ranking yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      )}
    </section>
  );
}
