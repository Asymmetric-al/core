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
  if (
    input.command.type !== "retry_staged_gift" &&
    input.command.type !== "crm_repost"
  ) {
    throw new ApiHttpError(
      400,
      `Unsupported contribution action: ${input.command.type}`,
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

  if ("scope" in input.command.extras && input.command.scope === undefined) {
    throw new ApiHttpError(400, "scope must be parent or designation.");
  }

  const retryScope =
    input.command.scope === "designation" ? "designation" : "parent";

  if (retryScope === "designation") {
    const allocationId = requireNonEmptyString(
      input.command.allocationId,
      "allocationId",
    );
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
