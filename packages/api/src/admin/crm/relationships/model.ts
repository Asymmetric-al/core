import type { AdminCrmRelationshipsParams } from "./query";
import type {
  CrmRelationshipAuthorityScope,
  CrmRelationshipDomain,
  CrmRelationshipRecordKind,
  CrmRelationshipReport,
  CrmRelationshipRow,
  CrmRelationshipSortField,
} from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

export const CRM_RELATIONSHIP_DOMAINS: CrmRelationshipDomain[] = [
  "people",
  "households",
  "organizations",
  "churches",
  "pledges",
  "activity",
];

const CHURCH_NAME_PATTERN = /church|ministry/i;
const CARE_SENSITIVE_PATTERN =
  /care|private|counsel|pastoral|member[-_\s]?care|care[-_\s]?plan/;

export function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/giu, "-")
    .replace(/^-+|-+$/g, "");
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right);
}

export function filterCrmRelationshipsForTenant(
  rows: CrmRelationshipRow[],
  tenantId: string,
  search: string | null,
): CrmRelationshipRow[] {
  const normalizedSearch = search?.trim().toLowerCase() ?? "";
  return rows.filter((row) => {
    if (row.tenantId !== tenantId || !row.recordId) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    return [
      row.displayName,
      row.primaryContactName,
      row.recordKind,
      row.relationshipKind,
      row.status,
      row.sourceSystem,
      row.secondaryLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });
}

export function sortCrmRelationships(
  rows: CrmRelationshipRow[],
  sort: AdminCrmRelationshipsParams["sort"],
): CrmRelationshipRow[] {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const comparison = compareSortField(left, right, sort.field);
    if (comparison !== 0) {
      return comparison * direction;
    }
    return left.id.localeCompare(right.id);
  });
}

function compareSortField(
  left: CrmRelationshipRow,
  right: CrmRelationshipRow,
  field: CrmRelationshipSortField,
): number {
  switch (field) {
    case "displayName":
      return compareText(left.displayName, right.displayName);
    case "domain":
      return compareText(left.domain, right.domain);
    case "status":
      return compareText(left.status ?? "", right.status ?? "");
    case "lastActivityAt":
      return compareText(left.lastActivityAt ?? "", right.lastActivityAt ?? "");
    case "commitmentAmountCents":
      return (
        (left.commitmentAmountCents ?? 0) - (right.commitmentAmountCents ?? 0)
      );
    case "createdAt":
      return compareText(left.createdAt, right.createdAt);
    case "updatedAt":
      return compareText(left.updatedAt, right.updatedAt);
    default: {
      const exhaustive: never = field;
      return exhaustive;
    }
  }
}

export function buildHouseholdMembershipKey(record: JsonRecord): string {
  const memberIds = readMembershipIds(record);
  if (memberIds.length > 0) {
    return `household-members:${memberIds.join("+")}`;
  }

  return normalizeKey(
    readText(record, ["name", "displayName", "label"]) || "household",
  );
}

export function isCareSensitiveRelationship(
  record: JsonRecord,
  objectName = "",
): boolean {
  return CARE_SENSITIVE_PATTERN.test(
    [
      objectName,
      readText(record, ["objectName"]),
      readText(record, ["type"]),
      readText(record, ["category"]),
      readText(record, ["visibility"]),
      readText(record, ["sensitivity"]),
      readText(record, ["name"]),
      readText(record, ["title"]),
    ].join(" "),
  );
}

function isChurchName(value: string): boolean {
  return CHURCH_NAME_PATTERN.test(value);
}

function donorDisplayName(donor: JsonRecord): string {
  return (
    readText(donor, ["name", "organization", "displayName", "label"]) || "Donor"
  );
}

function donorType(donor: JsonRecord): string {
  return readText(donor, ["type"]).toLowerCase();
}

function classifyDonor(
  donor: JsonRecord,
): "person" | "church" | "organization" {
  const type = donorType(donor);
  const name = donorDisplayName(donor);
  if (type === "church" || isChurchName(name)) {
    return "church";
  }
  if (
    type === "organization" ||
    type === "company" ||
    type === "agency" ||
    type === "org"
  ) {
    return "organization";
  }
  return "person";
}

function profileDisplayName(profile: JsonRecord): string {
  const firstName = readText(profile, ["first_name", "firstName"]);
  const lastName = readText(profile, ["last_name", "lastName"]);
  const combined = `${firstName} ${lastName}`.trim();
  return (
    combined ||
    readText(profile, ["display_name", "displayName", "full_name", "fullName"])
  );
}

function asIso(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return fallback;
}

function relationshipRow(input: {
  tenantId: string;
  recordKind: CrmRelationshipRecordKind;
  recordId: string;
  domain: CrmRelationshipDomain;
  displayName: string;
  relationshipKind: string;
  status: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  primaryContactName: string | null;
  secondaryLabel: string | null;
  commitmentAmountCents: number | null;
  commitmentCurrency: string | null;
  commitmentFrequency: string | null;
  sourceSystem: CrmRelationshipRow["sourceSystem"];
  authorityScope: CrmRelationshipAuthorityScope;
  location: string | null;
  memberCount: number | null;
  dedupeKey: string;
}): CrmRelationshipRow {
  return {
    authorityLabel:
      input.authorityScope === "finance_summary"
        ? "Asym finance summary"
        : "Asym CRM",
    authorityScope: input.authorityScope,
    commitmentAmountCents: input.commitmentAmountCents,
    commitmentCurrency: input.commitmentCurrency,
    commitmentFrequency: input.commitmentFrequency,
    createdAt: input.createdAt,
    dedupeKey: input.dedupeKey,
    displayName: input.displayName,
    domain: input.domain,
    id: `${input.recordKind}:${input.recordId}`,
    lastActivityAt: input.lastActivityAt,
    location: input.location,
    memberCount: input.memberCount,
    primaryContactName: input.primaryContactName,
    recordId: input.recordId,
    recordKind: input.recordKind,
    relationshipKind: input.relationshipKind,
    secondaryLabel: input.secondaryLabel,
    sourceSystem: input.sourceSystem,
    status: input.status,
    tenantId: input.tenantId,
    updatedAt: input.updatedAt,
  };
}

export function mapLocalCrmRelationshipRows(input: {
  tenantId: string;
  now: string;
  donors: JsonRecord[];
  missionaries: JsonRecord[];
  profiles: JsonRecord[];
  pledges: JsonRecord[];
  activities: JsonRecord[];
}): {
  rows: CrmRelationshipRow[];
  excludedCareActivityCount: number;
} {
  const profileById = new Map(
    input.profiles.map((profile) => [readText(profile, ["id"]), profile]),
  );
  const donorById = new Map(
    input.donors.map((donor) => [readText(donor, ["id"]), donor]),
  );
  const rows: CrmRelationshipRow[] = [];
  let excludedCareActivityCount = 0;

  for (const donor of input.donors) {
    const recordId = readText(donor, ["id"]);
    if (!recordId) {
      continue;
    }
    const displayName = donorDisplayName(donor);
    const createdAt = asIso(donor.created_at ?? donor.createdAt, input.now);
    const updatedAt = asIso(
      donor.updated_at ?? donor.updatedAt ?? createdAt,
      input.now,
    );
    const status = readText(donor, ["status"]) || null;
    const location = readText(donor, ["location"]) || null;
    const classification = classifyDonor(donor);
    const spouse = readText(donor, ["spouse"]);

    if (classification === "church") {
      rows.push(
        relationshipRow({
          tenantId: input.tenantId,
          recordKind: "church",
          recordId,
          domain: "churches",
          displayName,
          relationshipKind: "church",
          status,
          lastActivityAt: updatedAt,
          createdAt,
          updatedAt,
          primaryContactName: spouse || null,
          secondaryLabel: null,
          commitmentAmountCents: null,
          commitmentCurrency: null,
          commitmentFrequency: null,
          sourceSystem: "Asym CRM",
          authorityScope: "crm_relationship",
          location,
          memberCount: null,
          dedupeKey: `church:${normalizeKey(displayName)}`,
        }),
      );
    } else if (classification === "organization") {
      rows.push(
        relationshipRow({
          tenantId: input.tenantId,
          recordKind: "organization",
          recordId,
          domain: "organizations",
          displayName,
          relationshipKind: "organization",
          status,
          lastActivityAt: updatedAt,
          createdAt,
          updatedAt,
          primaryContactName: spouse || null,
          secondaryLabel: null,
          commitmentAmountCents: null,
          commitmentCurrency: null,
          commitmentFrequency: null,
          sourceSystem: "Asym CRM",
          authorityScope: "crm_relationship",
          location,
          memberCount: null,
          dedupeKey: `organization:${normalizeKey(displayName)}`,
        }),
      );
    } else {
      rows.push(
        relationshipRow({
          tenantId: input.tenantId,
          recordKind: "person",
          recordId,
          domain: "people",
          displayName,
          relationshipKind: "person",
          status,
          lastActivityAt: updatedAt,
          createdAt,
          updatedAt,
          primaryContactName: spouse || null,
          secondaryLabel: spouse || null,
          commitmentAmountCents: null,
          commitmentCurrency: null,
          commitmentFrequency: null,
          sourceSystem: "Asym CRM",
          authorityScope: "crm_relationship",
          location,
          memberCount: null,
          dedupeKey: `person:${normalizeKey(displayName)}`,
        }),
      );
    }

    if (spouse) {
      const householdName = `${displayName} Household`;
      rows.push(
        relationshipRow({
          tenantId: input.tenantId,
          recordKind: "household",
          recordId,
          domain: "households",
          displayName: householdName,
          relationshipKind: "household",
          status,
          lastActivityAt: updatedAt,
          createdAt,
          updatedAt,
          primaryContactName: spouse,
          secondaryLabel: spouse,
          commitmentAmountCents: null,
          commitmentCurrency: null,
          commitmentFrequency: null,
          sourceSystem: "Asym CRM",
          authorityScope: "crm_relationship",
          location,
          memberCount: 2,
          dedupeKey: `household:${buildHouseholdMembershipKey({
            displayName: householdName,
            name: householdName,
          })}`,
        }),
      );
    }
  }

  for (const missionary of input.missionaries) {
    const recordId = readText(missionary, ["id"]);
    if (!recordId) {
      continue;
    }
    const profile = profileById.get(
      readText(missionary, ["profile_id", "profileId"]),
    );
    const displayName = profile
      ? profileDisplayName(profile) || "Missionary"
      : "Missionary";
    const createdAt = asIso(
      missionary.created_at ?? missionary.createdAt,
      input.now,
    );
    const updatedAt = asIso(
      missionary.updated_at ?? missionary.updatedAt ?? createdAt,
      input.now,
    );
    rows.push(
      relationshipRow({
        tenantId: input.tenantId,
        recordKind: "missionary",
        recordId,
        domain: "people",
        displayName,
        relationshipKind: "missionary",
        status: readText(missionary, ["status"]) || null,
        lastActivityAt: updatedAt,
        createdAt,
        updatedAt,
        primaryContactName: null,
        secondaryLabel: "Missionary",
        commitmentAmountCents: null,
        commitmentCurrency: null,
        commitmentFrequency: null,
        sourceSystem: "Asym CRM",
        authorityScope: "crm_relationship",
        location: readText(missionary, ["location"]) || null,
        memberCount: null,
        dedupeKey: `person:${normalizeKey(displayName)}`,
      }),
    );
  }

  for (const pledge of input.pledges) {
    const recordId = readText(pledge, ["id"]);
    if (!recordId) {
      continue;
    }
    const amount = Number(pledge.amount ?? 0);
    const frequency = readText(pledge, ["frequency"]) || null;
    const currency = readText(pledge, ["currency"]) || "usd";
    const donor = donorById.get(readText(pledge, ["donor_id", "donorId"]));
    const primaryContactName = donor ? donorDisplayName(donor) : null;
    const createdAt = asIso(pledge.created_at ?? pledge.createdAt, input.now);
    const updatedAt = asIso(
      pledge.start_date ?? pledge.startDate ?? createdAt,
      input.now,
    );
    rows.push(
      relationshipRow({
        tenantId: input.tenantId,
        recordKind: "commitment",
        recordId,
        domain: "pledges",
        displayName: primaryContactName
          ? `${primaryContactName} pledge`
          : "Pledge",
        relationshipKind: frequency || "pledge",
        status: null,
        lastActivityAt: updatedAt,
        createdAt,
        updatedAt,
        primaryContactName,
        secondaryLabel: frequency,
        commitmentAmountCents: Number.isFinite(amount) ? amount : 0,
        commitmentCurrency: currency,
        commitmentFrequency: frequency,
        sourceSystem: "Asym finance summary",
        authorityScope: "finance_summary",
        location: null,
        memberCount: null,
        dedupeKey: `commitment:${recordId}`,
      }),
    );
  }

  for (const activity of input.activities) {
    const recordId = readText(activity, ["id"]);
    if (!recordId) {
      continue;
    }
    const activityType = readText(activity, ["type"]);
    if (isCareSensitiveRelationship(activity, activityType)) {
      excludedCareActivityCount += 1;
      continue;
    }
    const createdAt = asIso(
      activity.created_at ?? activity.createdAt,
      input.now,
    );
    const updatedAt = asIso(
      activity.occurred_at ?? activity.occurredAt ?? createdAt,
      input.now,
    );
    const title = readText(activity, ["title"]) || activityType || "Activity";
    rows.push(
      relationshipRow({
        tenantId: input.tenantId,
        recordKind: "activity",
        recordId,
        domain: "activity",
        displayName: title,
        relationshipKind: activityType || "activity",
        status: null,
        lastActivityAt: updatedAt,
        createdAt,
        updatedAt,
        primaryContactName: null,
        secondaryLabel: readText(activity, ["description"]) || null,
        commitmentAmountCents: null,
        commitmentCurrency: null,
        commitmentFrequency: null,
        sourceSystem: "Asym CRM",
        authorityScope: "crm_relationship",
        location: null,
        memberCount: null,
        dedupeKey: `activity:${recordId}`,
      }),
    );
  }

  return { excludedCareActivityCount, rows };
}

export function dedupeCrmRelationshipRows(rows: CrmRelationshipRow[]): {
  rows: CrmRelationshipRow[];
  duplicateCompanyCandidates: number;
  duplicatePersonCandidates: number;
} {
  return {
    duplicateCompanyCandidates: countDuplicateCandidates(rows, [
      "organization",
      "church",
    ]),
    duplicatePersonCandidates: countDuplicateCandidates(rows, [
      "person",
      "missionary",
    ]),
    rows,
  };
}

export function buildCrmRelationshipReport(
  rows: CrmRelationshipRow[],
  stats: {
    excludedCareActivityCount: number;
  },
): CrmRelationshipReport {
  const domainCounts = CRM_RELATIONSHIP_DOMAINS.reduce(
    (accumulator, domain) => {
      accumulator[domain] = rows.filter((row) => row.domain === domain).length;
      return accumulator;
    },
    {} as Record<CrmRelationshipDomain, number>,
  );
  const pledges = rows.filter((row) => row.domain === "pledges");

  return {
    domainCounts,
    duplicateCompanyCandidates: countDuplicateCandidates(rows, [
      "organization",
      "church",
    ]),
    duplicatePersonCandidates: countDuplicateCandidates(rows, [
      "person",
      "missionary",
    ]),
    excludedCareActivityCount: stats.excludedCareActivityCount,
    householdCount: domainCounts.households,
    pledgeCommitmentCount: pledges.length,
    pledgeCommitmentTotalCents: pledges.reduce(
      (sum, row) => sum + (row.commitmentAmountCents ?? 0),
      0,
    ),
    recentActivityCount: domainCounts.activity,
    sourceSystems: {
      auth: "Mission Control session and tenant membership.",
      care: "Member-care activity is local and excluded unless care-sensitive access is granted.",
      crm: "Asym Postgres owns relationship context.",
      finance: "Asym finance summary is a local read-only overlay.",
    },
    totalRows: rows.length,
  };
}

function countDuplicateCandidates(
  rows: CrmRelationshipRow[],
  kinds: CrmRelationshipRecordKind[],
): number {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!kinds.includes(row.recordKind)) {
      continue;
    }
    const key =
      row.dedupeKey ?? `${row.recordKind}:${normalizeKey(row.displayName)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let duplicates = 0;
  for (const count of counts.values()) {
    if (count > 1) {
      duplicates += count - 1;
    }
  }
  return duplicates;
}

function readMembershipIds(record: JsonRecord): string[] {
  const raw =
    record.memberIds ?? record.members ?? record.householdMembers ?? null;
  const values = Array.isArray(raw)
    ? raw.map((value) => String(value))
    : typeof raw === "string"
      ? raw.split(/[,\s]+/u)
      : [];

  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
}

function readText(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}
