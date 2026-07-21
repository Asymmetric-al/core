/**
 * Deterministic canonical serialization for cutover evidence and proofs.
 *
 * Two logically identical values always serialize to the same bytes (object
 * keys sorted recursively, no insignificant whitespace), so digests are stable
 * across runs and any semantic change produces a different digest.
 */

export const DOCUMENT_CUTOVER_SERIALIZER_VERSION = "1";

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
