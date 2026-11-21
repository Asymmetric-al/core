import type {
  ContributionBatchItemResult,
  ContributionBatchStatus,
} from "./types";

export function summarizeContributionBatchResults(
  results: Array<Pick<ContributionBatchItemResult, "status" | "taskId">>,
) {
  const processed = results.length;
  const succeeded = results.filter(
    (result) => result.status === "succeeded",
  ).length;
  const skipped = results.filter(
    (result) => result.status === "skipped",
  ).length;
  const failed = results.filter((result) => result.status === "failed").length;
  const followUpTasksCreated = results.filter((result) => result.taskId).length;
  let status: ContributionBatchStatus = "complete";

  if (failed > 0 || skipped > 0) {
    status = "complete_with_issues";
  }
  if (processed > 0 && succeeded === 0 && failed > 0 && skipped === 0) {
    status = "failed";
  }

  return {
    status,
    processed,
    succeeded,
    skipped,
    failed,
    followUpTasksCreated,
  };
}
