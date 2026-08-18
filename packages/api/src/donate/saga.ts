import { randomUUID } from "node:crypto";

import {
  createDonationPaymentIntent,
  mergeDonationPaymentIntentMetadata,
} from "./payment-intent";

import type { getAdminClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

type DonationSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

interface DonationSagaProcessParams {
  supabaseAdmin: DonationSupabaseClient;
  stripe: Stripe;
  outboxId: string;
  actorUserId: string;
  extraPaymentIntentMetadata?: Record<string, string>;
}

interface DonationSagaProcessResult {
  status: "completed" | "processing" | "failed";
  donationId: string;
  outboxId: string;
  paymentIntentId?: string;
  clientSecret?: string | null;
  error?: string;
}

interface DonationSagaClaimRow {
  claimed?: boolean;
  outbox_id?: string;
  donation_id?: string;
  donor_id?: string;
  tenant_id?: string;
  missionary_id?: string | null;
  fund_id?: string | null;
  amount?: number;
  currency?: string;
  attempt_count?: number;
  idempotency_key?: string;
  stripe_customer_id?: string | null;
}

function parseRpcObject<T extends object>(value: unknown): T | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as T) : null;
  }
  return typeof value === "object" ? (value as T) : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getClientSecretFromGatewayResponse(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const maybeRecord = value as Record<string, unknown>;
  return stringOrNull(maybeRecord.clientSecret);
}

function getErrorCode(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.length > 0) {
      return code;
    }
  }
  return "donation_saga_error";
}

async function recordSagaFailure(params: {
  supabaseAdmin: DonationSupabaseClient;
  outboxId: string;
  lockId: string;
  actorUserId: string;
  errorCode: string;
  errorMessage: string;
}) {
  await params.supabaseAdmin.rpc("record_donation_saga_failure", {
    p_outbox_id: params.outboxId,
    p_lock_id: params.lockId,
    p_error_code: params.errorCode,
    p_error_message: params.errorMessage,
    p_retry_delay_seconds: 60,
    p_dead_letter_after: 5,
    p_actor_user_id: params.actorUserId,
  });
}

async function getOutboxState(
  supabaseAdmin: DonationSupabaseClient,
  outboxId: string,
) {
  const { data: outboxData, error: outboxError } = await supabaseAdmin
    .from("donation_saga_outbox")
    .select(
      "id, donation_id, status, stripe_payment_intent_id, gateway_response, last_error_code, last_error_message",
    )
    .eq("id", outboxId)
    .single();
  if (outboxError || !outboxData) {
    throw new Error(outboxError?.message ?? "Donation outbox record not found");
  }
  return outboxData;
}

async function ensureStripeCustomerId(params: {
  supabaseAdmin: DonationSupabaseClient;
  stripe: Stripe;
  donorId: string;
  tenantId: string;
  actorUserId: string;
  idempotencyKey: string;
  existingStripeCustomerId: string | null;
}) {
  if (params.existingStripeCustomerId) {
    return params.existingStripeCustomerId;
  }

  const { data: donor, error: donorError } = await params.supabaseAdmin
    .from("donors")
    .select("id, profile_id, stripe_customer_id")
    .eq("id", params.donorId)
    .single();
  if (donorError || !donor) {
    throw new Error(donorError?.message ?? "Donor not found");
  }

  const donorStripeCustomerId = stringOrNull(donor.stripe_customer_id);
  if (donorStripeCustomerId) {
    return donorStripeCustomerId;
  }

  const profileId = stringOrNull(donor.profile_id);
  let email: string | undefined;
  let name: string | undefined;

  if (profileId) {
    const { data: profile } = await params.supabaseAdmin
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", profileId)
      .single();

    email = stringOrNull(profile?.email) ?? undefined;
    const firstName = stringOrNull(profile?.first_name);
    const lastName = stringOrNull(profile?.last_name);
    if (firstName || lastName) {
      name = [firstName, lastName].filter(Boolean).join(" ");
    }
  }

  const customer = await params.stripe.customers.create(
    {
      email,
      name,
      metadata: {
        donor_id: params.donorId,
        tenant_id: params.tenantId,
        user_id: params.actorUserId,
      },
    },
    {
      idempotencyKey: `${params.idempotencyKey}:customer`,
    },
  );

  return customer.id;
}

async function processClaimedDonationSagaEvent(params: {
  supabaseAdmin: DonationSupabaseClient;
  stripe: Stripe;
  actorUserId: string;
  lockId: string;
  outboxId: string;
  claim: DonationSagaClaimRow;
  extraPaymentIntentMetadata?: Record<string, string>;
}): Promise<DonationSagaProcessResult> {
  const donationId = stringOrNull(params.claim.donation_id);
  const donorId = stringOrNull(params.claim.donor_id);
  const tenantId = stringOrNull(params.claim.tenant_id);
  const idempotencyKey = stringOrNull(params.claim.idempotency_key);
  const amount = Number(params.claim.amount);
  const currency = stringOrNull(params.claim.currency)?.toLowerCase();

  if (!donationId || !donorId || !tenantId || !idempotencyKey || !currency) {
    throw new Error("Invalid donation saga claim payload");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid donation amount in saga claim");
  }

  const stripeCustomerId = await ensureStripeCustomerId({
    supabaseAdmin: params.supabaseAdmin,
    stripe: params.stripe,
    donorId,
    tenantId,
    actorUserId: params.actorUserId,
    idempotencyKey,
    existingStripeCustomerId: stringOrNull(params.claim.stripe_customer_id),
  });

  const paymentIntent = await createDonationPaymentIntent(params.stripe, {
    amountCents: amount,
    currency,
    customerId: stripeCustomerId,
    idempotencyKey,
    metadata: mergeDonationPaymentIntentMetadata({
      donationId,
      donorId,
      missionaryId: stringOrNull(params.claim.missionary_id) ?? "",
      fundId: stringOrNull(params.claim.fund_id) ?? "",
      tenantId,
      actorUserId: params.actorUserId,
      extra: params.extraPaymentIntentMetadata,
    }),
  });

  const gatewayResponse = {
    clientSecret: paymentIntent.clientSecret,
    stripePaymentIntentId: paymentIntent.paymentIntentId,
    stripeCustomerId,
    stripeStatus: paymentIntent.status,
    attemptCount: params.claim.attempt_count ?? 1,
  };

  const { error: completeError } = await params.supabaseAdmin.rpc(
    "complete_donation_saga_event",
    {
      p_outbox_id: params.outboxId,
      p_lock_id: params.lockId,
      p_stripe_payment_intent_id: paymentIntent.paymentIntentId,
      p_stripe_customer_id: stripeCustomerId,
      p_gateway_response: gatewayResponse,
    },
  );

  if (completeError) {
    throw new Error(completeError.message);
  }

  return {
    status: "completed",
    donationId,
    outboxId: params.outboxId,
    paymentIntentId: paymentIntent.paymentIntentId,
    clientSecret: paymentIntent.clientSecret,
  };
}

export async function processDonationSagaOutboxEvent({
  supabaseAdmin,
  stripe,
  outboxId,
  actorUserId,
  extraPaymentIntentMetadata,
}: DonationSagaProcessParams): Promise<DonationSagaProcessResult> {
  const lockId = randomUUID();
  let lockClaimed = false;
  let lockedOutboxId = outboxId;

  try {
    const { data: claimRaw, error: claimError } = await supabaseAdmin.rpc(
      "claim_donation_saga_event",
      {
        p_outbox_id: outboxId,
        p_lock_id: lockId,
      },
    );

    if (claimError) {
      throw new Error(claimError.message);
    }

    const claim = parseRpcObject<DonationSagaClaimRow>(claimRaw);
    const claimed = Boolean(claim?.claimed);

    if (!claimed) {
      const outbox = await getOutboxState(supabaseAdmin, outboxId);
      const status = stringOrNull(outbox.status);
      const donationId = stringOrNull(outbox.donation_id) ?? "";

      if (status === "completed") {
        return {
          status: "completed",
          donationId,
          outboxId,
          paymentIntentId:
            stringOrNull(outbox.stripe_payment_intent_id) ?? undefined,
          clientSecret: getClientSecretFromGatewayResponse(
            outbox.gateway_response,
          ),
        };
      }

      return {
        status: status === "dead_letter" ? "failed" : "processing",
        donationId,
        outboxId,
        error:
          stringOrNull(outbox.last_error_message) ??
          "Donation is still being processed",
      };
    }

    lockClaimed = true;
    const claimOutboxId = stringOrNull(claim?.outbox_id) ?? outboxId;
    lockedOutboxId = claimOutboxId;

    return await processClaimedDonationSagaEvent({
      supabaseAdmin,
      stripe,
      actorUserId,
      lockId,
      outboxId: claimOutboxId,
      claim: claim ?? {},
      extraPaymentIntentMetadata,
    });
  } catch (error) {
    if (lockClaimed) {
      try {
        await recordSagaFailure({
          supabaseAdmin,
          outboxId: lockedOutboxId,
          lockId,
          actorUserId,
          errorCode: getErrorCode(error),
          errorMessage:
            error instanceof Error ? error.message : "Donation saga failure",
        });
      } catch {
        // Avoid shadowing the original failure.
      }
    }

    throw error;
  }
}

export async function processDueDonationSagaOutboxEvents(params: {
  supabaseAdmin: DonationSupabaseClient;
  stripe: Stripe;
  actorUserId: string;
  tenantId: string;
  limit?: number;
}) {
  const limit = Math.max(1, Math.min(params.limit ?? 10, 100));
  const lockId = randomUUID();

  const { data: claimRaw, error: claimError } = await params.supabaseAdmin.rpc(
    "claim_due_donation_saga_events",
    {
      p_tenant_id: params.tenantId,
      p_limit: limit,
      p_lock_id: lockId,
    },
  );
  if (claimError) {
    throw new Error(claimError.message);
  }

  const rows = Array.isArray(claimRaw)
    ? claimRaw.filter(
        (row): row is DonationSagaClaimRow =>
          Boolean(row) && typeof row === "object",
      )
    : [];
  const results: DonationSagaProcessResult[] = [];

  for (const row of rows) {
    const outboxId = stringOrNull(row.outbox_id);
    if (!outboxId) {
      continue;
    }
    const donationId = stringOrNull(row.donation_id) ?? "";
    try {
      const result = await processClaimedDonationSagaEvent({
        supabaseAdmin: params.supabaseAdmin,
        stripe: params.stripe,
        actorUserId: params.actorUserId,
        lockId,
        outboxId,
        claim: row,
      });
      results.push(result);
    } catch (error) {
      try {
        await recordSagaFailure({
          supabaseAdmin: params.supabaseAdmin,
          outboxId,
          lockId,
          actorUserId: params.actorUserId,
          errorCode: getErrorCode(error),
          errorMessage:
            error instanceof Error ? error.message : "Donation saga failure",
        });
      } catch {
        // Ignore failure-recording errors to keep batch progress.
      }

      results.push({
        status: "failed",
        donationId,
        outboxId,
        error: error instanceof Error ? error.message : "Donation saga failure",
      });
    }
  }

  return {
    attempted: rows.length,
    completed: results.filter((result) => result.status === "completed").length,
    failed: results.filter((result) => result.status === "failed").length,
    processing: results.filter((result) => result.status === "processing")
      .length,
    results,
  };
}
