export function inboxContentState({
  isError,
  isLoading,
  total,
  matching,
}: {
  isError: boolean;
  isLoading: boolean;
  total: number;
  matching: number;
}) {
  if (isError && total === 0) return "error";
  if (isLoading) return "loading";
  if (total === 0) return "no-conversations";
  if (matching === 0) return "no-matches";
  return "ready";
}
