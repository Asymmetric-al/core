import { asPayload, createContributionBatchPreview } from "./preview";
import { summarizeContributionBatchResults } from "./results";
import {
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
} from "../contribution-operations/crm-retry-support";

import type {
  ContributionBatchStatus,
  ProcessContributionBatchInput,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const PERSISTED_BATCH_CHUNK_SIZE = 25;

/**
 * CRM posting actions retired from the batch request schema. Persisted rows
 * created before the retirement may still carry them (`crm_repost` was
 * batch-creatable), so the persisted processor retires those batches cleanly
 * instead of claiming items into an executor whose dependency set no longer
 * supports them (mirrors the automation-store retirement path).
 */
const RETIRED_CRM_BATCH_ACTION_TYPES = new Set<string>([
  "approve_staged_gift",
  "retry_staged_gift",
  "crm_repost",
]);

function isRetiredCrmBatchAction(actionType: string): boolean {
  return (
    !isContributionCrmPostingSupported() &&
    RETIRED_CRM_BATCH_ACTION_TYPES.has(actionType)
  );
}
const RUNNING_ITEM_STALE_AFTER_MS = 5 * 60 * 1000;
const OPEN_ITEM_STALE_AFTER_MS = 30 * 60 * 1000;

type PersistedBatchItemStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "skipped"
  | "failed";

interface BatchItemSummary {
  processed: number;
  succeeded: number;
  skipped: number;
  failed: number;
  pending: number;
  running: number;
  followUpTasksCreated: number;
  staleRunningItemIds: string[];
}

export async function processContributionBatch(
  input: ProcessContributionBatchInput,
) {
  const preview = createContributionBatchPreview({
    actionType: input.actionType,
    records: input.records,
  });
  const results = [];

  for (const skipped of preview.skippedRecords) {
    results.push({
      batchItemId: skipped.batchItemId,
      contributionId: skipped.contributionId,
      action: input.actionType,
      status: "skipped" as const,
      skipReason: skipped.reason,
      timestamp: new Date().toISOString(),
    });
  }

  for (const record of preview.affectedRecords) {
    try {
      const result = await input.executeContributionAction({
        tenantId: input.tenantId,
        actorProfileId: input.actorProfileId,
        sourceSurface: input.sourceSurface,
        contributionId: record.contributionId,
        stagedGiftId: record.stagedGiftId,
        actionType: input.actionType,
        actorPermissions: input.actorPermissions,
        actorCapabilities: input.actorCapabilities,
        reason: input.reason,
        confirmationToken: input.confirmationToken,
        payload: asPayload(record.payload),
      });
      results.push({
        batchItemId: record.batchItemId,
        contributionId: record.contributionId,
        action: input.actionType,
        status: "succeeded" as const,
        auditEventId: result.auditEventId ?? null,
        taskId: result.taskIds?.[0] ?? null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      let failureReason =
        error instanceof Error ? error.message : "Contribution action failed.";
      let taskId: string | null = null;

      if (input.createFollowUpTask != null) {
        try {
          taskId = await input.createFollowUpTask({
            tenantId: input.tenantId,
            actorProfileId: input.actorProfileId,
            contributionId: record.contributionId,
            actionType: input.actionType,
            reason: failureReason,
          });
        } catch (taskError) {
          const taskFailureReason =
            taskError instanceof Error
              ? taskError.message
              : "Follow-up task creation failed.";
          failureReason = `${failureReason} Follow-up task creation failed: ${taskFailureReason}`;
        }
      }

      results.push({
        batchItemId: record.batchItemId,
        contributionId: record.contributionId,
        action: input.actionType,
        status: "failed" as const,
        failureReason,
        taskId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  const summary = summarizeContributionBatchResults(results);
  const { status, ...summaryCounts } = summary;

  return {
    results,
    summary: summaryCounts,
    status,
  };
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asItemStatus(value: unknown): PersistedBatchItemStatus | null {
  if (
    value === "pending" ||
    value === "running" ||
    value === "succeeded" ||
    value === "skipped" ||
    value === "failed"
  ) {
    return value;
  }

  return null;
}

function toFailureReason(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Contribution batch processing failed.";
}

function isStaleRunningItem(row: JsonRecord, nowMs = Date.now()) {
  const status = asItemStatus(row.status);
  if (status !== "running") {
    return false;
  }

  const updatedAt = asString(row.updated_at);
  if (!updatedAt) {
    return true;
  }

  const updatedAtMs = Date.parse(updatedAt);
  if (!Number.isFinite(updatedAtMs)) {
    return true;
  }

  return nowMs - updatedAtMs > RUNNING_ITEM_STALE_AFTER_MS;
}

function getBatchStatusFromSummary(
  summary: Pick<
    BatchItemSummary,
    "failed" | "processed" | "skipped" | "succeeded"
  >,
): ContributionBatchStatus {
  if (
    summary.processed > 0 &&
    summary.succeeded === 0 &&
    summary.failed > 0 &&
    summary.skipped === 0
  ) {
    return "failed";
  }

  return summary.failed > 0 || summary.skipped > 0
    ? "complete_with_issues"
    : "complete";
}

function getPublicSummary(summary: BatchItemSummary) {
  return {
    processed: summary.processed,
    succeeded: summary.succeeded,
    skipped: summary.skipped,
    failed: summary.failed,
    followUpTasksCreated: summary.followUpTasksCreated,
  };
}

function hasOpenItems(summary: BatchItemSummary) {
  return summary.pending > 0 || summary.running > 0;
}

function isBatchStale(row: JsonRecord, nowMs = Date.now()) {
  const createdAt = asString(row.created_at);
  if (!createdAt) {
    return false;
  }

  const createdAtMs = Date.parse(createdAt);
  if (!Number.isFinite(createdAtMs)) {
    return false;
  }

  return nowMs - createdAtMs > OPEN_ITEM_STALE_AFTER_MS;
}

function assertBatchProcessOwner(input: {
  batchRow: JsonRecord;
  actorProfileId: string | null;
}) {
  const createdByProfileId = asString(input.batchRow.created_by_profile_id);
  if (
    createdByProfileId &&
    (!input.actorProfileId || createdByProfileId !== input.actorProfileId)
  ) {
    throw new Error(
      "Only the batch creator can process this contribution batch.",
    );
  }
}

async function readBatchItemSummary(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
}): Promise<BatchItemSummary> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_operation_batch_items")
    .select("id, status, task_id, updated_at")
    .eq("tenant_id", input.tenantId)
    .eq("batch_id", input.batchId);
  if (error) {
    throw new Error(error.message);
  }

  const summary: BatchItemSummary = {
    processed: 0,
    succeeded: 0,
    skipped: 0,
    failed: 0,
    pending: 0,
    running: 0,
    followUpTasksCreated: 0,
    staleRunningItemIds: [],
  };

  for (const row of (data ?? []) as JsonRecord[]) {
    const status = asItemStatus(row.status);
    if (!status) {
      continue;
    }

    if (status === "pending") {
      summary.pending += 1;
      continue;
    }

    if (status === "running") {
      summary.running += 1;
      const itemId = asString(row.id);
      if (itemId && isStaleRunningItem(row)) {
        summary.staleRunningItemIds.push(itemId);
      }
      continue;
    }

    summary.processed += 1;
    if (status === "succeeded") {
      summary.succeeded += 1;
    }
    if (status === "skipped") {
      summary.skipped += 1;
    }
    if (status === "failed") {
      summary.failed += 1;
    }
    if (asString(row.task_id)) {
      summary.followUpTasksCreated += 1;
    }
  }

  return summary;
}

async function markBatchItemsFailedById(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
  itemIds: string[];
  reason: string;
}) {
  if (input.itemIds.length === 0) {
    return;
  }

  const { error } = await input.supabaseAdmin
    .from("contribution_operation_batch_items")
    .update({
      status: "failed",
      error_message: input.reason,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("batch_id", input.batchId)
    .eq("status", "running")
    .in("id", input.itemIds);
  if (error) {
    throw new Error(error.message);
  }
}

async function markOpenBatchItemsFailed(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
  reason: string;
}) {
  const { error } = await input.supabaseAdmin
    .from("contribution_operation_batch_items")
    .update({
      status: "failed",
      error_message: input.reason,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("batch_id", input.batchId)
    .in("status", ["pending", "running"]);
  if (error) {
    throw new Error(error.message);
  }
}

async function readSummaryAfterStaleRecovery(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
}) {
  const summary = await readBatchItemSummary(input);
  if (summary.staleRunningItemIds.length === 0) {
    return summary;
  }

  await markBatchItemsFailedById({
    ...input,
    itemIds: summary.staleRunningItemIds,
    reason: "Batch item processing timed out before a result was recorded.",
  });

  return readBatchItemSummary(input);
}

async function updateBatchProgress(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
  summary: BatchItemSummary;
  finalize: boolean;
}) {
  const payload = {
    status: input.finalize
      ? getBatchStatusFromSummary(input.summary)
      : ("running" as const),
    processed_count: input.summary.processed,
    succeeded_count: input.summary.succeeded,
    skipped_count: input.summary.skipped,
    failed_count: input.summary.failed,
    follow_up_task_count: input.summary.followUpTasksCreated,
    ...(input.finalize ? { finished_at: new Date().toISOString() } : {}),
  };

  const { error } = await input.supabaseAdmin
    .from("contribution_operation_batches")
    .update(payload)
    .eq("tenant_id", input.tenantId)
    .eq("id", input.batchId);
  if (error) {
    throw new Error(error.message);
  }

  return payload.status;
}

async function claimPendingBatchItems(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
  chunkSize: number;
}) {
  const { data: pendingRows, error: selectError } = await input.supabaseAdmin
    .from("contribution_operation_batch_items")
    .select("id, donation_id, staged_gift_id, payload")
    .eq("tenant_id", input.tenantId)
    .eq("batch_id", input.batchId)
    .eq("status", "pending")
    .order("record_index", { ascending: true })
    .limit(input.chunkSize);
  if (selectError) {
    throw new Error(selectError.message);
  }

  const rows = (pendingRows ?? []) as JsonRecord[];
  const itemIds = rows
    .map((row) => asString(row.id))
    .filter((id) => id != null);
  if (itemIds.length === 0) {
    return [];
  }

  const { data: claimedRows, error: claimError } = await input.supabaseAdmin
    .from("contribution_operation_batch_items")
    .update({
      status: "running",
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("batch_id", input.batchId)
    .eq("status", "pending")
    .in("id", itemIds)
    .select("id");
  if (claimError) {
    throw new Error(claimError.message);
  }

  const claimedIds = new Set(
    ((claimedRows ?? []) as JsonRecord[])
      .map((row) => asString(row.id))
      .filter((id) => id != null),
  );

  return rows.filter((row) => {
    const id = asString(row.id);
    return id != null && claimedIds.has(id);
  });
}

/**
 * Best-effort terminal marker for a batch whose item persistence or background
 * processing failed before results could be recorded. Without it, a thrown
 * error would strand the batch row in `running` forever. Never throws — it is
 * called from error paths where the original failure must surface, not this
 * cleanup.
 */
export async function markContributionBatchFailed(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
}): Promise<void> {
  try {
    await markOpenBatchItemsFailed({
      ...input,
      reason: "Batch processing failed before this item recorded a result.",
    });
  } catch (error) {
    console.error("[contribution-batches] Could not mark open items failed", {
      batchId: input.batchId,
      error,
    });
  }

  try {
    const { error } = await input.supabaseAdmin
      .from("contribution_operation_batches")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", input.batchId);
    if (error) {
      console.error("[contribution-batches] Could not mark batch failed", {
        batchId: input.batchId,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("[contribution-batches] Could not mark batch failed", {
      batchId: input.batchId,
      error,
    });
  }
}

export async function processPersistedContributionBatch(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
  actorProfileId: string | null;
  executeContributionAction: ProcessContributionBatchInput["executeContributionAction"];
  createFollowUpTask?: ProcessContributionBatchInput["createFollowUpTask"];
  actorPermissions?: ProcessContributionBatchInput["actorPermissions"];
  actorCapabilities?: ProcessContributionBatchInput["actorCapabilities"];
  assertActionPermission?: (
    actionType: ProcessContributionBatchInput["actionType"],
  ) => void;
  chunkSize?: number;
}) {
  const { data: batchRow, error: batchError } = await input.supabaseAdmin
    .from("contribution_operation_batches")
    .select(
      "id, operation, source_surface, reason, confirmation_snapshot, status, processed_count, succeeded_count, skipped_count, failed_count, follow_up_task_count, created_by_profile_id, created_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("id", input.batchId)
    .single();
  if (batchError || !isRecord(batchRow)) {
    throw new Error(batchError?.message ?? "Batch not found.");
  }
  const actionType = String(
    batchRow.operation,
  ) as ProcessContributionBatchInput["actionType"];
  input.assertActionPermission?.(actionType);
  assertBatchProcessOwner({
    batchRow,
    actorProfileId: input.actorProfileId,
  });

  if (batchRow.status !== "running") {
    return {
      results: [],
      status: String(batchRow.status),
      summary: {
        processed: Number(batchRow.processed_count ?? 0),
        succeeded: Number(batchRow.succeeded_count ?? 0),
        skipped: Number(batchRow.skipped_count ?? 0),
        failed: Number(batchRow.failed_count ?? 0),
        followUpTasksCreated: Number(batchRow.follow_up_task_count ?? 0),
      },
    };
  }

  // Retire persisted batches for retired CRM posting operations without
  // claiming their items: executing them would fail every item on a missing
  // CRM dependency and spawn provider-failed follow-up tasks.
  if (isRetiredCrmBatchAction(actionType)) {
    await markOpenBatchItemsFailed({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
      reason: `${CRM_POSTING_UNAVAILABLE_REASON} ${CRM_POSTING_UNAVAILABLE_NEXT_STEP}`,
    });

    const summary = await readBatchItemSummary({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
    });
    const status = await updateBatchProgress({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
      summary,
      finalize: true,
    });

    return {
      results: [],
      status,
      summary: getPublicSummary(summary),
    };
  }

  if (isBatchStale(batchRow)) {
    const summaryBeforeCleanup = await readSummaryAfterStaleRecovery({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
    });

    if (hasOpenItems(summaryBeforeCleanup)) {
      await markOpenBatchItemsFailed({
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.tenantId,
        batchId: input.batchId,
        reason:
          "Batch processing timed out before all items recorded a result.",
      });
    }

    const summary = await readBatchItemSummary({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
    });
    const status = await updateBatchProgress({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
      summary,
      finalize: true,
    });

    return {
      results: [],
      status,
      summary: getPublicSummary(summary),
    };
  }

  const rows = await claimPendingBatchItems({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    batchId: input.batchId,
    chunkSize: input.chunkSize ?? PERSISTED_BATCH_CHUNK_SIZE,
  });
  const records = rows.map((row) => ({
    batchItemId: asString(row.id) ?? undefined,
    id: asString(row.donation_id) ?? "",
    stagedGiftId: asString(row.staged_gift_id),
    payload: asPayload(row.payload),
  }));
  if (rows.length === 0) {
    const summary = await readSummaryAfterStaleRecovery({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
    });
    const finalize = !hasOpenItems(summary);
    const status = await updateBatchProgress({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
      summary,
      finalize,
    });

    return {
      results: [],
      status,
      summary: getPublicSummary(summary),
    };
  }

  let result: Awaited<ReturnType<typeof processContributionBatch>>;
  try {
    result = await processContributionBatch({
      tenantId: input.tenantId,
      actorProfileId: input.actorProfileId,
      actionType,
      sourceSurface: String(batchRow.source_surface) as never,
      reason: asString(batchRow.reason),
      confirmationToken: isRecord(batchRow.confirmation_snapshot)
        ? asString(batchRow.confirmation_snapshot.confirmationToken)
        : null,
      actorPermissions: input.actorPermissions,
      actorCapabilities: input.actorCapabilities,
      records,
      executeContributionAction: input.executeContributionAction,
      createFollowUpTask: input.createFollowUpTask,
    });
  } catch (error) {
    await markBatchItemsFailedById({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      batchId: input.batchId,
      itemIds: rows.map((row) => asString(row.id)).filter((id) => id != null),
      reason: toFailureReason(error),
    });
    throw error;
  }

  for (const row of rows) {
    const id = asString(row.id);
    if (!id) continue;

    const contributionId = asString(row.donation_id);
    const itemResult =
      result.results.find((candidate) => candidate.batchItemId === id) ??
      result.results.find(
        (candidate) =>
          candidate.batchItemId == null &&
          candidate.contributionId === contributionId,
      );
    if (!itemResult) continue;

    const { error: updateError } = await input.supabaseAdmin
      .from("contribution_operation_batch_items")
      .update({
        status: itemResult.status,
        skip_reason: itemResult.skipReason ?? null,
        error_message: itemResult.failureReason ?? null,
        operation_audit_event_id: itemResult.auditEventId ?? null,
        task_id: itemResult.taskId ?? null,
        result: itemResult,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", id);
    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  const summary = await readSummaryAfterStaleRecovery({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    batchId: input.batchId,
  });
  const finalize = !hasOpenItems(summary);
  const status = await updateBatchProgress({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    batchId: input.batchId,
    summary,
    finalize,
  });

  return {
    ...result,
    status,
    summary: getPublicSummary(summary),
  };
}
