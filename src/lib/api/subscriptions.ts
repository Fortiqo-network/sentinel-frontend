import { z } from "zod";
import { apiClient } from "./client";
import { AgentSchema } from "./agents";
import type { Agent } from "@/types/agent";

// ── Schemas ──────────────────────────────────────────────────────────────────

const SubscriptionListSchema = z.object({
  agents: z.array(AgentSchema),
});

const SubscriptionCreatedSchema = z.object({
  agentId: z.string(),
  createdAt: z.string(),
});

export type SubscriptionCreated = z.infer<typeof SubscriptionCreatedSchema>;

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Lists the agents the authenticated buyer has subscribed to ("starred"), as
 * full marketplace listings so they can be rendered directly in the portal.
 * Returns an empty list if the buyer has none or the endpoint is unavailable.
 */
export async function listSubscriptions(): Promise<Agent[]> {
  try {
    const response = await apiClient.get<unknown>("/v1/buyer/subscriptions");
    return SubscriptionListSchema.parse(response.data).agents;
  } catch {
    return [];
  }
}

/** Subscribes the buyer to an agent. Idempotent server-side. */
export async function subscribe(agentId: string): Promise<SubscriptionCreated> {
  const response = await apiClient.post<unknown>("/v1/buyer/subscriptions", { agentId });
  return SubscriptionCreatedSchema.parse(response.data);
}

/** Removes a buyer's subscription to an agent. */
export async function unsubscribe(agentId: string): Promise<void> {
  await apiClient.delete(`/v1/buyer/subscriptions/${agentId}`);
}
