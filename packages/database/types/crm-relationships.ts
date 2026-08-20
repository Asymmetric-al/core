export type CrmRelationshipDomain =
  | "people"
  | "churches"
  | "organizations"
  | "households"
  | "pledges"
  | "activity";

export type CrmRelationshipSortField =
  | "updatedAt"
  | "createdAt"
  | "displayName"
  | "domain"
  | "status"
  | "lastActivityAt"
  | "commitmentAmountCents";

export type CrmRelationshipSortDirection = "asc" | "desc";

export type CrmRelationshipRecordKind =
  | "person"
  | "missionary"
  | "church"
  | "organization"
  | "household"
  | "commitment"
  | "activity";

export type CrmRelationshipAuthorityScope =
  | "crm_relationship"
  | "finance_summary"
  | "care_excluded";

export type CrmRelationshipRow = {
  id: string;
  recordKind: CrmRelationshipRecordKind;
  recordId: string;
  domain: CrmRelationshipDomain;
  displayName: string;
  secondaryLabel: string | null;
  relationshipKind: string;
  status: string | null;
  location: string | null;
  sourceSystem: "Asym CRM" | "Asym finance summary";
  authorityScope: CrmRelationshipAuthorityScope;
  authorityLabel: string;
  memberCount: number | null;
  commitmentAmountCents: number | null;
  commitmentCurrency: string | null;
  commitmentFrequency: string | null;
  lastActivityAt: string | null;
  primaryContactName: string | null;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
  dedupeKey: string | null;
};

export type AdminCrmRelationshipsSort = {
  field: CrmRelationshipSortField;
  direction: CrmRelationshipSortDirection;
};

export type AdminCrmRelationshipsListResponse = {
  mode: "local";
  configured: boolean;
  missing: string[];
  rows: CrmRelationshipRow[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  sort: AdminCrmRelationshipsSort;
  filters: {
    search: string | null;
    domains: CrmRelationshipDomain[];
  };
  report: CrmRelationshipReport;
  rollback: { existingCrmPath: "/crm" };
};

export type CrmRelationshipReport = {
  generatedAt?: string;
  sourceSystems: {
    auth: string;
    crm: string;
    finance: string;
    care: string;
  };
  totalRows: number;
  domainCounts: Record<CrmRelationshipDomain, number>;
  pledgeCommitmentCount: number;
  pledgeCommitmentTotalCents: number;
  householdCount: number;
  recentActivityCount: number;
  duplicateCompanyCandidates: number;
  duplicatePersonCandidates: number;
  excludedCareActivityCount: number;
};
