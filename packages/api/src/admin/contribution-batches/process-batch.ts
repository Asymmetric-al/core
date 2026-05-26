import { createContributionBatchPreview } from "./preview";
import { summarizeContributionBatchResults } from "./results";

import type { ProcessContributionBatchInput } from "./types";

export async function processContributionBatch(
  input: ProcessContributionBatchInput,
) {
  const preview = createContributionBatchPreview({
    actionType: input.actionType,
    records: input.records,
  });
  const results = [];

  for (const skipped of preview.skippedRecords) {
    results.push({
      contributionId: skipped.contributionId,
      action: input.actionType,
      status: "skipped" as const,
      skipReason: skipped.reason,
      timestamp: new Date().toISOString(),
    });
  }

  for (const record of preview.affectedRecords) {
    try {
      const result = await input.executeContributionAction({
        tenantId: input.tenantId,
        actorProfileId: input.actorProfileId,
        sourceSurface: input.sourceSurface,
        contributionId: record.contributionId,
        stagedGiftId: record.stagedGiftId,
        actionType: input.actionType,
        payload: record.stagedGiftId
          ? { stagedGiftId: record.stagedGiftId }
          : {},
      });
      results.push({
        contributionId: record.contributionId,
        action: input.actionType,
        status: "succeeded" as const,
        auditEventId: result.auditEventId ?? null,
        taskId: result.taskIds?.[0] ?? null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const failureReason =
        error instanceof Error ? error.message : "Contribution action failed.";
      const taskId =
        input.createFollowUpTask != null
          ? await input.createFollowUpTask({
              tenantId: input.tenantId,
              actorProfileId: input.actorProfileId,
              contributionId: record.contributionId,
              actionType: input.actionType,
              reason: failureReason,
            })
          : null;

      results.push({
        contributionId: record.contributionId,
        action: input.actionType,
        status: "failed" as const,
        failureReason,
        taskId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  const summary = summarizeContributionBatchResults(results);
  const { status, ...summaryCounts } = summary;

  return {
    results,
    summary: summaryCounts,
    status,
  };
}
