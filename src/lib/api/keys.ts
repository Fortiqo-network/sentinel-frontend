import { z } from "zod";
import { apiClient } from "./client";

export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  prefix: z.string(),
  scopes: z.array(z.string()),
  isActive: z.boolean(),
  lastUsedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

export const ApiKeyCreatedSchema = ApiKeySchema.extend({
  key: z.string(),
});

export type ApiKeyCreated = z.infer<typeof ApiKeyCreatedSchema>;

/** Lists the authenticated user's API keys (secrets are never returned). */
export async function listKeys(): Promise<ApiKey[]> {
  const response = await apiClient.get<unknown>("/v1/keys");
  return z.array(ApiKeySchema).parse(response.data);
}

/** Creates a new API key; the full secret is present only on this response. */
export async function createKey(name: string): Promise<ApiKeyCreated> {
  const response = await apiClient.post<unknown>("/v1/keys", { name });
  return ApiKeyCreatedSchema.parse(response.data);
}

/** Revokes an API key by id. */
export async function revokeKey(id: string): Promise<void> {
  await apiClient.delete(`/v1/keys/${id}`);
}
