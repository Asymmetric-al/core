import { getAdminClient } from "@asym/database/supabase/admin";
import { RetryAfterError } from "inngest";

import {
  claimStripeRawEvent,
  completeStripeRawEvent,
  getRawPayloadEvent,
  recordStripeRawEventFailure,
} from "../../stripe/event-store";
import { handleStripeWebhookEvent } from "../../stripe/webhooks";
import { runStripeEventRecoveryScan } from "../adapters/stripe-events";
import { parseWorkflowEnvelopeOrThrow } from "../envelope-guard";
import { STRIPE_EVENT_PROCESS_EVENT } from "../events";
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
    const envelope = parseWorkflowEnvelopeOrThrow(event.data);
    const rawEventId = envelope.subject.id;

    return await step.run("process-stored-stripe-event", async () => {
      const { client: supabaseAdmin, error: adminError } = getAdminClient();

      if (!supabaseAdmin) {
        throw new Error(
          `stripe_event_admin_client_unavailable: ${adminError ?? "unknown"}`,
        );
      }

      const claim = await claimStripeRawEvent({ supabaseAdmin, rawEventId });

      if (!claim.claimed) {
        const processingStatus = claim.rawEvent.processingStatus;

        if (processingStatus === "failed" || processingStatus === "received") {
          // The claim RPC refuses 'failed'/'received' rows only while their
          // next_attempt_at backoff (60s) has not elapsed — and Inngest's
          // first retry always fires inside that window. Completing here
          // would strand the event (Stripe already got its 200), so retry
          // after the backoff instead.
          throw new RetryAfterError("stripe_event_claim_backoff", "70s");
        }

        // Genuinely owned elsewhere or terminal (processing, processed,
        // ignored, dead_letter): no product effect may run twice.
        return {
          action: "stripe_event_already_claimed",
          handled: true,
          skipped: true,
          processingStatus,
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

/**
 * Scheduled recovery for stored Stripe events whose processing failed.
 * Stripe received a 200 at storage time and will not redeliver; this scan
 * gives failed events the same automated recovery story as donation saga
 * rows. The per-event function re-claims through claim_stripe_raw_event, so
 * duplicate dispatch cannot duplicate payment effects.
 */
export const stripeEventRecoveryScan = inngest.createFunction(
  {
    id: "stripe-event-recovery-scan",
    triggers: [{ cron: "*/2 * * * *" }],
    retries: 2,
    concurrency: [{ limit: 1 }],
  },
  async ({ step }) => {
    return await step.run("scan-failed-stripe-events", async () => {
      const { client, error } = getAdminClient();

      if (!client) {
        throw new Error(
          `stripe_event_recovery_admin_client_unavailable: ${error ?? "unknown"}`,
        );
      }

      return await runStripeEventRecoveryScan({ client });
    });
  },
);
