import { ApiHttpError } from "../../../shared/http-errors";
import {
  appendAuditEvent,
  assertCanExecuteDirectly,
  auditInput,
  correctionInput,
  createCorrectionRecord,
  createPendingCorrectionRequest,
  loadCanonicalContribution,
  normalizedToken,
  providerIdempotencyKey,
  requireDependency,
  requirePositiveSafeInteger,
  requiresCorrectionApproval,
  sanitizeProviderOutcome,
  sendCorrectionNotification,
} from "../action-runtime";
import { directContributionCapabilityForAction } from "../permissions";
import {
  correctionStatusForProviderOutcome,
  type ContributionActionResult,
  type ExecuteContributionActionInput,
} from "../types";

export async function executeRefund<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  if (input.command.type !== "refund") {
    throw new ApiHttpError(400, "Unsupported contribution action: refund");
  }
  const amount = requirePositiveSafeInteger(input.command.amount, "amount");

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
  const pendingReferenceId =
    providerOutcome.status === "pending"
      ? normalizedToken(providerOutcome.referenceId)
      : null;
  if (providerOutcome.status === "pending" && !pendingReferenceId) {
    throw new ApiHttpError(
      502,
      "Pending refund outcome returned no reference.",
    );
  }
  const correctionId = await createCorrectionRecord(
    input,
    correctionInput(input, {
      correctionType: "refund",
      status: correctionStatusForProviderOutcome(providerOutcome.status),
      providerOutcome,
      afterSummary: { refundAmount: amount },
    }),
  );
  if (pendingReferenceId) {
    const linkAndReconcilePendingRefundAttempt = requireDependency(
      input.dependencies,
      "linkAndReconcilePendingRefundAttempt",
    );
    await linkAndReconcilePendingRefundAttempt({
      tenantId: input.tenantId,
      providerReferenceId: pendingReferenceId,
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
