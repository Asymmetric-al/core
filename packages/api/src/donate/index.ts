import { NextRequest, NextResponse } from "next/server";
import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";

/** Read-only demo: mutations disabled. */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const missionaryId = searchParams.get("missionary_id");
    const fundId = searchParams.get("fund_id");

    const { data: donor } = await supabaseAdmin
      .from("donors")
      .select("id")
      .eq("profile_id", ctx.profileId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    let designations: { missionaries: unknown[]; funds: unknown[] } = {
      missionaries: [],
      funds: [],
    };

    if (missionaryId || fundId) {
      if (missionaryId) {
        const { data: missionary } = await supabaseAdmin
          .from("missionaries")
          .select(
            `
            id, 
            funding_goal, 
            current_funding,
            profile:profiles!profile_id(first_name, last_name, avatar_url)
          `,
          )
          .eq("id", missionaryId)
          .eq("tenant_id", ctx.tenantId)
          .single();

        if (missionary) {
          designations.missionaries = [missionary];
        }
      }

      if (fundId) {
        const { data: fund } = await supabaseAdmin
          .from("funds")
          .select("id, name, description, target_amount, current_amount")
          .eq("id", fundId)
          .eq("tenant_id", ctx.tenantId)
          .eq("is_active", true)
          .single();

        if (fund) {
          designations.funds = [fund];
        }
      }
    } else {
      const { data: missionaries } = await supabaseAdmin
        .from("missionaries")
        .select(
          `
          id, 
          funding_goal, 
          current_funding,
          profile:profiles!profile_id(first_name, last_name, avatar_url)
        `,
        )
        .eq("tenant_id", ctx.tenantId);

      const { data: funds } = await supabaseAdmin
        .from("funds")
        .select("id, name, description, target_amount, current_amount")
        .eq("tenant_id", ctx.tenantId)
        .eq("is_active", true);

      designations = {
        missionaries: missionaries || [],
        funds: funds || [],
      };
    }

    return NextResponse.json({
      designations,
      donor: donor || null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Unauthorized") ? 401 : 500 },
    );
  }
}
