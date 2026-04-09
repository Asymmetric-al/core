import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Canonical TanStack Query keys for Supabase tables mirrored by query-db collections.
 * Keep in sync with `queryKey` in client-db collections and any `invalidateQueries` / realtime hooks.
 */
export const supabaseTableQueryKeys = {
  profiles: ["profiles"] as const,
  missionaries: ["missionaries"] as const,
  donors: ["donors"] as const,
  posts: ["posts"] as const,
  post_comments: ["post_comments"] as const,
  donations: ["donations"] as const,
  funds: ["funds"] as const,
  follows: ["follows"] as const,
} as const;

export type SupabaseTableQueryName = keyof typeof supabaseTableQueryKeys;

export function getSupabaseTableQueryKey(
  name: SupabaseTableQueryName,
): QueryKey {
  return [...supabaseTableQueryKeys[name]];
}

export async function invalidateSupabaseTableQuery(
  queryClient: QueryClient,
  name: SupabaseTableQueryName,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: getSupabaseTableQueryKey(name),
  });
}
