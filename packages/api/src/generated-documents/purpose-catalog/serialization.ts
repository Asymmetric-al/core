import { createHash } from "node:crypto";

import { DOCUMENT_PURPOSE_CATALOG } from "./catalog";
import { DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION } from "./types";

import type { DocumentPurposeCatalogManifest } from "./types";

/**
 * Versioned canonical serialization for the purpose catalog. Object keys are
 * sorted recursively so the digest is stable across insertion order and
 * runtime processes, and any contract-semantic change produces a new digest
 * that later Generation Requests can pin against.
 */

export const DOCUMENT_PURPOSE_SERIALIZER_VERSION = "1";

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

export function canonicalizeDocumentPurposeValue(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function digestDocumentPurposeValue(value: unknown): string {
  return createHash("sha256")
    .update(canonicalizeDocumentPurposeValue(value))
    .digest("hex");
}

function sortedCatalogEntries() {
  return Object.keys(DOCUMENT_PURPOSE_CATALOG)
    .sort((left, right) => left.localeCompare(right))
    .map(
      (purposeId) =>
        DOCUMENT_PURPOSE_CATALOG[
          purposeId as keyof typeof DOCUMENT_PURPOSE_CATALOG
        ],
    );
}

let cachedDigest: string | undefined;

export function getDocumentPurposeCatalogDigest(): string {
  cachedDigest ??= digestDocumentPurposeValue({
    schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
    serializer_version: DOCUMENT_PURPOSE_SERIALIZER_VERSION,
    entries: sortedCatalogEntries(),
  });
  return cachedDigest;
}

export function buildDocumentPurposeCatalogManifest(): DocumentPurposeCatalogManifest {
  return {
    schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
    digest_algorithm: "sha256",
    entries: sortedCatalogEntries(),
    digest: getDocumentPurposeCatalogDigest(),
  };
}
