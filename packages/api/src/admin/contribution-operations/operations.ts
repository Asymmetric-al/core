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

function correctionEffectiveValues(
  actionType: ContributionActionType,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  if (actionType === "amount_correction") {
    const amount = payload.amount;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
      throw new ApiHttpError(400, "amount must be a non-negative number.");
    }
    return { amountCents: amount };
  }

  if (
    actionType === "designation_correction" ||
    actionType === "fund_correction"
  ) {
    const fundId = payload.fundId;
    return { fundId: typeof fundId === "string" ? fundId : null };
  }

  if (actionType === "allocation_correction") {
    const designationLines = payload.designationLines;
    if (Array.isArray(designationLines)) {
      const lines = designationLines.map((line, index) => {
        if (typeof line !== "object" || line === null) {
          throw new ApiHttpError(400, "designationLines must be objects.");
        }
        const record = line as Record<string, unknown>;
        const amountCents = record.amountCents;
        if (
          typeof amountCents !== "number" ||
          !Number.isFinite(amountCents) ||
          amountCents < 0
        ) {
          throw new ApiHttpError(
            400,
            "Each designation line needs a non-negative amountCents.",
          );
        }
        return {
          id:
            typeof record.id === "string" && record.id
              ? record.id
              : `line-${index + 1}`,
          amountCents,
          fundId: typeof record.fundId === "string" ? record.fundId : null,
          missionaryId:
            typeof record.missionaryId === "string"
              ? record.missionaryId
              : null,
          memo: typeof record.memo === "string" ? record.memo : null,
        };
      });
      return { designationLines: lines };
    }

    const fundId = payload.fundId;
    const missionaryId = payload.missionaryId;
    return {
      fundId: typeof fundId === "string" ? fundId : null,
      missionaryId: typeof missionaryId === "string" ? missionaryId : null,
    };
  }

  if (actionType === "payment_state_correction") {
    const status = payload.status;
    if (typeof status !== "string" || status.trim().length === 0) {
      throw new ApiHttpError(400, "status is required.");
    }
    assertAllowedPaymentStateCorrectionStatus(status);
    return { paymentStatus: status };
  }

  throw new ApiHttpError(
    501,
    `${actionType} requires a dedicated operation adapter before it can be applied.`,
  );
}

function summarizeEffectiveDetail(detail: {
  effective: {
    amountCents: number;
    fundId: string | null;
    missionaryId: string | null;
    paymentStatus: string;
  };
  donor: { id: string } | null;
}) {
  return {
    amount: detail.effective.amountCents,
    donorId: detail.donor?.id ?? null,
    fundId: detail.effective.fundId,
    missionaryId: detail.effective.missionaryId,
    status: detail.effective.paymentStatus,
  };
}

/**
 * Applies a correction as an immutable adjustment record (ADR-CD-004).
 *
 * The original donation row is never rewritten; effective values derive from
 * the original plus applied adjustments. Saves are concurrency-checked
 * against the detail revision and idempotent on retry.
 */
export async function applyContributionCorrection(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
  actionType: ContributionActionType;
  payload: Record<string, unknown>;
  reason: string;
  actorProfileId: string | null;
  sourceSurface: string;
  expectedRevision?: string | null;
  idempotencyKey?: string | null;
}) {
  const before = await loadContributionDetailFromSupabase(input);

  if (input.expectedRevision && input.expectedRevision !== before.revision) {
    throw new ApiHttpError(
      409,
      "This gift changed since you loaded it. Reload the latest detail, review the changes, and submit the correction again.",
    );
  }

  const effectiveValues = correctionEffectiveValues(
    input.actionType,
    input.payload,
  );

  const insertResult = await input.supabaseAdmin
    .from("contribution_adjustments")
    .insert({
      tenant_id: input.tenantId,
      donation_id: input.contributionId,
      adjustment_type: input.actionType,
      status: "applied",
      effective_values: effectiveValues,
      reason: input.reason,
      actor_profile_id: input.actorProfileId,
      source_surface: input.sourceSurface,
      base_revision: before.revision,
      idempotency_key: input.idempotencyKey ?? null,
    })
    .select("id")
    .single();

  if (insertResult.error) {
    const isDuplicateKey =
      insertResult.error.code === "23505" && Boolean(input.idempotencyKey);
    if (!isDuplicateKey) {
      throw new Error(insertResult.error.message);
    }

    const existingResult = await input.supabaseAdmin
      .from("contribution_adjustments")
      .select("id")
      .eq("tenant_id", input.tenantId)
      .eq("idempotency_key", input.idempotencyKey!)
      .maybeSingle();

    if (existingResult.error || !existingResult.data) {
      throw new Error(
        existingResult.error?.message ??
          "Adjustment already exists but could not be loaded for replay.",
      );
    }

    return {
      before: summarizeEffectiveDetail(before),
      after: summarizeEffectiveDetail(before),
      status: "applied" as const,
      adjustmentId: String(
        (existingResult.data as Record<string, unknown>).id ?? "",
      ),
      idempotentReplay: true,
    };
  }

  const adjustmentId = String(
    ((insertResult.data ?? {}) as Record<string, unknown>).id ?? "",
  );
  const after = await loadContributionDetailFromSupabase(input);

  return {
    before: summarizeEffectiveDetail(before),
    after: summarizeEffectiveDetail(after),
    status: "applied" as const,
    adjustmentId,
    idempotentReplay: false,
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
