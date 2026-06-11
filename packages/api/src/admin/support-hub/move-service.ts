import { randomUUID } from "node:crypto";

import { appendSupportAudit } from "./audit";
import { acquireWorkClaim, releaseWorkClaim } from "../../workflows/claims";

import type { getAdminClient } from "@asym/database/supabase/admin";

type MoveClient = NonNullable<ReturnType<typeof getAdminClient>["client"]>;

const REASON_MIN = 5;
const REASON_MAX = 500;

/**
 * Light Move Reason Validation: trimmed, required, 5-500 characters, free
 * text only. No categories, grammar, or formatting rules that slow staff
 * down.
 */
export function validateMoveReason(reason: string): string | null {
  const trimmed = reason.trim();
  if (trimmed.length < REASON_MIN || trimmed.length > REASON_MAX) {
    return null;
  }
  return trimmed;
}

interface ConversationMoveRow {
  id: string;
  tenant_id: string;
  inbox_id: string;
  status: string;
  assignee_agent_id: string | null;
  snoozed_until: string | null;
  priority: string;
}

export type MoveFailureCode =
  | "reason_invalid"
  | "conversation_not_found"
  | "destination_not_found"
  | "same_inbox"
  | "resolved_confirmation_required"
  | "move_failed";

/** Staff-visible failure text: safe, no internals, no cross-tenant detail. */
export const MOVE_FAILURE_MESSAGES: Record<MoveFailureCode, string> = {
  reason_invalid:
    "Please enter a short reason (5-500 characters) for this move.",
  conversation_not_found: "This conversation is not available to move.",
  destination_not_found: "The destination inbox is not available.",
  same_inbox: "This conversation is already in that inbox.",
  resolved_confirmation_required:
    "This conversation is resolved. Confirm that you want to move closed work.",
  move_failed: "Could not move this conversation. Please try again.",
};

export interface MoveConversationInput {
  tenantId: string;
  conversationId: string;
  destinationInboxId: string;
  reason: string;
  actorProfileId: string;
  confirmResolved?: boolean;
  batchOperationId?: string | null;
  isRetry?: boolean;
  /**
   * Bulk moves validate the shared destination inbox once before the loop;
   * setting this skips the redundant per-item ownership lookup. The per-item
   * conversation and same_inbox checks always run.
   */
  destinationValidated?: boolean;
}

export type MoveConversationResult =
  | {
      status: "moved";
      conversationId: string;
      sourceInboxId: string;
      destinationInboxId: string;
      assigneeCleared: boolean;
    }
  | {
      status: "failed";
      conversationId: string;
      code: MoveFailureCode;
      message: string;
    };

function failure(
  conversationId: string,
  code: MoveFailureCode,
): MoveConversationResult {
  return {
    status: "failed",
    conversationId,
    code,
    message: MOVE_FAILURE_MESSAGES[code],
  };
}

/**
 * Audited Support Message Move: an explicit action by an authenticated
 * support agent in the owning tenant. Moving changes the inbox, not the work
 * state — labels, priority, status, and snooze timing are retained; the
 * assignee is kept only while they can still work the destination queue;
 * resolved conversations need quiet confirmation; and both inboxes keep
 * quiet markers through audit entries instead of duplicate messages.
 */
export async function moveSupportConversation(
  client: MoveClient,
  input: MoveConversationInput,
): Promise<MoveConversationResult> {
  const reason = validateMoveReason(input.reason);
  if (!reason) {
    return failure(input.conversationId, "reason_invalid");
  }

  const { data: conversationRow, error: conversationError } = await client
    .from("support_conversations")
    .select(
      "id, tenant_id, inbox_id, status, assignee_agent_id, snoozed_until, priority",
    )
    .eq("tenant_id", input.tenantId)
    .eq("id", input.conversationId)
    .maybeSingle();

  if (conversationError || !conversationRow) {
    return failure(input.conversationId, "conversation_not_found");
  }

  const conversation = conversationRow as ConversationMoveRow;

  if (!input.destinationValidated) {
    const { data: destination, error: destinationError } = await client
      .from("support_inboxes")
      .select("id, tenant_id")
      .eq("tenant_id", input.tenantId)
      .eq("id", input.destinationInboxId)
      .maybeSingle();

    if (destinationError || !destination) {
      return failure(input.conversationId, "destination_not_found");
    }
  }

  if (conversation.inbox_id === input.destinationInboxId) {
    return failure(input.conversationId, "same_inbox");
  }

  if (conversation.status === "resolved" && !input.confirmResolved) {
    // Resolved Move Confirmation: quiet, not blocking — the caller re-sends
    // with confirmResolved once staff acknowledges.
    return failure(input.conversationId, "resolved_confirmation_required");
  }

  // Move Assignee Retention: keep the assignee only when they can still work
  // the destination queue (active agent in the owning tenant); otherwise the
  // conversation arrives unassigned with no automatic round-robin.
  let assigneeCleared = false;
  if (conversation.assignee_agent_id) {
    const { data: agent } = await client
      .from("support_agents")
      .select("id, is_active")
      .eq("tenant_id", input.tenantId)
      .eq("id", conversation.assignee_agent_id)
      .maybeSingle();

    assigneeCleared = !agent || agent.is_active === false;
  }

  const patch: Record<string, unknown> = {
    inbox_id: input.destinationInboxId,
  };
  if (assigneeCleared) {
    patch.assignee_agent_id = null;
  }

  const { error: updateError } = await client
    .from("support_conversations")
    .update(patch)
    .eq("tenant_id", input.tenantId)
    .eq("id", input.conversationId);

  if (updateError) {
    return failure(input.conversationId, "move_failed");
  }

  const movedAt = new Date().toISOString();
  const sharedMetadata = {
    movedItemId: input.conversationId,
    sourceInboxId: conversation.inbox_id,
    destinationInboxId: input.destinationInboxId,
    reason,
    assigneeCleared,
    previousAssigneeId: assigneeCleared ? conversation.assignee_agent_id : null,
    retained: {
      labels: true,
      priority: conversation.priority,
      status: conversation.status,
      snoozedUntil: conversation.snoozed_until,
    },
    batchOperationId: input.batchOperationId ?? null,
    isRetry: input.isRetry ?? false,
    movedAt,
  };

  // Both quiet markers land in ONE insert so they succeed or fail together:
  // the destination's moved-from entry and the original inbox's moved-to
  // entry (no duplicate replyable message left behind).
  try {
    await appendSupportAudit(client, [
      {
        tenantId: input.tenantId,
        conversationId: input.conversationId,
        actorProfileId: input.actorProfileId,
        verb: "conversation_moved",
        body: `Moved from another inbox: ${reason}`,
        metadata: { ...sharedMetadata, marker: "moved_from" },
      },
      {
        tenantId: input.tenantId,
        conversationId: input.conversationId,
        actorProfileId: input.actorProfileId,
        verb: "conversation_moved_out",
        body: `Moved to another inbox: ${reason}`,
        metadata: { ...sharedMetadata, marker: "moved_to" },
      },
    ]);
  } catch {
    // The move already happened; surface a safe failure for audit issues so
    // staff retry the audit-bearing operation rather than losing history.
    // (Bulk Retry failed maps the resulting same_inbox to success.)
    return failure(input.conversationId, "move_failed");
  }

  return {
    status: "moved",
    conversationId: input.conversationId,
    sourceInboxId: conversation.inbox_id,
    destinationInboxId: input.destinationInboxId,
    assigneeCleared,
  };
}

export interface BulkMoveInput {
  tenantId: string;
  conversationIds: string[];
  destinationInboxId: string;
  reason: string;
  actorProfileId: string;
  confirmResolved?: boolean;
}

export interface BulkMoveItemResult {
  conversationId: string;
  status: "moved" | "failed" | "skipped_claimed";
  code?: MoveFailureCode;
  message?: string;
}

export interface BulkMoveResult {
  batchOperationId: string;
  status: "completed" | "partial";
  moved: number;
  failed: number;
  items: BulkMoveItemResult[];
}

/**
 * Bulk Support Message Move: every item runs through the same tenant,
 * authorization, reason, audit, assignee, status, label, priority, snooze,
 * and marker safeguards as a single move. One shared required reason is
 * copied into every item-level audit entry together with a stable batch
 * operation identifier. Partial success is expected: moved items stay moved,
 * failed items stay unchanged in their original inbox.
 */
export async function bulkMoveSupportConversations(
  client: MoveClient,
  input: BulkMoveInput,
  options: { batchOperationId?: string; isRetry?: boolean } = {},
): Promise<BulkMoveResult> {
  const reason = validateMoveReason(input.reason);
  if (!reason) {
    return {
      batchOperationId: options.batchOperationId ?? randomUUID(),
      status: "partial",
      moved: 0,
      failed: input.conversationIds.length,
      items: input.conversationIds.map((conversationId) => ({
        conversationId,
        status: "failed",
        code: "reason_invalid",
        message: MOVE_FAILURE_MESSAGES.reason_invalid,
      })),
    };
  }

  const batchOperationId = options.batchOperationId ?? randomUUID();
  const items: BulkMoveItemResult[] = [];

  // Shared destination: validate tenant ownership once, not once per item.
  const { data: destination, error: destinationError } = await client
    .from("support_inboxes")
    .select("id, tenant_id")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.destinationInboxId)
    .maybeSingle();
  const destinationMissing = Boolean(destinationError) || !destination;

  if (destinationMissing) {
    // Every item fails the same way; still fall through so the batch record
    // is written exactly like any other all-failed bulk move.
    items.push(
      ...input.conversationIds.map(
        (conversationId): BulkMoveItemResult => ({
          conversationId,
          status: "failed",
          code: "destination_not_found",
          message: MOVE_FAILURE_MESSAGES.destination_not_found,
        }),
      ),
    );
  }

  for (const conversationId of destinationMissing
    ? []
    : input.conversationIds) {
    // Per-item product work claim: bulk moves, single moves, and retries
    // cannot run the same conversation move concurrently.
    const claim = await acquireWorkClaim(client, {
      tenantId: input.tenantId,
      subject: { type: "support_conversation_move", id: conversationId },
      claimedBy: `bulk-move:${batchOperationId}`,
    });

    if (!claim.acquired || !claim.claimId) {
      items.push({
        conversationId,
        status: "skipped_claimed",
        message: "Another move for this conversation is already in progress.",
      });
      continue;
    }

    try {
      const result = await moveSupportConversation(client, {
        tenantId: input.tenantId,
        conversationId,
        destinationInboxId: input.destinationInboxId,
        reason,
        actorProfileId: input.actorProfileId,
        confirmResolved: input.confirmResolved,
        batchOperationId,
        isRetry: options.isRetry ?? false,
        destinationValidated: true,
      });

      if (result.status === "moved") {
        items.push({ conversationId, status: "moved" });
      } else if (result.code === "same_inbox" && (options.isRetry ?? false)) {
        // Retry-time same_inbox means the conversation is already at the
        // destination: the original attempt moved it but its bookkeeping
        // failed. Treat it as success instead of failing forever. (Retries
        // always reuse the original destination, so same_inbox cannot mean
        // anything else here.)
        items.push({ conversationId, status: "moved" });
      } else {
        items.push({
          conversationId,
          status: "failed",
          code: result.code,
          message: result.message,
        });
      }
    } catch {
      items.push({
        conversationId,
        status: "failed",
        code: "move_failed",
        message: MOVE_FAILURE_MESSAGES.move_failed,
      });
    } finally {
      await releaseWorkClaim(client, { claimId: claim.claimId });
    }
  }

  const moved = items.filter((item) => item.status === "moved").length;
  const failed = items.length - moved;

  // Retries skip this write entirely: retryFailedBulkMove merges the retried
  // items into the original batch row and owns that single update.
  if (!options.isRetry) {
    await client.from("support_bulk_move_operations").upsert(
      {
        id: batchOperationId,
        tenant_id: input.tenantId,
        destination_inbox_id: input.destinationInboxId,
        reason,
        created_by_profile_id: input.actorProfileId,
        items,
        status: failed === 0 ? "completed" : "partial",
        retry_of: null,
      },
      { onConflict: "id" },
    );
  }

  return {
    batchOperationId,
    status: failed === 0 ? "completed" : "partial",
    moved,
    failed,
    items,
  };
}

export interface RetryFailedBulkMoveInput {
  tenantId: string;
  batchOperationId: string;
  actorProfileId: string;
  confirmResolved?: boolean;
}

export type RetryFailedBulkMoveResult =
  | { status: "active_retry_in_progress" }
  | { status: "nothing_to_retry" }
  | ({ status: "retried" } & Omit<BulkMoveResult, "status">);

/**
 * Bulk Move Retry Failed Action: retries only the failed items of an earlier
 * batch through the product server path, reuses the original bulk move
 * reason, links audit to the original batch operation, and never reruns
 * successful item moves. Repeat clicks reuse the active retry attempt.
 */
export async function retryFailedBulkMove(
  client: MoveClient,
  input: RetryFailedBulkMoveInput,
): Promise<RetryFailedBulkMoveResult> {
  const { data: batchRow, error } = await client
    .from("support_bulk_move_operations")
    .select("id, tenant_id, destination_inbox_id, reason, items")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.batchOperationId)
    .maybeSingle();

  if (error || !batchRow) {
    return { status: "nothing_to_retry" };
  }

  const previousItems = (batchRow.items ?? []) as BulkMoveItemResult[];
  const failedIds = previousItems
    .filter((item) => item.status !== "moved")
    .map((item) => item.conversationId);

  if (failedIds.length === 0) {
    return { status: "nothing_to_retry" };
  }

  const claim = await acquireWorkClaim(client, {
    tenantId: input.tenantId,
    subject: { type: "support_bulk_move_retry", id: input.batchOperationId },
    claimedBy: `bulk-move-retry:${input.actorProfileId}`,
  });

  if (!claim.acquired || !claim.claimId) {
    return { status: "active_retry_in_progress" };
  }

  try {
    const retryResult = await bulkMoveSupportConversations(
      client,
      {
        tenantId: input.tenantId,
        conversationIds: failedIds,
        destinationInboxId: String(batchRow.destination_inbox_id),
        // Bulk Move Retry Reason Reuse: no new reason; the retry audit links
        // back to the original batch via batchOperationId + isRetry.
        reason: String(batchRow.reason),
        actorProfileId: input.actorProfileId,
        confirmResolved: input.confirmResolved ?? true,
      },
      { batchOperationId: input.batchOperationId, isRetry: true },
    );

    // Merge: items moved earlier stay moved; retried items take new results.
    const mergedItems = previousItems.map((item) => {
      if (item.status === "moved") return item;
      const retried = retryResult.items.find(
        (candidate) => candidate.conversationId === item.conversationId,
      );
      return retried ?? item;
    });
    const failed = mergedItems.filter((item) => item.status !== "moved").length;

    await client
      .from("support_bulk_move_operations")
      .update({
        items: mergedItems,
        status: failed === 0 ? "completed" : "partial",
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", input.batchOperationId);

    return {
      ...retryResult,
      status: "retried",
      items: mergedItems,
      moved: mergedItems.filter((item) => item.status === "moved").length,
      failed,
    };
  } finally {
    await releaseWorkClaim(client, { claimId: claim.claimId });
  }
}
