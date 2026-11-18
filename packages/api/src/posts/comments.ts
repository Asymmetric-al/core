import { getAuthContext, requestScopeOf } from "@asym/auth/context";
import { createClient } from "@asym/database/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

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
  // selected for this request (plan 5.4; AL-2675).
  const supabase = await createClient(requestScopeOf(auth));

  const { postId } = await params;

  const { data: comments, error } = await supabase
    .from("post_comments")
    .select(
      `
      *,
      user:profiles!user_id(id, first_name, last_name, avatar_url)
    `,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments });
}

/** Read-only demo: no-op so UI does not break; comments are client-only. */
export async function POST(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ success: true, readOnlyDemo: true });
}
