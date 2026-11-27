import {
  ownMinistryEntries,
  reviewedOwnMinistryHelpers,
} from "../../../../scripts/verify/command-entry-boundaries.mjs";

type GateFailure = {
  code: string;
  table?: string;
  function?: string;
  detail?: string;
};

const CHILD_TABLES = [
  "post_comments",
  "post_fires",
  "post_likes",
  "post_prayers",
] as const;

export const REVIEW_LATER = [
  ...[
    ...Object.keys(reviewedOwnMinistryHelpers),
    ...ownMinistryEntries.map((entry: { function: string }) => entry.function),
  ].map((signature) => `COMMAND_EXCEPTION_UNREVIEWED|${signature}`),
  ...CHILD_TABLES.map(
    (table) => `PARENT_SCOPED_POLICY_NOT_PINNED|${table}|tanstack browser read`,
  ),
  "TENANT_CONDITION_MISSING|posts|tanstack browser read",
  ...CHILD_TABLES.map(
    (table) => `POLICY_EXCEPTION_STALE|${table}|${table} anonymous read`,
  ),
  "POLICY_EXCEPTION_STALE|posts|posts anonymous approved read",
].sort();

export function reviewKey(failure: GateFailure) {
  if (failure.function) return `${failure.code}|${failure.function}`;
  const policy = /policy "([^"]+)"/.exec(failure.detail ?? "")?.[1] ?? "";
  return `${failure.code}|${failure.table ?? ""}|${policy}`;
}

export function reviewLater(failure: GateFailure) {
  return REVIEW_LATER.includes(reviewKey(failure));
}
