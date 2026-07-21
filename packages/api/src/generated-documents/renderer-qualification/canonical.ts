import { createHash } from "node:crypto";

/**
 * Canonical serialization for charter digests. Object keys sort recursively;
 * arrays keep their declared order. Order-insensitive collections (candidates,
 * corpus, gates, dimensions, budgets, validators, triggers) are normalized to
 * a stable sort by the freeze step before digesting, so shuffled input yields
 * the same digest while genuinely order-sensitive protocols (tie-break order,
 * concurrency staircase steps) remain order-significant.
 */

export const RENDERER_QUALIFICATION_SERIALIZER_VERSION = "1";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, canonicalize(child)]),
  );
}

export function canonicalizeQualificationValue(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function digestQualificationValue(value: unknown): string {
  return createHash("sha256")
    .update(canonicalizeQualificationValue(value))
    .digest("hex");
}
