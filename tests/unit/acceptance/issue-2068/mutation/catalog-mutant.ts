/**
 * Issue #2068 criterion-1 mutant: the real purpose catalog with exactly one
 * leaf changed. `ACC_2068_MUTANT_PURPOSE` names the entry and
 * `ACC_2068_MUTANT_PATH` (a JSON array) the leaf inside it. The result is
 * deep-frozen like the real catalog, so unrelated immutability tests behave
 * the same as in the control run.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { mutatedLeaf, withLeaf } from "../catalog-scan";
import { DOCUMENT_PURPOSE_CATALOG as REAL_CATALOG } from "../../../../../packages/api/src/generated-documents/purpose-catalog/catalog";

export * from "../../../../../packages/api/src/generated-documents/purpose-catalog/catalog";

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function mutate(): typeof REAL_CATALOG {
  const purposeId = process.env.ACC_2068_MUTANT_PURPOSE ?? "";
  const leafPath = JSON.parse(process.env.ACC_2068_MUTANT_PATH ?? "[]") as (
    string | number
  )[];
  const catalog = structuredClone(REAL_CATALOG) as Record<string, unknown>;
  if (!(purposeId in catalog) || leafPath.length === 0) {
    throw new Error(
      `catalog mutant: unknown purpose ${purposeId} or empty leaf path`,
    );
  }
  let current: unknown = catalog[purposeId];
  for (const key of leafPath) {
    current = (current as Record<string | number, unknown>)[key];
  }
  catalog[purposeId] = withLeaf(
    catalog[purposeId],
    leafPath,
    mutatedLeaf(current),
  );
  return deepFreeze(catalog) as typeof REAL_CATALOG;
}

export const DOCUMENT_PURPOSE_CATALOG = mutate();
