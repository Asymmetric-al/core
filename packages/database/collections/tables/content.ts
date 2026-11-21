"use client";

import {
  followSchema,
  postCommentSchema,
  postInteractionSchema,
  postSchema,
} from "../schemas/content";
import { defineSupabaseCollection } from "../supabase-collection";

const followRealtimeSafetyRequired =
  "Disabled until tenant/ownership RLS and safe column exposure are resolved before live subscriptions are enabled.";

export const postsCollection = defineSupabaseCollection({
  tableName: "posts",
  schema: postSchema,
  keys: ["id"],
  realtime: {
    enabled: false,
    reason:
      "posts is not in the supabase_realtime publication (AL-2675, WP2b second release), so a channel would error and rejoin; read it once.",
  },
});

export const postCommentsCollection = defineSupabaseCollection({
  tableName: "post_comments",
  schema: postCommentSchema,
  keys: ["id"],
  realtime: {
    enabled: false,
    reason:
      "post_comments is not in the supabase_realtime publication (AL-2675, WP2b second release), so a channel would error and rejoin; read it once.",
  },
});

export const postLikesCollection = defineSupabaseCollection({
  tableName: "post_likes",
  schema: postInteractionSchema,
  keys: ["id"],
  realtime: {
    enabled: false,
    reason:
      "post_likes is not in the supabase_realtime publication (AL-2675, WP2b second release), so a channel would error and rejoin; read it once.",
  },
});

export const postPrayersCollection = defineSupabaseCollection({
  tableName: "post_prayers",
  schema: postInteractionSchema,
  keys: ["id"],
  realtime: {
    enabled: false,
    reason:
      "post_prayers is not in the supabase_realtime publication (AL-2675, WP2b second release), so a channel would error and rejoin; read it once.",
  },
});

export const postFiresCollection = defineSupabaseCollection({
  tableName: "post_fires",
  schema: postInteractionSchema,
  keys: ["id"],
  realtime: {
    enabled: false,
    reason:
      "post_fires is not in the supabase_realtime publication (AL-2675, WP2b second release), so a channel would error and rejoin; read it once.",
  },
});

export const followsCollection = defineSupabaseCollection({
  tableName: "follows",
  schema: followSchema,
  keys: ["id"],
  realtime: { enabled: false, reason: followRealtimeSafetyRequired },
});
