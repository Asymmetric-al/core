const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const SUPPORTED_CRM_SORT_FIELDS = [
  "updatedAt",
  "createdAt",
  "name",
  "recordType",
  "lifecycleStatus",
  "lifetimeGiving",
  "lastGiftAt",
] as const;

export type CrmSortField = (typeof SUPPORTED_CRM_SORT_FIELDS)[number];
export type CrmSortDirection = "asc" | "desc";

export interface CrmCursor {
  id: string;
  field: CrmSortField;
  direction: CrmSortDirection;
  value: string | number | null;
}

export interface AdminCrmFilters {
  recordTypes: string[];
  lifecycleStatuses: string[];
  tags: string[];
  hasPortal: boolean | null;
}

export interface AdminCrmParams {
  limit: number;
  search: string | null;
  sort: {
    field: CrmSortField;
    direction: CrmSortDirection;
  };
  cursor: CrmCursor | null;
  filters: AdminCrmFilters;
}

function isSortField(value: string): value is CrmSortField {
  return (SUPPORTED_CRM_SORT_FIELDS as readonly string[]).includes(value);
}

function getNormalizedValues(searchParams: URLSearchParams, key: string) {
  return Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
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
): AdminCrmParams["sort"] {
  if (!fieldValue || !isSortField(fieldValue)) {
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

export function encodeCrmCursor(cursor: CrmCursor) {
  return encodeBase64Url(JSON.stringify(cursor));
}

export function decodeCrmCursor(
  value: string | null | undefined,
): CrmCursor | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(value)) as Partial<CrmCursor>;
    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      !parsed.id ||
      typeof parsed.field !== "string" ||
      !isSortField(parsed.field) ||
      (parsed.direction !== "asc" && parsed.direction !== "desc")
    ) {
      return null;
    }

    if (
      parsed.value !== null &&
      typeof parsed.value !== "string" &&
      typeof parsed.value !== "number"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      field: parsed.field,
      direction: parsed.direction,
      value: parsed.value ?? null,
    };
  } catch {
    return null;
  }
}

function parseHasPortal(value: string | null): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function parseAdminCrmParams(
  searchParams: URLSearchParams,
): AdminCrmParams {
  const sort = parseSort(searchParams.get("sort"), searchParams.get("dir"));
  const search = searchParams.get("q")?.trim() || null;

  return {
    limit: parseLimit(searchParams.get("limit")),
    search,
    sort,
    cursor: decodeCrmCursor(searchParams.get("after")),
    filters: {
      recordTypes: getNormalizedValues(searchParams, "recordType"),
      lifecycleStatuses: getNormalizedValues(searchParams, "status"),
      tags: getNormalizedValues(searchParams, "tag"),
      hasPortal: parseHasPortal(searchParams.get("hasPortal")),
    },
  };
}

export const adminCrmQueryConfig = {
  defaultLimit: DEFAULT_LIMIT,
  maxLimit: MAX_LIMIT,
  supportedSortFields: SUPPORTED_CRM_SORT_FIELDS,
} as const;
