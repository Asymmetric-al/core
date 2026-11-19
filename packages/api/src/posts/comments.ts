import { getAuthContext, requestScopeOf } from "@asym/auth/context";
import { type NextRequest, NextResponse } from "next/server";

import { CommentAuthorsReadError, readCommentAuthors } from "./comment-authors";
import { createRequestSessionClient } from "../shared/request-session-client";

/** A comment as the comment screens read it. */
export interface PostCommentView {
  id: string;
  post_id: string | null;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  /**
   * The commenter, in the shape the screens use. A commenter with no name to
   * show (a blank display name, or a caller outside the post's organization)
   * has empty names and no avatar; the screens label them "Commenter".
   */
  user: {
    id: string | null;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  // Explicit auth check — do not rely on RLS alone. (finding 06 Gap 3)
  const auth = await getAuthContext(request);
  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The caller's own token, sending the tenant and assignment the resolver
  // selected for this request (plan 5.4; AL-2675): the bearer token first,
  // as `getAuthContext` authenticated it, otherwise the cookies (JB13).
  const supabase = await createRequestSessionClient(
    request,
    requestScopeOf(auth),
  );

  const { postId } = await params;

  // No embed of `profiles`: no foreign key joins `post_comments.user_id` to
  // it, so PostgREST refused the whole read (PGRST200), and other people's
  // profiles are not this route's to read. The commenters come from
  // `public.post_comment_authors` (AL-2675, JB11).
  const { data: comments, error } = await supabase
    .from("post_comments")
    .select("id, post_id, user_id, parent_id, content, created_at, updated_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let authors;
  try {
    authors = await readCommentAuthors(supabase, postId);
  } catch (cause) {
    if (!(cause instanceof CommentAuthorsReadError)) throw cause;
    return NextResponse.json({ error: cause.message }, { status: 500 });
  }

  const view: PostCommentView[] = (comments ?? []).map((comment) => {
    const author = comment.user_id ? authors.get(comment.user_id) : undefined;
    return {
      ...comment,
      user: {
        id: comment.user_id,
        first_name: author?.displayName ?? "",
        last_name: "",
        avatar_url: author?.avatarUrl ?? null,
      },
    };
  });

  return NextResponse.json({ comments: view });
}

/** Read-only demo: no-op so UI does not break; comments are client-only. */
export async function POST(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ success: true, readOnlyDemo: true });
}
