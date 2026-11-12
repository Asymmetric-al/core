/**
 * Oracle self-checks for the GitHub issue #2206 acceptance tests.
 * Issue: {@link https://github.com/Asymmetric-al/core/issues/2206}
 *
 * These tests check the oracle, not the implementation. They pass on the base
 * commit and on any candidate. They make sure that:
 * - the hand-derived literals in `./oracle.ts` really are in UTF-16 code-unit
 *   order;
 * - the issue's claim "a code-point comparator ... keeps today's digest" holds
 *   for the catalog data. A reference canonicalization written here from the
 *   issue's description (sort object keys by code point, drop undefined, keep
 *   arrays, JSON, sha256) applied to the catalog entries in code-point order
 *   gives the pinned digest. So C1 and C2 can both be met at once.
 *
 * They only read catalog data and `node:crypto`; they never call the
 * serialization module under test.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { DOCUMENT_PURPOSE_CATALOG } from "../../../../packages/api/src/generated-documents/purpose-catalog/catalog";
import {
  CANONICAL_SAMPLE_EXPECTED,
  CODE_POINT_PURPOSE_ORDER,
  canonicalSampleInput,
  PINNED_CATALOG_DIGEST,
} from "./oracle";

function codeUnitCompare(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function referenceCanonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(referenceCanonicalize);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => codeUnitCompare(left, right))
      .map(([key, child]) => [key, referenceCanonicalize(child)]),
  );
}

describe("issue #2206 oracle self-check", () => {
  it("oracle: the canonical sample literal is the sample in code-unit key order", () => {
    expect(JSON.stringify(referenceCanonicalize(canonicalSampleInput()))).toBe(
      CANONICAL_SAMPLE_EXPECTED,
    );
  });

  it("oracle: the purpose-order literal is the catalog's ids in code-unit order", () => {
    expect(Object.keys(DOCUMENT_PURPOSE_CATALOG).sort(codeUnitCompare)).toEqual(
      [...CODE_POINT_PURPOSE_ORDER],
    );
  });

  it("oracle: code-point canonicalization of the catalog gives the pinned digest", () => {
    const entries = CODE_POINT_PURPOSE_ORDER.map(
      (id) => DOCUMENT_PURPOSE_CATALOG[id],
    );
    const canonical = JSON.stringify(
      referenceCanonicalize({
        schema_version: "2",
        serializer_version: "1",
        entries,
      }),
    );
    expect(createHash("sha256").update(canonical).digest("hex")).toBe(
      PINNED_CATALOG_DIGEST,
    );
  });
});
