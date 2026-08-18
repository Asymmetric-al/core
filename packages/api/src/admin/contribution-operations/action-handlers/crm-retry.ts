import { ApiHttpError } from "../../../shared/http-errors";
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
import {
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
} from "../crm-retry-support";

import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "../types";

export async function executeCrmRetry<TContribution>(
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
  const retryScope =
    payload.scope === "designation" ? "designation" : "parent";

  if (retryScope === "designation") {
    const allocationId = requireStringPayload(payload, "allocationId");
    const retryDesignation = input.dependencies?.retryDesignationPost;
    if (!retryDesignation) {
      throw new ApiHttpError(
        501,
        `${CRM_POSTING_UNAVAILABLE_REASON} ${CRM_POSTING_UNAVAILABLE_NEXT_STEP}`,
      );
    }
    await retryDesignation({
      tenantId: input.tenantId,
      contributionId: input.contributionId,
      stagedGiftId,
      allocationId,
      actorProfileId: input.actorProfileId,
      note: input.reason ?? null,
    });
    const auditEventId = await appendAuditEvent(
      input,
      auditInput(input, {
        stagedGiftId,
        downstreamEffects: {
          crmPostStatus: "queued",
          retryScope: "designation",
          allocationId,
        },
      }),
    );

    return {
      canonicalContribution: await loadCanonicalContribution(input),
      auditEventId,
      taskIds: [],
    };
  }

  const retry = requireDependency(input.dependencies, "retryStagedGift");
  await retry({
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
        crmPostStatus: "queued",
        retryScope: "parent",
      },
    }),
  );

  return {
    canonicalContribution: await loadCanonicalContribution(input),
    auditEventId,
    taskIds: [],
  };
}
