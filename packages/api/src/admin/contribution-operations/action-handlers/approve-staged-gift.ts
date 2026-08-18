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

import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "../types";

export async function executeApproveStagedGift<TContribution>(
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
  const approve = requireDependency(input.dependencies, "approveStagedGift");
  await approve({
    tenantId: input.tenantId,
    contributionId: input.contributionId,
    stagedGiftId,
    actorProfileId: input.actorProfileId,
    note: input.reason ?? null,
  });
  const auditEventId = await appendAuditEvent(
    input,
    auditInput(input, {
      stagedGiftId,
      downstreamEffects: {
        stagedGiftStatus: "queued_for_posting",
      },
    }),
  );

  return {
    canonicalContribution: await loadCanonicalContribution(input),
    auditEventId,
    taskIds: [],
  };
}
