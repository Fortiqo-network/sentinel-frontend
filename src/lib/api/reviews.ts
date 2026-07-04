import { z } from "zod";
import { apiClient } from "./client";

export const ReviewItemSchema = z.object({
  id: z.string(),
  rating: z.number().int(),
  body: z.string().nullable(),
  reviewer_name: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

export const ReviewListSchema = z.object({
  items: z.array(ReviewItemSchema),
  total: z.number().int(),
  average: z.number().nullable(),
  count: z.number().int(),
});
export type ReviewList = z.infer<typeof ReviewListSchema>;

/** Fetches an agent's reviews + aggregate rating (public). */
export async function getReviews(agentId: string): Promise<ReviewList> {
  const response = await apiClient.get<unknown>(`/v1/agents/${agentId}/reviews`);
  return ReviewListSchema.parse(response.data);
}

/**
 * Writes or updates the caller's review. Throws a SentinelApiError with
 * statusCode 403 when the buyer hasn't subscribed to the agent.
 */
export async function submitReview(agentId: string, rating: number, body?: string): Promise<void> {
  await apiClient.post(`/v1/agents/${agentId}/reviews`, { rating, body: body || null });
}

/** Deletes the caller's own review. */
export async function deleteMyReview(agentId: string): Promise<void> {
  await apiClient.delete(`/v1/agents/${agentId}/reviews/me`);
}
