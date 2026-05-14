import type {
  CrmOutboundJob,
  CrmReconciliationRun,
  CrmReconciliationSnapshot,
  CrmSyncDomain,
  CrmSyncLogInput,
  CrmSyncPauseState,
  EnqueueCrmOutboundJobInput,
  RecordCrmOutboundFailureInput,
  RecordCrmOutboundSuccessInput,
  StoreCrmWebhookEventInput,
  StoredCrmWebhookEvent,
  UpdateCrmWebhookEventInput,
} from "./types";

type JsonRecord = Record<string, unknown>;

interface SupabaseError {
  code?: string;
  message?: string;
}

interface SupabaseResult<T> {
  data: T | null;
  error: SupabaseError | null;
}

interface SupabaseFilterBuilder<T = JsonRecord> extends PromiseLike<
  SupabaseResult<T[]>
> {
  select: (columns?: string) => SupabaseFilterBuilder<T>;
  eq: (column: string, value: unknown) => SupabaseFilterBuilder<T>;
  in: (column: string, values: unknown[]) => SupabaseFilterBuilder<T>;
  is: (column: string, value: null) => SupabaseFilterBuilder<T>;
  lte: (column: string, value: unknown) => SupabaseFilterBuilder<T>;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => SupabaseFilterBuilder<T>;
  limit: (count: number) => SupabaseFilterBuilder<T>;
  single: <TRow extends JsonRecord = JsonRecord>() => Promise<
    SupabaseResult<TRow>
  >;
  maybeSingle: <TRow extends JsonRecord = JsonRecord>() => Promise<
    SupabaseResult<TRow>
  >;
}

interface SupabaseTableBuilder {
  insert: (row: JsonRecord) => SupabaseFilterBuilder;
  update: (row: JsonRecord) => SupabaseFilterBuilder;
  select: (columns?: string) => SupabaseFilterBuilder;
}

export interface SupabaseCrmSyncClient {
  from: (table: string) => SupabaseTableBuilder;
}

export interface CrmSyncStore {
  storeInboundEvent(
    input: StoreCrmWebhookEventInput,
  ): Promise<StoredCrmWebhookEvent>;
  updateInboundEvent(input: UpdateCrmWebhookEventInput): Promise<void>;
  loadInboundEvent(id: string): Promise<StoredCrmWebhookEvent | null>;
  getSyncPause(
    tenantId: string,
    domain: CrmSyncDomain,
  ): Promise<CrmSyncPauseState>;
  applyInboundEvent(event: StoredCrmWebhookEvent): Promise<void>;
  appendSyncLog(input: CrmSyncLogInput): Promise<void>;
  enqueueOutboundJob(
    input: EnqueueCrmOutboundJobInput,
  ): Promise<CrmOutboundJob>;
  loadOutboundJob(id: string): Promise<CrmOutboundJob | null>;
  updateOutboundJob(
    id: string,
    patch: Partial<
      Pick<
        CrmOutboundJob,
        "status" | "attemptCount" | "resultSummary" | "lastError"
      >
    >,
  ): Promise<void>;
  recordOutboundSuccess(input: RecordCrmOutboundSuccessInput): Promise<void>;
  recordOutboundFailure(input: RecordCrmOutboundFailureInput): Promise<void>;
  loadReconciliationSnapshot(input: {
    tenantId: string;
    domain?: CrmSyncDomain | null;
    stalledBefore: Date;
  }): Promise<CrmReconciliationSnapshot>;
  recordReconciliationRun(input: {
    tenantId: string;
    domain?: CrmSyncDomain | null;
    reconciliationType: string;
    status: CrmReconciliationRun["status"];
    checkedCounts: Record<string, number>;
    findings: CrmReconciliationSnapshot;
    lastError?: string | null;
    requestedByProfileId?: string | null;
  }): Promise<CrmReconciliationRun>;
}

function requireNoError(error: SupabaseError | null, fallback: string): void {
  if (error) {
    throw new Error(error.message ?? fallback);
  }
}

function rowString(row: JsonRecord, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function rowNullableString(row: JsonRecord, key: string): string | null {
  const value = row[key];
  return typeof value === "string" ? value : null;
}

function rowNumber(row: JsonRecord, key: string, fallback = 0): number {
  const value = row[key];
  return typeof value === "number" ? value : fallback;
}

function rowRecord(row: JsonRecord, key: string): Record<string, unknown> {
  const value = row[key];
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function toStoredWebhookEvent(
  row: JsonRecord,
  duplicate: boolean,
): StoredCrmWebhookEvent {
  return {
    action: rowString(row, "event_action"),
    domain: rowNullableString(row, "domain") as StoredCrmWebhookEvent["domain"],
    duplicate,
    eventKey: rowString(row, "webhook_event_key"),
    eventType: rowString(row, "twenty_event_type"),
    id: rowString(row, "id"),
    objectName: rowString(row, "twenty_object_name"),
    payload: rowRecord(
      row,
      "payload",
    ) as unknown as StoredCrmWebhookEvent["payload"],
    payloadHash: rowString(row, "payload_hash"),
    recordId: rowNullableString(row, "twenty_record_id"),
    status: rowString(row, "status") as StoredCrmWebhookEvent["status"],
    tenantId: rowNullableString(row, "tenant_id"),
    timestamp: new Date(rowString(row, "webhook_timestamp")),
  };
}

function toOutboundJob(row: JsonRecord): CrmOutboundJob {
  return {
    attemptCount: rowNumber(row, "attempt_count"),
    crmRecordLinkId: rowNullableString(row, "crm_record_link_id"),
    domain: rowString(row, "domain") as CrmOutboundJob["domain"],
    id: rowString(row, "id"),
    idempotencyKey: rowString(row, "idempotency_key"),
    jobType: rowString(row, "job_type") as CrmOutboundJob["jobType"],
    lastError: rowNullableString(row, "last_error"),
    maxAttempts: rowNumber(row, "max_attempts", 5),
    payload: rowRecord(row, "payload"),
    resultSummary: rowRecord(row, "result_summary"),
    sourceEntityId: rowNullableString(row, "source_entity_id"),
    sourceEntityType: rowNullableString(
      row,
      "source_entity_type",
    ) as CrmOutboundJob["sourceEntityType"],
    status: rowString(row, "status") as CrmOutboundJob["status"],
    tenantId: rowString(row, "tenant_id"),
    twentyObjectName: rowString(row, "twenty_object_name"),
  };
}

function isGiftSummaryPaymentRecord(job: CrmOutboundJob): boolean {
  return (
    job.twentyObjectName === "giftSummaries" &&
    job.sourceEntityType === "payment_record" &&
    Boolean(job.sourceEntityId)
  );
}

function safeErrorCode(
  status: RecordCrmOutboundFailureInput["status"],
): string {
  return status === "dead_letter"
    ? "twenty_outbound_dead_letter"
    : "twenty_outbound_failed";
}

async function selectExistingByIdempotency(
  client: SupabaseCrmSyncClient,
  tenantId: string,
  idempotencyKey: string,
): Promise<CrmOutboundJob | null> {
  const { data, error } = await client
    .from("crm_outbound_jobs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  requireNoError(error, "Failed to read CRM outbound job.");
  return data ? toOutboundJob(data) : null;
}

export function createSupabaseCrmSyncStore(clientInput: unknown): CrmSyncStore {
  const client = clientInput as SupabaseCrmSyncClient;

  return {
    async storeInboundEvent(input) {
      const existing = await client
        .from("crm_webhook_events")
        .select("*")
        .eq("crm_provider", "twenty")
        .eq("webhook_event_key", input.eventKey)
        .maybeSingle();

      requireNoError(existing.error, "Failed to read CRM webhook event.");
      if (existing.data) {
        return toStoredWebhookEvent(existing.data, true);
      }

      const row = {
        tenant_id: input.tenantId,
        crm_provider: "twenty",
        webhook_event_key: input.eventKey,
        twenty_event_type: input.eventType,
        twenty_object_name: input.objectName,
        twenty_record_id: input.recordId,
        domain: input.domain,
        event_action: input.action,
        webhook_timestamp: input.timestamp.toISOString(),
        signature_hash: input.signatureHash,
        payload_hash: input.payloadHash,
        payload: input.payload,
        status: "received",
      };
      const inserted = await client
        .from("crm_webhook_events")
        .insert(row)
        .select("*")
        .single();

      if (inserted.error?.code === "23505") {
        const duplicate = await client
          .from("crm_webhook_events")
          .select("*")
          .eq("crm_provider", "twenty")
          .eq("webhook_event_key", input.eventKey)
          .single();
        requireNoError(duplicate.error, "Failed to read duplicate webhook.");
        return toStoredWebhookEvent(duplicate.data ?? {}, true);
      }

      requireNoError(inserted.error, "Failed to store CRM webhook event.");
      return toStoredWebhookEvent(inserted.data ?? {}, false);
    },

    async updateInboundEvent(input) {
      const patch = {
        status: input.status,
        ...(input.processAttempts !== undefined
          ? { process_attempts: input.processAttempts }
          : {}),
        ...(input.ignoredReason !== undefined
          ? { ignored_reason: input.ignoredReason }
          : {}),
        ...(input.lastError !== undefined
          ? { last_error: input.lastError }
          : {}),
        ...(input.processedAt !== undefined
          ? { processed_at: input.processedAt }
          : {}),
        ...(input.replayedAt !== undefined
          ? { replayed_at: input.replayedAt }
          : {}),
        ...(input.replayCount !== undefined
          ? { replay_count: input.replayCount }
          : {}),
        updated_at: new Date().toISOString(),
      };
      const { error } = await client
        .from("crm_webhook_events")
        .update(patch)
        .eq("id", input.id);
      requireNoError(error, "Failed to update CRM webhook event.");
    },

    async loadInboundEvent(id) {
      const { data, error } = await client
        .from("crm_webhook_events")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      requireNoError(error, "Failed to read CRM webhook event.");
      return data ? toStoredWebhookEvent(data, false) : null;
    },

    async getSyncPause(tenantId, domain) {
      const { data, error } = await client
        .from("crm_sync_settings")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("domain", domain)
        .maybeSingle();

      requireNoError(error, "Failed to read CRM sync settings.");
      return {
        domain,
        tenantId,
        inboundPaused: data?.inbound_paused === true,
        outboundPaused: data?.outbound_paused === true,
        replayPaused: data?.replay_paused === true,
        pausedReason: rowNullableString(data ?? {}, "paused_reason"),
      };
    },

    async applyInboundEvent(event) {
      if (!event.tenantId || !event.recordId) {
        return;
      }

      if (event.action === "deleted") {
        await client
          .from("crm_record_links")
          .update({
            link_status: "archived",
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("tenant_id", event.tenantId)
          .eq("twenty_object_name", event.objectName)
          .eq("twenty_record_id", event.recordId)
          .eq("link_status", "active");
      } else {
        await client
          .from("crm_record_links")
          .update({
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("tenant_id", event.tenantId)
          .eq("twenty_object_name", event.objectName)
          .eq("twenty_record_id", event.recordId);
      }

      await client
        .from("crm_projection_state")
        .update({
          sync_status: "stale",
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", event.tenantId)
        .eq("twenty_object_name", event.objectName)
        .eq("twenty_record_id", event.recordId);
    },

    async appendSyncLog(input) {
      const { error } = await client.from("crm_sync_logs").insert({
        tenant_id: input.tenantId,
        direction: input.direction,
        domain: input.domain,
        status: input.status,
        source_table: input.sourceTable,
        source_id: input.sourceId,
        message: input.message,
        details: input.details ?? {},
      });
      requireNoError(error, "Failed to append CRM sync log.");
    },

    async enqueueOutboundJob(input) {
      if (input.idempotencyKey) {
        const existing = await selectExistingByIdempotency(
          client,
          input.tenantId,
          input.idempotencyKey,
        );
        if (existing) {
          return existing;
        }
      }

      const inserted = await client
        .from("crm_outbound_jobs")
        .insert({
          tenant_id: input.tenantId,
          domain: input.domain,
          job_type: input.jobType,
          twenty_object_name: input.twentyObjectName,
          source_entity_type: input.sourceEntityType ?? null,
          source_entity_id: input.sourceEntityId ?? null,
          crm_record_link_id: input.crmRecordLinkId ?? null,
          idempotency_key: input.idempotencyKey,
          status: "queued",
          payload: input.payload,
          max_attempts: input.maxAttempts ?? 5,
        })
        .select("*")
        .single();

      requireNoError(inserted.error, "Failed to enqueue CRM outbound job.");
      return toOutboundJob(inserted.data ?? {});
    },

    async loadOutboundJob(id) {
      const { data, error } = await client
        .from("crm_outbound_jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      requireNoError(error, "Failed to read CRM outbound job.");
      return data ? toOutboundJob(data) : null;
    },

    async updateOutboundJob(id, patch) {
      const rowPatch = {
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.attemptCount !== undefined
          ? { attempt_count: patch.attemptCount }
          : {}),
        ...(patch.resultSummary !== undefined
          ? { result_summary: patch.resultSummary }
          : {}),
        ...(patch.lastError !== undefined
          ? { last_error: patch.lastError }
          : {}),
        updated_at: new Date().toISOString(),
      };
      const { error } = await client
        .from("crm_outbound_jobs")
        .update(rowPatch)
        .eq("id", id);
      requireNoError(error, "Failed to update CRM outbound job.");
    },

    async recordOutboundSuccess(input) {
      if (!isGiftSummaryPaymentRecord(input.job)) {
        return;
      }

      const stagedGiftId = input.job.sourceEntityId;
      const now = new Date().toISOString();
      const correlation = {
        crmOutboundJobId: input.job.id,
        crmOutboundIdempotencyKey: input.job.idempotencyKey,
        crmOutboundStatus: "succeeded",
        twentyObjectName: input.job.twentyObjectName,
        ...(input.twentyRecordId
          ? { twentyRecordId: input.twentyRecordId }
          : {}),
      };

      const { error: giftError } = await client
        .from("staged_gifts")
        .update({
          status: "posted",
          crm_post_status: "posted",
          crm_outbound_job_id: input.job.id,
          twenty_record_id: input.twentyRecordId,
          posted_at: now,
          last_error_code: null,
          last_error_message: null,
          updated_at: now,
        })
        .eq("tenant_id", input.job.tenantId)
        .eq("id", stagedGiftId);
      requireNoError(giftError, "Failed to promote staged gift CRM post.");

      const existing = await client
        .from("donation_crm_links")
        .select("*")
        .eq("tenant_id", input.job.tenantId)
        .eq("staged_gift_id", stagedGiftId)
        .eq("crm_provider", "twenty")
        .maybeSingle();
      requireNoError(existing.error, "Failed to read donation CRM link.");

      if (existing.data) {
        const { error: linkError } = await client
          .from("donation_crm_links")
          .update({
            link_status: "active",
            twenty_object_name: input.job.twentyObjectName,
            twenty_record_id: input.twentyRecordId,
            metadata: {
              ...rowRecord(existing.data, "metadata"),
              ...correlation,
            },
            updated_at: now,
          })
          .eq("id", rowString(existing.data, "id"));
        requireNoError(linkError, "Failed to promote donation CRM link.");
        return;
      }

      const { error: insertError } = await client
        .from("donation_crm_links")
        .insert({
          tenant_id: input.job.tenantId,
          donation_id:
            typeof input.job.payload.asymDonationId === "string"
              ? input.job.payload.asymDonationId
              : null,
          staged_gift_id: stagedGiftId,
          crm_provider: "twenty",
          twenty_object_name: input.job.twentyObjectName,
          twenty_record_id: input.twentyRecordId,
          link_status: "active",
          metadata: correlation,
        });
      requireNoError(insertError, "Failed to create donation CRM link.");
    },

    async recordOutboundFailure(input) {
      if (!isGiftSummaryPaymentRecord(input.job)) {
        return;
      }

      const stagedGiftId = input.job.sourceEntityId;
      const now = new Date().toISOString();
      const errorCode = safeErrorCode(input.status);
      const correlation = {
        crmOutboundJobId: input.job.id,
        crmOutboundIdempotencyKey: input.job.idempotencyKey,
        crmOutboundStatus: input.status,
        twentyObjectName: input.job.twentyObjectName,
        lastError: input.error,
      };

      const { error: giftError } = await client
        .from("staged_gifts")
        .update({
          status: "failed",
          crm_post_status: "failed",
          crm_outbound_job_id: input.job.id,
          last_error_code: errorCode,
          last_error_message: input.error,
          updated_at: now,
        })
        .eq("tenant_id", input.job.tenantId)
        .eq("id", stagedGiftId);
      requireNoError(giftError, "Failed to mark staged gift CRM post failure.");

      const existing = await client
        .from("donation_crm_links")
        .select("*")
        .eq("tenant_id", input.job.tenantId)
        .eq("staged_gift_id", stagedGiftId)
        .eq("crm_provider", "twenty")
        .maybeSingle();
      requireNoError(existing.error, "Failed to read donation CRM link.");

      if (!existing.data) {
        return;
      }

      const { error: linkError } = await client
        .from("donation_crm_links")
        .update({
          link_status: "failed",
          metadata: {
            ...rowRecord(existing.data, "metadata"),
            ...correlation,
          },
          updated_at: now,
        })
        .eq("id", rowString(existing.data, "id"));
      requireNoError(linkError, "Failed to mark donation CRM link failed.");
    },

    async loadReconciliationSnapshot(input) {
      const orphanLinks = await client
        .from("crm_record_links")
        .select("id,twenty_object_name,twenty_record_id")
        .eq("tenant_id", input.tenantId)
        .eq("link_status", "active")
        .is("last_seen_at", null);
      const staleProjections = await client
        .from("crm_projection_state")
        .select("id,projection_name,sync_status")
        .eq("tenant_id", input.tenantId)
        .in("sync_status", ["stale", "failed"]);
      const stalledJobs = await client
        .from("crm_outbound_jobs")
        .select("id,status,locked_at")
        .eq("tenant_id", input.tenantId)
        .eq("status", "processing")
        .lte("locked_at", input.stalledBefore.toISOString());
      const duplicateCandidates = await client
        .from("crm_merge_candidates")
        .select("id,confidence,score")
        .eq("tenant_id", input.tenantId)
        .eq("status", "pending");
      const failedWebhooks = await client
        .from("crm_webhook_events")
        .select("id,status,last_error")
        .eq("tenant_id", input.tenantId)
        .in("status", ["failed", "dead_letter"]);
      const giftLinkDrift = await client
        .from("donation_crm_links")
        .select(
          "id,donation_id,staged_gift_id,link_status,twenty_record_id,metadata",
        )
        .eq("tenant_id", input.tenantId)
        .in("link_status", ["queued", "failed"]);

      requireNoError(orphanLinks.error, "Failed to read orphan CRM links.");
      requireNoError(
        staleProjections.error,
        "Failed to read stale CRM projections.",
      );
      requireNoError(stalledJobs.error, "Failed to read stalled CRM jobs.");
      requireNoError(
        duplicateCandidates.error,
        "Failed to read CRM duplicate candidates.",
      );
      requireNoError(
        failedWebhooks.error,
        "Failed to read failed CRM webhooks.",
      );
      requireNoError(
        giftLinkDrift.error,
        "Failed to read gift CRM link drift.",
      );

      return {
        orphanLinks: (orphanLinks.data ?? []).map((row) => ({
          id: rowString(row, "id"),
          reason: "active_link_without_last_seen",
          details: row,
        })),
        staleProjections: (staleProjections.data ?? []).map((row) => ({
          id: rowString(row, "id"),
          reason: "stale_or_failed_projection",
          details: row,
        })),
        stalledJobs: (stalledJobs.data ?? []).map((row) => ({
          id: rowString(row, "id"),
          reason: "processing_job_exceeded_stall_threshold",
          details: row,
        })),
        duplicateCandidates: (duplicateCandidates.data ?? []).map((row) => ({
          id: rowString(row, "id"),
          reason: "pending_duplicate_candidate",
          details: row,
        })),
        failedWebhooks: (failedWebhooks.data ?? []).map((row) => ({
          id: rowString(row, "id"),
          reason: "failed_or_dead_letter_webhook",
          details: row,
        })),
        giftLinkDrift: (giftLinkDrift.data ?? []).map((row) => ({
          id: rowString(row, "id"),
          reason:
            rowString(row, "link_status") === "queued"
              ? "gift_link_still_queued"
              : "gift_link_failed",
          details: row,
        })),
      };
    },

    async recordReconciliationRun(input) {
      const inserted = await client
        .from("crm_reconciliation_runs")
        .insert({
          tenant_id: input.tenantId,
          domain: input.domain ?? null,
          reconciliation_type: input.reconciliationType,
          status: input.status,
          checked_counts: input.checkedCounts,
          findings: input.findings,
          last_error: input.lastError ?? null,
          requested_by_profile_id: input.requestedByProfileId ?? null,
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      requireNoError(
        inserted.error,
        "Failed to record CRM reconciliation run.",
      );
      const row = inserted.data ?? {};
      return {
        checkedCounts: rowRecord(row, "checked_counts") as Record<
          string,
          number
        >,
        domain: rowNullableString(row, "domain") as CrmSyncDomain | null,
        findings: rowRecord(
          row,
          "findings",
        ) as unknown as CrmReconciliationSnapshot,
        id: rowString(row, "id"),
        lastError: rowNullableString(row, "last_error"),
        reconciliationType: rowString(row, "reconciliation_type"),
        status: rowString(row, "status") as CrmReconciliationRun["status"],
        tenantId: rowNullableString(row, "tenant_id"),
      };
    },
  };
}
