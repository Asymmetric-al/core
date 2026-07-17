import { ensureCorrectionApprovalWorkflow } from "./approval-notifications";
import { createContributionCorrectionRequestInSupabase } from "./correction-requests";
import { sendContributionCorrectionNotificationFromSupabase } from "./notifications/store";
import {
  applyContributionCorrection,
  replayStripeEventThroughContributionOperations,
} from "./operations";
import { refundContributionThroughStripe } from "./refunds";
import {
  appendContributionOperationAuditEvent,
  createContributionCorrectionRecord,
  linkPendingContributionRefundAttemptToCorrection,
  loadContributionDetailFromSupabase,
} from "./store";
import { sendStagedGiftReceipt } from "../../giving/receipts";
import { ApiHttpError } from "../../shared/http-errors";
import { resolveLatestStripeEventIdForDonation } from "../../stripe/replay";
import { reconcileStripeRefundByProviderId } from "../../stripe/webhooks";

import type { ContributionActionDependencies } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export function createContributionActionDependencies(
  supabaseAdmin: AdminSupabaseClient,
): ContributionActionDependencies {
  return {
    sendReceipt: ({ stagedGiftId, tenantId }) =>
      sendStagedGiftReceipt({ supabaseAdmin, stagedGiftId, tenantId }),
    applyCorrection: (correctionInput) =>
      applyContributionCorrection({ supabaseAdmin, ...correctionInput }),
    refundContribution: (refundInput) =>
      refundContributionThroughStripe({ supabaseAdmin, ...refundInput }),
    linkAndReconcilePendingRefundAttempt: async (linkInput) => {
      await linkPendingContributionRefundAttemptToCorrection({
        supabaseAdmin,
        ...linkInput,
      });
      try {
        await reconcileStripeRefundByProviderId({
          supabaseAdmin,
          tenantId: linkInput.tenantId,
          providerRefundId: linkInput.providerReferenceId,
        });
      } catch {
        // The durable link is the recovery boundary. A transient provider read
        // must not make an action retry create a second correction; the bounded
        // aged-pending sweep will retry this same linked attempt.
      }
    },
    resolveReplayStripeEventId: async ({
      payload,
      tenantId,
      contributionId,
    }) => {
      const payloadEventId =
        typeof payload.stripeEventId === "string" &&
        payload.stripeEventId.trim().length > 0
          ? payload.stripeEventId.trim()
          : null;
      return (
        payloadEventId ??
        (await resolveLatestStripeEventIdForDonation({
          supabaseAdmin,
          tenantId,
          donationId: contributionId,
        }))
      );
    },
    createCorrectionRequest: async (request) => {
      const requestId = await createContributionCorrectionRequestInSupabase({
        supabaseAdmin,
        request,
      });
      await ensureCorrectionApprovalWorkflow({
        supabaseAdmin,
        tenantId: request.tenantId,
        requestId,
      });
      return requestId;
    },
    replayStripeEvent: async ({ payload, tenantId, contributionId }) => {
      const payloadEventId =
        typeof payload.stripeEventId === "string" &&
        payload.stripeEventId.trim().length > 0
          ? payload.stripeEventId.trim()
          : null;
      const stripeEventId =
        payloadEventId ??
        (await resolveLatestStripeEventIdForDonation({
          supabaseAdmin,
          tenantId,
          donationId: contributionId,
        }));

      if (!stripeEventId) {
        throw new ApiHttpError(
          404,
          "No stored provider event to replay for this gift.",
        );
      }

      const rawEvent = await replayStripeEventThroughContributionOperations({
        contributionId,
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
        beforeSummary: notificationInput.beforeSummary ?? null,
        afterSummary: notificationInput.afterSummary ?? null,
      });
    },
    loadContributionDetail: ({ contributionId, tenantId }) =>
      loadContributionDetailFromSupabase({
        supabaseAdmin,
        tenantId,
        contributionId,
      }),
  };
}
