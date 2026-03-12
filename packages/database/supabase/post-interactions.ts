import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserPostInteractionRow {
  post_id: string;
  user_liked: boolean;
  user_prayed: boolean;
  user_fired: boolean;
}

export interface UserPostInteractionSets {
  likedPostIds: Set<string>;
  prayedPostIds: Set<string>;
  firedPostIds: Set<string>;
}

function normalizePostIds(postIds: string[]) {
  return Array.from(
    new Set(postIds.map((postId) => postId.trim()).filter(Boolean)),
  );
}

export function toUserPostInteractionSets(rows: UserPostInteractionRow[]) {
  const likedPostIds = new Set<string>();
  const prayedPostIds = new Set<string>();
  const firedPostIds = new Set<string>();

  for (const row of rows) {
    if (row.user_liked) likedPostIds.add(row.post_id);
    if (row.user_prayed) prayedPostIds.add(row.post_id);
    if (row.user_fired) firedPostIds.add(row.post_id);
  }

  return {
    likedPostIds,
    prayedPostIds,
    firedPostIds,
  } satisfies UserPostInteractionSets;
}

export async function fetchUserPostInteractions(
  supabaseAdmin: SupabaseClient,
  userId: string,
  postIds: string[],
) {
  const normalizedPostIds = normalizePostIds(postIds);
  if (!userId || normalizedPostIds.length === 0) {
    return [] satisfies UserPostInteractionRow[];
  }

  const { data, error } = await supabaseAdmin.rpc(
    "get_user_post_interactions",
    {
      p_user_id: userId,
      p_post_ids: normalizedPostIds,
    },
  );

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as UserPostInteractionRow[];
  return rows;
}

export async function fetchUserPostInteractionSets(
  supabaseAdmin: SupabaseClient,
  userId: string,
  postIds: string[],
) {
  const rows = await fetchUserPostInteractions(supabaseAdmin, userId, postIds);
  return toUserPostInteractionSets(rows);
}
