import { z } from "zod";
import { apiClient } from "./client";

// ── Schemas ──────────────────────────────────────────────────────────────────

export const AdminAnalyticsSchema = z.object({
  users_total: z.number().int().min(0),
  developers: z.number().int().min(0),
  buyers: z.number().int().min(0),
  agents_total: z.number().int().min(0),
  agents_live: z.number().int().min(0),
  agents_disabled: z.number().int().min(0),
  health_active: z.number().int().min(0),
  health_inactive: z.number().int().min(0),
  agents_by_status: z.record(z.number().int()),
  gmv_credits: z.number().int().min(0).default(0),
  platform_revenue_credits: z.number().int().min(0).default(0),
  developer_earnings_credits: z.number().int().min(0).default(0),
  topups_credits: z.number().int().min(0).default(0),
  charges_count: z.number().int().min(0).default(0),
  revenue_30d_credits: z.number().int().min(0).default(0),
  charges_30d: z.number().int().min(0).default(0),
});

export type AdminAnalytics = z.infer<typeof AdminAnalyticsSchema>;

export const AdminAgentRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  status: z.string(),
  enabled: z.boolean(),
  featured: z.boolean().optional().default(false),
  health_status: z.string(),
  trust_score: z.number().nullable().optional(),
  owner_id: z.string(),
  owner_email: z.string().nullable().optional(),
  last_health_check_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export type AdminAgentRow = z.infer<typeof AdminAgentRowSchema>;

const AdminAgentListSchema = z.object({
  agents: z.array(AdminAgentRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
});

export const AdminDeveloperRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string().nullable().optional(),
  is_active: z.boolean(),
  agents: z.number().int().min(0),
  payable_units: z.number().int(),
  available_units: z.number().int(),
  created_at: z.string(),
});

export type AdminDeveloperRow = z.infer<typeof AdminDeveloperRowSchema>;

const AdminDeveloperListSchema = z.object({
  developers: z.array(AdminDeveloperRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
});

export const AdminUserRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string().nullable().optional(),
  roles: z.array(z.string()).default([]),
  is_active: z.boolean(),
  created_at: z.string(),
});

export type AdminUserRow = z.infer<typeof AdminUserRowSchema>;

const AdminUserListSchema = z.object({
  users: z.array(AdminUserRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
});

const SettleResponseSchema = z.object({
  developer_id: z.string(),
  settled_units: z.number().int(),
  available_units: z.number().int(),
});

export type SettleResult = z.infer<typeof SettleResponseSchema>;

const AgentStateSchema = z.object({
  agent_id: z.string(),
  status: z.string(),
  enabled: z.boolean(),
  health_status: z.string(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

export interface AdminAgentListResult {
  agents: AdminAgentRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminDeveloperListResult {
  developers: AdminDeveloperRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserListResult {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Reads ────────────────────────────────────────────────────────────────────

export const PlatformSettingsSchema = z.object({
  allow_http_agents: z.boolean(),
});

export type PlatformSettings = z.infer<typeof PlatformSettingsSchema>;

/** Read admin-tunable platform settings. */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const response = await apiClient.get<unknown>("/v1/admin/settings");
  return PlatformSettingsSchema.parse(response.data);
}

/** Update admin-tunable platform settings (e.g. allow http:// agents). */
export async function updatePlatformSettings(body: PlatformSettings): Promise<PlatformSettings> {
  const response = await apiClient.put<unknown>("/v1/admin/settings", body);
  return PlatformSettingsSchema.parse(response.data);
}

export const AdminDiagnosticsSchema = z.object({
  verify_reachable: z.boolean(),
  billing_reachable: z.boolean(),
  ed25519_required: z.boolean(),
  hmac_required: z.boolean(),
  allow_http_agents: z.boolean(),
  agents_submitted: z.number().int().min(0),
  agents_verifying: z.number().int().min(0),
  agents_stuck: z.number().int().min(0),
});

export type AdminDiagnostics = z.infer<typeof AdminDiagnosticsSchema>;

/** Verify-pipeline diagnostics (service reachability, signing config, stuck counts). */
export async function getDiagnostics(): Promise<AdminDiagnostics> {
  const response = await apiClient.get<unknown>("/v1/admin/diagnostics");
  return AdminDiagnosticsSchema.parse(response.data);
}

export const TopAgentRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  trust_score: z.number().nullable().optional(),
  subscribers: z.number().int().min(0),
  owner_email: z.string().nullable().optional(),
  gross_credits: z.number().int().min(0).default(0),
  platform_revenue_credits: z.number().int().min(0).default(0),
  charges_count: z.number().int().min(0).default(0),
});

export type TopAgentRow = z.infer<typeof TopAgentRowSchema>;

const TopAgentsSchema = z.object({
  agents: z.array(TopAgentRowSchema),
  ranked_by: z.enum(["revenue", "subscribers"]).default("subscribers"),
});

export type TopAgents = z.infer<typeof TopAgentsSchema>;

/** Top agents — by gross revenue when charges exist, else by subscribers. */
export async function getTopAgents(limit = 10): Promise<TopAgents> {
  const response = await apiClient.get<unknown>("/v1/admin/top-agents", { params: { limit } });
  return TopAgentsSchema.parse(response.data);
}

/** Platform analytics for the admin dashboard. */
export async function getAnalytics(): Promise<AdminAnalytics> {
  const response = await apiClient.get<unknown>("/v1/admin/analytics");
  return AdminAnalyticsSchema.parse(response.data);
}

/** Lists every agent (including disabled/retired) for moderation. */
export async function listAdminAgents(params?: {
  q?: string;
  status?: string;
  enabled?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<AdminAgentListResult> {
  const response = await apiClient.get<unknown>("/v1/admin/agents", {
    params: {
      q: params?.q || undefined,
      status: params?.status || undefined,
      enabled: params?.enabled,
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 50,
    },
  });
  const parsed = AdminAgentListSchema.parse(response.data);
  return { agents: parsed.agents, total: parsed.total, page: parsed.page, pageSize: parsed.page_size };
}

/** Lists developers with accrued + withdrawable balances. */
export async function listAdminDevelopers(params?: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminDeveloperListResult> {
  const response = await apiClient.get<unknown>("/v1/admin/developers", {
    params: {
      q: params?.q || undefined,
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 50,
    },
  });
  const parsed = AdminDeveloperListSchema.parse(response.data);
  return { developers: parsed.developers, total: parsed.total, page: parsed.page, pageSize: parsed.page_size };
}

/** Lists platform users for admin oversight. */
export async function listAdminUsers(params?: {
  q?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}): Promise<AdminUserListResult> {
  const response = await apiClient.get<unknown>("/v1/admin/users", {
    params: {
      q: params?.q || undefined,
      role: params?.role || undefined,
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 50,
    },
  });
  const parsed = AdminUserListSchema.parse(response.data);
  return { users: parsed.users, total: parsed.total, page: parsed.page, pageSize: parsed.page_size };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Disable an agent (hides it from the marketplace until re-enabled). */
export async function disableAgent(agentId: string): Promise<AgentState> {
  const response = await apiClient.post<unknown>(`/v1/admin/agents/${agentId}/disable`, {});
  return AgentStateSchema.parse(response.data);
}

/** Re-enable a previously disabled agent. */
export async function enableAgent(agentId: string): Promise<AgentState> {
  const response = await apiClient.post<unknown>(`/v1/admin/agents/${agentId}/enable`, {});
  return AgentStateSchema.parse(response.data);
}

/** Publish an agent to live (and enable it). */
export async function publishAgent(agentId: string): Promise<AgentState> {
  const response = await apiClient.post<unknown>(`/v1/admin/agents/${agentId}/publish`, {});
  return AgentStateSchema.parse(response.data);
}

/** Re-run verification for an agent (admin recovery for a stuck verdict). */
export async function reverifyAgent(agentId: string): Promise<AgentState> {
  const response = await apiClient.post<unknown>(`/v1/admin/agents/${agentId}/reverify`, {});
  return AgentStateSchema.parse(response.data);
}

/** Enable every agent (set enabled=true everywhere). Returns the count changed. */
export async function enableAllAgents(): Promise<number> {
  const response = await apiClient.post<{ enabled: number }>("/v1/admin/agents/enable-all", {});
  return response.data.enabled ?? 0;
}

const UserStateSchema = z.object({
  user_id: z.string(),
  is_active: z.boolean(),
  roles: z.array(z.string()).default([]),
});

export type UserState = z.infer<typeof UserStateSchema>;

/** Block (suspend) a user or developer — they can no longer log in. */
export async function blockUser(userId: string): Promise<UserState> {
  const response = await apiClient.post<unknown>(`/v1/admin/users/${userId}/block`, {});
  return UserStateSchema.parse(response.data);
}

/** Unblock (reinstate) a previously suspended user or developer. */
export async function unblockUser(userId: string): Promise<UserState> {
  const response = await apiClient.post<unknown>(`/v1/admin/users/${userId}/unblock`, {});
  return UserStateSchema.parse(response.data);
}

/** Settle a developer's accrued earnings (payable → withdrawable). */
export async function settleDeveloper(developerId: string): Promise<SettleResult> {
  const response = await apiClient.post<unknown>(`/v1/admin/developers/${developerId}/settle`, {});
  return SettleResponseSchema.parse(response.data);
}

/** Convert internal units to whole credits (1 credit = 100 units). */
export function unitsToCredits(units: number): number {
  return Math.round(units / 100);
}

// ── Moderation: abuse reports + kill-switch ─────────────────────────────────────

export const AbuseReportRowSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  reporter_id: z.string(),
  reason: z.string(),
  details: z.string().nullable(),
  status: z.enum(["open", "resolved", "dismissed"]),
  resolution_note: z.string().nullable(),
  created_at: z.string(),
});
export type AbuseReportRow = z.infer<typeof AbuseReportRowSchema>;

const AbuseReportListSchema = z.object({
  reports: z.array(AbuseReportRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  page_size: z.number().int(),
});

/** List abuse reports for the moderation queue (defaults to open only). */
export async function listAbuseReports(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ reports: AbuseReportRow[]; total: number }> {
  const response = await apiClient.get<unknown>("/v1/admin/abuse-reports", {
    params: {
      status: params?.status || undefined,
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 100,
    },
  });
  const parsed = AbuseReportListSchema.parse(response.data);
  return { reports: parsed.reports, total: parsed.total };
}

/** Resolve or dismiss an abuse report. */
export async function resolveAbuseReport(
  reportId: string,
  action: "resolve" | "dismiss",
  note?: string,
): Promise<AbuseReportRow> {
  const response = await apiClient.post<unknown>(`/v1/admin/abuse-reports/${reportId}/resolve`, {
    action,
    note,
  });
  return AbuseReportRowSchema.parse(response.data);
}

/** Kill-switch: suspend a live agent (delisted + blocked from invocation). */
export async function suspendAgent(agentId: string, reason?: string): Promise<AgentState> {
  const response = await apiClient.post<unknown>(`/v1/admin/agents/${agentId}/suspend`, { reason });
  return AgentStateSchema.parse(response.data);
}

/** Reverse a suspension, restoring the agent to live. */
export async function unsuspendAgent(agentId: string): Promise<AgentState> {
  const response = await apiClient.post<unknown>(`/v1/admin/agents/${agentId}/unsuspend`, {});
  return AgentStateSchema.parse(response.data);
}

/** Feature an agent on the marketplace home (optionally with a sort order). */
export async function featureAgent(agentId: string, order?: number): Promise<void> {
  await apiClient.post(`/v1/admin/agents/${agentId}/feature`, order == null ? {} : { order });
}

/** Remove an agent from the featured curation. */
export async function unfeatureAgent(agentId: string): Promise<void> {
  await apiClient.post(`/v1/admin/agents/${agentId}/unfeature`, {});
}
