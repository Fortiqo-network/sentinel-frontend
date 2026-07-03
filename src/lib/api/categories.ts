import { z } from "zod";
import { apiClient } from "./client";

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  agentCount: z.number().int(),
});
export type Category = z.infer<typeof CategorySchema>;

/**
 * Returns the active marketplace categories (with live-agent counts) that power
 * the discovery filter. Falls back to an empty list if the service is down, so
 * the page renders without a hard dependency on categories.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get<unknown>("/v1/categories");
    return z.array(CategorySchema).parse(response.data);
  } catch {
    return [];
  }
}
