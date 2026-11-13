/**
 * Acceptance tests for GitHub issue #2206, criteria C1–C3 in the test
 * runner's own process (whatever locale the host gives it).
 * Issue: {@link https://github.com/Asymmetric-al/core/issues/2206}
 *
 * "Fix: switch to a code-point comparator. This keeps today's digest
 * (45ca5f48…eeaa under en/C locales)."
 *
 * The expected orderings are hand-derived literals in `./oracle.ts`. The
 * canonical sample uses keys whose code-point order differs from every ICU
 * collation (including English), so a comparator that is merely pinned to one
 * locale, such as `localeCompare(other, "en")`, does not pass.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
  DOCUMENT_PURPOSE_SERIALIZER_VERSION,
  buildDocumentPurposeCatalogManifest,
  canonicalizeDocumentPurposeValue,
  getDocumentPurposeCatalogDigest,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";
import {
  CANONICAL_SAMPLE_EXPECTED,
  CODE_POINT_PURPOSE_ORDER,
  canonicalSampleInput,
  PINNED_CATALOG_DIGEST,
} from "./oracle";

describe("issue #2206: code-point order in the host process", () => {
  it("C2: canonicalizeDocumentPurposeValue orders object keys by code point at every depth", () => {
    expect(canonicalizeDocumentPurposeValue(canonicalSampleInput())).toBe(
      CANONICAL_SAMPLE_EXPECTED,
    );
  });

  it("C2: buildDocumentPurposeCatalogManifest() lists all 11 entries in code-point order of purpose id", () => {
    const ids = buildDocumentPurposeCatalogManifest().entries.map(
      (entry) => `${entry.purpose_key}@${entry.purpose_version}`,
    );
    expect(ids).toEqual([...CODE_POINT_PURPOSE_ORDER]);
  });

  it("C1: getDocumentPurposeCatalogDigest() keeps the pinned digest", () => {
    expect(getDocumentPurposeCatalogDigest()).toBe(PINNED_CATALOG_DIGEST);
  });

  it("C1: buildDocumentPurposeCatalogManifest().digest keeps the pinned digest", () => {
    expect(buildDocumentPurposeCatalogManifest().digest).toBe(
      PINNED_CATALOG_DIGEST,
    );
  });

  it('C3: serializer "1", schema "2" and "sha256" are unchanged', () => {
    const manifest = buildDocumentPurposeCatalogManifest();
    expect({
      serializer: DOCUMENT_PURPOSE_SERIALIZER_VERSION,
      schema: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      manifestSchema: manifest.schema_version,
      algorithm: manifest.digest_algorithm,
    }).toEqual({
      serializer: "1",
      schema: "2",
      manifestSchema: "2",
      algorithm: "sha256",
    });
  });
});
