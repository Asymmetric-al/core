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
      .from("missionaries")
      .select("id, tenant_id, profile_id")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (ctx.role !== "super_admin") {
      query = query.eq("tenant_id", ctx.tenantId);
    }

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const profileIds = Array.from(
      new Set(
        (rows ?? [])
          .map((r) => r.profile_id as string | null | undefined)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    let profilesById: Record<
      string,
      { full_name: string | null; display_name: string | null }
    > = {};

    if (profileIds.length > 0) {
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", profileIds);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      profilesById = Object.fromEntries(
        (profiles ?? []).map((p) => [
          p.id as string,
          {
            full_name: (p.full_name as string | null) ?? null,
            display_name: (p.display_name as string | null) ?? null,
          },
        ]),
      );
    }

    const missionaries = (rows ?? []).map((row) => {
      const pid = row.profile_id as string | null | undefined;
      const profile = pid ? profilesById[pid] : undefined;
      return {
        id: row.id as string,
        tenant_id: row.tenant_id as string | null,
        profile: profile
          ? { full_name: profile.full_name, display_name: profile.display_name }
          : null,
      };
    });

    return NextResponse.json({ missionaries });
  } catch (e) {
    return toErrorResponse(e);
  }
}
