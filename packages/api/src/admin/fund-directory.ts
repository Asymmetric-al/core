import { NextResponse } from "next/server";

import { withOperation } from "../shared/with-operation";

export const GET = withOperation(
  async ({ supabaseAdmin, auth: ctx, request }) => {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    let query = supabaseAdmin
      .from("funds")
      .select("id, name, description, missionary_id, tenant_id")
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (ctx.role !== "super_admin") {
      query = query.eq("tenant_id", ctx.tenantId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ funds: data ?? [] });
  },
  { roles: ["staff", "admin", "super_admin"] },
);
