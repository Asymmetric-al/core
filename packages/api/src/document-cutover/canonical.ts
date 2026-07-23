/**
 * Deterministic canonical serialization for cutover evidence and proofs.
 *
 * Two logically identical values always serialize to the same bytes (object
 * keys sorted recursively by code point, no insignificant whitespace), so
 * digests are stable across runs, locales, and runtimes, and any semantic
 * change produces a different digest.
 */

export const DOCUMENT_CUTOVER_SERIALIZER_VERSION = "1";

/** Locale-independent ordinal comparison; digests must never depend on ICU. */
export function compareOrdinal(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Map || value instanceof Set) {
    throw new TypeError(
      "canonicalize does not support Map/Set values; convert to a plain object or array first.",
    );
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => compareOrdinal(left, right))
      .map(([key, child]) => [key, canonicalize(child)]),
  );
}

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function toHex(digest: ArrayBuffer): string {
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function sha256HexOfText(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  return toHex(await crypto.subtle.digest("SHA-256", encoded));
}

export async function digestCanonicalValue(value: unknown): Promise<string> {
  return sha256HexOfText(canonicalStringify(value));
}
