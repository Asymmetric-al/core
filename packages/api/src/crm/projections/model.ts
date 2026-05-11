import { CRM_PROJECTION_CONTRACTS } from "./contracts";

import type {
  CrmProjectionContract,
  CrmProjectionDriftStatus,
  CrmProjectionShadowCounts,
  CrmProjectionShadowReport,
  CrmProjectionShadowRow,
  CrmProjectionState,
  CrmProjectionTargetSurface,
} from "@asym/database/types";

const DEFAULT_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function countMetadata(states: readonly CrmProjectionState[], key: string) {
  return states.reduce(
    (total, state) =>
      total + (isRecord(state.metadata) ? asNumber(state.metadata[key]) : 0),
    0,
  );
}

function getOldestStaleAt(
  states: readonly CrmProjectionState[],
): string | null {
  const staleTimestamps = states
    .filter((state) => state.syncStatus === "stale")
    .map((state) => state.updatedAt)
    .filter(Boolean)
    .sort();

  return staleTimestamps[0] ?? null;
}

function isStateTimeStale(
  state: CrmProjectionState,
  now: Date,
  staleAfterMs: number,
) {
  if (state.syncStatus !== "synced" || !state.lastProjectedAt) {
    return false;
  }

  const projectedAt = new Date(state.lastProjectedAt).getTime();
  return Number.isFinite(projectedAt)
    ? now.getTime() - projectedAt > staleAfterMs
    : false;
}

function getRecordCountParity(counts: CrmProjectionShadowCounts) {
  if (counts.sourceRecords === 0 && counts.projectedRecords === 0) {
    return "not_started" as const;
  }

  return counts.sourceRecords === counts.projectedRecords &&
    counts.missingInCrm === 0 &&
    counts.missingInAsym === 0
    ? ("matched" as const)
    : ("mismatched" as const);
}

function getDriftStatus(
  contract: CrmProjectionContract,
  counts: CrmProjectionShadowCounts,
): CrmProjectionDriftStatus {
  if (!contract.shadowMode.enabled) {
    return "disabled";
  }

  if (counts.sourceRecords === 0 && counts.projectedRecords === 0) {
    return "missing";
  }

  if (counts.failedRecords > 0) {
    return "failed";
  }

  if (counts.conflictingRecords > 0) {
    return "conflicting";
  }

  if (counts.staleRecords > 0) {
    return "stale";
  }

  if (counts.missingInCrm > 0 || counts.missingInAsym > 0) {
    return "missing";
  }

  return "healthy";
}

function summarizeContractStates(input: {
  contract: CrmProjectionContract;
  now: Date;
  staleAfterMs: number;
  states: readonly CrmProjectionState[];
}): CrmProjectionShadowRow {
  const states = input.states;
  const timeStaleCount = states.filter((state) =>
    isStateTimeStale(state, input.now, input.staleAfterMs),
  ).length;
  const projectedRecords = states.filter(
    (state) =>
      state.syncStatus === "synced" &&
      Boolean(state.projectedHash || state.twentyRecordId),
  ).length;
  const conflictingRecords =
    states.filter(
      (state) =>
        state.sourceHash &&
        state.projectedHash &&
        state.sourceHash !== state.projectedHash,
    ).length + countMetadata(states, "conflictingRecords");
  const counts: CrmProjectionShadowCounts = {
    duplicateCandidates: countMetadata(states, "duplicateCandidates"),
    failedRecords: states.filter((state) => state.syncStatus === "failed")
      .length,
    missingInAsym: countMetadata(states, "missingInAsym"),
    missingInCrm:
      states.filter(
        (state) =>
          state.syncStatus === "pending" ||
          (!state.twentyRecordId && state.syncStatus !== "disabled"),
      ).length + countMetadata(states, "missingInCrm"),
    projectedRecords,
    sourceRecords: states.length,
    staleRecords:
      states.filter((state) => state.syncStatus === "stale").length +
      timeStaleCount,
    conflictingRecords,
  };
  const driftStatus = getDriftStatus(input.contract, counts);

  return {
    allowedRoles: input.contract.allowedRoles,
    blockedFields: input.contract.blockedFields,
    context: input.contract.context,
    counts,
    driftStatus,
    id: input.contract.projectionName,
    label: input.contract.label,
    lastError:
      states.find((state) => state.lastError)?.lastError ??
      (driftStatus === "missing" && states.length === 0
        ? "projection_state_not_started"
        : null),
    oldestStaleAt: getOldestStaleAt(states),
    projectionName: input.contract.projectionName,
    roleScope: input.contract.roleScope,
    rollback: input.contract.rollback,
    shadowMode: {
      enabled: input.contract.shadowMode.enabled,
      recordCountParity: getRecordCountParity(counts),
      userVisibleDependency: false,
    },
    sourceOwnership: input.contract.sourceOwnership,
    targetSurface: input.contract.targetSurface,
    visibleFields: input.contract.visibleFields,
  };
}

export function buildCrmProjectionShadowRows(input: {
  states: readonly CrmProjectionState[];
  now?: Date;
  staleAfterMs?: number;
  search?: string | null;
  targetSurfaces?: readonly CrmProjectionTargetSurface[];
}): CrmProjectionShadowRow[] {
  const now = input.now ?? new Date();
  const staleAfterMs = input.staleAfterMs ?? DEFAULT_STALE_AFTER_MS;
  const search = input.search?.trim().toLowerCase() ?? "";
  const surfaceFilter = new Set(input.targetSurfaces ?? []);

  return CRM_PROJECTION_CONTRACTS.map((contract) =>
    summarizeContractStates({
      contract,
      now,
      staleAfterMs,
      states: input.states.filter(
        (state) => state.projectionName === contract.projectionName,
      ),
    }),
  ).filter((row) => {
    if (surfaceFilter.size > 0 && !surfaceFilter.has(row.targetSurface)) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      row.label,
      row.context,
      row.targetSurface,
      row.roleScope,
      row.driftStatus,
      row.sourceOwnership.crm,
      row.sourceOwnership.asym,
    ].some((value) => value.toLowerCase().includes(search));
  });
}

export function buildCrmProjectionShadowReport(
  rows: readonly CrmProjectionShadowRow[],
): CrmProjectionShadowReport {
  return rows.reduce<CrmProjectionShadowReport>(
    (report, row) => ({
      conflictingRecords:
        report.conflictingRecords + row.counts.conflictingRecords,
      driftedProjections:
        report.driftedProjections +
        (row.driftStatus === "healthy" || row.driftStatus === "disabled"
          ? 0
          : 1),
      duplicateCandidates:
        report.duplicateCandidates + row.counts.duplicateCandidates,
      failedRecords: report.failedRecords + row.counts.failedRecords,
      healthyProjections:
        report.healthyProjections + (row.driftStatus === "healthy" ? 1 : 0),
      missingInAsym: report.missingInAsym + row.counts.missingInAsym,
      missingInCrm: report.missingInCrm + row.counts.missingInCrm,
      projectedRecords: report.projectedRecords + row.counts.projectedRecords,
      sourceRecords: report.sourceRecords + row.counts.sourceRecords,
      staleRecords: report.staleRecords + row.counts.staleRecords,
      totalProjections: report.totalProjections + 1,
    }),
    {
      conflictingRecords: 0,
      driftedProjections: 0,
      duplicateCandidates: 0,
      failedRecords: 0,
      healthyProjections: 0,
      missingInAsym: 0,
      missingInCrm: 0,
      projectedRecords: 0,
      sourceRecords: 0,
      staleRecords: 0,
      totalProjections: 0,
    },
  );
}
