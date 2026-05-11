import type {
  CrmRelationshipDomain,
  CrmRelationshipSortDirection,
  CrmRelationshipSortField,
} from "@asym/database/types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const SUPPORTED_CRM_RELATIONSHIP_DOMAINS = [
  "people",
  "organizations",
  "churches",
  "households",
  "pledges",
  "activity",
] as const satisfies readonly CrmRelationshipDomain[];

export const SUPPORTED_CRM_RELATIONSHIP_SORT_FIELDS = [
  "updatedAt",
  "lastActivityAt",
  "displayName",
  "domain",
  "status",
  "commitmentAmountCents",
] as const satisfies readonly CrmRelationshipSortField[];

export interface CrmRelationshipCursor {
  offset: number;
}

export interface AdminCrmRelationshipsParams {
  limit: number;
  search: string | null;
  domains: CrmRelationshipDomain[];
  sort: {
    field: CrmRelationshipSortField;
    direction: CrmRelationshipSortDirection;
  };
  cursor: CrmRelationshipCursor | null;
}

function isRelationshipDomain(value: string): value is CrmRelationshipDomain {
  return (SUPPORTED_CRM_RELATIONSHIP_DOMAINS as readonly string[]).includes(
    value,
  );
}

function isRelationshipSortField(
  value: string,
): value is CrmRelationshipSortField {
  return (SUPPORTED_CRM_RELATIONSHIP_SORT_FIELDS as readonly string[]).includes(
    value,
  );
}

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function parseDomains(values: string[]): CrmRelationshipDomain[] {
  const domains = values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(isRelationshipDomain);

  return Array.from(new Set(domains));
}

function parseSort(
  fieldValue: string | null,
  directionValue: string | null,
): AdminCrmRelationshipsParams["sort"] {
  if (!fieldValue || !isRelationshipSortField(fieldValue)) {
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

export function encodeCrmRelationshipCursor(cursor: CrmRelationshipCursor) {
  return encodeBase64Url(JSON.stringify(cursor));
}

export function decodeCrmRelationshipCursor(
  value: string | null | undefined,
): CrmRelationshipCursor | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      decodeBase64Url(value),
    ) as Partial<CrmRelationshipCursor>;
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

export function parseAdminCrmRelationshipsParams(
  searchParams: URLSearchParams,
): AdminCrmRelationshipsParams {
  return {
    limit: parseLimit(searchParams.get("limit")),
    search: searchParams.get("q")?.trim() || null,
    domains: parseDomains(searchParams.getAll("domain")),
    sort: parseSort(searchParams.get("sort"), searchParams.get("dir")),
    cursor: decodeCrmRelationshipCursor(searchParams.get("after")),
  };
}

export const adminCrmRelationshipsQueryConfig = {
  defaultLimit: DEFAULT_LIMIT,
  maxLimit: MAX_LIMIT,
  supportedDomains: SUPPORTED_CRM_RELATIONSHIP_DOMAINS,
  supportedSortFields: SUPPORTED_CRM_RELATIONSHIP_SORT_FIELDS,
} as const;
