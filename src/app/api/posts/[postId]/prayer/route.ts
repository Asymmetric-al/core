import { createClient } from "@asym/database/supabase";
import { NextRequest, NextResponse } from "next/server";

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

  const { error: prayerError } = await supabase
    .from("post_prayers")
    .insert({ post_id: postId, user_id: user.id });

  if (prayerError) {
    if (prayerError.code === "23505") {
      return NextResponse.json({ error: "Already prayed" }, { status: 409 });
    }
    return NextResponse.json({ error: prayerError.message }, { status: 500 });
  }

  await supabase.rpc("increment_post_prayer_count", { post_id: postId });

  return NextResponse.json({ success: true });
}

export async function DELETE(
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

  const { error } = await supabase
    .from("post_prayers")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.rpc("decrement_post_prayer_count", { post_id: postId });

  return NextResponse.json({ success: true });
}
