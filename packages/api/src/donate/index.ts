import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { resolveRequiredIdempotencyKey } from "./idempotency";
import { processDonationSagaOutboxEvent } from "./saga";
import { donateGetQuerySchema, donatePostSchema } from "../schemas/donate";
import { ensureJsonBody, toErrorResponse } from "../shared/http-errors";
import { findDonorByProfileId } from "../shared/queries";
import { withOperation } from "../shared/with-operation";
import { STRIPE_API_VERSION } from "../stripe/api-version";

function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
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

export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const { amount, currency, missionary_id, fund_id } = donatePostSchema.parse(
      await ensureJsonBody(request),
    );

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id, stripe_secret_key, stripe_publishable_key")
      .eq("id", ctx.tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const stripeSecretKey =
      tenant.stripe_secret_key ?? process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe not configured for this organization" },
        { status: 500 },
      );
    }

    const stripe = getStripeClient(stripeSecretKey);
    const amountInCents = Math.round(amount * 100);
    const idempotencyKey = resolveRequiredIdempotencyKey(request.headers);

    const { data: beginRaw, error: beginError } = await supabaseAdmin.rpc(
      "begin_donation_saga",
      {
        p_tenant_id: ctx.tenantId,
        p_profile_id: ctx.profileId,
        p_actor_user_id: ctx.userId,
        p_amount: amountInCents,
        p_currency: currency.toLowerCase(),
        p_missionary_id: missionary_id || null,
        p_fund_id: fund_id || null,
        p_idempotency_key: idempotencyKey,
        p_ip_address: request.headers.get("x-forwarded-for"),
        p_user_agent: request.headers.get("user-agent"),
      },
    );

    if (beginError) {
      if (beginError.code === "P0002") {
        return NextResponse.json(
          { error: "Missionary or fund not found" },
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
      replayed?: boolean;
    }>(beginRaw);

    const outboxId = beginResult?.outbox_id ?? null;
    const donationId = beginResult?.donation_id ?? null;
    if (!outboxId || !donationId) {
      return NextResponse.json(
        { error: "Failed to start donation saga" },
        { status: 500 },
      );
    }

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

    if (!sagaResult.clientSecret || !sagaResult.paymentIntentId) {
      return NextResponse.json(
        { error: "Failed to initialize payment intent" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret: sagaResult.clientSecret,
      paymentIntentId: sagaResult.paymentIntentId,
      donationId,
      outboxId,
      idempotencyKey,
      replayed: Boolean(beginResult?.replayed),
      publishableKey:
        tenant.stripe_publishable_key ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  },
  { roles: ["donor", "admin", "staff", "super_admin"] },
);

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const { missionary_id: missionaryId, fund_id: fundId } =
      donateGetQuerySchema.parse({
        missionary_id: searchParams.get("missionary_id"),
        fund_id: searchParams.get("fund_id"),
      });

    const { data: donor } = await findDonorByProfileId(
      supabaseAdmin,
      ctx.profileId,
      ctx.tenantId,
    );

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
  } catch (error) {
    return toErrorResponse(error);
  }
}
