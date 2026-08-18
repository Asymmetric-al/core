import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "../types";
import {
  appendAuditEvent,
  assertExpectedRevisionMatches,
  assertStagedGiftBelongsToContribution,
  auditInput,
  commandPayload,
  loadCanonicalContribution,
  requireDependency,
  requireStringPayload,
} from "../action-runtime";

export async function executeResendReceipt<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  const payload = commandPayload(input);
  const stagedGiftId =
    input.stagedGiftId ?? requireStringPayload(payload, "stagedGiftId");
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
