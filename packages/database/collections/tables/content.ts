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
});

export const postCommentsCollection = defineSupabaseCollection({
  tableName: "post_comments",
  schema: postCommentSchema,
  keys: ["id"],
});

export const postLikesCollection = defineSupabaseCollection({
  tableName: "post_likes",
  schema: postInteractionSchema,
  keys: ["id"],
});

export const postPrayersCollection = defineSupabaseCollection({
  tableName: "post_prayers",
  schema: postInteractionSchema,
  keys: ["id"],
});

export const postFiresCollection = defineSupabaseCollection({
  tableName: "post_fires",
  schema: postInteractionSchema,
  keys: ["id"],
});

export const followsCollection = defineSupabaseCollection({
  tableName: "follows",
  schema: followSchema,
  keys: ["id"],
  realtime: { enabled: false, reason: followRealtimeSafetyRequired },
});
