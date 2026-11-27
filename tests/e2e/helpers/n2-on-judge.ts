export interface JudgedCall {
  url: string;
  headers: Record<string, string>;
  status: number | null;
  refused: string | null;
  failed: boolean;
}

export interface StaleJudgement {
  pending: JudgedCall[];
  cancelled: number;
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
  return {
    pending: stale.filter((call) => call.status === null && !call.failed),
    cancelled: stale.filter((call) => call.status === null && call.failed)
      .length,
    served: stale.filter((call) => call.status !== null && call.status !== 401),
    refused: stale.filter(
      (call) => call.status === 401 && call.refused === "generation_mismatch",
    ).length,
  };
}
