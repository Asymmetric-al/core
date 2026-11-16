import { z } from "zod";

import { ApiHttpError } from "../../shared/http-errors";

import type { ContributionBatchStatus } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const batchIdSchema = z.guid();

/**
 * A bulk request's confirmation token, when it is a GUID, is the id of the
 * batch it creates. The client makes the token once per selection and keeps
 * it across retries, so a retried request finds the batch it already
 * created (the primary key rejects a second one) instead of starting another
 * that would send the same receipts again.
 */
export function contributionBatchIdFromToken(token: string): string | null {
  const trimmed = token.trim();
  return batchIdSchema.safeParse(trimmed).success
    ? trimmed.toLowerCase()
    : null;
}

export function isUniqueViolation(
  error: { code?: string | null } | null | undefined,
): boolean {
  return error?.code === "23505";
}

function recordIdsOf(snapshot: unknown): string[] | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const records = (snapshot as { records?: unknown }).records;
  if (!Array.isArray(records)) return null;
  const ids: string[] = [];
  for (const record of records) {
    const id =
      record && typeof record === "object"
        ? (record as { id?: unknown }).id
        : undefined;
    if (typeof id !== "string") return null;
    ids.push(id.toLowerCase());
  }
  return ids;
}

function sameIds(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((id, index) => id === right[index]?.toLowerCase())
  );
}

/**
 * The response for a batch this token already created in the tenant, or null
 * when there is none. A token reused for another action, other gifts or
 * another person is refused rather than answered with someone else's batch.
 */
export async function replayContributionBatch(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  batchId: string;
  actorProfileId: string | null;
  actionType: string;
  recordIds: string[];
}) {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_operation_batches")
    .select(
      "id, operation, status, execution_mode, created_by_profile_id, selection_snapshot, processed_count, succeeded_count, skipped_count, failed_count, follow_up_task_count",
    )
    .eq("tenant_id", input.tenantId)
    .eq("id", input.batchId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as Record<string, unknown>;

  const storedIds = recordIdsOf(row.selection_snapshot);
  if (
    row.operation !== input.actionType ||
    row.created_by_profile_id !== input.actorProfileId ||
    !storedIds ||
    !sameIds(storedIds, input.recordIds)
  ) {
    throw new ApiHttpError(
      409,
      "This confirmation was already used for a different batch. Close the dialog and start again.",
    );
  }

  const status = String(row.status) as ContributionBatchStatus;
  const executionMode =
    row.execution_mode === "background" ? "background" : "immediate";
  if (executionMode === "immediate" && status === "running") {
    throw new ApiHttpError(
      409,
      "This batch is still being sent. Refresh the gifts in a moment to see the result.",
    );
  }

  const summary = {
    processed: Number(row.processed_count ?? 0),
    succeeded: Number(row.succeeded_count ?? 0),
    skipped: Number(row.skipped_count ?? 0),
    failed: Number(row.failed_count ?? 0),
    followUpTasksCreated: Number(row.follow_up_task_count ?? 0),
  };
  const id = String(row.id);
  return {
    batch:
      executionMode === "background"
        ? { id, status, executionMode, summary }
        : { id, status, executionMode, results: [], summary },
    nextAction:
      executionMode === "background" && status === "running"
        ? {
            method: "POST" as const,
            href: `/api/admin/contribution-batches/${id}/process`,
          }
        : null,
  };
}
