/**
 * Issue #2068 criterion-1 mutant: the real serialization module with one
 * serializer-level change, picked by `ACC_2068_SERIALIZER_MUTATION`:
 *
 * - `canonical_order`: object keys sort in reverse order. All public functions
 *   change together, so the module stays self-consistent and only a literal
 *   pin can notice.
 * - `serializer_version_bump`: `DOCUMENT_PURPOSE_SERIALIZER_VERSION` is `"2"`
 *   and the digest is computed with serializer version `"2"`.
 * - `serializer_version_export`: only the exported constant reads `"2"`.
 * - `manifest_schema_version`: the manifest reports a different schema version.
 * - `manifest_algorithm`: the manifest reports a different digest algorithm.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { createHash } from "node:crypto";

import * as real from "../../../../../packages/api/src/generated-documents/purpose-catalog/serialization";
import { DOCUMENT_PURPOSE_CATALOG } from "../../../../../packages/api/src/generated-documents/purpose-catalog/catalog";
import { DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION } from "../../../../../packages/api/src/generated-documents/purpose-catalog/types";

import type { DocumentPurposeCatalogManifest } from "../../../../../packages/api/src/generated-documents/purpose-catalog/types";

const mutation = process.env.ACC_2068_SERIALIZER_MUTATION ?? "";
const KNOWN = [
  "canonical_order",
  "serializer_version_bump",
  "serializer_version_export",
  "manifest_schema_version",
  "manifest_algorithm",
];
if (!KNOWN.includes(mutation)) {
  throw new Error(`serialization mutant: unknown mutation ${mutation}`);
}

function reverseCanonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseCanonicalize);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([key, child]) => [key, reverseCanonicalize(child)]),
  );
}

export const canonicalizeDocumentPurposeValue =
  mutation === "canonical_order"
    ? (value: unknown): string => JSON.stringify(reverseCanonicalize(value))
    : real.canonicalizeDocumentPurposeValue;

export const digestDocumentPurposeValue =
  mutation === "canonical_order"
    ? (value: unknown): string =>
        createHash("sha256")
          .update(canonicalizeDocumentPurposeValue(value))
          .digest("hex")
    : real.digestDocumentPurposeValue;

export const DOCUMENT_PURPOSE_SERIALIZER_VERSION =
  mutation === "serializer_version_bump" ||
  mutation === "serializer_version_export"
    ? "2"
    : real.DOCUMENT_PURPOSE_SERIALIZER_VERSION;

function sortedEntries() {
  return Object.keys(DOCUMENT_PURPOSE_CATALOG)
    .sort((left, right) => left.localeCompare(right))
    .map(
      (id) =>
        DOCUMENT_PURPOSE_CATALOG[id as keyof typeof DOCUMENT_PURPOSE_CATALOG],
    );
}

export function getDocumentPurposeCatalogDigest(): string {
  if (
    mutation === "canonical_order" ||
    mutation === "serializer_version_bump"
  ) {
    return digestDocumentPurposeValue({
      schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      serializer_version: DOCUMENT_PURPOSE_SERIALIZER_VERSION,
      entries: sortedEntries(),
    });
  }
  return real.getDocumentPurposeCatalogDigest();
}

export function buildDocumentPurposeCatalogManifest(): DocumentPurposeCatalogManifest {
  const manifest = {
    ...real.buildDocumentPurposeCatalogManifest(),
    digest: getDocumentPurposeCatalogDigest(),
  };
  if (mutation === "manifest_schema_version") {
    return {
      ...manifest,
      schema_version: `${manifest.schema_version}.mutated`,
    };
  }
  if (mutation === "manifest_algorithm") {
    return {
      ...manifest,
      digest_algorithm: "sha512" as unknown as "sha256",
    };
  }
  return manifest;
}
