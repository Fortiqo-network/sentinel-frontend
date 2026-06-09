"use client";

import * as React from "react";
import { AgentCard } from "./AgentCard";
import { AgentCardSkeleton } from "@/components/ui/skeleton";
import type { Agent } from "@/types/agent";

interface AgentGridProps {
  agents: Agent[];
  /** When true, renders skeleton cards instead of real content. */
  isLoading?: boolean;
  /** Number of skeleton cards to show during loading. */
  skeletonCount?: number;
  className?: string;
}

/**
 * Responsive grid of AgentCard components. Renders skeletons during loading
 * and a friendly empty state when the agent list is empty.
 *
 * @example
 * <AgentGrid agents={agents} isLoading={isLoading} />
 */
export function AgentGrid({
  agents,
  isLoading = false,
  skeletonCount = 6,
  className,
}: AgentGridProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}
        aria-busy="true"
        aria-label="Loading agents"
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl">🔍</div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No agents found</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          Try adjusting your filters or search query to find verified agents.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}>
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
