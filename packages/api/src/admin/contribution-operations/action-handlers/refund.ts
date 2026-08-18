import { directContributionCapabilityForAction } from "../permissions";
import {
  correctionStatusForProviderOutcome,
  type ContributionActionResult,
  type ExecuteContributionActionInput,
} from "../types";
import {
  appendAuditEvent,
  assertCanExecuteDirectly,
  auditInput,
  commandPayload,
  correctionInput,
  createCorrectionRecord,
  createPendingCorrectionRequest,
  loadCanonicalContribution,
  normalizedToken,
  providerIdempotencyKey,
  requireDependency,
  requirePositiveSafeIntegerPayload,
  requiresCorrectionApproval,
  sanitizeProviderOutcome,
  sendCorrectionNotification,
} from "../action-runtime";

export async function executeRefund<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  const payload = commandPayload(input);
  const amount = requirePositiveSafeIntegerPayload(payload, "amount");

  if (requiresCorrectionApproval(input)) {
    return createPendingCorrectionRequest(input);
  }

  assertCanExecuteDirectly(
    input,
    directContributionCapabilityForAction("refund"),
  );

  const refund = requireDependency(input.dependencies, "refundContribution");
  const providerOutcome = sanitizeProviderOutcome(
    await refund({
      tenantId: input.tenantId,
      contributionId: input.contributionId,
      amount,
      reason: input.reason ?? "",
      confirmationToken:
        normalizedToken(input.confirmationToken) ??
        normalizedToken(input.approvedRequestId) ??
        "",
      expectedRevision: input.expectedRevision ?? null,
      idempotencyKey: providerIdempotencyKey(input),
    }),
  );
  const correctionId = await createCorrectionRecord(
    input,
    correctionInput(input, {
      correctionType: "refund",
      status: correctionStatusForProviderOutcome(providerOutcome.status),
      providerOutcome,
      afterSummary: { refundAmount: amount },
    }),
  );
  if (providerOutcome.status === "pending") {
    const providerReferenceId = normalizedToken(providerOutcome.referenceId);
    if (!providerReferenceId) {
      throw new Error(
        "Pending refund outcome is missing its provider reference.",
      );
    }

    const linkAndReconcilePendingRefundAttempt = requireDependency(
      input.dependencies,
      "linkAndReconcilePendingRefundAttempt",
    );
    await linkAndReconcilePendingRefundAttempt({
      tenantId: input.tenantId,
      providerReferenceId,
      correctionId,
    });
  }
  const auditEventId = await appendAuditEvent(
    input,
    auditInput(input, {
      correctionId,
      providerOutcome,
      afterSummary: { refundAmount: amount },
    }),
  );
  const notification = await sendCorrectionNotification(input, {
    auditEventId,
    correctionId,
    providerOutcome,
    afterSummary: { refundAmount: amount },
  });

  return {
    canonicalContribution: await loadCanonicalContribution(input),
    auditEventId,
    correctionId,
    notification,
    taskIds: notification.taskIds ?? [],
    providerOutcome,
  };
}
