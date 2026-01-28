import { NextRequest, NextResponse } from "next/server";
import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { createAdminClient } from "@asym/database/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext();
    requireRole(auth, ["donor", "admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data, error } = await supabaseAdmin
      .from("donations")
      .select(
        "*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
      )
      .eq("donor_id", ctx.profileId)
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ donations: data });
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

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext();
    requireRole(auth, ["donor", "admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const audit = createAuditLogger(ctx, request);

    const body = await request.json();
    const { missionaryId, amount, currency = "usd" } = body;

    if (!missionaryId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid donation data" },
        { status: 400 },
      );
    }

    const { data: missionary } = await supabaseAdmin
      .from("missionaries")
      .select("id")
      .eq("id", missionaryId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!missionary) {
      return NextResponse.json(
        { error: "Missionary not found" },
        { status: 404 },
      );
    }

    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .insert({
        tenant_id: ctx.tenantId,
        donor_id: ctx.profileId,
        missionary_id: missionaryId,
        amount,
        currency,
        status: "pending",
      })
      .select(
        "*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    await audit.logDonation(donation.id, "donation_created", {
      amount,
      missionaryId,
    });
    return NextResponse.json({ donation }, { status: 201 });
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
