import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { resolveCrmSyncRuntimeConfig } from "../../crm/sync/config";
import { processDonationSagaOutboxEvent } from "../../donate/saga";
import { queueStagedGiftPostingToTwenty } from "../../giving/staged-gifts";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { STRIPE_API_VERSION } from "../../stripe/api-version";
import {
  claimStripeRawEvent,
  completeStripeRawEvent,
  recordStripeRawEventFailure,
} from "../../stripe/event-store";
import {
  getRawPayloadEvent,
  loadStripeRawEventForReplay,
  markStripeRawEventForReplay,
} from "../../stripe/replay";
import { handleStripeWebhookEvent } from "../../stripe/webhooks";

const replaySchema = z
  .object({
    stripeEventId: z.string().min(1).optional(),
    donationSagaOutboxId: z.string().uuid().optional(),
    stagedGiftId: z.string().uuid().optional(),
    receiptSendId: z.string().uuid().optional(),
  })
  .refine(
    (value) =>
      [
        value.stripeEventId,
        value.donationSagaOutboxId,
        value.stagedGiftId,
        value.receiptSendId,
      ].filter(Boolean).length === 1,
    {
      message:
        "Provide exactly one replay target: stripeEventId, donationSagaOutboxId, stagedGiftId, or receiptSendId.",
    },
  );

function getStripeForReplay() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new ApiHttpError(
      503,
      "STRIPE_SECRET_KEY is required to replay donation saga outbox events.",
    );
  }

  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const body = replaySchema.parse(await ensureJsonBody(request));

      if (body.stripeEventId) {
        const rawEvent = await loadStripeRawEventForReplay({
          supabaseAdmin,
          stripeEventId: body.stripeEventId,
          tenantId: auth.tenantId,
        });
        await markStripeRawEventForReplay({
          supabaseAdmin,
          rawEventId: rawEvent.id,
        });
        const claim = await claimStripeRawEvent({
          supabaseAdmin,
          rawEventId: rawEvent.id,
        });
        if (!claim.claimed) {
          throw new ApiHttpError(409, "Stripe raw event is not replayable.");
        }

        const event = getRawPayloadEvent(rawEvent);
        let outcome;
        try {
          outcome = await handleStripeWebhookEvent(supabaseAdmin, event, {
            rawEventId: rawEvent.id,
            stripeEventId: rawEvent.stripeEventId,
          });
          await completeStripeRawEvent({
            supabaseAdmin,
            rawEventId: rawEvent.id,
            lockId: claim.lockId,
            status: outcome.handled ? "processed" : "ignored",
            outcome: {
              action: outcome.action,
              donationId: outcome.donationId,
              handled: outcome.handled,
              paymentIntentId: outcome.paymentIntentId,
              reason: outcome.reason,
              stagedGiftId: outcome.stagedGiftId,
            },
            stagedGiftId: outcome.stagedGiftId ?? null,
          });
        } catch (error) {
          await recordStripeRawEventFailure({
            supabaseAdmin,
            rawEventId: rawEvent.id,
            lockId: claim.lockId,
            error,
          });
          throw error;
        }

        return NextResponse.json({ replayed: outcome, requestId });
      }

      if (body.donationSagaOutboxId) {
        const replayed = await processDonationSagaOutboxEvent({
          supabaseAdmin,
          stripe: getStripeForReplay(),
          outboxId: body.donationSagaOutboxId,
          actorUserId: auth.userId,
        });

        return NextResponse.json({ replayed, requestId });
      }

      if (body.stagedGiftId) {
        const replayed = await queueStagedGiftPostingToTwenty({
          supabaseAdmin,
          stagedGiftId: body.stagedGiftId,
          tenantId: auth.tenantId,
          actorProfileId: auth.profileId,
          note: "Operator replay by staged gift id.",
          crmConfig: resolveCrmSyncRuntimeConfig(serverEnv),
        });

        return NextResponse.json({ replayed, requestId });
      }

      if (body.receiptSendId) {
        const { data, error } = await supabaseAdmin
          .from("email_send_logs")
          .select("id, tenant_id, status, idempotency_key")
          .eq("id", body.receiptSendId)
          .eq("tenant_id", auth.tenantId)
          .maybeSingle();
        if (error) {
          throw new Error(error.message);
        }
        if (!data) {
          throw new ApiHttpError(404, "Receipt send log not found.");
        }

        return NextResponse.json({
          replayed: {
            receiptSendId: body.receiptSendId,
            status: "not_verified",
            reason:
              "Receipt resend requires a connected tenant Resend key and provider proof; original send log was found for operator review.",
          },
          requestId,
        });
      }

      throw new ApiHttpError(400, "Missing replay target.");
    } catch (error) {
      return toErrorResponse(error, "Failed to replay giving item.", requestId);
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
