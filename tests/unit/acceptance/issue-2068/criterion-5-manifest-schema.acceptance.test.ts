/**
 * Acceptance tests for GitHub issue #2068, done criterion 5.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * Criterion 5: "The manifest's `schema_version` is `"2"` and `entries` still
 * has 11 items."
 *
 * D1a: "the purpose ID stays `giving.summary.informational@1`, and
 * `DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION` goes from `"1"` to `"2"`."
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  buildDocumentPurposeCatalogManifest,
  DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
  DOCUMENT_PURPOSE_IDS,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";

describe("issue #2068 done criterion 5: schema version", () => {
  it('criterion 5 / D1a: the manifest\'s schema_version and DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION are "2"', () => {
    expect(DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION).toBe("2");
    expect(buildDocumentPurposeCatalogManifest().schema_version).toBe("2");
  });
});

describe("issue #2068 done criterion 5: entry count", () => {
  it("criterion 5: entries still has 11 items, with the same 11 purpose IDs (D1a: no @2)", () => {
    const { entries } = buildDocumentPurposeCatalogManifest();
    expect(entries).toHaveLength(11);
    expect(
      entries.map((entry) => `${entry.purpose_key}@${entry.purpose_version}`),
    ).toEqual([...DOCUMENT_PURPOSE_IDS].sort((a, b) => a.localeCompare(b)));
  });
});
