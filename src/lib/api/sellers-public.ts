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
  tier: z.enum(["managed", "proxy", "verified", "registry"]),
});

export type PublicAgentSummary = z.infer<typeof PublicAgentSummarySchema>;

export const SellerPublicProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  agents: z.array(PublicAgentSummarySchema).default([]),
});

export type SellerPublicProfile = z.infer<typeof SellerPublicProfileSchema>;

// ── API function ──────────────────────────────────────────────────────────────

/**
 * Fetches a seller's public profile including their live agents.
 * No authentication required — publicly accessible.
 */
export async function getSellerProfile(userId: string): Promise<SellerPublicProfile> {
  const response = await apiClient.get<unknown>(`/v1/sellers/${userId}`);
  return SellerPublicProfileSchema.parse(response.data);
}
