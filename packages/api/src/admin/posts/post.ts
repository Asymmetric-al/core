import {
  getAuthContext,
  requestScopeOf,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { type NextRequest, NextResponse } from "next/server";

import { withStaffPostAuthors } from "./index";
import { toErrorResponse } from "../../shared/http-errors";
import { createRequestSessionClient } from "../../shared/request-session-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const auth = await getAuthContext(request);
    requireCapability(auth, "admin.dashboard.access");
    const ctx = auth as AuthenticatedContext;
    const { postId } = await params;
    const supabase = await createRequestSessionClient(
      request,
      requestScopeOf(ctx),
    );

    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const [named] = await withStaffPostAuthors([
      post as unknown as { id: string },
    ]);
    return NextResponse.json(
      { post: named },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    // The shared answer: the guard's refusal of a proposed scope keeps its
    // 401 and its mark, any other error its status (check of the fix lists,
    // JR8).
    return toErrorResponse(e);
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
