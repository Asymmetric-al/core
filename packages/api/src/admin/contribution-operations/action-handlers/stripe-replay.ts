import {
  appendAuditEvent,
  assertCanExecuteDirectly,
  auditInput,
  commandPayload,
  correctionInput,
  createCorrectionRecord,
  createPendingCorrectionRequest,
  loadCanonicalContribution,
  providerIdempotencyKey,
  requireDependency,
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

export async function executeStripeReplay<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  if (requiresCorrectionApproval(input)) {
    return createPendingCorrectionRequest(input);
  }

  assertCanExecuteDirectly(
    input,
    directContributionCapabilityForAction("stripe_replay"),
  );

  const replayStripeEvent = requireDependency(
    input.dependencies,
    "replayStripeEvent",
  );
  const providerOutcome = sanitizeProviderOutcome(
    await replayStripeEvent({
      tenantId: input.tenantId,
      contributionId: input.contributionId,
      payload: commandPayload(input),
      expectedRevision: input.expectedRevision ?? null,
      idempotencyKey: providerIdempotencyKey(input),
    }),
  );
  const correctionId = await createCorrectionRecord(
    input,
    correctionInput(input, {
      correctionType: "stripe_replay",
      status: correctionStatusForProviderOutcome(providerOutcome.status),
      providerOutcome,
    }),
  );
  const auditEventId = await appendAuditEvent(
    input,
    auditInput(input, {
      correctionId,
      providerOutcome,
    }),
  );
  const notification = await sendCorrectionNotification(input, {
    auditEventId,
    correctionId,
    providerOutcome,
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
