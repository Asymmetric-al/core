import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import {
  GiftProcessingFeePolicyError,
  giftProcessingFeeStripeMetadataEquals,
  readStoredGiftProcessingFeeStripeMetadata,
  resolveGiftIntakeCharge,
  toGiftProcessingFeeStripeMetadata,
  type GiftProcessingFeeQuote,
  type GiftProcessingFeeStripeMetadata,
} from "./fee-policy";
import { resolveRequiredIdempotencyKey } from "./idempotency";
import { processDonationSagaOutboxEvent } from "./saga";
import { donateGetQuerySchema, donatePostSchema } from "../schemas/donate";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../shared/http-errors";
import { findDonorByProfileId } from "../shared/queries";
import { withOperation } from "../shared/with-operation";
import { resolveTenantStripe } from "../stripe/tenant-client";

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

const stripeConfigurationError = () =>
  NextResponse.json(
    { error: "Checkout configuration is incomplete for this organization" },
    { status: 500 },
  );

export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const {
      amount,
      currency,
      missionary_id,
      fund_id,
      cover_fees,
      payment_method,
    } = donatePostSchema.parse(await ensureJsonBody(request));

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
    let feeQuote: GiftProcessingFeeQuote;
    try {
      feeQuote = resolveGiftIntakeCharge({
        amount,
        coverFees: cover_fees,
        paymentMethod: payment_method,
        currency,
      });
    } catch (error) {
      if (error instanceof GiftProcessingFeePolicyError) {
        throw new ApiHttpError(400, error.message);
      }
      throw error;
    }
    const amountInCents = feeQuote.chargedAmountCents;
    const idempotencyKey = resolveRequiredIdempotencyKey(request.headers);
    const extraPaymentIntentMetadata =
      toGiftProcessingFeeStripeMetadata(feeQuote);

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
        p_fee_extras: extraPaymentIntentMetadata,
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

    if (beginResult?.replayed) {
      const { data: storedDonation, error: storedDonationError } =
        await supabaseAdmin
          .from("donations")
          .select("amount")
          .eq("id", donationId)
          .eq("tenant_id", ctx.tenantId)
          .single();

      const storedAmountCents = Number(storedDonation?.amount);
      if (
        storedDonationError ||
        storedDonation == null ||
        !Number.isSafeInteger(storedAmountCents)
      ) {
        throw new ApiHttpError(
          500,
          "Failed to load the existing donation for this idempotency key.",
        );
      }
      if (storedAmountCents !== feeQuote.chargedAmountCents) {
        throw new ApiHttpError(
          409,
          "This idempotency key was already used for a different charged amount.",
        );
      }

      const { data: storedOutbox, error: storedOutboxError } =
        await supabaseAdmin
          .from("donation_saga_outbox")
          .select("fee_extras")
          .eq("id", outboxId)
          .eq("tenant_id", ctx.tenantId)
          .single();

      if (storedOutboxError || storedOutbox == null) {
        throw new ApiHttpError(
          500,
          "Failed to load the existing donation fee extras for this idempotency key.",
        );
      }
      let storedFeeExtras: GiftProcessingFeeStripeMetadata | undefined;
      try {
        storedFeeExtras = readStoredGiftProcessingFeeStripeMetadata(
          storedOutbox.fee_extras,
        );
      } catch (error) {
        if (error instanceof GiftProcessingFeePolicyError) {
          throw new ApiHttpError(
            500,
            "Failed to load the existing donation fee extras for this idempotency key.",
          );
        }
        throw error;
      }
      if (
        storedFeeExtras == null ||
        !giftProcessingFeeStripeMetadataEquals(
          storedFeeExtras,
          extraPaymentIntentMetadata,
        )
      ) {
        throw new ApiHttpError(
          409,
          "This idempotency key was already used for a different gift fee quote.",
        );
      }
    }

    const sagaResult = await processDonationSagaOutboxEvent({
      supabaseAdmin,
      stripe,
      outboxId,
      actorUserId: ctx.userId,
      extraPaymentIntentMetadata,
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
