import { z } from "zod";
import { apiClient } from "./client";

// ── Schemas ──────────────────────────────────────────────────────────────────

export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  read: z.boolean(),
  type: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

const NotificationListSchema = z.object({
  notifications: z.array(NotificationSchema),
});

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's notifications, newest first. Resolves to an
 * empty list if the endpoint is unavailable so the bell never breaks the header.
 */
export async function listNotifications(): Promise<Notification[]> {
  try {
    const response = await apiClient.get<unknown>("/v1/notifications");
    return NotificationListSchema.parse(response.data).notifications;
  } catch {
    return [];
  }
}

/** Marks the given notification ids (or all) as read. Returns the count updated. */
export async function markNotificationsRead(input: { ids?: string[]; all?: boolean }): Promise<number> {
  try {
    const response = await apiClient.post<unknown>("/v1/notifications/read", input);
    const parsed = z.object({ updated: z.number().int() }).safeParse(response.data);
    return parsed.success ? parsed.data.updated : 0;
  } catch {
    return 0;
  }
}
