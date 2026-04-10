import { toErrorResponse } from "@asym/api/shared/http-errors";
import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: adminError ?? "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext(request);
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    if (
      ctx.role !== "staff" &&
      ctx.role !== "admin" &&
      ctx.role !== "super_admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
  } catch (e) {
    return toErrorResponse(e);
  }
}
