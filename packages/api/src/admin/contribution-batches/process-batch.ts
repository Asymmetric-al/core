import { createContributionBatchPreview } from "./preview";
import { summarizeContributionBatchResults } from "./results";

import type { ProcessContributionBatchInput } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

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
        reason: input.reason,
        confirmationToken: input.confirmationToken,
        payload: record.stagedGiftId
          ? { stagedGiftId: record.stagedGiftId }
          : {},
      });
      results.push({
        contributionId: record.contributionId,
        action: input.actionType,
        status: "succeeded" as const,
        auditEventId: result.auditEventId ?? null,
        taskId: result.taskIds?.[0] ?? null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const failureReason =
        error instanceof Error ? error.message : "Contribution action failed.";
      const taskId =
        input.createFollowUpTask != null
          ? await input.createFollowUpTask({
              tenantId: input.tenantId,
              actorProfileId: input.actorProfileId,
              contributionId: record.contributionId,
              actionType: input.actionType,
              reason: failureReason,
            })
          : null;

      results.push({
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

export async function processPersistedContributionBatch(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
  actorProfileId: string | null;
  executeContributionAction: ProcessContributionBatchInput["executeContributionAction"];
  createFollowUpTask?: ProcessContributionBatchInput["createFollowUpTask"];
  actorPermissions?: ProcessContributionBatchInput["actorPermissions"];
  assertActionPermission?: (
    actionType: ProcessContributionBatchInput["actionType"],
  ) => void;
}) {
  const { data: batchRow, error: batchError } = await input.supabaseAdmin
    .from("contribution_operation_batches")
    .select("id, operation, source_surface, reason, confirmation_snapshot")
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

  const { data: itemRows, error: itemError } = await input.supabaseAdmin
    .from("contribution_operation_batch_items")
    .select("id, donation_id, staged_gift_id")
    .eq("tenant_id", input.tenantId)
    .eq("batch_id", input.batchId)
    .eq("status", "pending")
    .order("record_index", { ascending: true });
  if (itemError) throw new Error(itemError.message);

  const records = ((itemRows ?? []) as JsonRecord[]).map((row) => ({
    id: asString(row.donation_id) ?? "",
    stagedGiftId: asString(row.staged_gift_id),
  }));

  const result = await processContributionBatch({
    tenantId: input.tenantId,
    actorProfileId: input.actorProfileId,
    actionType,
    sourceSurface: String(batchRow.source_surface) as never,
    reason: asString(batchRow.reason),
    confirmationToken: isRecord(batchRow.confirmation_snapshot)
      ? asString(batchRow.confirmation_snapshot.confirmationToken)
      : null,
    actorPermissions: input.actorPermissions,
    records,
    executeContributionAction: input.executeContributionAction,
    createFollowUpTask: input.createFollowUpTask,
  });

  const rows = (itemRows ?? []) as JsonRecord[];
  for (const row of rows) {
    const contributionId = asString(row.donation_id);
    const itemResult = result.results.find(
      (candidate) => candidate.contributionId === contributionId,
    );
    if (!row) continue;
    const id = asString(row.id);
    if (!id || !itemResult) continue;

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
    if (updateError) throw new Error(updateError.message);
  }

  const { error: batchUpdateError } = await input.supabaseAdmin
    .from("contribution_operation_batches")
    .update({
      status: result.status,
      processed_count: result.summary.processed,
      succeeded_count: result.summary.succeeded,
      skipped_count: result.summary.skipped,
      failed_count: result.summary.failed,
      follow_up_task_count: result.summary.followUpTasksCreated,
      finished_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.batchId);
  if (batchUpdateError) throw new Error(batchUpdateError.message);

  return result;
}
