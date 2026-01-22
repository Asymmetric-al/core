import { NextRequest, NextResponse } from "next/server";
import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { createAuditLogger } from "@/lib/audit/logger";
import { getAdminClient } from "@asym/database/supabase";

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin"]);
    const ctx = auth as AuthenticatedContext;

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
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin"]);
    const ctx = auth as AuthenticatedContext;
    const audit = createAuditLogger(ctx, request);

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role || !["donor", "missionary", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldRole = targetProfile.role;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .eq("tenant_id", ctx.tenantId)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    await audit.logRoleChange(userId, oldRole, role);
    return NextResponse.json({ user: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
