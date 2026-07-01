import { DONATION_SAGA_RECOVERY_EVENT } from "../events";
import {
  requestWorkflowDispatch,
  type CreateDispatchRequestInput,
  type RequestWorkflowDispatchDeps,
  type RequestWorkflowDispatchResult,
} from "../ledger";

import type { getAdminClient } from "@asym/database/supabase/admin";

type DonationWorkflowClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

const DUE_STATUSES = ["pending", "failed"] as const;

export interface DonationRecoveryDispatchDeps {
  client: DonationWorkflowClient;
  requestDispatch?: (
    deps: RequestWorkflowDispatchDeps,
    input: CreateDispatchRequestInput,
  ) => Promise<RequestWorkflowDispatchResult>;
}

export interface DonationRecoveryDispatchInput {
  tenantId: string;
  outboxId: string;
  /**
   * The saga row's current attempt_count. It scopes the dispatch idempotency
   * key to the current recovery epoch: duplicate scanner ticks reuse the same
   * dispatch request, while a later failed attempt gets a fresh handoff.
   */
  attemptCount: number;
}

/**
 * Donation Workflow Adapter: turns a due donation saga outbox row into a safe
 * workflow dispatch request. The event carries identifiers only; the workflow
 * loads current saga state through the saga claim RPCs when it runs.
 */
export async function requestDonationSagaRecoveryDispatch(
  deps: DonationRecoveryDispatchDeps,
  input: DonationRecoveryDispatchInput,
): Promise<RequestWorkflowDispatchResult> {
  const requestDispatch = deps.requestDispatch ?? requestWorkflowDispatch;

  return await requestDispatch(
    { client: deps.client },
    {
      tenantId: input.tenantId,
      productArea: "donations",
      workflowName: DONATION_SAGA_RECOVERY_EVENT,
      subject: { type: "donation_saga_outbox", id: input.outboxId },
      idempotencyKey: `donation-saga-recovery/${input.outboxId}/attempt-${input.attemptCount}`,
    },
  );
}

export interface DonationRecoveryScanOptions {
  limit?: number;
  now?: Date;
}

export interface DonationRecoveryScanSummary {
  scanned: number;
  dispatched: number;
  failed: number;
  alreadyDispatched: number;
}

interface DueSagaRow {
  id: string;
  tenant_id: string;
  attempt_count: number;
}

/**
 * Find due donation saga outbox rows (pending or failed, past their retry
 * time) and hand each one to workflow orchestration. The scan only finds
 * rows; the per-row workflow claims the row via claim_donation_saga_event
 * before any Stripe work, so duplicate dispatch cannot duplicate payment
 * effects. Dead-letter rows are excluded and stay visible for staff recovery.
 */
export async function runDonationSagaRecoveryScan(
  deps: DonationRecoveryDispatchDeps,
  options: DonationRecoveryScanOptions = {},
): Promise<DonationRecoveryScanSummary> {
  const limit = options.limit ?? 25;
  const now = options.now ?? new Date();

  const due = await deps.client
    .from("donation_saga_outbox")
    .select("id, tenant_id, attempt_count")
    .in("status", [...DUE_STATUSES])
    .lte("next_attempt_at", now.toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);

  if (due.error) {
    throw new Error(`donation_saga_recovery_scan_failed: ${due.error.message}`);
  }

  const rows = (due.data ?? []) as DueSagaRow[];
  const summary: DonationRecoveryScanSummary = {
    scanned: rows.length,
    dispatched: 0,
    failed: 0,
    alreadyDispatched: 0,
  };

  for (const row of rows) {
    const result = await requestDonationSagaRecoveryDispatch(deps, {
      tenantId: row.tenant_id,
      outboxId: row.id,
      attemptCount: row.attempt_count ?? 0,
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
