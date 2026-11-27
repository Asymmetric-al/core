export const FEED_POST_SELECT = "*";

export interface FeedPostRow extends Record<string, unknown> {
  id: string;
  worker_withheld?: boolean | null;
}

export const FEED_POST_AUTHOR_SELECT =
  "id, author:profiles!missionary_id(id, avatar_url), post_author_public_name";

export const OWN_POST_SELECT =
  "*, author:profiles!missionary_id(id, avatar_url), post_author_public_name";
