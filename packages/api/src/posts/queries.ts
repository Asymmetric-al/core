import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/** Fetches user reaction status for a set of posts in parallel. */
export async function getPostReactionStatus(
  supabase: AdminSupabaseClient,
  postIds: string[],
  userId: string,
) {
  if (postIds.length === 0) {
    return {
      likedSet: new Set<string>(),
      prayedSet: new Set<string>(),
      firedSet: new Set<string>(),
    };
  }

  const [likesResult, prayersResult, firesResult] = await Promise.all([
    supabase
      .from("post_likes")
      .select("post_id")
      .in("post_id", postIds)
      .eq("user_id", userId),
    supabase
      .from("post_prayers")
      .select("post_id")
      .in("post_id", postIds)
      .eq("user_id", userId),
    supabase
      .from("post_fires")
      .select("post_id")
      .in("post_id", postIds)
      .eq("user_id", userId),
  ]);

  const likedSet = new Set(
    (likesResult.data || []).map((like: { post_id: string }) => like.post_id),
  );
  const prayedSet = new Set(
    (prayersResult.data || []).map(
      (prayer: { post_id: string }) => prayer.post_id,
    ),
  );
  const firedSet = new Set(
    (firesResult.data || []).map((fire: { post_id: string }) => fire.post_id),
  );

  return { likedSet, prayedSet, firedSet };
}
