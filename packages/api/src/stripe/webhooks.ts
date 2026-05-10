import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_API_VERSION = "2025-02-24.acacia";
const TERMINAL_PAID_STATUSES = new Set(["completed", "refunded"]);

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

interface DonationWebhookRow {
  id: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string | null;
}

interface StripeWebhookOutcome {
  action: string;
  donationId?: string;
  handled: boolean;
  paymentIntentId?: string;
  reason?: string;
}

function getStripeClient(secretKey: string) {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}

export function getStripeObjectId(
  value: string | { id?: string | null } | null | undefined,
) {
  if (typeof value === "string") {
    return value.length > 0 ? value : null;
  }

  if (value && typeof value.id === "string" && value.id.length > 0) {
    return value.id;
  }

  return null;
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

async function findDonationByPaymentIntentId(
  supabaseAdmin: SupabaseAdminClient,
  paymentIntentId: string,
) {
  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("id, amount, status, stripe_payment_intent_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DonationWebhookRow | null;
}

async function updateDonation(
  supabaseAdmin: SupabaseAdminClient,
  donationId: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabaseAdmin
    .from("donations")
    .update(values)
    .eq("id", donationId);

  if (error) {
    throw new Error(error.message);
  }
}

async function updatePaymentIntentDonation(params: {
  supabaseAdmin: SupabaseAdminClient;
  paymentIntent: Stripe.PaymentIntent;
  status: "completed" | "failed" | "processing";
}) {
  const { supabaseAdmin, paymentIntent, status } = params;
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

  return {
    action: `payment_intent_${status}`,
    donationId: donation.id,
    handled: true,
    paymentIntentId: paymentIntent.id,
  } satisfies StripeWebhookOutcome;
}

async function updateRefundedChargeDonation(
  supabaseAdmin: SupabaseAdminClient,
  charge: Stripe.Charge,
) {
  const paymentIntentId = getStripeObjectId(charge.payment_intent);
  if (!paymentIntentId) {
    return {
      action: "charge_refund_missing_payment_intent",
      handled: true,
      reason: "Stripe charge did not include a payment intent.",
    } satisfies StripeWebhookOutcome;
  }

  const donation = await findDonationByPaymentIntentId(
    supabaseAdmin,
    paymentIntentId,
  );

  if (!donation) {
    return {
      action: "charge_refund_not_matched",
      handled: true,
      paymentIntentId,
      reason: "No donation matched the refunded Stripe charge.",
    } satisfies StripeWebhookOutcome;
  }

  const timestamp = new Date().toISOString();
  const refundAmount = charge.amount_refunded ?? 0;
  const isFullRefund = refundAmount >= donation.amount;

  await updateDonation(supabaseAdmin, donation.id, {
    refund_amount: refundAmount,
    refunded_at: refundAmount > 0 ? timestamp : null,
    status: isFullRefund ? "refunded" : donation.status,
    stripe_charge_id: charge.id,
    updated_at: timestamp,
  });

  return {
    action: isFullRefund ? "charge_refunded" : "charge_partially_refunded",
    donationId: donation.id,
    handled: true,
    paymentIntentId,
  } satisfies StripeWebhookOutcome;
}

export async function handleStripeWebhookEvent(
  supabaseAdmin: SupabaseAdminClient,
  event: Stripe.Event,
): Promise<StripeWebhookOutcome> {
  switch (event.type) {
    case "payment_intent.succeeded":
      return updatePaymentIntentDonation({
        supabaseAdmin,
        paymentIntent: event.data.object as Stripe.PaymentIntent,
        status: "completed",
      });
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
      return updatePaymentIntentDonation({
        supabaseAdmin,
        paymentIntent: event.data.object as Stripe.PaymentIntent,
        status: "failed",
      });
    case "payment_intent.processing":
      return updatePaymentIntentDonation({
        supabaseAdmin,
        paymentIntent: event.data.object as Stripe.PaymentIntent,
        status: "processing",
      });
    case "charge.refunded":
      return updateRefundedChargeDonation(
        supabaseAdmin,
        event.data.object as Stripe.Charge,
      );
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
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const stripe = getStripeClient(secretKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  const { client: supabaseAdmin, error: adminError } = getAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: adminError }, { status: 503 });
  }

  try {
    const outcome = await handleStripeWebhookEvent(supabaseAdmin, event);
    return NextResponse.json({
      eventId: event.id,
      eventType: event.type,
      received: true,
      ...outcome,
    });
  } catch {
    return NextResponse.json(
      { error: "Stripe webhook processing failed." },
      { status: 500 },
    );
  }
}
