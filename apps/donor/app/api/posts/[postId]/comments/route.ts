import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@asym/database/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const supabase = await createClient();
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const supabase = await createClient();
  const { postId } = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const { data: comment, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })
    .select(
      `
      *,
      user:profiles!user_id(id, first_name, last_name, avatar_url)
    `,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.rpc("increment_post_comment_count", { post_id: postId });

  return NextResponse.json({ comment }, { status: 201 });
}
