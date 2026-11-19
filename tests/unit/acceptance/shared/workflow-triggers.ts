/**
 * Checked reads of a workflow's `on:` block for acceptance tests (#2706). The
 * parsed YAML is narrowed with type guards, not casts, and a `push` branch
 * filter is compared as a set: GitHub does not read its order.
 */
import { expect } from "vitest";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The parsed `on:` map; throws when `on:` is not a map of triggers. */
export function triggerMap(on: unknown): Record<string, unknown> {
  if (!isRecord(on)) {
    throw new Error(`on: is not a map of triggers: ${JSON.stringify(on)}`);
  }
  return on;
}

/** `push` filters on exactly these branches, in any order, and nothing else. */
export function expectPushBranches(
  push: unknown,
  branches: readonly string[],
): void {
  expect(isRecord(push) ? Object.keys(push) : push, "push filters").toEqual([
    "branches",
  ]);
  const listed =
    isRecord(push) && Array.isArray(push.branches)
      ? [...push.branches].sort()
      : push;
  expect(listed, "push branches").toEqual([...branches].sort());
}
