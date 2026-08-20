import { ApiHttpError } from "../../../shared/http-errors";
import {
  appendAuditEvent,
  assertExpectedRevisionMatches,
  assertStagedGiftBelongsToContribution,
  auditInput,
  loadCanonicalContribution,
  requireDependency,
  requireNonEmptyString,
} from "../action-runtime";

import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "../types";

export async function executeResendReceipt<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  if (input.command.type !== "resend_receipt") {
    throw new ApiHttpError(
      400,
      "Unsupported contribution action: resend_receipt",
    );
  }
  const stagedGiftId =
    input.stagedGiftId ??
    requireNonEmptyString(input.command.stagedGiftId, "stagedGiftId");
  const canonicalContribution = await assertStagedGiftBelongsToContribution(
    input,
    stagedGiftId,
  );
  assertExpectedRevisionMatches(input, canonicalContribution);
  const sendReceipt = requireDependency(input.dependencies, "sendReceipt");
  const receipt = await sendReceipt({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    stagedGiftId,
  });
  const providerOutcome = {
    provider: "resend" as const,
    status: receipt.status,
    referenceId: receipt.sendLogId ?? null,
  };
  const auditEventId = await appendAuditEvent(
    input,
    auditInput(input, {
      stagedGiftId,
      providerOutcome,
      downstreamEffects: {
        receiptStatus: receipt.status,
      },
    }),
  );

  return {
    canonicalContribution: await loadCanonicalContribution(input),
    auditEventId,
    taskIds: [],
    providerOutcome,
  };
}
