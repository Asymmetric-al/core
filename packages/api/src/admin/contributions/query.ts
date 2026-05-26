const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const SUPPORTED_SORT_FIELDS = [
  "giftDate",
  "createdAt",
  "amount",
  "status",
  "paymentMethod",
  "source",
] as const;

const SUPPORTED_RECEIPT_STATUSES = [
  "sent",
  "pending",
  "failed",
  "not_sent",
] as const;

export type ContributionSortField = (typeof SUPPORTED_SORT_FIELDS)[number];
export type ContributionSortDirection = "asc" | "desc";
export type ContributionReceiptStatus =
  (typeof SUPPORTED_RECEIPT_STATUSES)[number];

export interface ContributionCursor {
  id: string;
  field: ContributionSortField;
  direction: ContributionSortDirection;
  value: string | number | null;
}

export interface AdminContributionsFilters {
  statuses: string[];
  contributionTypes: string[];
  paymentMethods: string[];
  sources: string[];
  fundIds: string[];
  missionaryIds: string[];
  projectIds: string[];
  batchIds: string[];
  receiptStatuses: ContributionReceiptStatus[];
  refundStatuses: string[];
  anonymousOnly: boolean;
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
  paymentLast4: string | null;
}

export interface AdminContributionsParams {
  limit: number;
  search: string | null;
  sort: {
    field: ContributionSortField;
    direction: ContributionSortDirection;
  };
  cursor: ContributionCursor | null;
  filters: AdminContributionsFilters;
}

function isSortField(value: string): value is ContributionSortField {
  return (SUPPORTED_SORT_FIELDS as readonly string[]).includes(value);
}

function isReceiptStatus(value: string): value is ContributionReceiptStatus {
  return (SUPPORTED_RECEIPT_STATUSES as readonly string[]).includes(value);
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

function parseNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value: string | null) {
  return value === "true";
}

function parseSort(
  fieldValue: string | null,
  directionValue: string | null,
): AdminContributionsParams["sort"] {
  if (!fieldValue || !isSortField(fieldValue)) {
    return {
      field: "giftDate",
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

export function encodeContributionCursor(cursor: ContributionCursor) {
  return encodeBase64Url(JSON.stringify(cursor));
}

export function decodeContributionCursor(
  value: string | null | undefined,
): ContributionCursor | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      decodeBase64Url(value),
    ) as Partial<ContributionCursor>;
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

export function parseAdminContributionsParams(
  searchParams: URLSearchParams,
): AdminContributionsParams {
  const sort = parseSort(searchParams.get("sort"), searchParams.get("dir"));
  const search = searchParams.get("q")?.trim() || null;

  return {
    limit: parseLimit(searchParams.get("limit")),
    search,
    sort,
    cursor: decodeContributionCursor(searchParams.get("after")),
    filters: {
      statuses: getNormalizedValues(searchParams, "status"),
      contributionTypes: getNormalizedValues(searchParams, "type"),
      paymentMethods: getNormalizedValues(searchParams, "paymentMethod"),
      sources: getNormalizedValues(searchParams, "source"),
      fundIds: getNormalizedValues(searchParams, "fundId"),
      missionaryIds: getNormalizedValues(searchParams, "missionaryId"),
      projectIds: getNormalizedValues(searchParams, "projectId"),
      batchIds: getNormalizedValues(searchParams, "batchId"),
      receiptStatuses: getNormalizedValues(
        searchParams,
        "receiptStatus",
      ).filter(isReceiptStatus),
      refundStatuses: getNormalizedValues(searchParams, "refundStatus"),
      anonymousOnly: parseBoolean(searchParams.get("anonymousOnly")),
      dateFrom: searchParams.get("dateFrom")?.trim() || null,
      dateTo: searchParams.get("dateTo")?.trim() || null,
      amountMin: parseNumber(searchParams.get("amountMin")),
      amountMax: parseNumber(searchParams.get("amountMax")),
      paymentLast4: searchParams.get("last4")?.trim() || null,
    },
  };
}

export const adminContributionQueryConfig = {
  defaultLimit: DEFAULT_LIMIT,
  maxLimit: MAX_LIMIT,
  supportedSortFields: SUPPORTED_SORT_FIELDS,
  supportedReceiptStatuses: SUPPORTED_RECEIPT_STATUSES,
} as const;
