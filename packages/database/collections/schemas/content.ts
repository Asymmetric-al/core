import { z } from "zod";

export const mediaItemSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["image", "video"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const postSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  missionary_id: z.string().min(1),
  content: z.string(),
  media: z.array(mediaItemSchema),
  like_count: z.number().int(),
  prayer_count: z.number().int(),
  fires_count: z.number().int(),
  comment_count: z.number().int(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export const postCommentSchema = z.object({
  id: z.string().min(1),
  post_id: z.string().min(1),
  user_id: z.string().min(1),
  content: z.string(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export const postInteractionSchema = z.object({
  id: z.string().min(1),
  post_id: z.string().min(1),
  user_id: z.string().min(1),
  created_at: z.string().min(1),
});

export const followSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().nullable(),
  donor_id: z.string().nullable(),
  missionary_id: z.string().nullable(),
  status: z.string().min(1),
  is_donor: z.boolean(),
  approved_at: z.string().nullable(),
  notification_frequency: z.string().nullable(),
  muted: z.boolean(),
  created_at: z.string().min(1),
});
