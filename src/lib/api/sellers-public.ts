import { z } from "zod";
import { apiClient } from "./client";

// ── Schemas ──────────────────────────────────────────────────────────────────

export const PublicAgentSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  trustScore: z.number().int().min(0).max(100).nullable().optional(),
  ratingAvg: z.number().nullable().optional(),
  ratingCount: z.number().int().default(0),
  tier: z.enum(["managed", "proxy", "verified", "registry"]),
});

export type PublicAgentSummary = z.infer<typeof PublicAgentSummarySchema>;

export const SellerPublicProfileSchema = z.object({
  id: z.string().uuid(),
  handle: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),
  githubHandle: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  agents: z.array(PublicAgentSummarySchema).default([]),
});

export type SellerPublicProfile = z.infer<typeof SellerPublicProfileSchema>;

export const SellerPostSchema = z.object({
  id: z.string(),
  kind: z.enum(["impression", "article"]),
  title: z.string().nullable().optional(),
  bodyMd: z.string(),
  likeCount: z.number().int().default(0),
  commentCount: z.number().int().default(0),
  createdAt: z.string(),
});

export type SellerPost = z.infer<typeof SellerPostSchema>;

export const SellerFeedSchema = z.object({
  items: z.array(SellerPostSchema),
  total: z.number().int(),
});

export type SellerFeed = z.infer<typeof SellerFeedSchema>;

export const PostCommentSchema = z.object({
  id: z.string(),
  parentCommentId: z.string().nullable().optional(),
  authorId: z.string(),
  authorName: z.string().nullable().optional(),
  bodyMd: z.string(),
  createdAt: z.string(),
});

export type PostComment = z.infer<typeof PostCommentSchema>;

export const CommentListSchema = z.object({
  items: z.array(PostCommentSchema),
  total: z.number().int(),
});

export type CommentList = z.infer<typeof CommentListSchema>;

const LikeStateSchema = z.object({
  liked: z.boolean(),
  likeCount: z.number().int().default(0),
});

export type LikeState = z.infer<typeof LikeStateSchema>;

// ── Public reads ──────────────────────────────────────────────────────────────

/**
 * Fetches a seller's public profile (by handle or user id) including their
 * live agents. No authentication required — publicly accessible.
 */
export async function getSellerProfile(ref: string): Promise<SellerPublicProfile> {
  const response = await apiClient.get<unknown>(`/v1/sellers/${ref}`);
  return SellerPublicProfileSchema.parse(response.data);
}

/** Fetches a page of a seller's published feed (public). */
export async function getSellerPosts(ref: string, page = 1): Promise<SellerFeed> {
  const response = await apiClient.get<unknown>(`/v1/sellers/${ref}/posts`, {
    params: { page },
  });
  return SellerFeedSchema.parse(response.data);
}

/** Fetches a post's comments in thread order (public). */
export async function getComments(postId: string): Promise<CommentList> {
  const response = await apiClient.get<unknown>(`/v1/posts/${postId}/comments`);
  return CommentListSchema.parse(response.data);
}

// ── Authed writes (session cookie) ──────────────────────────────────────────────

/** Creates a post on the caller's own seller feed (seller role required). */
export async function createPost(input: {
  kind: "impression" | "article";
  title?: string | null;
  bodyMd: string;
}): Promise<SellerPost> {
  const response = await apiClient.post<unknown>("/v1/seller/posts", {
    kind: input.kind,
    title: input.title ?? null,
    body_md: input.bodyMd,
  });
  return SellerPostSchema.parse(response.data);
}

/** Likes a post (idempotent). Returns the new like state. */
export async function likePost(postId: string): Promise<LikeState> {
  const response = await apiClient.post<unknown>(`/v1/posts/${postId}/like`);
  return LikeStateSchema.parse(response.data);
}

/** Removes the caller's like (idempotent). */
export async function unlikePost(postId: string): Promise<LikeState> {
  const response = await apiClient.delete<unknown>(`/v1/posts/${postId}/like`);
  return LikeStateSchema.parse(response.data);
}

/** Adds a comment or a one-level reply to a post. */
export async function createComment(
  postId: string,
  bodyMd: string,
  parentCommentId?: string | null,
): Promise<PostComment> {
  const response = await apiClient.post<unknown>(`/v1/posts/${postId}/comments`, {
    body_md: bodyMd,
    parent_comment_id: parentCommentId ?? null,
  });
  return PostCommentSchema.parse(response.data);
}

/** Reports a post to the moderation queue. */
export async function reportPost(postId: string, reason: string, detail?: string): Promise<void> {
  await apiClient.post(`/v1/posts/${postId}/report`, { reason, detail: detail ?? null });
}

/** Reports a seller to the moderation queue. */
export async function reportSeller(ref: string, reason: string, detail?: string): Promise<void> {
  await apiClient.post(`/v1/sellers/${ref}/report`, { reason, detail: detail ?? null });
}
