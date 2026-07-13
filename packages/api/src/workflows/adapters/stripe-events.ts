import { STRIPE_EVENT_PROCESS_EVENT } from "../events";
import {
  requestWorkflowDispatch,
  type CreateDispatchRequestInput,
  type RequestWorkflowDispatchDeps,
  type RequestWorkflowDispatchResult,
} from "../ledger";

import type { getAdminClient } from "@asym/database/supabase/admin";

type StripeWorkflowClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

export interface StripeEventRecoveryDeps {
  client: StripeWorkflowClient;
  requestDispatch?: (
    deps: RequestWorkflowDispatchDeps,
    input: CreateDispatchRequestInput,
  ) => Promise<RequestWorkflowDispatchResult>;
}

export interface StripeEventRecoveryDispatchInput {
  tenantId: string;
  rawEventId: string;
  /**
   * The stored event's current process_attempts. It scopes the dispatch
   * idempotency key to the current recovery epoch: duplicate scanner ticks
   * reuse the same dispatch request, while a later failed attempt gets a
   * fresh handoff.
   */
  attempts: number;
}

/**
 * Turn a failed stored Stripe event into a safe workflow dispatch request.
 * The event carries identifiers only; the workflow re-claims the stored
 * event (claim_stripe_raw_event) before applying it to product records.
 */
export async function requestStripeEventRecoveryDispatch(
  deps: StripeEventRecoveryDeps,
  input: StripeEventRecoveryDispatchInput,
): Promise<RequestWorkflowDispatchResult> {
  const requestDispatch = deps.requestDispatch ?? requestWorkflowDispatch;

  return await requestDispatch(
    { client: deps.client },
    {
      tenantId: input.tenantId,
      productArea: "giving",
      workflowName: STRIPE_EVENT_PROCESS_EVENT,
      subject: { type: "stripe_raw_event", id: input.rawEventId },
      idempotencyKey: `stripe-event-recovery/${input.rawEventId}/attempt-${input.attempts}`,
    },
  );
}

export interface StripeEventRecoveryScanOptions {
  limit?: number;
  now?: Date;
}

export interface StripeEventRecoveryScanSummary {
  scanned: number;
  dispatched: number;
  failed: number;
  alreadyDispatched: number;
}

interface FailedStripeEventRow {
  id: string;
  tenant_id: string;
  process_attempts: number;
}

/**
 * Find stored Stripe events whose processing failed and whose retry backoff
 * has elapsed, and hand each one back to workflow orchestration. Stripe got
 * its 200 at storage time and will not redeliver; without this scan a
 * transient processing failure would strand the payment event until manual
 * staff replay. Dead-lettering still comes from the event-store RPC's own
 * attempt threshold — this scan only repairs the retry loop.
 */
export async function runStripeEventRecoveryScan(
  deps: StripeEventRecoveryDeps,
  options: StripeEventRecoveryScanOptions = {},
): Promise<StripeEventRecoveryScanSummary> {
  const limit = options.limit ?? 25;
  const now = options.now ?? new Date();

  const due = await deps.client
    .from("stripe_raw_events")
    .select("id, tenant_id, process_attempts")
    .eq("processing_status", "failed")
    .not("tenant_id", "is", null)
    .lte("next_attempt_at", now.toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);

  if (due.error) {
    throw new Error(`stripe_event_recovery_scan_failed: ${due.error.message}`);
  }

  const rows = (due.data ?? []) as FailedStripeEventRow[];
  const summary: StripeEventRecoveryScanSummary = {
    scanned: rows.length,
    dispatched: 0,
    failed: 0,
    alreadyDispatched: 0,
  };

  for (const row of rows) {
    const result = await requestStripeEventRecoveryDispatch(deps, {
      tenantId: row.tenant_id,
      rawEventId: row.id,
      attempts: row.process_attempts ?? 0,
    });

    if (result.outcome === "dispatched") {
      summary.dispatched += 1;
    } else if (result.outcome === "already_dispatched") {
      summary.alreadyDispatched += 1;
    } else {
      summary.failed += 1;
    }
  }

  return summary;
}
