import type { AdminCrmRelationshipsParams } from "./query";
import type {
  CrmRelationshipDomain,
  CrmRelationshipReport,
  CrmRelationshipRow,
} from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

const DEFAULT_TIMESTAMP = "1970-01-01T00:00:00.000Z";

const EMPTY_DOMAIN_COUNTS: Record<CrmRelationshipDomain, number> = {
  activity: 0,
  churches: 0,
  households: 0,
  organizations: 0,
  people: 0,
  pledges: 0,
};

const CRM_AUTHORITY_LABEL = "CRM relationship context";
const FINANCE_AUTHORITY_LABEL = "Relationship commitment; Asym owns payments";
const CARE_AUTHORITY_LABEL = "CRM activity; Asym owns care records";

export const CRM_RELATIONSHIP_OBJECTS = [
  "people",
  "companies",
  "churches",
  "households",
  "relationshipCommitments",
  "ministryActivities",
] as const;

interface NormalizeStats {
  duplicateCompanyCandidates: number;
  excludedCareActivityCount: number;
}

interface NormalizeResult {
  rows: CrmRelationshipRow[];
  stats: NormalizeStats;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (isRecord(value) && typeof value.value === "string") {
    return asString(value.value);
  }

  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function findFirstString(
  record: JsonRecord,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) {
      return value;
    }
  }

  return null;
}

function getNestedName(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  return (
    (findFirstString(value, ["name", "displayName", "fullName"]) ??
      [asString(value.firstName), asString(value.lastName)]
        .filter(Boolean)
        .join(" ")
        .trim()) ||
    null
  );
}

function normalizeKey(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || null;
}

function timestampOrDefault(value: string | null): string {
  if (!value) {
    return DEFAULT_TIMESTAMP;
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return DEFAULT_TIMESTAMP;
  }

  return timestamp.toISOString();
}

function timestampOrNull(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return timestamp.toISOString();
}

function getArrayCandidate(value: unknown, objectName: string): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [];
  }

  const candidates = [
    value.data,
    value.records,
    value.items,
    value.results,
    value[objectName],
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (isRecord(candidate)) {
      const nested = getArrayCandidate(candidate, objectName);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function getTenantId(record: JsonRecord) {
  return findFirstString(record, [
    "asymTenantId",
    "tenantId",
    "asym_tenant_id",
  ]);
}

function getRecordId(record: JsonRecord) {
  return findFirstString(record, ["id", "recordId"]);
}

function getCreatedAt(record: JsonRecord) {
  return timestampOrDefault(
    findFirstString(record, ["createdAt", "created_at"]),
  );
}

function getUpdatedAt(record: JsonRecord, fallback: string) {
  return timestampOrDefault(
    findFirstString(record, ["updatedAt", "updated_at"]) ?? fallback,
  );
}

function getDisplayName(
  record: JsonRecord,
  keys: readonly string[],
): string | null {
  return (
    findFirstString(record, keys) ??
    getNestedName(record.name) ??
    getNestedName(record.person) ??
    getNestedName(record.company)
  );
}

function getMemberIds(record: JsonRecord): string[] {
  const rawMemberIds = record.memberIds ?? record.personIds;
  const ids = Array.isArray(rawMemberIds)
    ? rawMemberIds
    : Array.isArray(record.members)
      ? record.members.map((member) =>
          isRecord(member) ? getRecordId(member) : asString(member),
        )
      : [];

  return Array.from(
    new Set(ids.map((id) => asString(id)).filter(Boolean) as string[]),
  ).sort((left, right) => left.localeCompare(right));
}

export function buildHouseholdMembershipKey(record: JsonRecord): string | null {
  const memberIds = getMemberIds(record);
  if (memberIds.length > 0) {
    return `household-members:${memberIds.join("+")}`;
  }

  return normalizeKey(
    getDisplayName(record, ["householdName", "displayName", "name", "title"]),
  );
}

function isCareSensitiveActivity(record: JsonRecord): boolean {
  const value = [
    findFirstString(record, ["activityKind", "type", "category", "source"]),
    findFirstString(record, ["title", "name", "summary"]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /care|private|counsel|pastoral|member[-_\s]?care|care[-_\s]?plan/.test(
    value,
  );
}

function baseRow(input: {
  record: JsonRecord;
  objectName: string;
  domain: CrmRelationshipDomain;
  displayName: string;
  secondaryLabel?: string | null;
  relationshipKind?: string | null;
  status?: string | null;
  location?: string | null;
  primaryContactName?: string | null;
  memberCount?: number | null;
  commitmentAmountCents?: number | null;
  commitmentCurrency?: string | null;
  commitmentFrequency?: string | null;
  lastActivityAt?: string | null;
  sourceSystem?: CrmRelationshipRow["sourceSystem"];
  authorityScope?: CrmRelationshipRow["authorityScope"];
  authorityLabel?: string;
  dedupeKey?: string | null;
}): CrmRelationshipRow[] {
  const id = getRecordId(input.record);
  const tenantId = getTenantId(input.record);
  if (!id || !tenantId) {
    return [];
  }

  const createdAt = getCreatedAt(input.record);

  return [
    {
      authorityLabel: input.authorityLabel ?? CRM_AUTHORITY_LABEL,
      authorityScope: input.authorityScope ?? "crm_relationship",
      commitmentAmountCents: input.commitmentAmountCents ?? null,
      commitmentCurrency: input.commitmentCurrency ?? null,
      commitmentFrequency: input.commitmentFrequency ?? null,
      createdAt,
      dedupeKey: input.dedupeKey ?? null,
      displayName: input.displayName,
      domain: input.domain,
      id: `${input.objectName}:${id}`,
      lastActivityAt: input.lastActivityAt ?? null,
      location: input.location ?? null,
      memberCount: input.memberCount ?? null,
      primaryContactName: input.primaryContactName ?? null,
      relationshipKind: input.relationshipKind ?? null,
      secondaryLabel: input.secondaryLabel ?? null,
      sourceSystem: input.sourceSystem ?? "Twenty CRM",
      status: input.status ?? null,
      tenantId,
      twentyObjectName: input.objectName,
      twentyRecordId: id,
      updatedAt: getUpdatedAt(input.record, createdAt),
    },
  ];
}

function normalizePerson(record: JsonRecord): CrmRelationshipRow[] {
  const displayName =
    getDisplayName(record, ["displayName", "fullName", "name", "title"]) ??
    "Unnamed person";

  return baseRow({
    record,
    objectName: "people",
    domain: "people",
    displayName,
    secondaryLabel: findFirstString(record, [
      "organizationName",
      "companyName",
      "primaryOrganization",
    ]),
    relationshipKind: "person",
    status: findFirstString(record, ["relationshipStatus", "status"]),
    location: findFirstString(record, ["location", "city", "address"]),
    primaryContactName: findFirstString(record, [
      "primaryEmail",
      "email",
      "primaryPhone",
      "phone",
    ]),
    lastActivityAt: timestampOrNull(
      findFirstString(record, ["lastActivityAt", "lastTouchAt"]),
    ),
    dedupeKey: normalizeKey(
      findFirstString(record, ["primaryEmail", "email"]) ?? displayName,
    ),
  });
}

function normalizeCompany(record: JsonRecord): CrmRelationshipRow[] {
  const displayName =
    getDisplayName(record, ["displayName", "companyName", "name", "title"]) ??
    "Unnamed organization";
  const organizationKind =
    findFirstString(record, ["organizationKind", "kind", "type"]) ??
    "organization";
  const churchLike = /church|ministry/i.test(organizationKind);
  const domain: CrmRelationshipDomain = churchLike
    ? "churches"
    : "organizations";
  const normalizedName = normalizeKey(displayName);

  return baseRow({
    record,
    objectName: "companies",
    domain,
    displayName,
    secondaryLabel: organizationKind,
    relationshipKind: organizationKind,
    status: findFirstString(record, ["relationshipStatus", "status"]),
    location: findFirstString(record, ["location", "city", "address"]),
    primaryContactName:
      getNestedName(record.primaryContact) ??
      findFirstString(record, ["primaryContactName"]),
    lastActivityAt: timestampOrNull(
      findFirstString(record, ["lastActivityAt", "lastTouchAt"]),
    ),
    dedupeKey: normalizedName
      ? `${domain === "churches" ? "church" : "organization"}:${normalizedName}`
      : null,
  });
}

function normalizeChurch(record: JsonRecord): CrmRelationshipRow[] {
  const displayName =
    getDisplayName(record, ["churchName", "displayName", "name", "title"]) ??
    "Unnamed church";
  const normalizedName = normalizeKey(displayName);

  return baseRow({
    record,
    objectName: "churches",
    domain: "churches",
    displayName,
    secondaryLabel: "church",
    relationshipKind: "church",
    status: findFirstString(record, ["relationshipStatus", "status"]),
    location: findFirstString(record, ["location", "city", "address"]),
    primaryContactName:
      getNestedName(record.primaryContact) ??
      findFirstString(record, ["primaryContactName"]),
    lastActivityAt: timestampOrNull(
      findFirstString(record, ["lastActivityAt", "lastTouchAt"]),
    ),
    dedupeKey: normalizedName ? `church:${normalizedName}` : null,
  });
}

function normalizeHousehold(record: JsonRecord): CrmRelationshipRow[] {
  const displayName =
    getDisplayName(record, ["householdName", "displayName", "name", "title"]) ??
    "Unnamed household";
  const memberIds = getMemberIds(record);

  return baseRow({
    record,
    objectName: "households",
    domain: "households",
    displayName,
    secondaryLabel:
      memberIds.length > 0
        ? `${memberIds.length} member${memberIds.length === 1 ? "" : "s"}`
        : null,
    relationshipKind: "household",
    status: findFirstString(record, ["relationshipStatus", "status"]),
    location: findFirstString(record, ["location", "city", "address"]),
    primaryContactName:
      getNestedName(record.primaryContact) ??
      findFirstString(record, ["primaryContactName"]),
    memberCount: memberIds.length || asNumber(record.memberCount),
    lastActivityAt: timestampOrNull(
      findFirstString(record, ["lastActivityAt", "lastTouchAt"]),
    ),
    dedupeKey: buildHouseholdMembershipKey(record),
  });
}

function normalizeRelationshipCommitment(
  record: JsonRecord,
): CrmRelationshipRow[] {
  const displayName =
    (getDisplayName(record, [
      "commitmentName",
      "displayName",
      "name",
      "title",
    ]) ??
      [
        findFirstString(record, ["donorName"]),
        findFirstString(record, ["fundName", "designationName"]),
      ]
        .filter(Boolean)
        .join(" to ")
        .trim()) ||
    "Relationship commitment";

  return baseRow({
    record,
    objectName: "relationshipCommitments",
    domain: "pledges",
    displayName,
    secondaryLabel: findFirstString(record, [
      "fundName",
      "designationName",
      "missionaryName",
    ]),
    relationshipKind: "relationship commitment",
    status: findFirstString(record, ["commitmentStatus", "status"]),
    commitmentAmountCents: asNumber(
      record.commitmentAmountCents ?? record.amountCents ?? record.amount,
    ),
    commitmentCurrency: findFirstString(record, ["currency"]),
    commitmentFrequency: findFirstString(record, ["frequency"]),
    lastActivityAt: timestampOrNull(
      findFirstString(record, ["lastActivityAt", "updatedAt"]),
    ),
    sourceSystem: "Asym finance summary",
    authorityScope: "finance_summary",
    authorityLabel: FINANCE_AUTHORITY_LABEL,
    dedupeKey:
      normalizeKey(findFirstString(record, ["asymPledgeId"])) ??
      normalizeKey(displayName),
  });
}

function normalizeMinistryActivity(record: JsonRecord): CrmRelationshipRow[] {
  if (isCareSensitiveActivity(record)) {
    return [];
  }

  const displayName =
    getDisplayName(record, ["title", "summary", "displayName", "name"]) ??
    "Relationship activity";

  return baseRow({
    record,
    objectName: "ministryActivities",
    domain: "activity",
    displayName,
    secondaryLabel: findFirstString(record, ["activityKind", "type"]),
    relationshipKind:
      findFirstString(record, ["activityKind", "type"]) ?? "activity",
    status: findFirstString(record, ["status"]),
    primaryContactName:
      getNestedName(record.person) ??
      getNestedName(record.company) ??
      findFirstString(record, ["personName", "organizationName"]),
    lastActivityAt: timestampOrNull(
      findFirstString(record, ["occurredAt", "activityAt", "createdAt"]),
    ),
    authorityScope: "care_excluded",
    authorityLabel: CARE_AUTHORITY_LABEL,
    dedupeKey:
      normalizeKey(findFirstString(record, ["eventKey", "externalId"])) ??
      normalizeKey(displayName),
  });
}

export function normalizeTwentyRelationshipResponse(
  objectName: string,
  response: unknown,
): CrmRelationshipRow[] {
  return getArrayCandidate(response, objectName).flatMap((record) => {
    if (!isRecord(record)) {
      return [];
    }

    switch (objectName) {
      case "people":
        return normalizePerson(record);
      case "companies":
        return normalizeCompany(record);
      case "churches":
        return normalizeChurch(record);
      case "households":
        return normalizeHousehold(record);
      case "relationshipCommitments":
        return normalizeRelationshipCommitment(record);
      case "ministryActivities":
        return normalizeMinistryActivity(record);
      default:
        return [];
    }
  });
}

export function normalizeTwentyRelationshipResponseWithStats(
  objectName: string,
  response: unknown,
): NormalizeResult {
  const records = getArrayCandidate(response, objectName);
  let excludedCareActivityCount = 0;
  const rows = records.flatMap((record) => {
    if (!isRecord(record)) {
      return [];
    }

    if (
      objectName === "ministryActivities" &&
      isCareSensitiveActivity(record)
    ) {
      excludedCareActivityCount += 1;
      return [];
    }

    return normalizeTwentyRelationshipResponse(objectName, [record]);
  });

  return {
    rows,
    stats: {
      duplicateCompanyCandidates: 0,
      excludedCareActivityCount,
    },
  };
}

function rowPriority(row: CrmRelationshipRow): number {
  if (row.twentyObjectName === "churches") return 0;
  if (row.domain === "churches" && row.twentyObjectName === "companies") {
    return 1;
  }
  return 2;
}

export function dedupeCrmRelationshipRows(
  rows: readonly CrmRelationshipRow[],
): NormalizeResult {
  const byKey = new Map<string, CrmRelationshipRow>();
  const keptWithoutKeys: CrmRelationshipRow[] = [];
  let duplicateCompanyCandidates = 0;

  for (const row of rows) {
    if (!row.dedupeKey) {
      keptWithoutKeys.push(row);
      continue;
    }

    const existing = byKey.get(row.dedupeKey);
    if (!existing) {
      byKey.set(row.dedupeKey, row);
      continue;
    }

    duplicateCompanyCandidates +=
      row.twentyObjectName === "companies" ||
      existing.twentyObjectName === "companies"
        ? 1
        : 0;

    const currentPriority = rowPriority(row);
    const existingPriority = rowPriority(existing);
    if (
      currentPriority < existingPriority ||
      (currentPriority === existingPriority &&
        new Date(row.updatedAt).getTime() >
          new Date(existing.updatedAt).getTime())
    ) {
      byKey.set(row.dedupeKey, row);
    }
  }

  return {
    rows: [...byKey.values(), ...keptWithoutKeys],
    stats: {
      duplicateCompanyCandidates,
      excludedCareActivityCount: 0,
    },
  };
}

export function filterCrmRelationshipsForTenant(
  rows: readonly CrmRelationshipRow[],
  tenantId: string,
  search: string | null,
  domains: readonly CrmRelationshipDomain[],
): CrmRelationshipRow[] {
  const normalizedSearch = search?.trim().toLowerCase() ?? "";
  const domainSet = new Set(domains);

  return rows.filter((row) => {
    if (row.tenantId !== tenantId) {
      return false;
    }

    if (domainSet.size > 0 && !domainSet.has(row.domain)) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      row.displayName,
      row.secondaryLabel,
      row.relationshipKind,
      row.status,
      row.location,
      row.primaryContactName,
      row.sourceSystem,
      row.authorityLabel,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedSearch));
  });
}

function compareNullableText(left: string | null, right: string | null) {
  return (left ?? "").localeCompare(right ?? "");
}

function compareNullableNumber(left: number | null, right: number | null) {
  return (left ?? 0) - (right ?? 0);
}

function compareNullableTimestamp(left: string | null, right: string | null) {
  return (
    new Date(left ?? DEFAULT_TIMESTAMP).getTime() -
    new Date(right ?? DEFAULT_TIMESTAMP).getTime()
  );
}

export function sortCrmRelationships(
  rows: readonly CrmRelationshipRow[],
  sort: AdminCrmRelationshipsParams["sort"],
): CrmRelationshipRow[] {
  const direction = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    let compared = 0;

    if (sort.field === "displayName") {
      compared = compareNullableText(left.displayName, right.displayName);
    } else if (sort.field === "domain") {
      compared = compareNullableText(left.domain, right.domain);
    } else if (sort.field === "status") {
      compared = compareNullableText(left.status, right.status);
    } else if (sort.field === "lastActivityAt") {
      compared = compareNullableTimestamp(
        left.lastActivityAt,
        right.lastActivityAt,
      );
    } else if (sort.field === "commitmentAmountCents") {
      compared = compareNullableNumber(
        left.commitmentAmountCents,
        right.commitmentAmountCents,
      );
    } else {
      compared = compareNullableTimestamp(left.updatedAt, right.updatedAt);
    }

    if (compared !== 0) {
      return compared * direction;
    }

    return left.id.localeCompare(right.id);
  });
}

export function buildCrmRelationshipReport(
  rows: readonly CrmRelationshipRow[],
  stats?: Partial<NormalizeStats>,
): CrmRelationshipReport {
  const domainCounts = { ...EMPTY_DOMAIN_COUNTS };
  let pledgeCommitmentTotalCents = 0;
  let pledgeCommitmentCount = 0;
  let householdCount = 0;
  let recentActivityCount = 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const row of rows) {
    domainCounts[row.domain] += 1;

    if (row.domain === "pledges") {
      pledgeCommitmentCount += 1;
      pledgeCommitmentTotalCents += row.commitmentAmountCents ?? 0;
    } else if (row.domain === "households") {
      householdCount += 1;
    } else if (row.domain === "activity" && row.lastActivityAt) {
      const lastActivityAt = new Date(row.lastActivityAt).getTime();
      if (!Number.isNaN(lastActivityAt) && lastActivityAt >= thirtyDaysAgo) {
        recentActivityCount += 1;
      }
    }
  }

  return {
    domainCounts,
    duplicateCompanyCandidates: stats?.duplicateCompanyCandidates ?? 0,
    excludedCareActivityCount: stats?.excludedCareActivityCount ?? 0,
    householdCount,
    pledgeCommitmentCount,
    pledgeCommitmentTotalCents,
    recentActivityCount,
    sourceSystems: {
      auth: "Supabase Auth and Asym memberships own identity and authorization.",
      care: "Asym owns care plans and private care notes.",
      crm: "Twenty CRM owns relationship context.",
      finance:
        "Asym owns payment execution, receipts, statements, refunds, and reconciliation.",
    },
    totalRows: rows.length,
  };
}
