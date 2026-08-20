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

export async function executeApproveStagedGift<TContribution>(
  input: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  if (input.command.type !== "approve_staged_gift") {
    throw new ApiHttpError(
      400,
      "Unsupported contribution action: approve_staged_gift",
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
