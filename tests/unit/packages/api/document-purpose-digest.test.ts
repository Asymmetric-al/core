import { describe, expect, it } from "vitest";

import {
  DOCUMENT_PURPOSE_CATALOG,
  buildDocumentPurposeCatalogManifest,
  canonicalizeDocumentPurposeValue,
  digestDocumentPurposeValue,
  getDocumentPurposeCatalogDigest,
  getDocumentPurposeContract,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";

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

  it("keeps a stable digest across processes and repeated calls", () => {
    const digest = getDocumentPurposeCatalogDigest();
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(getDocumentPurposeCatalogDigest()).toBe(digest);

    // Recomputing from a deep clone (fresh object graph, insertion order
    // re-created) must land on the same digest.
    const recomputed = digestDocumentPurposeValue({
      schema_version: "1",
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
      schema_version: "1",
      serializer_version: "1",
      entries,
    });
    const changed = digestDocumentPurposeValue({
      schema_version: "1",
      serializer_version: "1",
      entries: mutated,
    });
    expect(changed).not.toBe(base);
  });

  it("builds a manifest with schema version, sorted entries, algorithm, and digest", () => {
    const manifest = buildDocumentPurposeCatalogManifest();

    expect(manifest.schema_version).toBe("1");
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
