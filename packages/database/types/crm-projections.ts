import type { UserRole } from "./database";

export type CrmProjectionContext =
  | "donor"
  | "missionary"
  | "cms"
  | "event"
  | "project_fund"
  | "reporting";

export type CrmProjectionTargetSurface =
  | "donor"
  | "missionary"
  | "cms"
  | "event"
  | "reporting";

export type CrmProjectionRoleScope =
  | "donor_self"
  | "missionary_assigned"
  | "cms_editor"
  | "event_staff"
  | "reporting_staff";

export type CrmProjectionSyncStatus =
  | "pending"
  | "synced"
  | "stale"
  | "failed"
  | "disabled";

export type CrmProjectionDriftStatus =
  | "healthy"
  | "missing"
  | "stale"
  | "failed"
  | "conflicting"
  | "disabled";

export interface CrmProjectionSourceOwnership {
  crm: string;
  asym: string;
  excluded: readonly string[];
}

export interface CrmProjectionContract {
  projectionName: string;
  label: string;
  context: CrmProjectionContext;
  targetSurface: CrmProjectionTargetSurface;
  roleScope: CrmProjectionRoleScope;
  allowedRoles: readonly UserRole[];
  sourceOwnership: CrmProjectionSourceOwnership;
  visibleFields: readonly string[];
  blockedFields: readonly string[];
  shadowMode: {
    enabled: boolean;
    userVisibleDependency: false;
  };
  rollback: {
    disableProjectionName: string;
    restoreReadModel: string;
  };
}

export interface CrmProjectionState {
  id: string;
  tenantId: string;
  projectionName: string;
  sourceSystem: string;
  sourceEntityType: string;
  sourceEntityId: string;
  targetSurface: CrmProjectionTargetSurface;
  crmRecordLinkId: string | null;
  twentyObjectName: string | null;
  twentyRecordId: string | null;
  syncStatus: CrmProjectionSyncStatus;
  sourceHash: string | null;
  projectedHash: string | null;
  lastProjectedAt: string | null;
  lastError: string | null;
  metadata: Record<string, unknown>;
  updatedAt: string;
}

export interface CrmProjectionShadowCounts {
  sourceRecords: number;
  projectedRecords: number;
  missingInCrm: number;
  missingInAsym: number;
  staleRecords: number;
  failedRecords: number;
  conflictingRecords: number;
  duplicateCandidates: number;
}

export interface CrmProjectionShadowRow {
  id: string;
  projectionName: string;
  label: string;
  context: CrmProjectionContext;
  targetSurface: CrmProjectionTargetSurface;
  roleScope: CrmProjectionRoleScope;
  allowedRoles: readonly UserRole[];
  driftStatus: CrmProjectionDriftStatus;
  counts: CrmProjectionShadowCounts;
  sourceOwnership: CrmProjectionSourceOwnership;
  visibleFields: readonly string[];
  blockedFields: readonly string[];
  oldestStaleAt: string | null;
  lastError: string | null;
  shadowMode: {
    enabled: boolean;
    userVisibleDependency: false;
    recordCountParity: "matched" | "mismatched" | "not_started";
  };
  rollback: {
    disableProjectionName: string;
    restoreReadModel: string;
  };
}

export interface CrmProjectionShadowReport {
  totalProjections: number;
  healthyProjections: number;
  driftedProjections: number;
  sourceRecords: number;
  projectedRecords: number;
  missingInCrm: number;
  missingInAsym: number;
  staleRecords: number;
  failedRecords: number;
  conflictingRecords: number;
  duplicateCandidates: number;
}

export interface AdminCrmProjectionShadowResponse {
  mode: "shadow";
  rows: CrmProjectionShadowRow[];
  report: CrmProjectionShadowReport;
  filters: {
    search: string | null;
    targetSurfaces: CrmProjectionTargetSurface[];
  };
  rollback: {
    hidePath: "/crm/projections";
    disableAllProjectionNames: readonly string[];
    restoreReadModels: readonly string[];
  };
}
