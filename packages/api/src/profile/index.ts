import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "../shared/http-errors";

export async function GET() {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", ctx.profileId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );

    let profileData = { ...profile };

    if (ctx.role === "missionary") {
      const { data: missionary } = await supabaseAdmin
        .from("missionaries")
        .select("*")
        .eq("profile_id", ctx.profileId)
        .single();

      if (missionary) {
        profileData = { ...profileData, missionary };
      }
    }

    return NextResponse.json({ profile: profileData });
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** Read-only demo: profile updates disabled. */
export async function PATCH(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
