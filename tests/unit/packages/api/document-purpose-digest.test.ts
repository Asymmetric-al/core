import { describe, expect, it } from "vitest";

import {
  DOCUMENT_PURPOSE_CATALOG,
  DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
  DOCUMENT_PURPOSE_SERIALIZER_VERSION,
  buildDocumentPurposeCatalogManifest,
  canonicalizeDocumentPurposeValue,
  digestDocumentPurposeValue,
  getDocumentPurposeCatalogDigest,
  getDocumentPurposeContract,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";

// Changing this pin is a reviewed, versioned contract change: any catalog value
// or serialization change must update it deliberately, with a schema version
// bump where the contract shape or meaning changes.
const PINNED_CATALOG_DIGEST =
  "45ca5f488c8de37813095c5a3fa3677989c298e4e2faa976b6f9c5a57537eeaa";

describe("canonical serialization and the catalog digest", () => {
  it("serializes logically identical values identically regardless of key order", () => {
    const shuffled = {
      review_floor: "protected",
      lane: "official_tax",
      approved_data_view: { view_version: 1, view_key: "x", fields: ["a"] },
    };
    const ordered = {
      approved_data_view: { fields: ["a"], view_key: "x", view_version: 1 },
      lane: "official_tax",
      review_floor: "protected",
    };

    expect(canonicalizeDocumentPurposeValue(shuffled)).toBe(
      canonicalizeDocumentPurposeValue(ordered),
    );
    expect(digestDocumentPurposeValue(shuffled)).toBe(
      digestDocumentPurposeValue(ordered),
    );
  });

  it("pins the catalog digest and serialization contract to literal values", () => {
    const manifest = buildDocumentPurposeCatalogManifest();

    expect(getDocumentPurposeCatalogDigest()).toBe(PINNED_CATALOG_DIGEST);
    expect(manifest.digest).toBe(PINNED_CATALOG_DIGEST);
    expect(DOCUMENT_PURPOSE_SERIALIZER_VERSION).toBe("1");
    expect(manifest.digest_algorithm).toBe("sha256");
    expect(manifest.schema_version).toBe("2");
    expect(DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION).toBe("2");
  });

  it("keeps a stable digest across processes and repeated calls", () => {
    const digest = getDocumentPurposeCatalogDigest();
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(getDocumentPurposeCatalogDigest()).toBe(digest);

    // Recomputing from a deep clone (fresh object graph, insertion order
    // re-created) must land on the same digest.
    const recomputed = digestDocumentPurposeValue({
      schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      serializer_version: "1",
      entries: Object.keys(DOCUMENT_PURPOSE_CATALOG)
        .sort((left, right) => left.localeCompare(right))
        .map((purposeId) =>
          structuredClone(getDocumentPurposeContract(purposeId)),
        ),
    });
    expect(recomputed).toBe(digest);
  });

  it("changes the digest for any contract-semantic change", () => {
    const entries = Object.keys(DOCUMENT_PURPOSE_CATALOG)
      .sort((left, right) => left.localeCompare(right))
      .map((purposeId) =>
        structuredClone(getDocumentPurposeContract(purposeId)),
      );
    const mutated = structuredClone(entries);
    mutated[0].review_floor = "standard";

    const base = digestDocumentPurposeValue({
      schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      serializer_version: "1",
      entries,
    });
    const changed = digestDocumentPurposeValue({
      schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      serializer_version: "1",
      entries: mutated,
    });
    expect(changed).not.toBe(base);
  });

  it("builds a manifest with schema version, sorted entries, algorithm, and digest", () => {
    const manifest = buildDocumentPurposeCatalogManifest();

    expect(manifest.schema_version).toBe(
      DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
    );
    expect(manifest.digest_algorithm).toBe("sha256");
    expect(manifest.digest).toBe(getDocumentPurposeCatalogDigest());
    expect(manifest.entries).toHaveLength(11);

    const ids = manifest.entries.map(
      (entry) => `${entry.purpose_key}@${entry.purpose_version}`,
    );
    expect(ids).toEqual(
      [...ids].sort((left, right) => left.localeCompare(right)),
    );
  });

  it("cannot be mutated by a consumer to change a later lookup or digest", () => {
    const digestBefore = getDocumentPurposeCatalogDigest();
    const contract = getDocumentPurposeContract("tribute.notification@1");

    expect(() => {
      (contract as { review_floor: string }).review_floor = "protected";
    }).toThrow(TypeError);
    expect(() => {
      (contract.forbidden_facts.facts as string[]).push("nothing");
    }).toThrow(TypeError);

    expect(
      getDocumentPurposeContract("tribute.notification@1").review_floor,
    ).toBe("standard");
    expect(getDocumentPurposeCatalogDigest()).toBe(digestBefore);
  });
});
