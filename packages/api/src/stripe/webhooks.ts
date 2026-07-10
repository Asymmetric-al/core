import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { createStripeClient } from "./client";
import {
  claimStripeRawEvent,
  completeStripeRawEvent,
  recordStripeRawEventFailure,
  storeStripeRawEvent,
} from "./event-store";
import { updateInvoicePledge, updateSubscriptionPledge } from "./recurring";
import {
  applyRefundedChargeToDonation,
  findDonationByPaymentIntentId,
  getStripeObjectId,
  updateDonation,
} from "./refunds";
import {
  StripeWebhookVerificationError,
  constructVerifiedStripeEvent,
} from "./verify-event";
import { stageGiftFromStripeDonation } from "../giving/staged-gifts";
import { STRIPE_EVENT_PROCESS_EVENT } from "../workflows/events";
import { requestWorkflowDispatch } from "../workflows/ledger";

import type Stripe from "stripe";

export { getStripeObjectId };

const TERMINAL_PAID_STATUSES = new Set(["completed", "refunded"]);

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

export interface StripeWebhookOutcome {
  action: string;
  donationId?: string;
  handled: boolean;
  paymentIntentId?: string;
  pledgeId?: string;
  reason?: string;
  stagedGiftId?: string | null;
}

/**
 * Event types the product processes through the durable workflow executor
 * once the raw event is stored. Anything else is stored and marked ignored
 * with a safe reason at the webhook boundary.
 */
const WORKFLOW_DISPATCHED_STRIPE_EVENT_TYPES = new Set<string>([
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "payment_intent.processing",
  "charge.refunded",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

export function isWorkflowDispatchedStripeEventType(
  eventType: string,
): boolean {
  return WORKFLOW_DISPATCHED_STRIPE_EVENT_TYPES.has(eventType);
}

interface StripeWebhookProcessingContext {
  rawEventId?: string | null;
  stripeEventId?: string | null;
  tenantId?: string | null;
}

export function getPaymentIntentLatestChargeId(
  paymentIntent: Stripe.PaymentIntent,
) {
  return getStripeObjectId(paymentIntent.latest_charge);
}

function getPaymentIntentErrorCode(paymentIntent: Stripe.PaymentIntent) {
  return paymentIntent.last_payment_error?.code ?? "stripe_payment_failed";
}

function getPaymentIntentErrorMessage(paymentIntent: Stripe.PaymentIntent) {
  return (
    paymentIntent.last_payment_error?.message ??
    "Stripe reported that the payment intent did not complete."
  );
}

async function updatePaymentIntentDonation(params: {
  supabaseAdmin: SupabaseAdminClient;
  paymentIntent: Stripe.PaymentIntent;
  status: "completed" | "failed" | "processing";
  context?: StripeWebhookProcessingContext;
}) {
  const { supabaseAdmin, paymentIntent, status, context } = params;
  const donation = await findDonationByPaymentIntentId(
    supabaseAdmin,
    paymentIntent.id,
  );

  if (!donation) {
    return {
      action: "payment_intent_not_matched",
      handled: true,
      paymentIntentId: paymentIntent.id,
      reason: "No donation matched the Stripe payment intent.",
    } satisfies StripeWebhookOutcome;
  }

  if (TERMINAL_PAID_STATUSES.has(donation.status)) {
    return {
      action: "terminal_status_preserved",
      donationId: donation.id,
      handled: true,
      paymentIntentId: paymentIntent.id,
      reason: `Donation already has terminal status ${donation.status}.`,
    } satisfies StripeWebhookOutcome;
  }

  const timestamp = new Date().toISOString();
  const updateValues: Record<string, unknown> = {
    status,
    updated_at: timestamp,
  };

  if (status === "completed") {
    updateValues.completed_at = timestamp;
    updateValues.processed_at = timestamp;
    updateValues.failed_at = null;
    updateValues.error_code = null;
    updateValues.error_message = null;
    updateValues.stripe_charge_id =
      getPaymentIntentLatestChargeId(paymentIntent);
  } else if (status === "failed") {
    updateValues.failed_at = timestamp;
    updateValues.error_code = getPaymentIntentErrorCode(paymentIntent);
    updateValues.error_message = getPaymentIntentErrorMessage(paymentIntent);
  }

  await updateDonation(supabaseAdmin, donation.id, updateValues);
  let stagedGiftId: string | null = null;

  if (status === "completed") {
    const stagedGift = await stageGiftFromStripeDonation({
      supabaseAdmin,
      donation: {
        ...donation,
        status,
        stripe_charge_id:
          getPaymentIntentLatestChargeId(paymentIntent) ??
          donation.stripe_charge_id,
      },
      rawEventId: context?.rawEventId ?? null,
      stripeEventId: context?.stripeEventId ?? "",
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: getPaymentIntentLatestChargeId(paymentIntent),
    });
    stagedGiftId = stagedGift.id;
  }

  return {
    action: `payment_intent_${status}`,
    donationId: donation.id,
    handled: true,
    paymentIntentId: paymentIntent.id,
    stagedGiftId,
  } satisfies StripeWebhookOutcome;
}

export async function handleStripeWebhookEvent(
  supabaseAdmin: SupabaseAdminClient,
  event: Stripe.Event,
  context: StripeWebhookProcessingContext = {},
): Promise<StripeWebhookOutcome> {
  switch (event.type) {
    case "payment_intent.succeeded":
      return updatePaymentIntentDonation({
        supabaseAdmin,
        paymentIntent: event.data.object as Stripe.PaymentIntent,
        status: "completed",
        context: {
          rawEventId: context.rawEventId,
          stripeEventId: context.stripeEventId ?? event.id,
        },
      });
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
      return updatePaymentIntentDonation({
        supabaseAdmin,
        paymentIntent: event.data.object as Stripe.PaymentIntent,
        status: "failed",
        context,
      });
    case "payment_intent.processing":
      return updatePaymentIntentDonation({
        supabaseAdmin,
        paymentIntent: event.data.object as Stripe.PaymentIntent,
        status: "processing",
        context,
      });
    case "charge.refunded":
      return applyRefundedChargeToDonation(
        supabaseAdmin,
        event.data.object as Stripe.Charge,
      );
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return updateSubscriptionPledge({
        supabaseAdmin,
        subscription: event.data.object as Stripe.Subscription,
        eventType: event.type,
        tenantId: context.tenantId,
      });
    case "invoice.paid":
      return updateInvoicePledge({
        supabaseAdmin,
        invoice: event.data.object as Stripe.Invoice,
        outcome: "paid",
        tenantId: context.tenantId,
      });
    case "invoice.payment_failed":
      return updateInvoicePledge({
        supabaseAdmin,
        invoice: event.data.object as Stripe.Invoice,
        outcome: "failed",
        tenantId: context.tenantId,
      });
    default:
      return {
        action: "ignored",
        handled: false,
        reason: `Unhandled Stripe event type ${event.type}.`,
      };
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Need the secret key to build the client that verifies the signature.
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const stripe = createStripeClient(secretKey);
  let event: Stripe.Event;

  try {
    event = constructVerifiedStripeEvent({
      stripe,
      rawBody,
      signature,
      secret: webhookSecret,
    });
  } catch (error) {
    if (error instanceof StripeWebhookVerificationError) {
      // not_configured (missing whsec) → 500; missing/invalid signature → 400.
      const status = error.reason === "not_configured" ? 500 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  const { client: supabaseAdmin, error: adminError } = getAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: adminError }, { status: 503 });
  }

  let processingClaim: { rawEventId: string; lockId: string } | null = null;

  try {
    const storedEvent = await storeStripeRawEvent({
      supabaseAdmin,
      event,
      rawBody,
      // Non-null here: a verified event guarantees the signature was present.
      signatureHeader: signature ?? "",
    });

    // Durable storage is provider webhook acceptance. Supported tenant-scoped
    // events hand processing to the workflow executor; an immediate dispatch
    // failure is recorded on the dispatch ledger and recovered internally
    // instead of forcing Stripe to replay an already accepted event.
    if (
      isWorkflowDispatchedStripeEventType(event.type) &&
      storedEvent.tenantId
    ) {
      try {
        const dispatch = await requestWorkflowDispatch(
          { client: supabaseAdmin },
          {
            tenantId: storedEvent.tenantId,
            productArea: "giving",
            workflowName: STRIPE_EVENT_PROCESS_EVENT,
            subject: { type: "stripe_raw_event", id: storedEvent.id },
            idempotencyKey: `stripe-event/${storedEvent.stripeEventId}`,
          },
        );

        return NextResponse.json({
          action: "workflow_dispatch",
          dispatch: dispatch.outcome,
          eventId: event.id,
          eventType: event.type,
          handled: true,
          rawEventId: storedEvent.id,
          received: true,
        });
      } catch {
        // Ledger unavailable: fall back to inline processing so the stored
        // event is still handled on the legacy path.
      }
    }

    const claim = await claimStripeRawEvent({
      supabaseAdmin,
      rawEventId: storedEvent.id,
    });

    if (!claim.claimed) {
      return NextResponse.json({
        action: "stripe_event_already_recorded",
        eventId: event.id,
        eventType: event.type,
        handled: true,
        rawEventId: storedEvent.id,
        received: true,
        reason: `Stripe event is already ${claim.rawEvent.processingStatus}.`,
      });
    }

    processingClaim = {
      rawEventId: storedEvent.id,
      lockId: claim.lockId,
    };
    const outcome = await handleStripeWebhookEvent(supabaseAdmin, event, {
      rawEventId: storedEvent.id,
      stripeEventId: event.id,
      tenantId: storedEvent.tenantId,
    });
    await completeStripeRawEvent({
      supabaseAdmin,
      rawEventId: storedEvent.id,
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
    processingClaim = null;

    return NextResponse.json({
      eventId: event.id,
      eventType: event.type,
      rawEventId: storedEvent.id,
      received: true,
      ...outcome,
    });
  } catch (error) {
    // A raw event can only be marked failed after it has been claimed. If
    // storage or claiming failed there is no safe durable lock to update;
    // Stripe will retry from the non-2xx response.
    if (processingClaim) {
      try {
        await recordStripeRawEventFailure({
          supabaseAdmin,
          rawEventId: processingClaim.rawEventId,
          lockId: processingClaim.lockId,
          error,
        });
      } catch {
        // Preserve the original processing failure for the HTTP response.
      }
    }

    return NextResponse.json(
      { error: "Stripe webhook processing failed." },
      { status: 500 },
    );
  }
}
