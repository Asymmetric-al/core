import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Canonical TanStack Query keys for Supabase tables mirrored by query-db collections.
 * Keep in sync with `queryKey` in client-db collections and any `invalidateQueries` / realtime hooks.
 */
export const supabaseTableQueryKeys = {
  profiles: ["profiles"] as const,
  missionaries: ["missionaries"] as const,
  donors: ["donors"] as const,
  donor_activities: ["donor_activities"] as const,
  donor_pledges: ["donor_pledges"] as const,
  posts: ["posts"] as const,
  post_comments: ["post_comments"] as const,
  donations: ["donations"] as const,
  funds: ["funds"] as const,
  follows: ["follows"] as const,
} as const;

export const adminSurfaceQueryKeys = {
  contributions: ["admin", "contributions"] as const,
  crmContacts: ["admin", "crm", "contacts"] as const,
  crmRecords: ["admin", "crm", "records", "infinite"] as const,
  crmRecordsInfinite: ["admin", "crm", "records", "infinite"] as const,
  tasks: ["admin", "tasks"] as const,
  taskStaff: ["admin", "tasks", "staff"] as const,
  taskLinkedEntities: ["admin", "tasks", "linked-entities"] as const,
  // Compatibility aliases for legacy mock care collections that still exist
  // in the repo but are no longer the authoritative member-care source.
  carePersonnel: ["admin", "care", "personnel"] as const,
  careActivity: ["admin", "care", "activity"] as const,
  memberCareDashboard: ["admin", "member-care", "dashboard"] as const,
  memberCareDetail: ["admin", "member-care", "detail"] as const,
  eventAttendees: ["admin", "events", "attendees"] as const,
  mobilizeCandidates: ["admin", "mobilize", "candidates"] as const,
  teams: ["admin", "teams"] as const,
  teamMembers: ["admin", "teams", "members"] as const,
  locations: ["admin", "locations"] as const,
  locationLinkedEntities: ["admin", "locations", "linked-entities"] as const,
} as const;

/**
 * Canonical TanStack Query keys for the Support Hub feature. All hooks under
 * `apps/admin/features/support-hub/hooks` build on these so cache fan-out
 * stays consistent and a later phase can rename a key in exactly one place.
 */
export const supportHubQueryKeys = {
  root: ["admin", "support"] as const,
  conversations: ["admin", "support", "conversations"] as const,
  conversation: (id: string) =>
    ["admin", "support", "conversations", id] as const,
  messagesAll: ["admin", "support", "messages"] as const,
  messages: (conversationId: string) =>
    ["admin", "support", "messages", conversationId] as const,
  labels: ["admin", "support", "labels"] as const,
  macros: ["admin", "support", "macros"] as const,
  cannedResponses: ["admin", "support", "canned-responses"] as const,
  savedViews: ["admin", "support", "saved-views"] as const,
  inboxes: ["admin", "support", "inboxes"] as const,
  inboxSettings: ["admin", "support", "inbox-settings"] as const,
  agents: ["admin", "support", "agents"] as const,
  teams: ["admin", "support", "teams"] as const,
  businessHours: ["admin", "support", "business-hours"] as const,
  slaPolicies: ["admin", "support", "sla-policies"] as const,
  stats: (inboxId: string | null) =>
    ["admin", "support", "stats", inboxId ?? "all"] as const,
  reports: (slice: string, inboxId: string | null) =>
    ["admin", "support", "reports", slice, inboxId ?? "all"] as const,
} as const;

export type SupabaseTableQueryName = keyof typeof supabaseTableQueryKeys;
export type AdminSurfaceQueryName = keyof typeof adminSurfaceQueryKeys;

export function getSupabaseTableQueryKey(
  name: SupabaseTableQueryName,
): QueryKey {
  return [...supabaseTableQueryKeys[name]];
}

export function getAdminSurfaceQueryKey(name: AdminSurfaceQueryName): QueryKey {
  return [...adminSurfaceQueryKeys[name]];
}

export async function invalidateSupabaseTableQuery(
  queryClient: QueryClient,
  name: SupabaseTableQueryName,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: getSupabaseTableQueryKey(name),
  });
}

export async function invalidateAdminSurfaceQuery(
  queryClient: QueryClient,
  name: AdminSurfaceQueryName,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: getAdminSurfaceQueryKey(name),
  });
}
