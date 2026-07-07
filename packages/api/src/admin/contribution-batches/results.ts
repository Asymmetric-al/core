import type {
  ContributionBatchItemResult,
  ContributionBatchStatus,
} from "./types";

function csvEscape(value: unknown): string {
  const stringValue = value == null ? "" : String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replaceAll('"', '""')}"`
    : stringValue;
}

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

export function buildContributionBatchCsv(
  results: ContributionBatchItemResult[],
): string {
  const headers = [
    "contributionId",
    "donorName",
    "donorEmail",
    "amount",
    "currency",
    "action",
    "status",
    "skipReason",
    "failureReason",
    "auditEventId",
    "taskId",
    "timestamp",
  ];
  const rows = results.map((result) =>
    [
      result.contributionId,
      result.donorName,
      result.donorEmail,
      result.amount,
      result.currency,
      result.action,
      result.status,
      result.skipReason,
      result.failureReason,
      result.auditEventId,
      result.taskId,
      result.timestamp,
    ]
      .map(csvEscape)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
