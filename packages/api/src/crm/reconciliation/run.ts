import type { CrmSyncStore } from "../sync/store";
import type {
  CrmReconciliationRun,
  CrmReconciliationSnapshot,
  CrmSyncDomain,
  CrmSyncRuntimeConfig,
} from "../sync/types";

const DEFAULT_STALLED_AFTER_MS = 15 * 60 * 1000;

export function getCrmReconciliationCounts(
  snapshot: CrmReconciliationSnapshot,
): Record<string, number> {
  return {
    orphanLinks: snapshot.orphanLinks.length,
    staleProjections: snapshot.staleProjections.length,
    stalledJobs: snapshot.stalledJobs.length,
    duplicateCandidates: snapshot.duplicateCandidates.length,
    failedWebhooks: snapshot.failedWebhooks.length,
  };
}

export function hasCrmReconciliationFindings(
  snapshot: CrmReconciliationSnapshot,
): boolean {
  return Object.values(getCrmReconciliationCounts(snapshot)).some(
    (count) => count > 0,
  );
}

export async function runCrmReconciliation(
  store: CrmSyncStore,
  config: CrmSyncRuntimeConfig,
  input: {
    tenantId: string;
    domain?: CrmSyncDomain | null;
    requestedByProfileId?: string | null;
    now?: Date;
    stalledAfterMs?: number;
  },
): Promise<CrmReconciliationRun> {
  if (!config.reconciliationEnabled) {
    return store.recordReconciliationRun({
      tenantId: input.tenantId,
      domain: input.domain,
      reconciliationType: "phase_03_sync_reconciliation",
      status: "queued",
      checkedCounts: {},
      findings: {
        duplicateCandidates: [],
        failedWebhooks: [],
        orphanLinks: [],
        staleProjections: [],
        stalledJobs: [],
      },
      lastError: "reconciliation_disabled",
      requestedByProfileId: input.requestedByProfileId,
    });
  }

  const now = input.now ?? new Date();
  const stalledBefore = new Date(
    now.getTime() - (input.stalledAfterMs ?? DEFAULT_STALLED_AFTER_MS),
  );
  const snapshot = await store.loadReconciliationSnapshot({
    tenantId: input.tenantId,
    domain: input.domain,
    stalledBefore,
  });
  const checkedCounts = getCrmReconciliationCounts(snapshot);
  const hasFindings = hasCrmReconciliationFindings(snapshot);

  const run = await store.recordReconciliationRun({
    tenantId: input.tenantId,
    domain: input.domain,
    reconciliationType: "phase_03_sync_reconciliation",
    status: "succeeded",
    checkedCounts,
    findings: snapshot,
    lastError: null,
    requestedByProfileId: input.requestedByProfileId,
  });

  await store.appendSyncLog({
    tenantId: input.tenantId,
    direction: "reconciliation",
    domain: input.domain ?? null,
    status: hasFindings ? "failed" : "succeeded",
    sourceTable: "crm_reconciliation_runs",
    sourceId: run.id,
    message: hasFindings
      ? "CRM reconciliation found sync drift requiring operator review."
      : "CRM reconciliation completed without findings.",
    details: checkedCounts,
  });

  return run;
}
