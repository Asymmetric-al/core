import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "../shared/http-errors";

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data, error } = await supabaseAdmin
      .from("missionaries")
      .select("*, profile:profiles!profile_id(*)")
      .eq("tenant_id", ctx.tenantId)
      .range(offset, offset + limit - 1);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ missionaries: data });
  } catch (e) {
    return toErrorResponse(e);
  }
}
