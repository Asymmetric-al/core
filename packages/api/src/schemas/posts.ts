import { z } from "zod";

const optionalIdentifier = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

export const postsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100),
  offset: z.coerce.number().int().min(0).max(10_000),
  /**
   * The feed read runs through the service-role client, so this value reaches
   * the query unmediated by RLS. Keep it a closed set — a free-form string
   * lets a caller select any `posts.status` (the column has no CHECK
   * constraint) and becomes an unbounded cache key.
   */
  status: z.enum(["published", "draft"]).default("published"),
  missionaryId: optionalIdentifier,
});

export const postIdParamSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
});
