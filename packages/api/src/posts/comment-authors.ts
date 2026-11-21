/**
 * The people who commented on a post, for its comments (AL-2675, JB11).
 *
 * `public.post_comment_authors(post)` returns one row for each commenter of
 * a published public post: their profile's display name (NULL when blank)
 * and avatar, given only to a caller with a live membership in the post's
 * organization, and NULL to anyone else. It reads no other part of anyone's
 * profile, so the comments keep their authors when the second release stops
 * other people's `profiles` rows from being readable.
 */

/** The one call this reader makes; a user-token Supabase client satisfies it. */
export interface CommentAuthorsRpcClient {
  rpc(
    fn: "post_comment_authors",
    args: { p_post_id: string },
  ): PromiseLike<{ data: unknown; error: unknown }>;
}

export interface CommentAuthor {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export class CommentAuthorsReadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "CommentAuthorsReadError";
  }
}

const nullableText = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

/** Each commenter of `postId`, by user id. A failed read or a malformed row throws. */
export async function readCommentAuthors(
  client: CommentAuthorsRpcClient,
  postId: string,
): Promise<ReadonlyMap<string, CommentAuthor>> {
  const { data, error } = await client.rpc("post_comment_authors", {
    p_post_id: postId,
  });
  if (error) {
    throw new CommentAuthorsReadError("post_comment_authors failed", {
      cause: error,
    });
  }
  if (!Array.isArray(data)) {
    throw new CommentAuthorsReadError(
      "post_comment_authors returned a non-array result",
    );
  }
  const authors = new Map<string, CommentAuthor>();
  for (const row of data as unknown[]) {
    const { user_id, display_name, avatar_url } = (row ?? {}) as Record<
      string,
      unknown
    >;
    if (
      typeof user_id !== "string" ||
      !nullableText(display_name) ||
      !nullableText(avatar_url)
    ) {
      throw new CommentAuthorsReadError(
        "post_comment_authors returned a malformed row",
      );
    }
    authors.set(user_id, {
      userId: user_id,
      displayName: display_name,
      avatarUrl: avatar_url,
    });
  }
  return authors;
}
