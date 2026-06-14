import { z } from "zod";
import { apiClient } from "./client";

// ── Schemas ──────────────────────────────────────────────────────────────────

/** Lifecycle states an agent moves through, as reported by core-api. */
export const DeveloperAgentStatusSchema = z.enum([
  "draft",
  "submitted",
  "verifying",
  "verified",
  "rejected",
  "live",
  "suspended",
  "retired",
]);

export type DeveloperAgentStatus = z.infer<typeof DeveloperAgentStatusSchema>;

export const DeveloperAgentSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: DeveloperAgentStatusSchema,
  tier: z.enum(["managed", "proxy"]),
  trustScore: z.number().int().min(0).max(100).nullable(),
  vertical: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DeveloperAgent = z.infer<typeof DeveloperAgentSchema>;

export const DeveloperAgentListSchema = z.object({
  agents: z.array(DeveloperAgentSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const CreateAgentRequestSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(128)
    .regex(/^[a-z0-9][a-z0-9-]{1,126}[a-z0-9]$/, "Lowercase letters, numbers and hyphens only."),
  name: z.string().min(1).max(256),
  description: z.string().optional(),
  tier: z.enum(["managed", "proxy"]).default("proxy"),
  vertical: z.string().max(64).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateAgentRequest = z.infer<typeof CreateAgentRequestSchema>;

export const UpdateAgentRequestSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  description: z.string().optional(),
  vertical: z.string().max(64).optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateAgentRequest = z.infer<typeof UpdateAgentRequestSchema>;

export const EarningsSchema = z.object({
  payableCredits: z.number().int().min(0),
  meetsMinimum: z.boolean(),
  payoutProvider: z.string().nullable().optional(),
});

export type Earnings = z.infer<typeof EarningsSchema>;

export const BondSchema = z.object({
  bondId: z.string(),
  status: z.string(),
  originalCredits: z.number().int().min(0),
  currentCredits: z.number().int().min(0),
});

export type Bond = z.infer<typeof BondSchema>;

// ── Agent CRUD ───────────────────────────────────────────────────────────────

/** Lists the authenticated developer's own agents. */
export async function listMyAgents(page = 1, pageSize = 50): Promise<DeveloperAgent[]> {
  const response = await apiClient.get<unknown>("/v1/developer/agents", {
    params: { page, pageSize },
  });
  return DeveloperAgentListSchema.parse(response.data).agents;
}

/** Fetches one of the developer's agents by id. */
export async function getMyAgent(id: string): Promise<DeveloperAgent> {
  const response = await apiClient.get<unknown>(`/v1/developer/agents/${id}`);
  return DeveloperAgentSchema.parse(response.data);
}

/** Creates a new draft agent owned by the developer. */
export async function createAgent(body: CreateAgentRequest): Promise<DeveloperAgent> {
  const response = await apiClient.post<unknown>("/v1/developer/agents", body);
  return DeveloperAgentSchema.parse(response.data);
}

/** Updates the editable metadata of one of the developer's agents. */
export async function updateAgent(id: string, body: UpdateAgentRequest): Promise<DeveloperAgent> {
  const response = await apiClient.patch<unknown>(`/v1/developer/agents/${id}`, body);
  return DeveloperAgentSchema.parse(response.data);
}

/** Deletes a draft or rejected agent. */
export async function deleteAgent(id: string): Promise<void> {
  await apiClient.delete(`/v1/developer/agents/${id}`);
}

/** Submits a draft agent into the verification pipeline. */
export async function submitAgent(id: string): Promise<DeveloperAgent> {
  const response = await apiClient.post<unknown>(`/v1/developer/agents/${id}/submit`, {});
  return DeveloperAgentSchema.parse(response.data);
}

// ── Earnings ─────────────────────────────────────────────────────────────────

/** Returns the developer's payout-eligible earnings, in credits. */
export async function getEarnings(): Promise<Earnings> {
  const response = await apiClient.get<unknown>("/v1/developer/earnings");
  return EarningsSchema.parse(response.data);
}

/** Returns the developer's active performance bond, or null if none is posted. */
export async function getBond(): Promise<Bond | null> {
  const response = await apiClient.get<unknown>("/v1/developer/bond");
  if (response.data === null) return null;
  return BondSchema.parse(response.data);
}

// ── Per-agent user access blocks ───────────────────────────────────────────────

export const AccessBlockSchema = z.object({
  userId: z.string(),
  email: z.string(),
  displayName: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type AccessBlock = z.infer<typeof AccessBlockSchema>;

const AccessBlockListSchema = z.object({ blocks: z.array(AccessBlockSchema) });

/** Lists the users the developer has blocked from one of their agents. */
export async function listAccessBlocks(agentId: string): Promise<AccessBlock[]> {
  const response = await apiClient.get<unknown>(`/v1/developer/agents/${agentId}/access-blocks`);
  return AccessBlockListSchema.parse(response.data).blocks;
}

/** Blocks a user (by email) from one of the developer's agents. */
export async function blockUser(agentId: string, email: string, reason?: string): Promise<AccessBlock> {
  const response = await apiClient.post<unknown>(`/v1/developer/agents/${agentId}/access-blocks`, {
    email,
    reason,
  });
  return AccessBlockSchema.parse(response.data);
}

/** Removes a user's block from one of the developer's agents. */
export async function unblockUser(agentId: string, userId: string): Promise<void> {
  await apiClient.delete(`/v1/developer/agents/${agentId}/access-blocks/${userId}`);
}
