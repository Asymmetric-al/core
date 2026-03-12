import { z } from "zod";

const optionalIdentifier = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

export const postsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100),
  offset: z.coerce.number().int().min(0),
  status: z.string().trim().min(1),
  missionaryId: optionalIdentifier,
});

export const postIdParamSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
});
