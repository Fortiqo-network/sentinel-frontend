"use client";

import * as React from "react";
import { AgentCard } from "./AgentCard";
import { getRelatedAgents } from "@/lib/api/agents";
import type { Agent } from "@/types/agent";

/**
 * Discovery footer for an agent detail page: other agents by the same developer
 * and similar agents in the same vertical. Renders nothing until at least one
 * related agent is found.
 *
 * @example
 * <RelatedAgents agentId={agent.id} />
 */
export function RelatedAgents({ agentId }: { agentId: string }): React.JSX.Element | null {
  const [more, setMore] = React.useState<Agent[]>([]);
  const [similar, setSimilar] = React.useState<Agent[]>([]);

  React.useEffect(() => {
    void getRelatedAgents(agentId).then((r) => {
      setMore(r.moreFromDeveloper);
      setSimilar(r.similar);
    });
  }, [agentId]);

  if (more.length === 0 && similar.length === 0) return null;

  return (
    <div className="space-y-10">
      {more.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-porcelain">More from this developer</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </section>
      )}
      {similar.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-porcelain">Similar agents</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
