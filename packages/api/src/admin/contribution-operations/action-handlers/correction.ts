import { ApiHttpError } from "../../../shared/http-errors";
import {
  appendAuditEvent,
  assertCanExecuteDirectly,
  auditInput,
  commandActionType,
  commandPayload,
  correctionIdempotencyKey,
  correctionInput,
  createCorrectionRecord,
  createPendingCorrectionRequest,
  loadCanonicalContribution,
  requireDependency,
  requiresCorrectionApproval,
  sendCorrectionNotification,
} from "../action-runtime";
import { directContributionCapabilityForAction } from "../permissions";

import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "../types";

function receiptDeliveryProposalFromPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> | null {
  return payload.receiptDelivery &&
    typeof payload.receiptDelivery === "object" &&
    payload.receiptDelivery !== null
    ? (payload.receiptDelivery as Record<string, unknown>)
    : null;
}

export async function executeCorrection<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  const actionType = commandActionType(input);
  if (!input.reason?.trim()) {
    throw new ApiHttpError(400, `A reason is required for ${actionType}.`);
  }

  const payload = commandPayload(input);
  if (requiresCorrectionApproval(input)) {
    return createPendingCorrectionRequest(input, {
      receiptDeliveryProposal: receiptDeliveryProposalFromPayload(payload),
    });
  }

  assertCanExecuteDirectly(
    input,
    directContributionCapabilityForAction(actionType),
  );

  const applyCorrection = requireDependency(
    input.dependencies,
    "applyCorrection",
  );
  const idempotencyKey = correctionIdempotencyKey(input);
  const correction = await applyCorrection({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    actionType,
    payload,
    reason: input.reason,
    actorProfileId: input.actorProfileId,
    sourceSurface: input.sourceSurface,
    actorCapabilities: input.actorCapabilities,
    expectedRevision: input.expectedRevision ?? null,
    idempotencyKey,
  });

  if (correction.idempotentReplay) {
    const auditEventId = await appendAuditEvent(
      input,
      auditInput(input, {
        beforeSummary: correction.before ?? null,
        afterSummary: correction.after ?? null,
        downstreamEffects: { idempotentReplay: true },
      }),
    );

    return {
      canonicalContribution: await loadCanonicalContribution(input),
      auditEventId,
      correctionId: null,
      adjustmentId: correction.adjustmentId ?? null,
      idempotentReplay: true,
      taskIds: [],
    };
  }

  const correctionId = await createCorrectionRecord(
    input,
    correctionInput(input, {
      beforeSummary: correction.before ?? null,
      afterSummary: correction.after ?? null,
      status: correction.status ?? "applied",
    }),
  );
  const auditEventId = await appendAuditEvent(
    input,
    auditInput(input, {
      beforeSummary: correction.before ?? null,
      afterSummary: correction.after ?? null,
      correctionId,
      downstreamEffects: {
        receiptOutcome: correction.receiptOutcome?.status ?? "not_required",
        receiptAffectedFields: correction.receiptOutcome?.affectedFields ?? [],
        receiptSnapshotId: correction.receiptOutcome?.snapshotId ?? null,
        receiptDeliveryRequested: correction.receiptOutcome?.requested ?? null,
        receiptDeliveryConfirmed: correction.receiptOutcome?.confirmed ?? null,
      },
    }),
  );
  const notification = await sendCorrectionNotification(input, {
    auditEventId,
    correctionId,
    beforeSummary: correction.before ?? null,
    afterSummary: correction.after ?? null,
  });

  return {
    canonicalContribution: await loadCanonicalContribution(input),
    auditEventId,
    correctionId,
    adjustmentId: correction.adjustmentId ?? null,
    receiptOutcome: correction.receiptOutcome ?? null,
    approvalStatus: "applied",
    notification,
    taskIds: notification.taskIds ?? [],
  };
}
