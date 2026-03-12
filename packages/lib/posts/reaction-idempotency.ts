interface ErrorWithCode {
  code?: string | null;
}

export function isDuplicateReactionError(
  error: ErrorWithCode | null | undefined,
) {
  return error?.code === "23505";
}

export function hasRemovedReactions(rows: Array<unknown> | null | undefined) {
  return (rows?.length ?? 0) > 0;
}
