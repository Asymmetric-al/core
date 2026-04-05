import { type NextRequest, NextResponse } from "next/server";

import { adminUsersListQuerySchema } from "../schemas/admin";
import { withOperation } from "../shared/with-operation";

export const GET = withOperation(
  async ({ supabaseAdmin, auth: ctx, request }) => {
    const { searchParams } = new URL(request.url);
    const parsed = adminUsersListQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? "50",
      offset: searchParams.get("offset") ?? "0",
      role: searchParams.get("role")?.trim() || undefined,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message ?? "Invalid query parameters" },
        { status: 400 },
      );
    }
    const { limit, offset, role } = parsed.data;

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
