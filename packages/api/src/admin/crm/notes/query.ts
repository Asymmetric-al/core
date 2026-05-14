import type {
  CrmNoteSortDirection,
  CrmNoteSortField,
} from "@asym/database/types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const SUPPORTED_CRM_NOTE_SORT_FIELDS = [
  "updatedAt",
  "createdAt",
  "title",
] as const satisfies readonly CrmNoteSortField[];

export interface CrmNoteCursor {
  offset: number;
}

export interface AdminCrmNotesParams {
  limit: number;
  search: string | null;
  sort: {
    field: CrmNoteSortField;
    direction: CrmNoteSortDirection;
  };
  cursor: CrmNoteCursor | null;
}

function isNoteSortField(value: string): value is CrmNoteSortField {
  return (SUPPORTED_CRM_NOTE_SORT_FIELDS as readonly string[]).includes(value);
}

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function parseSort(
  fieldValue: string | null,
  directionValue: string | null,
): AdminCrmNotesParams["sort"] {
  if (!fieldValue || !isNoteSortField(fieldValue)) {
    return {
      field: "updatedAt",
      direction: "desc",
    };
  }

  return {
    field: fieldValue,
    direction: directionValue === "asc" ? "asc" : "desc",
  };
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function encodeCrmNoteCursor(cursor: CrmNoteCursor) {
  return encodeBase64Url(JSON.stringify(cursor));
}

export function decodeCrmNoteCursor(
  value: string | null | undefined,
): CrmNoteCursor | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(value)) as Partial<CrmNoteCursor>;
    if (
      !parsed ||
      typeof parsed.offset !== "number" ||
      !Number.isInteger(parsed.offset) ||
      parsed.offset < 0
    ) {
      return null;
    }

    return {
      offset: parsed.offset,
    };
  } catch {
    return null;
  }
}

export function parseAdminCrmNotesParams(
  searchParams: URLSearchParams,
): AdminCrmNotesParams {
  return {
    limit: parseLimit(searchParams.get("limit")),
    search: searchParams.get("q")?.trim() || null,
    sort: parseSort(searchParams.get("sort"), searchParams.get("dir")),
    cursor: decodeCrmNoteCursor(searchParams.get("after")),
  };
}

export const adminCrmNotesQueryConfig = {
  defaultLimit: DEFAULT_LIMIT,
  maxLimit: MAX_LIMIT,
  supportedSortFields: SUPPORTED_CRM_NOTE_SORT_FIELDS,
} as const;
