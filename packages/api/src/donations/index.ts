import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { resolveRequiredIdempotencyKey } from "../donate/idempotency";
import { processDonationSagaOutboxEvent } from "../donate/saga";
import { ensureJsonBody, toErrorResponse } from "../shared/http-errors";

import { findMissionaryById } from "../missionaries/queries";

function getSupabaseAdmin() {
  const { client, error } = getAdminClient();
  if (!client) return { supabaseAdmin: null, error };
  return { supabaseAdmin: client, error: null };
}

function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });
}

function parseRpcObject<T extends Record<string, unknown>>(
  value: unknown,
): T | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as T) : null;
  }
  return typeof value === "object" ? (value as T) : null;
}

export async function GET(request: NextRequest) {
  try {
    const { supabaseAdmin, error } = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: error ?? "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext();
    requireRole(auth, ["donor", "admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: donor } = await supabaseAdmin
      .from("donors")
      .select("id")
      .eq("profile_id", ctx.profileId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!donor?.id) {
      return NextResponse.json({ donations: [] });
    }

    const { data, error: queryError } = await supabaseAdmin
      .from("donations")
      .select(
        "*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
      )
      .eq("donor_id", donor.id)
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (queryError)
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    return NextResponse.json({ donations: data });
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabaseAdmin, error } = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: error ?? "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext();
    requireRole(auth, ["donor", "admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const body = (await ensureJsonBody(request)) as Record<string, unknown>;
    const missionaryId =
      typeof body.missionaryId === "string" ? body.missionaryId : "";
    const amount = typeof body.amount === "number" ? body.amount : Number.NaN;
    const currency =
      typeof body.currency === "string" && body.currency.trim().length > 0
        ? body.currency.trim().toLowerCase()
        : "usd";

    if (
      !missionaryId ||
      !Number.isInteger(amount) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid donation data" },
        { status: 400 },
      );
    }

    const idempotencyKey = resolveRequiredIdempotencyKey(request.headers);
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id, stripe_secret_key")
      .eq("id", ctx.tenantId)
      .single();
    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const stripeSecretKey =
      tenant.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe not configured for this organization" },
        { status: 500 },
      );
    }

    const { data: beginRaw, error: beginError } = await supabaseAdmin.rpc(
      "begin_donation_saga",
      {
        p_tenant_id: ctx.tenantId,
        p_profile_id: ctx.profileId,
        p_actor_user_id: ctx.userId,
        p_missionary_id: missionaryId,
        p_amount: amount,
        p_currency: currency,
        p_fund_id: null,
        p_idempotency_key: idempotencyKey,
        p_ip_address: request.headers.get("x-forwarded-for"),
        p_user_agent: request.headers.get("user-agent"),
      },
    );
    if (beginError) {
      if (beginError.code === "P0002") {
        return NextResponse.json(
          { error: "Missionary not found" },
          { status: 404 },
        );
      }
      if (beginError.code === "22023") {
        return NextResponse.json(
          { error: beginError.message },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: beginError.message }, { status: 500 });
    }

    const beginResult = parseRpcObject<{
      outbox_id?: string;
      donation_id?: string;
    }>(beginRaw);
    const outboxId = beginResult?.outbox_id ?? null;
    const donationId = beginResult?.donation_id ?? null;
    if (!outboxId || !donationId) {
      return NextResponse.json(
        { error: "Failed to start donation saga" },
        { status: 500 },
      );
    }

    const stripe = getStripeClient(stripeSecretKey);
    const sagaResult = await processDonationSagaOutboxEvent({
      supabaseAdmin,
      stripe,
      outboxId,
      actorUserId: ctx.userId,
    });
    if (sagaResult.status !== "completed") {
      return NextResponse.json(
        {
          error: sagaResult.error ?? "Donation is still processing",
          donationId,
          outboxId,
          status: sagaResult.status,
        },
        { status: sagaResult.status === "processing" ? 202 : 500 },
      );
    }

    const { data: donation, error: donationError } = await supabaseAdmin
      .from("donations")
      .select(
        "*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
      )
      .eq("id", donationId)
      .single();
    if (donationError || !donation) {
      return NextResponse.json(
        { error: donationError?.message ?? "Donation not found" },
        { status: 500 },
      );
    }

    return NextResponse.json({ donation }, { status: 201 });
  } catch (e) {
    return toErrorResponse(e);
  }
}
