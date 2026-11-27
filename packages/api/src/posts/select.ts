export const FEED_POST_SELECT =
  "id, tenant_id, missionary_id, ministry_assignment_id, title, content, media, image_url, post_type, type, visibility, status, like_count, prayer_count, fires_count, comment_count, created_at, updated_at, review_state, review_reason, worker_withheld, author_user_id";

export interface FeedPostRow extends Record<string, unknown> {
  id: string;
  worker_withheld?: boolean | null;
  author_user_id?: string | null;
  review_reason?: string | null;
}

export const FEED_POST_AUTHOR_SELECT =
  "id, author:profiles!missionary_id(id, avatar_url), post_author_public_name";

export function forReader<T extends FeedPostRow>(
  post: T,
  userId: string,
): FeedPostRow {
  if (post.author_user_id === userId) return post;
  const shown: FeedPostRow = { ...post, review_reason: null };
  delete shown.author_user_id;
  return shown;
}
