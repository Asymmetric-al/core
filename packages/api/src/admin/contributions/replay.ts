import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveCrmSyncRuntimeConfig } from "../../crm/sync/config";
import { processDonationSagaOutboxEvent } from "../../donate/saga";
import { queueStagedGiftPostingToTwenty } from "../../giving/staged-gifts";
import { revalidateAdminContributionsCache } from "../../shared/cache-tags";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
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
import { resolveTenantStripe } from "../../stripe/tenant-client";
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

async function getStripeForReplay(params: {
  supabaseAdmin: Parameters<typeof resolveTenantStripe>[0]["supabaseAdmin"];
  tenantId: string;
}) {
  const tenantStripe = await resolveTenantStripe(params);
  if (!tenantStripe.ok) {
    if (tenantStripe.reason === "lookup_failed") {
      throw new Error(tenantStripe.message);
    }
    throw new ApiHttpError(
      503,
      "A Stripe secret key (tenant or platform) is required to replay donation saga outbox events.",
    );
  }

  return tenantStripe.stripe;
}

/**
 * The saga executor claims outbox rows by id only, so the replay endpoint is
 * the tenant gate: an operator may only replay rows their own tenant owns —
 * otherwise another tenant's donation would be driven on this tenant's
 * Stripe account.
 */
async function requireTenantOwnedSagaOutboxRow(params: {
  supabaseAdmin: Parameters<typeof resolveTenantStripe>[0]["supabaseAdmin"];
  outboxId: string;
  tenantId: string;
}) {
  const { data, error } = await params.supabaseAdmin
    .from("donation_saga_outbox")
    .select("id")
    .eq("id", params.outboxId)
    .eq("tenant_id", params.tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new ApiHttpError(404, "Donation saga outbox event not found.");
  }
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

        if (outcome.mutated) {
          revalidateAdminContributionsCache(auth.tenantId);
        }

        return NextResponse.json({ replayed: outcome, requestId });
      }

      if (body.donationSagaOutboxId) {
        await requireTenantOwnedSagaOutboxRow({
          supabaseAdmin,
          outboxId: body.donationSagaOutboxId,
          tenantId: auth.tenantId,
        });
        const replayed = await processDonationSagaOutboxEvent({
          supabaseAdmin,
          stripe: await getStripeForReplay({
            supabaseAdmin,
            tenantId: auth.tenantId,
          }),
          outboxId: body.donationSagaOutboxId,
          actorUserId: auth.userId,
        });

        revalidateAdminContributionsCache(auth.tenantId);

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

        revalidateAdminContributionsCache(auth.tenantId);

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
