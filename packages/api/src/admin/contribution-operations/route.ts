import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { executeContributionAction } from "./actions";
import { sendContributionCorrectionNotificationFromSupabase } from "./notifications/store";
import { hasContributionPermission } from "./permissions";
import {
  appendContributionOperationAuditEvent,
  createContributionCorrectionRecord,
  loadContributionDetailFromSupabase,
} from "./store";
import { resolveCrmSyncRuntimeConfig } from "../../crm/sync/config";
import { sendStagedGiftReceipt } from "../../giving/receipts";
import {
  queueStagedGiftPostingToTwenty,
  retryStagedGiftPostingToTwenty,
} from "../../giving/staged-gifts";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import {
  loadStripeRawEventForReplay,
  markStripeRawEventForReplay,
} from "../../stripe/replay";

import type {
  ContributionActionType,
  ContributionPermission,
  ContributionSourceSurface,
} from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";

const STRIPE_API_VERSION = "2025-02-24.acacia";

const actionTypeSchema = z.enum([
  "resend_receipt",
  "approve_staged_gift",
  "retry_staged_gift",
  "crm_repost",
  "metadata_update",
  "refund",
  "donor_relink",
  "amount_correction",
  "designation_correction",
  "fund_correction",
  "allocation_correction",
  "receipt_correction",
  "statement_correction",
  "payment_state_correction",
  "stripe_replay",
]);

const sourceSurfaceSchema = z.enum([
  "contribution_hub",
  "donor_crm_record",
  "automation",
  "bulk_action",
  "api",
]);

const actionRequestSchema = z.object({
  contributionId: z.string().uuid(),
  stagedGiftId: z.string().uuid().nullable().optional(),
  actionType: actionTypeSchema,
  sourceSurface: sourceSurfaceSchema.default("api"),
  reason: z.string().max(1000).nullable().optional(),
  confirmationToken: z.string().max(200).nullable().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

function getContributionIdFromPath(request: Request): string | null {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const index = segments.indexOf("contribution-operations");
  return index >= 0 ? (segments[index + 1] ?? null) : null;
}

function actorPermissionsFromAuth(
  auth: AuthenticatedContext,
): ContributionPermission[] {
  return hasContributionPermission(auth, "finance:manage_contributions")
    ? ["finance:manage_contributions"]
    : [];
}

function requireStripeSecretKey(): string {
  const key = serverEnv.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiHttpError(503, "Stripe is not configured for refunds.");
  }
  return key;
}

async function refundContribution(input: {
  supabaseAdmin: Parameters<
    typeof loadContributionDetailFromSupabase
  >[0]["supabaseAdmin"];
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
      .eq("id", input.contributionId);

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

async function applyContributionCorrection(input: {
  supabaseAdmin: Parameters<
    typeof loadContributionDetailFromSupabase
  >[0]["supabaseAdmin"];
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
      fundId: before.designation.fundId,
      missionaryId: before.designation.missionaryId,
      status: before.payment.status,
    },
    after: {
      amount: after.amount.value,
      donorId: after.donor?.id ?? null,
      fundId: after.designation.fundId,
      missionaryId: after.designation.missionaryId,
      status: after.payment.status,
    },
    status: "applied" as const,
  };
}

export const GET = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const contributionId = getContributionIdFromPath(request);
      if (!contributionId) {
        throw new ApiHttpError(400, "Missing contribution id.");
      }

      const contribution = await loadContributionDetailFromSupabase({
        supabaseAdmin,
        tenantId: auth.tenantId,
        contributionId,
      });

      return NextResponse.json({ contribution, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load contribution operation detail.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const body = actionRequestSchema.parse(await ensureJsonBody(request));
      const result = await executeContributionAction({
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        actorPermissions: actorPermissionsFromAuth(auth),
        sourceSurface: body.sourceSurface as ContributionSourceSurface,
        contributionId: body.contributionId,
        stagedGiftId: body.stagedGiftId ?? null,
        actionType: body.actionType as ContributionActionType,
        reason: body.reason ?? null,
        confirmationToken: body.confirmationToken ?? null,
        payload: body.payload,
        dependencies: {
          sendReceipt: ({ stagedGiftId, tenantId }) =>
            sendStagedGiftReceipt({ supabaseAdmin, stagedGiftId, tenantId }),
          approveStagedGift: ({
            actorProfileId,
            note,
            stagedGiftId,
            tenantId,
          }) =>
            queueStagedGiftPostingToTwenty({
              supabaseAdmin,
              actorProfileId,
              note,
              stagedGiftId,
              tenantId,
              crmConfig: resolveCrmSyncRuntimeConfig(serverEnv),
            }),
          retryStagedGift: ({ actorProfileId, note, stagedGiftId, tenantId }) =>
            retryStagedGiftPostingToTwenty({
              supabaseAdmin,
              actorProfileId,
              note,
              stagedGiftId,
              tenantId,
              crmConfig: resolveCrmSyncRuntimeConfig(serverEnv),
            }),
          relinkDonor: async ({ contributionId, donorId, tenantId }) => {
            const before = await loadContributionDetailFromSupabase({
              supabaseAdmin,
              tenantId,
              contributionId,
            });
            const { error } = await supabaseAdmin
              .from("donations")
              .update({
                donor_id: donorId,
                updated_at: new Date().toISOString(),
              })
              .eq("tenant_id", tenantId)
              .eq("id", contributionId);
            if (error) throw new Error(error.message);
            return {
              before: { donorId: before.donor?.id ?? null },
              after: { donorId },
            };
          },
          applyCorrection: (correctionInput) =>
            applyContributionCorrection({ supabaseAdmin, ...correctionInput }),
          replayStripeEvent: async ({ payload, tenantId }) => {
            const stripeEventId = payload.stripeEventId;
            if (typeof stripeEventId !== "string" || !stripeEventId) {
              throw new ApiHttpError(400, "stripeEventId is required.");
            }
            const rawEvent =
              await replayStripeEventThroughContributionOperations({
                supabaseAdmin,
                tenantId,
                stripeEventId,
              });
            return {
              provider: "stripe" as const,
              status: "queued_for_replay",
              referenceId: rawEvent.stripeEventId,
            };
          },
          refundContribution: (refundInput) =>
            refundContribution({ supabaseAdmin, ...refundInput }),
          appendAuditEvent: (event) =>
            appendContributionOperationAuditEvent({ supabaseAdmin, event }),
          createCorrectionRecord: (correction) =>
            createContributionCorrectionRecord({ supabaseAdmin, correction }),
          sendCorrectionNotification: async (notificationInput) => {
            const detail = await loadContributionDetailFromSupabase({
              supabaseAdmin,
              tenantId: notificationInput.tenantId,
              contributionId: notificationInput.contributionId,
            });

            return sendContributionCorrectionNotificationFromSupabase({
              supabaseAdmin,
              tenantId: notificationInput.tenantId,
              actionType: notificationInput.actionType,
              contributionId: notificationInput.contributionId,
              correctionId: notificationInput.correctionId,
              auditEventId: notificationInput.auditEventId,
              actorProfileId: notificationInput.actorProfileId,
              providerOutcome: notificationInput.providerOutcome,
              detail,
            });
          },
          loadContributionDetail: ({ contributionId, tenantId }) =>
            loadContributionDetailFromSupabase({
              supabaseAdmin,
              tenantId,
              contributionId,
            }),
        },
      });

      return NextResponse.json({ result, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to execute contribution action.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);

export async function replayStripeEventThroughContributionOperations(input: {
  supabaseAdmin: Parameters<
    typeof loadContributionDetailFromSupabase
  >[0]["supabaseAdmin"];
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
