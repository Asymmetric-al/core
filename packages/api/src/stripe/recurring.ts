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

function subscriptionReferenceToId(
  reference: string | { id?: string } | null | undefined,
): string | null {
  if (typeof reference === "string" && reference.length > 0) {
    return reference;
  }
  if (
    reference &&
    typeof reference === "object" &&
    typeof reference.id === "string"
  ) {
    return reference.id;
  }
  return null;
}

/** API 2026-05-27.dahlia: period end lives on subscription items, not Subscription. */
function getSubscriptionCurrentPeriodEnd(
  subscription: Stripe.Subscription,
): number | null {
  const items = subscription.items?.data ?? [];
  let maxEnd: number | null = null;

  for (const item of items) {
    const end = item.current_period_end;
    if (typeof end === "number" && Number.isFinite(end)) {
      if (maxEnd === null || end > maxEnd) {
        maxEnd = end;
      }
    }
  }

  return maxEnd;
}

function pledgeLookupTenantId(
  explicitTenantId: string | null | undefined,
  metadata: Stripe.Metadata | null | undefined,
): string | null {
  if (explicitTenantId && explicitTenantId.length > 0) {
    return explicitTenantId;
  }

  const fromMetadata = metadata?.tenant_id;
  return typeof fromMetadata === "string" && fromMetadata.length > 0
    ? fromMetadata
    : null;
}

async function findPledgeBySubscriptionId(
  supabaseAdmin: SupabaseAdminClient,
  subscriptionId: string,
  tenantId?: string | null,
): Promise<PledgeRow | null> {
  let query = supabaseAdmin
    .from("donor_pledges")
    .select("id, tenant_id, status, failed_charge_count, payments_completed")
    .eq("stripe_subscription_id", subscriptionId);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`pledge_lookup_failed: ${error.message}`);
  }

  return (data as PledgeRow | null) ?? null;
}

export async function updateSubscriptionPledge(params: {
  supabaseAdmin: SupabaseAdminClient;
  subscription: Stripe.Subscription;
  eventType: "customer.subscription.updated" | "customer.subscription.deleted";
  tenantId?: string | null;
}): Promise<StripeWebhookOutcome> {
  const tenantId = pledgeLookupTenantId(
    params.tenantId,
    params.subscription.metadata,
  );
  const pledge = await findPledgeBySubscriptionId(
    params.supabaseAdmin,
    params.subscription.id,
    tenantId,
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

  if (pledge.status === "cancelled" && status !== "cancelled") {
    // Cancellation is terminal. A non-cancelled snapshot here is a stale
    // customer.subscription.updated (created before the deletion) arriving
    // late through retries or the recovery scan — applying it would
    // resurrect the pledge and schedule a charge that will never come.
    return {
      action: "pledge_cancellation_preserved",
      handled: true,
      pledgeId: pledge.id,
      reason: "Pledge is cancelled; stale subscription update ignored.",
    };
  }

  const patch: Record<string, unknown> = { status };

  if (isDeleted) {
    const canceledAtIso = toIsoFromEpochSeconds(
      params.subscription.canceled_at ?? params.subscription.ended_at,
    );
    patch.end_date = (canceledAtIso ?? new Date().toISOString()).slice(0, 10);
  } else {
    const nextChargeAt = toIsoFromEpochSeconds(
      getSubscriptionCurrentPeriodEnd(params.subscription),
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
  const fromParent = subscriptionReferenceToId(
    invoice.parent?.subscription_details?.subscription,
  );
  if (fromParent) {
    return fromParent;
  }

  // Legacy webhook payloads (pre-basil) may still carry top-level subscription.
  const legacySubscription = (
    invoice as Stripe.Invoice & {
      subscription?: string | { id?: string } | null;
    }
  ).subscription;

  return subscriptionReferenceToId(legacySubscription);
}

export async function updateInvoicePledge(params: {
  supabaseAdmin: SupabaseAdminClient;
  invoice: Stripe.Invoice;
  outcome: "paid" | "failed";
  tenantId?: string | null;
}): Promise<StripeWebhookOutcome> {
  const subscriptionId = getInvoiceSubscriptionId(params.invoice);

  if (!subscriptionId) {
    return {
      action: "ignored",
      handled: false,
      reason: "Invoice event has no subscription reference.",
    };
  }

  const tenantId = pledgeLookupTenantId(
    params.tenantId,
    params.invoice.metadata,
  );
  const pledge = await findPledgeBySubscriptionId(
    params.supabaseAdmin,
    subscriptionId,
    tenantId,
  );

  if (!pledge) {
    return {
      action: "ignored",
      handled: false,
      reason: `No pledge found for Stripe subscription ${subscriptionId}.`,
    };
  }

  const nowIso = new Date().toISOString();
  const paidAtIso =
    toIsoFromEpochSeconds(params.invoice.status_transitions?.paid_at) ?? nowIso;

  const patch: Record<string, unknown> =
    params.outcome === "paid"
      ? {
          // Stripe does not guarantee event ordering: a late invoice.paid
          // after customer.subscription.deleted must never reactivate a
          // cancelled pledge. Counters still record the collection.
          ...(pledge.status === "cancelled" ? {} : { status: "active" }),
          last_charge_at: paidAtIso,
          last_charge_attempt: paidAtIso,
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
