import type {
  CrmOutboundJob,
  CrmReconciliationRun,
  CrmReconciliationSnapshot,
  CrmSyncDomain,
  CrmSyncLogInput,
  CrmSyncPauseState,
  EnqueueCrmOutboundJobInput,
  StoreCrmWebhookEventInput,
  StoredCrmWebhookEvent,
  UpdateCrmWebhookEventInput,
} from "../../../../packages/api/src/crm/sync/types";
import type { CrmSyncStore } from "../../../../packages/api/src/crm/sync/store";

const emptySnapshot = (): CrmReconciliationSnapshot => ({
  duplicateCandidates: [],
  failedWebhooks: [],
  giftLinkDrift: [],
  orphanLinks: [],
  staleProjections: [],
  stalledJobs: [],
});

export class MemoryCrmSyncStore implements CrmSyncStore {
  readonly events = new Map<string, StoredCrmWebhookEvent>();
  readonly jobs = new Map<string, CrmOutboundJob>();
  readonly logs: CrmSyncLogInput[] = [];
  readonly appliedEvents: string[] = [];
  readonly outboundSuccesses: Array<{
    jobId: string;
    twentyRecordId: string | null;
  }> = [];
  readonly outboundFailures: Array<{
    jobId: string;
    status: "failed" | "dead_letter";
    error: string;
  }> = [];
  pause: Partial<Record<CrmSyncDomain, Partial<CrmSyncPauseState>>> = {};
  snapshot: CrmReconciliationSnapshot = emptySnapshot();
  private eventCounter = 0;
  private jobCounter = 0;
  private runCounter = 0;

  async storeInboundEvent(
    input: StoreCrmWebhookEventInput,
  ): Promise<StoredCrmWebhookEvent> {
    const existing = Array.from(this.events.values()).find(
      (event) => event.eventKey === input.eventKey,
    );
    if (existing) {
      return { ...existing, duplicate: true };
    }

    const event = {
      ...input,
      duplicate: false,
      id: `event-${++this.eventCounter}`,
      status: "received" as const,
    };
    this.events.set(event.id, event);
    return event;
  }

  async updateInboundEvent(input: UpdateCrmWebhookEventInput): Promise<void> {
    const event = this.events.get(input.id);
    if (!event) return;
    this.events.set(input.id, {
      ...event,
      ...(input.status ? { status: input.status } : {}),
    });
  }

  async loadInboundEvent(id: string): Promise<StoredCrmWebhookEvent | null> {
    return this.events.get(id) ?? null;
  }

  async getSyncPause(
    tenantId: string,
    domain: CrmSyncDomain,
  ): Promise<CrmSyncPauseState> {
    const pause = this.pause[domain] ?? {};
    return {
      domain,
      tenantId,
      inboundPaused: pause.inboundPaused ?? false,
      outboundPaused: pause.outboundPaused ?? false,
      replayPaused: pause.replayPaused ?? false,
      pausedReason: pause.pausedReason ?? null,
    };
  }

  async applyInboundEvent(event: StoredCrmWebhookEvent): Promise<void> {
    this.appliedEvents.push(event.id);
  }

  async appendSyncLog(input: CrmSyncLogInput): Promise<void> {
    this.logs.push(input);
  }

  async enqueueOutboundJob(
    input: EnqueueCrmOutboundJobInput,
  ): Promise<CrmOutboundJob> {
    const existing = Array.from(this.jobs.values()).find(
      (job) =>
        job.tenantId === input.tenantId &&
        job.idempotencyKey === input.idempotencyKey,
    );
    if (existing) {
      return existing;
    }

    const job: CrmOutboundJob = {
      attemptCount: 0,
      crmRecordLinkId: input.crmRecordLinkId ?? null,
      domain: input.domain,
      id: `job-${++this.jobCounter}`,
      idempotencyKey: input.idempotencyKey ?? `job-${this.jobCounter}`,
      jobType: input.jobType,
      lastError: null,
      maxAttempts: input.maxAttempts ?? 5,
      payload: input.payload,
      resultSummary: {},
      sourceEntityId: input.sourceEntityId ?? null,
      sourceEntityType: input.sourceEntityType ?? null,
      status: "queued",
      tenantId: input.tenantId,
      twentyObjectName: input.twentyObjectName,
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async loadOutboundJob(id: string): Promise<CrmOutboundJob | null> {
    return this.jobs.get(id) ?? null;
  }

  async updateOutboundJob(
    id: string,
    patch: Partial<
      Pick<
        CrmOutboundJob,
        "status" | "attemptCount" | "resultSummary" | "lastError"
      >
    >,
  ): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) return;
    this.jobs.set(id, { ...job, ...patch });
  }

  async recordOutboundSuccess(input: {
    job: CrmOutboundJob;
    twentyRecordId: string | null;
  }): Promise<void> {
    this.outboundSuccesses.push({
      jobId: input.job.id,
      twentyRecordId: input.twentyRecordId,
    });
  }

  async recordOutboundFailure(input: {
    job: CrmOutboundJob;
    status: "failed" | "dead_letter";
    error: string;
  }): Promise<void> {
    this.outboundFailures.push({
      jobId: input.job.id,
      status: input.status,
      error: input.error,
    });
  }

  async loadReconciliationSnapshot(): Promise<CrmReconciliationSnapshot> {
    return this.snapshot;
  }

  async recordReconciliationRun(input: {
    tenantId: string;
    domain?: CrmSyncDomain | null;
    reconciliationType: string;
    status: CrmReconciliationRun["status"];
    checkedCounts: Record<string, number>;
    findings: CrmReconciliationSnapshot;
    lastError?: string | null;
  }): Promise<CrmReconciliationRun> {
    return {
      checkedCounts: input.checkedCounts,
      domain: input.domain ?? null,
      findings: input.findings,
      id: `reconciliation-${++this.runCounter}`,
      lastError: input.lastError ?? null,
      reconciliationType: input.reconciliationType,
      status: input.status,
      tenantId: input.tenantId,
    };
  }
}
