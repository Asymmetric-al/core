import type { ColumnFiltersState } from "./tanstack";

export type UrlColumnFiltersParseResult =
  | { ok: true; filters: ColumnFiltersState }
  | { ok: false; filters: ColumnFiltersState; shouldClearParam: boolean };

function isColumnFilterEntry(
  value: unknown,
): value is ColumnFiltersState[number] {
  if (value === null || typeof value !== "object") return false;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0;
}

/**
 * Parse the URL `filter` query value into TanStack `ColumnFiltersState`.
 * Invalid JSON, non-arrays, or malformed entries yield `[]` and may trigger
 * `shouldClearParam` so callers can remove a corrupted param from the URL.
 */
export function parseColumnFiltersFromUrlString(
  raw: string | null | undefined,
): UrlColumnFiltersParseResult {
  const str = raw?.trim() ?? "";
  if (!str) {
    return { ok: true, filters: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(str);
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[asym/ui] DataTable URL filter: invalid JSON; column filters cleared.",
      );
    }
    return { ok: false, filters: [], shouldClearParam: true };
  }

  if (!Array.isArray(parsed)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[asym/ui] DataTable URL filter: expected JSON array; column filters cleared.",
      );
    }
    return { ok: false, filters: [], shouldClearParam: true };
  }

  const filters: ColumnFiltersState = [];
  for (const item of parsed) {
    if (!isColumnFilterEntry(item)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[asym/ui] DataTable URL filter: invalid filter entry; column filters cleared.",
        );
      }
      return { ok: false, filters: [], shouldClearParam: true };
    }
    filters.push(item);
  }

  return { ok: true, filters };
}
