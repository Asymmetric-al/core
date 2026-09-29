import { ApiHttpError } from "../../../shared/http-errors";
import {
  appendAuditEvent,
  assertCanExecuteDirectly,
  auditInput,
  correctionInput,
  createCorrectionRecord,
  createPendingCorrectionRequest,
  loadCanonicalContribution,
  providerIdempotencyKey,
  requireDependency,
  requireNonEmptyString,
  requiresCorrectionApproval,
  sendCorrectionNotification,
} from "../action-runtime";
import { directContributionCapabilityForAction } from "../permissions";

import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "../types";

export async function executeDonorRelink<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  if (input.command.type !== "donor_relink") {
    throw new ApiHttpError(
      400,
      "Unsupported contribution action: donor_relink",
    );
  }
  const donorId = requireNonEmptyString(input.command.donorId, "donorId");

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
