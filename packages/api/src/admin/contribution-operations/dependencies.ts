import { serverEnv } from "@asym/env";

import { ensureCorrectionApprovalWorkflow } from "./approval-notifications";
import { createContributionCorrectionRequestInSupabase } from "./correction-requests";
import { sendContributionCorrectionNotificationFromSupabase } from "./notifications/store";
import {
  applyContributionCorrection,
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
  retryStagedGiftDesignationPostingToTwenty,
  retryStagedGiftPostingToTwenty,
} from "../../giving/staged-gifts";
import { ApiHttpError } from "../../shared/http-errors";
import { resolveLatestStripeEventIdForDonation } from "../../stripe/replay";

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
    retryDesignationPost: ({
      actorProfileId,
      allocationId,
      contributionId,
      note,
      stagedGiftId,
      tenantId,
    }) =>
      retryStagedGiftDesignationPostingToTwenty({
        supabaseAdmin,
        actorProfileId,
        allocationId,
        contributionId,
        note,
        stagedGiftId,
        tenantId,
        crmConfig: resolveCrmSyncRuntimeConfig(serverEnv),
      }),
    applyCorrection: (correctionInput) =>
      applyContributionCorrection({ supabaseAdmin, ...correctionInput }),
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
