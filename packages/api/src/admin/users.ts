import { type NextRequest, NextResponse } from "next/server";

import { withOperation } from "../shared/with-operation";

export const GET = withOperation(
  async ({ supabaseAdmin, auth: ctx, request }) => {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const role = searchParams.get("role");

    let query = supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data });
  },
  { roles: ["admin"] },
);

/** Read-only demo: user updates disabled. */
export async function PATCH(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
