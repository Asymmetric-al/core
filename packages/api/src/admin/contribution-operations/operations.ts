import { serverEnv } from "@asym/env";
import Stripe from "stripe";

import { assertAllowedPaymentStateCorrectionStatus } from "./payment-status-allowlist";
import { loadContributionDetailFromSupabase } from "./store";
import { ApiHttpError } from "../../shared/http-errors";
import {
  loadStripeRawEventForReplay,
  markStripeRawEventForReplay,
} from "../../stripe/replay";

import type { ContributionActionType } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const STRIPE_API_VERSION = "2025-02-24.acacia";

type SupabaseAdmin = AdminSupabaseClient;

function requireStripeSecretKey(): string {
  const key = serverEnv.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiHttpError(503, "Stripe is not configured for refunds.");
  }
  return key;
}

export async function refundContribution(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  amount: number;
  reason: string;
  confirmationToken: string;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("donations")
    .select("id, tenant_id, amount, refund_amount, status, stripe_charge_id")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.contributionId)
    .single();

  if (error || !data) {
    throw new ApiHttpError(404, "Contribution not found for refund.");
  }

  const amount = typeof data.amount === "number" ? data.amount : 0;
  const refunded =
    typeof data.refund_amount === "number" ? data.refund_amount : 0;
  const remaining = Math.max(0, amount - refunded);
  if (input.amount > remaining) {
    throw new ApiHttpError(
      400,
      "Refund amount exceeds remaining refundable amount.",
    );
  }
  if (!data.stripe_charge_id) {
    throw new ApiHttpError(
      409,
      "Contribution does not have a Stripe charge id.",
    );
  }

  try {
    const stripe = new Stripe(requireStripeSecretKey(), {
      apiVersion: STRIPE_API_VERSION,
    });
    const refund = await stripe.refunds.create(
      {
        charge: data.stripe_charge_id,
        amount: input.amount,
        metadata: {
          donation_id: input.contributionId,
          tenant_id: input.tenantId,
          reason: input.reason,
        },
      },
      {
        idempotencyKey: `contribution-refund/${input.tenantId}/${input.contributionId}/${input.amount}/${input.confirmationToken}`,
      },
    );

    const providerStatus = refund.status ?? "pending";
    const nextRefundAmount = refunded + input.amount;
    const updateResult = await input.supabaseAdmin
      .from("donations")
      .update({
        refund_amount: nextRefundAmount,
        refunded_at: new Date().toISOString(),
        status:
          providerStatus === "succeeded" && nextRefundAmount >= amount
            ? "refunded"
            : data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", input.contributionId)
      .eq("refund_amount", refunded);

    if (updateResult.error) {
      return {
        provider: "stripe" as const,
        status: "local_update_failed",
        referenceId: refund.id,
        errorCode: "local_contribution_update_failed",
        errorMessage: `Stripe refund ${refund.id} was created, but the local contribution state could not be updated: ${updateResult.error.message}`,
        raw: {
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
        },
      };
    }

    if ((updateResult.count ?? 0) === 0) {
      throw new ApiHttpError(
        409,
        "Contribution refund state changed concurrently. Retry the refund.",
      );
    }

    return {
      provider: "stripe" as const,
      status: providerStatus,
      referenceId: refund.id,
      raw: {
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
      },
    };
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw error;
    }

    return {
      provider: "stripe" as const,
      status: "failed",
      errorCode:
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "stripe_refund_failed",
      errorMessage:
        error instanceof Error ? error.message : "Stripe refund failed.",
    };
  }
}

export async function applyContributionCorrection(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  actionType: ContributionActionType;
  payload: Record<string, unknown>;
}) {
  const before = await loadContributionDetailFromSupabase(input);
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.actionType === "amount_correction") {
    const amount = input.payload.amount;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
      throw new ApiHttpError(400, "amount must be a non-negative number.");
    }
    patch.amount = amount;
  } else if (
    input.actionType === "designation_correction" ||
    input.actionType === "fund_correction"
  ) {
    const fundId = input.payload.fundId;
    patch.fund_id = typeof fundId === "string" ? fundId : null;
  } else if (input.actionType === "allocation_correction") {
    const fundId = input.payload.fundId;
    const missionaryId = input.payload.missionaryId;
    patch.fund_id = typeof fundId === "string" ? fundId : null;
    patch.missionary_id =
      typeof missionaryId === "string" ? missionaryId : null;
  } else if (input.actionType === "payment_state_correction") {
    const status = input.payload.status;
    if (typeof status !== "string" || status.trim().length === 0) {
      throw new ApiHttpError(400, "status is required.");
    }
    assertAllowedPaymentStateCorrectionStatus(status);
    patch.status = status;
  } else {
    throw new ApiHttpError(
      501,
      `${input.actionType} requires a dedicated operation adapter before it can be applied.`,
    );
  }

  const { error } = await input.supabaseAdmin
    .from("donations")
    .update(patch)
    .eq("tenant_id", input.tenantId)
    .eq("id", input.contributionId);

  if (error) {
    throw new Error(error.message);
  }

  const after = await loadContributionDetailFromSupabase(input);

  return {
    before: {
      amount: before.amount.value,
      donorId: before.donor?.id ?? null,
      fundId: before.shared.designationSummary.fundId,
      missionaryId: before.shared.designationSummary.missionaryId,
      status: before.payment.status,
    },
    after: {
      amount: after.amount.value,
      donorId: after.donor?.id ?? null,
      fundId: after.shared.designationSummary.fundId,
      missionaryId: after.shared.designationSummary.missionaryId,
      status: after.payment.status,
    },
    status: "applied" as const,
  };
}

export async function relinkContributionDonor(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  donorId: string;
}) {
  const { data: donor, error: donorError } = await input.supabaseAdmin
    .from("donors")
    .select("id, tenant_id")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.donorId)
    .maybeSingle();

  if (donorError) {
    throw new Error(donorError.message);
  }
  if (!donor) {
    throw new ApiHttpError(404, "Donor not found in this organization.");
  }

  const before = await loadContributionDetailFromSupabase(input);
  const { error } = await input.supabaseAdmin
    .from("donations")
    .update({
      donor_id: input.donorId,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.contributionId);
  if (error) throw new Error(error.message);

  return {
    before: { donorId: before.donor?.id ?? null },
    after: { donorId: input.donorId },
  };
}

export async function replayStripeEventThroughContributionOperations(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  stripeEventId: string;
}) {
  const rawEvent = await loadStripeRawEventForReplay(input);
  await markStripeRawEventForReplay({
    supabaseAdmin: input.supabaseAdmin,
    rawEventId: rawEvent.id,
  });
  return rawEvent;
}
