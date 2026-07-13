import { z } from "zod";
import { apiClient } from "./client";

export const ReviewItemSchema = z.object({
  id: z.string(),
  rating: z.number().int(),
  body: z.string().nullable(),
  reviewer_name: z.string().nullable(),
  seller_response: z.string().nullable().optional(),
  seller_responded_at: z.string().nullable().optional(),
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

/** Agent owner: publicly reply to a review. Returns the updated review. */
export async function respondToReview(
  agentId: string,
  reviewId: string,
  response: string,
): Promise<ReviewItem> {
  const res = await apiClient.post<unknown>(
    `/v1/agents/${agentId}/reviews/${reviewId}/response`,
    { response },
  );
  return ReviewItemSchema.parse(res.data);
}

/** Agent owner: remove their reply to a review. Returns the updated review. */
export async function deleteReviewResponse(agentId: string, reviewId: string): Promise<ReviewItem> {
  const res = await apiClient.delete<unknown>(`/v1/agents/${agentId}/reviews/${reviewId}/response`);
  return ReviewItemSchema.parse(res.data);
}

/** Report a review for moderation (any signed-in user). */
export async function reportReview(
  agentId: string,
  reviewId: string,
  reason: string,
  details?: string,
): Promise<void> {
  await apiClient.post(`/v1/agents/${agentId}/reviews/${reviewId}/report`, {
    reason,
    details: details || null,
  });
}
