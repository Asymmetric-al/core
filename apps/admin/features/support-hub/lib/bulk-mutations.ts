export interface BulkMutationReport {
  total: number;
  succeeded: number;
  failed: number;
  firstError: Error | null;
}

export async function runBulkMutations<T>(
  items: readonly T[],
  mutate: (item: T) => Promise<unknown>,
): Promise<BulkMutationReport> {
  const results = await Promise.allSettled(items.map((item) => mutate(item)));
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  return {
    total: items.length,
    succeeded: results.length - failures.length,
    failed: failures.length,
    firstError: toError(failures[0]?.reason),
  };
}

function toError(reason: unknown): Error | null {
  if (reason === undefined) return null;
  return reason instanceof Error ? reason : new Error(String(reason));
}
