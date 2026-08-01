import type {
  ContributionBatchApiResponse,
  ContributionBatchNextAction,
  ContributionBatchStatus,
  ContributionBatchSummary,
} from "@asym/api/admin/contribution-batches";

export type {
  ContributionBatchApiResponse as ContributionBatchResponse,
  ContributionBatchNextAction,
};

export const MAX_CONTRIBUTION_BATCH_PROCESS_REQUESTS = 50;

const contributionBatchStatuses: Record<ContributionBatchStatus, true> = {
  running: true,
  complete: true,
  complete_with_issues: true,
  failed: true,
  cancelled: true,
};

interface BatchResponseLike {
  ok: boolean;
  json: () => Promise<unknown>;
}

type BatchFetcher = (
  input: string,
  init?: { method: "POST" },
) => Promise<BatchResponseLike>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isContributionBatchStatus(
  value: unknown,
): value is ContributionBatchStatus {
  return (
    typeof value === "string" && Object.hasOwn(contributionBatchStatuses, value)
  );
}

function isContributionBatchSummary(
  value: unknown,
): value is ContributionBatchSummary {
  if (!isRecord(value)) {
    return false;
  }

  return [
    "processed",
    "succeeded",
    "skipped",
    "failed",
    "followUpTasksCreated",
  ].every((key) => typeof value[key] === "number");
}

function isContributionBatchNextAction(
  value: unknown,
): value is ContributionBatchNextAction {
  return (
    isRecord(value) &&
    value.method === "POST" &&
    typeof value.href === "string" &&
    /^\/api\/admin\/contribution-batches\/[^/?#]+\/process$/.test(value.href)
  );
}

function parseContributionBatchResponse(
  value: unknown,
): ContributionBatchApiResponse | null {
  if (!isRecord(value) || !isRecord(value.batch)) {
    return null;
  }

  const { batch } = value;
  if (
    !isContributionBatchStatus(batch.status) ||
    !isContributionBatchSummary(batch.summary)
  ) {
    return null;
  }

  const nextAction = value.nextAction;
  if (
    nextAction !== undefined &&
    nextAction !== null &&
    !isContributionBatchNextAction(nextAction)
  ) {
    return null;
  }

  return value as unknown as ContributionBatchApiResponse;
}

export async function readContributionBatchResponse(
  response: BatchResponseLike,
  fallbackMessage: string,
): Promise<ContributionBatchApiResponse> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : fallbackMessage;
    throw new Error(errorMessage);
  }

  const parsed = parseContributionBatchResponse(body);
  if (!parsed) {
    throw new Error(fallbackMessage);
  }

  return parsed;
}

export async function continueContributionBatch(input: {
  initialResponse: ContributionBatchApiResponse;
  fetcher: BatchFetcher;
  maxProcessRequests?: number;
  onProgress?: (batch: ContributionBatchApiResponse["batch"]) => void;
  onContinuationAction?: (action: ContributionBatchNextAction) => void;
}): Promise<ContributionBatchApiResponse> {
  let currentResponse = input.initialResponse;
  let continuationAction = currentResponse.nextAction ?? null;
  const maxProcessRequests =
    input.maxProcessRequests ?? MAX_CONTRIBUTION_BATCH_PROCESS_REQUESTS;

  input.onProgress?.(currentResponse.batch);

  if (currentResponse.batch.status !== "running") {
    return currentResponse;
  }

  if (!continuationAction) {
    throw new Error(
      "The running contribution batch did not provide a continuation action.",
    );
  }
  if (!isContributionBatchNextAction(continuationAction)) {
    throw new Error(
      "The contribution batch returned an invalid continuation action.",
    );
  }

  for (
    let requestCount = 0;
    requestCount < maxProcessRequests;
    requestCount += 1
  ) {
    input.onContinuationAction?.(continuationAction);
    const response = await input.fetcher(continuationAction.href, {
      method: continuationAction.method,
    });
    currentResponse = await readContributionBatchResponse(
      response,
      "Could not continue the contribution batch.",
    );
    input.onProgress?.(currentResponse.batch);

    if (currentResponse.batch.status !== "running") {
      return currentResponse;
    }

    const returnedAction = currentResponse.nextAction;
    if (returnedAction) {
      if (!isContributionBatchNextAction(returnedAction)) {
        throw new Error(
          "The contribution batch returned an invalid continuation action.",
        );
      }
      continuationAction = returnedAction;
    }
  }

  input.onContinuationAction?.(continuationAction);
  throw new Error(
    `Contribution batch processing paused after ${maxProcessRequests} process requests. Retry to continue the same batch.`,
  );
}
