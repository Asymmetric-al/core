import { getAdminClient } from "@asym/database/supabase/admin";
import { NonRetriableError } from "inngest";

import {
  claimStripeRawEvent,
  completeStripeRawEvent,
  getRawPayloadEvent,
  recordStripeRawEventFailure,
} from "../../stripe/event-store";
import { handleStripeWebhookEvent } from "../../stripe/webhooks";
import {
  STRIPE_EVENT_PROCESS_EVENT,
  workflowEventEnvelopeSchema,
} from "../events";
import { inngest } from "../inngest/client";

import type Stripe from "stripe";

/**
 * Durable Stripe event follow-up. The webhook boundary has already verified
 * the signature and stored the raw event; this function claims the stored
 * event (the product work claim for this work item), applies it to product
 * records, and completes it. Stripe stays the payment authority — this
 * function only applies what Stripe said.
 */
export const stripeEventProcessing = inngest.createFunction(
  {
    id: "stripe-event-processing",
    triggers: [{ event: STRIPE_EVENT_PROCESS_EVENT }],
    retries: 3,
    concurrency: [{ key: "event.data.tenantId", limit: 5 }],
  },
  async ({ event, step }) => {
    const parsed = workflowEventEnvelopeSchema.safeParse(event.data);

    if (!parsed.success) {
      throw new NonRetriableError(
        `workflow_envelope_invalid: ${parsed.error.issues
          .map((issue) => issue.path.join(".") || issue.code)
          .join(", ")}`,
      );
    }

    const rawEventId = parsed.data.subject.id;

    return await step.run("process-stored-stripe-event", async () => {
      const { client: supabaseAdmin, error: adminError } = getAdminClient();

      if (!supabaseAdmin) {
        throw new Error(
          `stripe_event_admin_client_unavailable: ${adminError ?? "unknown"}`,
        );
      }

      const claim = await claimStripeRawEvent({ supabaseAdmin, rawEventId });

      if (!claim.claimed) {
        // Duplicate dispatch or concurrent processing: the stored event is
        // already owned elsewhere. No product effect may run twice.
        return {
          action: "stripe_event_already_claimed",
          handled: true,
          skipped: true,
          processingStatus: claim.rawEvent.processingStatus,
        };
      }

      try {
        const stripeEvent = getRawPayloadEvent(
          claim.rawEvent,
        ) as unknown as Stripe.Event;

        const outcome = await handleStripeWebhookEvent(
          supabaseAdmin,
          stripeEvent,
          {
            rawEventId: claim.rawEvent.id,
            stripeEventId: claim.rawEvent.stripeEventId,
          },
        );

        await completeStripeRawEvent({
          supabaseAdmin,
          rawEventId: claim.rawEvent.id,
          lockId: claim.lockId,
          status: outcome.handled ? "processed" : "ignored",
          outcome: {
            action: outcome.action,
            donationId: outcome.donationId,
            handled: outcome.handled,
            paymentIntentId: outcome.paymentIntentId,
            pledgeId: outcome.pledgeId,
            reason: outcome.reason,
            stagedGiftId: outcome.stagedGiftId,
          },
          stagedGiftId: outcome.stagedGiftId ?? null,
        });

        return { ...outcome, rawEventId: claim.rawEvent.id };
      } catch (error) {
        try {
          await recordStripeRawEventFailure({
            supabaseAdmin,
            rawEventId: claim.rawEvent.id,
            lockId: claim.lockId,
            error,
          });
        } catch {
          // Preserve the original processing failure for the retry.
        }

        throw error;
      }
    });
  },
);
