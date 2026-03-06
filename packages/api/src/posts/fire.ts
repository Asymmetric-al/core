import { createClient } from "@asym/database/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
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

  const { error: fireError } = await supabase
    .from("post_fires")
    .insert({ post_id: postId, user_id: user.id });

  if (fireError) {
    if (fireError.code === "23505") {
      return NextResponse.json({ error: "Already fired" }, { status: 409 });
    }
    return NextResponse.json({ error: fireError.message }, { status: 500 });
  }

  const { error: countError } = await supabase.rpc("increment_post_fire_count", {
    post_id: postId,
  });
  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
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

  const { data: deletedRows, error } = await supabase
    .from("post_fires")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Avoid mutating denormalized counters when there was no matching reaction row.
  if (!deletedRows || deletedRows.length === 0) {
    return NextResponse.json({ success: true });
  }

  const { error: countError } = await supabase.rpc("decrement_post_fire_count", {
    post_id: postId,
  });
  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
