/**
 * Coercion helpers for untrusted JSON — Supabase rows, webhook payloads, and
 * external CRM responses. Import these instead of redefining per file.
 */

/** Fallback timestamp used by `timestampOrDefault` for missing/invalid input. */
export const DEFAULT_TIMESTAMP = "1970-01-01T00:00:00.000Z";

/** Plain-object guard: rejects null, arrays, and primitives. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Returns the string unchanged when it has non-whitespace content; empty or
 * whitespace-only strings and non-strings become null. Does NOT trim the
 * returned value — use `coerceString` for trimming.
 */
export function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Lenient CRM-payload coercion: trims strings (empty -> null), stringifies
 * numbers and booleans, and unwraps `{ value: string }` field wrappers.
 */
export function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (isRecord(value) && typeof value.value === "string") {
    return coerceString(value.value);
  }

  return null;
}

/** First key whose value coerces (via `coerceString`) to a usable string. */
export function findFirstString(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = coerceString(record[key]);
    if (value) {
      return value;
    }
  }

  return null;
}

/**
 * Display name from a nested CRM object: prefers name/displayName/fullName,
 * then falls back to joining firstName + lastName.
 */
export function getNestedName(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  return (
    (findFirstString(value, ["name", "displayName", "fullName"]) ??
      [coerceString(value.firstName), coerceString(value.lastName)]
        .filter(Boolean)
        .join(" ")
        .trim()) ||
    null
  );
}

/** Normalizes to an ISO timestamp; null/unparseable -> `DEFAULT_TIMESTAMP`. */
export function timestampOrDefault(value: string | null): string {
  if (!value) {
    return DEFAULT_TIMESTAMP;
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return DEFAULT_TIMESTAMP;
  }

  return timestamp.toISOString();
}
