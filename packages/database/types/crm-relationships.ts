export type CrmRelationshipDomain =
  | "people"
  | "organizations"
  | "churches"
  | "households"
  | "pledges"
  | "activity";

export type CrmRelationshipSortField =
  | "displayName"
  | "domain"
  | "updatedAt"
  | "lastActivityAt"
  | "status"
  | "commitmentAmountCents";

export type CrmRelationshipSortDirection = "asc" | "desc";

export type CrmRelationshipAuthorityScope =
  | "crm_relationship"
  | "finance_summary"
  | "care_excluded";

export interface CrmRelationshipRow {
  id: string;
  tenantId: string;
  twentyObjectName: string;
  twentyRecordId: string;
  domain: CrmRelationshipDomain;
  displayName: string;
  secondaryLabel: string | null;
  relationshipKind: string | null;
  status: string | null;
  location: string | null;
  primaryContactName: string | null;
  memberCount: number | null;
  commitmentAmountCents: number | null;
  commitmentCurrency: string | null;
  commitmentFrequency: string | null;
  lastActivityAt: string | null;
  sourceSystem: "Twenty CRM" | "Asym finance summary";
  authorityScope: CrmRelationshipAuthorityScope;
  authorityLabel: string;
  dedupeKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmRelationshipReport {
  totalRows: number;
  domainCounts: Record<CrmRelationshipDomain, number>;
  pledgeCommitmentCount: number;
  pledgeCommitmentTotalCents: number;
  householdCount: number;
  recentActivityCount: number;
  duplicateCompanyCandidates: number;
  excludedCareActivityCount: number;
  sourceSystems: {
    crm: "Twenty CRM owns relationship context.";
    finance: "Asym owns payment execution, receipts, statements, refunds, and reconciliation.";
    care: "Asym owns care plans and private care notes.";
    auth: "Supabase Auth and Asym memberships own identity and authorization.";
  };
}

export interface AdminCrmRelationshipsListResponse {
  rows: CrmRelationshipRow[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  configured: boolean;
  mode: "twenty" | "not_configured";
  missing: string[];
  sort: {
    field: CrmRelationshipSortField;
    direction: CrmRelationshipSortDirection;
  };
  filters: {
    search: string | null;
    domains: CrmRelationshipDomain[];
  };
  report: CrmRelationshipReport;
  rollback: {
    existingCrmPath: "/crm";
    hidePath: "/crm/relationships";
    pauseDomains: ReadonlyArray<
      | "people"
      | "companies"
      | "churches"
      | "households"
      | "ministry_activities"
      | "relationship_commitments"
    >;
  };
}
