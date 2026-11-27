export const NAVIGATION_ABORT = "net::ERR_ABORTED";

export interface JudgedCall {
  url: string;
  headers: Record<string, string>;
  status: number | null;
  refused: string | null;
  failure: string | null;
}

export interface StaleJudgement {
  pending: JudgedCall[];
  cancelled: number;
  transportErrors: JudgedCall[];
  served: JudgedCall[];
  refused: number;
}

export function judgeStaleCalls(
  calls: readonly JudgedCall[],
  moved: string,
): StaleJudgement {
  const stale = calls.filter(
    (call) => call.headers["x-asym-scope-generation"] !== moved,
  );
  const unanswered = stale.filter((call) => call.status === null);
  return {
    pending: unanswered.filter((call) => call.failure === null),
    cancelled: unanswered.filter((call) => call.failure === NAVIGATION_ABORT)
      .length,
    transportErrors: unanswered.filter(
      (call) => call.failure !== null && call.failure !== NAVIGATION_ABORT,
    ),
    served: stale.filter((call) => call.status !== null && call.status !== 401),
    refused: stale.filter(
      (call) => call.status === 401 && call.refused === "generation_mismatch",
    ).length,
  };
}
