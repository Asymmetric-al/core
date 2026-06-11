import type { StripeWebhookOutcome } from "./webhooks";
import type { getAdminClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

interface PledgeRow {
  id: string;
  tenant_id: string | null;
  status: string | null;
  failed_charge_count: number | null;
  payments_completed: number | null;
}

/**
 * Recurring donations use Stripe Billing lifecycle semantics. These handlers
 * apply subscription/invoice events to the product pledge record; they never
 * create charges or build a renewal loop — Stripe owns recurring billing and
 * remains the payment authority.
 *
 * Pledge status vocabulary stays within the product's existing values
 * (active, paused, cancelled). Collection distress is tracked in
 * failed_charge_count / last_charge_attempt; staff-facing payment language is
 * a separate giving-surfaces concern.
 */
function mapSubscriptionStatusToPledgeStatus(
  subscription: Stripe.Subscription,
): string {
  if (
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired"
  ) {
    return "cancelled";
  }

  if (subscription.status === "paused" || subscription.pause_collection) {
    return "paused";
  }

  return "active";
}

function toIsoFromEpochSeconds(
  value: number | null | undefined,
): string | null {
  if (!value || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}

async function findPledgeBySubscriptionId(
  supabaseAdmin: SupabaseAdminClient,
  subscriptionId: string,
): Promise<PledgeRow | null> {
  const { data, error } = await supabaseAdmin
    .from("donor_pledges")
    .select("id, tenant_id, status, failed_charge_count, payments_completed")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(`pledge_lookup_failed: ${error.message}`);
  }

  return (data as PledgeRow | null) ?? null;
}

export async function updateSubscriptionPledge(params: {
  supabaseAdmin: SupabaseAdminClient;
  subscription: Stripe.Subscription;
  eventType: "customer.subscription.updated" | "customer.subscription.deleted";
}): Promise<StripeWebhookOutcome> {
  const pledge = await findPledgeBySubscriptionId(
    params.supabaseAdmin,
    params.subscription.id,
  );

  if (!pledge) {
    return {
      action: "ignored",
      handled: false,
      reason: `No pledge found for Stripe subscription ${params.subscription.id}.`,
    };
  }

  const isDeleted = params.eventType === "customer.subscription.deleted";
  const status = isDeleted
    ? "cancelled"
    : mapSubscriptionStatusToPledgeStatus(params.subscription);

  const patch: Record<string, unknown> = { status };

  if (isDeleted) {
    patch.end_date = new Date().toISOString().slice(0, 10);
  } else {
    const nextChargeAt = toIsoFromEpochSeconds(
      params.subscription.current_period_end,
    );
    if (nextChargeAt) {
      patch.next_charge_at = nextChargeAt;
    }
  }

  const { error } = await params.supabaseAdmin
    .from("donor_pledges")
    .update(patch)
    .eq("id", pledge.id);

  if (error) {
    throw new Error(`pledge_subscription_update_failed: ${error.message}`);
  }

  return {
    action: isDeleted ? "pledge_cancelled" : "pledge_subscription_updated",
    handled: true,
    pledgeId: pledge.id,
  };
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subscription = invoice.subscription;
  if (typeof subscription === "string" && subscription.length > 0) {
    return subscription;
  }
  if (
    subscription &&
    typeof subscription === "object" &&
    typeof subscription.id === "string"
  ) {
    return subscription.id;
  }
  return null;
}

export async function updateInvoicePledge(params: {
  supabaseAdmin: SupabaseAdminClient;
  invoice: Stripe.Invoice;
  outcome: "paid" | "failed";
}): Promise<StripeWebhookOutcome> {
  const subscriptionId = getInvoiceSubscriptionId(params.invoice);

  if (!subscriptionId) {
    return {
      action: "ignored",
      handled: false,
      reason: "Invoice event has no subscription reference.",
    };
  }

  const pledge = await findPledgeBySubscriptionId(
    params.supabaseAdmin,
    subscriptionId,
  );

  if (!pledge) {
    return {
      action: "ignored",
      handled: false,
      reason: `No pledge found for Stripe subscription ${subscriptionId}.`,
    };
  }

  const nowIso = new Date().toISOString();

  const patch: Record<string, unknown> =
    params.outcome === "paid"
      ? {
          status: "active",
          last_charge_at: nowIso,
          last_charge_attempt: nowIso,
          failed_charge_count: 0,
          payments_completed: (pledge.payments_completed ?? 0) + 1,
        }
      : {
          last_charge_attempt: nowIso,
          failed_charge_count: (pledge.failed_charge_count ?? 0) + 1,
        };

  const { error } = await params.supabaseAdmin
    .from("donor_pledges")
    .update(patch)
    .eq("id", pledge.id);

  if (error) {
    throw new Error(`pledge_invoice_update_failed: ${error.message}`);
  }

  return {
    action:
      params.outcome === "paid"
        ? "pledge_invoice_paid"
        : "pledge_invoice_payment_failed",
    handled: true,
    pledgeId: pledge.id,
  };
}
