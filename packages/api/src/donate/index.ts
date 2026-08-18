import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { beginGiftIntake } from "./begin-gift-intake";
import { resolveRequiredIdempotencyKey } from "./idempotency";
import { processDonationSagaOutboxEvent } from "./saga";
import { donateGetQuerySchema, donatePostSchema } from "../schemas/donate";
import { ensureJsonBody, toErrorResponse } from "../shared/http-errors";
import { findDonorByProfileId } from "../shared/queries";
import { withOperation } from "../shared/with-operation";
import { resolveTenantStripe } from "../stripe/tenant-client";

const stripeConfigurationError = () =>
  NextResponse.json(
    { error: "Checkout configuration is incomplete for this organization" },
    { status: 500 },
  );

export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const { amount, currency, missionary_id, fund_id } = donatePostSchema.parse(
      await ensureJsonBody(request),
    );

    const tenantStripe = await resolveTenantStripe({
      supabaseAdmin,
      tenantId: ctx.tenantId,
    });
    if (!tenantStripe.ok) {
      if (tenantStripe.reason === "stripe_unconfigured") {
        return stripeConfigurationError();
      }
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }
    if (!tenantStripe.publishableKey) {
      return stripeConfigurationError();
    }

    const { stripe, publishableKey } = tenantStripe;
    const amountInCents = Math.round(amount * 100);
    const idempotencyKey = resolveRequiredIdempotencyKey(request.headers);

    const begin = await beginGiftIntake({
      rpc: async (fn, rpcArgs) => {
        const response = await supabaseAdmin.rpc(fn, rpcArgs as never);
        return { data: response.data, error: response.error };
      },
      tenantId: ctx.tenantId,
      profileId: ctx.profileId,
      actorUserId: ctx.userId,
      missionaryId: missionary_id || null,
      fundId: fund_id || null,
      amountCents: amountInCents,
      currency,
      idempotencyKey,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    if (!begin.ok) {
      switch (begin.code) {
        case "not_found":
          return NextResponse.json(
            { error: "Missionary or fund not found" },
            { status: 404 },
          );
        case "invalid":
          return NextResponse.json({ error: begin.message }, { status: 400 });
        case "incomplete":
          return NextResponse.json(
            { error: "Failed to start donation saga" },
            { status: 500 },
          );
        case "failed":
          return NextResponse.json({ error: begin.message }, { status: 500 });
        default: {
          const _exhaustive: never = begin;
          return NextResponse.json(
            { error: String(_exhaustive) },
            { status: 500 },
          );
        }
      }
    }

    const sagaResult = await processDonationSagaOutboxEvent({
      supabaseAdmin,
      stripe,
      outboxId: begin.outboxId,
      actorUserId: ctx.userId,
    });

    if (sagaResult.status !== "completed") {
      return NextResponse.json(
        {
          error: sagaResult.error ?? "Donation is still processing",
          donationId: begin.donationId,
          outboxId: begin.outboxId,
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
      donationId: begin.donationId,
      outboxId: begin.outboxId,
      idempotencyKey,
      replayed: begin.replayed,
      publishableKey,
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

    const tenantStripe = await resolveTenantStripe({
      supabaseAdmin,
      tenantId: ctx.tenantId,
    });
    if (!tenantStripe.ok) {
      if (tenantStripe.reason === "stripe_unconfigured") {
        return stripeConfigurationError();
      }
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }
    if (!tenantStripe.publishableKey) {
      return stripeConfigurationError();
    }
    const { publishableKey } = tenantStripe;

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
      publishableKey,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
