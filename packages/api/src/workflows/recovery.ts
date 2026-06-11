import { acquireWorkClaim, releaseWorkClaim } from "./claims";
import {
  dispatchWorkflowEvent,
  type WorkflowDispatchInput,
  type WorkflowDispatchResult,
} from "./dispatch";
import {
  dispatchLedgerRequest,
  mapWorkflowDispatchRequestRow,
  type WorkflowDispatchRequestRow,
} from "./ledger";

import type { getAdminClient } from "@asym/database/supabase/admin";

type WorkflowRecoveryClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

const LEDGER_TABLE = "workflow_dispatch_requests";

/** Handoffs that keep failing become dead letters for staff review. */
const MAX_DISPATCH_ATTEMPTS = 10;

const RECOVERY_CLAIMED_BY = "dispatch-recovery-scan";

export interface DispatchRecoveryScanDeps {
  client: WorkflowRecoveryClient;
  dispatcher?: (
    input: WorkflowDispatchInput,
  ) => Promise<WorkflowDispatchResult>;
}

export interface DispatchRecoveryScanOptions {
  limit?: number;
  now?: Date;
  maxAttempts?: number;
}

export interface DispatchRecoveryScanSummary {
  scanned: number;
  dispatched: number;
  failed: number;
  skippedClaimed: number;
  deadLettered: number;
}

/**
 * The dispatch recovery scan finds workflow dispatch requests that were
 * stored but not successfully handed to workflow orchestration, claims each
 * work item, and retries the handoff. It repairs handoffs only; product
 * records and Stripe/Resend webhooks remain the authority for business
 * outcomes.
 */
export async function runDispatchRecoveryScan(
  deps: DispatchRecoveryScanDeps,
  options: DispatchRecoveryScanOptions = {},
): Promise<DispatchRecoveryScanSummary> {
  const dispatcher = deps.dispatcher ?? dispatchWorkflowEvent;
  const limit = options.limit ?? 25;
  const now = options.now ?? new Date();
  const maxAttempts = options.maxAttempts ?? MAX_DISPATCH_ATTEMPTS;

  const due = await deps.client
    .from(LEDGER_TABLE)
    .select("*")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", now.toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);

  if (due.error) {
    throw new Error(`workflow_recovery_scan_failed: ${due.error.message}`);
  }

  const rows = (due.data ?? []) as WorkflowDispatchRequestRow[];
  const summary: DispatchRecoveryScanSummary = {
    scanned: rows.length,
    dispatched: 0,
    failed: 0,
    skippedClaimed: 0,
    deadLettered: 0,
  };

  // Exhausted rows dead-letter together in one UPDATE; only rows still
  // inside the attempt budget go through the per-row claim + redispatch.
  const exhaustedIds = rows
    .filter((row) => row.dispatch_attempts >= maxAttempts)
    .map((row) => row.id);

  if (exhaustedIds.length > 0) {
    const deadLettered = await deps.client
      .from(LEDGER_TABLE)
      .update({
        status: "dead_letter",
        dead_letter_at: now.toISOString(),
      })
      .in("id", exhaustedIds);

    if (deadLettered.error) {
      throw new Error(
        `workflow_recovery_dead_letter_failed: ${deadLettered.error.message}`,
      );
    }

    summary.deadLettered = exhaustedIds.length;
  }

  for (const row of rows) {
    if (row.dispatch_attempts >= maxAttempts) {
      continue;
    }

    const request = mapWorkflowDispatchRequestRow(row);

    const claim = await acquireWorkClaim(deps.client, {
      tenantId: request.tenantId,
      subject: request.subject,
      claimedBy: RECOVERY_CLAIMED_BY,
    });

    if (!claim.acquired || !claim.claimId) {
      summary.skippedClaimed += 1;
      continue;
    }

    try {
      const result = await dispatchLedgerRequest(
        { client: deps.client, dispatcher },
        request,
      );

      if (result.outcome === "dispatched") {
        summary.dispatched += 1;
      } else {
        summary.failed += 1;
      }
    } finally {
      await releaseWorkClaim(deps.client, { claimId: claim.claimId });
    }
  }

  return summary;
}
