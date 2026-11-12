import { z } from "zod";

import { postContentHasSubstance } from "../posts/content";

const optionalIdentifier = z.preprocess((value) => {
  // `URLSearchParams.get` returns null for an absent param.
  if (value === null) return undefined;
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

/** The update types the composer and both feeds understand. */
export const POST_TYPES = [
  "Update",
  "Story",
  "Prayer Request",
  "Milestone",
] as const;

/**
 * Stored visibility. The composer says "partners"; rows store
 * "partners_only", which is what the feed readers check.
 */
const postVisibilitySchema = z.preprocess(
  (value) => (value === "partners" ? "partners_only" : value),
  z.enum(["public", "partners_only"]),
);

const postMediaSchema = z
  .array(
    z.object({
      url: z
        .string()
        .url()
        .refine((url) => /^https?:\/\//i.test(url), "Media must be a web URL"),
      type: z.enum(["image", "video"]),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    }),
  )
  .max(10);

const optionalTitle = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().max(120).optional());

/** Body of POST /api/posts: one new ministry update. */
export const postWriteSchema = z.object({
  title: optionalTitle,
  content: z
    .string()
    .max(200_000)
    .refine(postContentHasSubstance, "Write something or add an image"),
  post_type: z.enum(POST_TYPES).default("Update"),
  visibility: postVisibilitySchema.default("public"),
  status: z.enum(["published", "draft"]).default("published"),
  media: postMediaSchema.default([]),
});

export type PostWriteInput = z.infer<typeof postWriteSchema>;

/** Body of PATCH /api/posts/:postId: any subset of the same fields. */
export const postUpdateSchema = z
  .object({
    title: z
      .preprocess((value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }, z.string().max(120).nullable())
      .optional(),
    content: postWriteSchema.shape.content.optional(),
    post_type: z.enum(POST_TYPES).optional(),
    visibility: postVisibilitySchema.optional(),
    status: z.enum(["published", "draft"]).optional(),
    media: postMediaSchema.optional(),
    autosave: z.literal(true).optional(),
    expected_updated_at: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .optional(),
  })
  .superRefine((input, context) => {
    if (
      input.autosave &&
      (input.status !== "draft" || input.expected_updated_at === undefined)
    ) {
      context.addIssue({
        code: "custom",
        path: ["expected_updated_at"],
        message: "Autosave requires a draft and its current revision",
      });
    }
  });
