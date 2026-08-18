import { directContributionCapabilityForAction } from "../permissions";
import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
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
  providerIdempotencyKey,
  requireDependency,
  requireStringPayload,
  requiresCorrectionApproval,
  sendCorrectionNotification,
} from "../action-runtime";

export async function executeDonorRelink<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  const payload = commandPayload(input);
  const donorId = requireStringPayload(payload, "donorId");

  if (requiresCorrectionApproval(input)) {
    return createPendingCorrectionRequest(input);
  }

  assertCanExecuteDirectly(
    input,
    directContributionCapabilityForAction("donor_relink"),
  );

  const relinkDonor = requireDependency(input.dependencies, "relinkDonor");
  const relink = await relinkDonor({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    donorId,
    expectedRevision: input.expectedRevision ?? null,
    idempotencyKey: providerIdempotencyKey(input),
  });
  const correctionId = await createCorrectionRecord(
    input,
    correctionInput(input, {
      correctionType: "donor_relink",
      beforeSummary: relink.before ?? null,
      afterSummary: relink.after ?? { donorId },
    }),
  );
  const auditEventId = await appendAuditEvent(
    input,
    auditInput(input, {
      correctionId,
      beforeSummary: relink.before ?? null,
      afterSummary: relink.after ?? { donorId },
    }),
  );
  const notification = await sendCorrectionNotification(input, {
    auditEventId,
    correctionId,
    beforeSummary: relink.before ?? null,
    afterSummary: relink.after ?? { donorId },
  });

  return {
    canonicalContribution: await loadCanonicalContribution(input),
    auditEventId,
    correctionId,
    notification,
    taskIds: notification.taskIds ?? [],
  };
}
