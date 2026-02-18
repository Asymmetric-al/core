import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const { postId } = await params;

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url, role)
      `,
      )
      .eq("id", postId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Read-only demo: admin post updates disabled. */
export async function PATCH(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

/** Read-only demo: admin post deletion disabled. */
export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
