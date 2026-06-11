import { serverEnv } from "@asym/env";

import { ensureCorrectionApprovalWorkflow } from "./approval-notifications";
import { createContributionCorrectionRequestInSupabase } from "./correction-requests";
import { sendContributionCorrectionNotificationFromSupabase } from "./notifications/store";
import {
  applyContributionCorrection,
  refundContribution,
  relinkContributionDonor,
  replayStripeEventThroughContributionOperations,
} from "./operations";
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
import { ApiHttpError } from "../../shared/http-errors";

import type { ContributionActionDependencies } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export function createContributionActionDependencies(
  supabaseAdmin: AdminSupabaseClient,
): ContributionActionDependencies {
  return {
    sendReceipt: ({ stagedGiftId, tenantId }) =>
      sendStagedGiftReceipt({ supabaseAdmin, stagedGiftId, tenantId }),
    approveStagedGift: ({ actorProfileId, note, stagedGiftId, tenantId }) =>
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
    relinkDonor: (relinkInput) =>
      relinkContributionDonor({ supabaseAdmin, ...relinkInput }),
    applyCorrection: (correctionInput) =>
      applyContributionCorrection({ supabaseAdmin, ...correctionInput }),
    createCorrectionRequest: async (request) => {
      const requestId = await createContributionCorrectionRequestInSupabase({
        supabaseAdmin,
        request,
      });
      // Durable approval task + approver notifications (ADR-CD-026); safe to
      // repeat because the task is keyed on the request and deliveries dedupe.
      await ensureCorrectionApprovalWorkflow({
        supabaseAdmin,
        tenantId: request.tenantId,
        requestId,
      });
      return requestId;
    },
    replayStripeEvent: async ({ payload, tenantId }) => {
      const stripeEventId = payload.stripeEventId;
      if (typeof stripeEventId !== "string" || !stripeEventId) {
        throw new ApiHttpError(400, "stripeEventId is required.");
      }
      const rawEvent = await replayStripeEventThroughContributionOperations({
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
