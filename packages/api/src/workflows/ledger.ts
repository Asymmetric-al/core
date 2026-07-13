import {
  dispatchWorkflowEvent,
  type WorkflowDispatchInput,
  type WorkflowDispatchResult,
} from "./dispatch";
import { envelopeInvalidMessage } from "./envelope-guard";
import {
  workflowEventEnvelopeSchema,
  type WorkflowEventEnvelope,
} from "./events";

import type { getAdminClient } from "@asym/database/supabase/admin";

type WorkflowLedgerClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

const LEDGER_TABLE = "workflow_dispatch_requests";

/** Failed handoffs back off before the recovery scan retries them. */
const RETRY_BACKOFF_MS = 60_000;

export type WorkflowDispatchRequestStatus =
  | "pending"
  | "dispatched"
  | "failed"
  | "dead_letter";

/** Snake_case row shape stored in public.workflow_dispatch_requests. */
export interface WorkflowDispatchRequestRow {
  id: string;
  tenant_id: string;
  product_area: string;
  workflow_name: string;
  subject_type: string;
  subject_id: string;
  idempotency_key: string;
  schema_version: number;
  status: WorkflowDispatchRequestStatus;
  dispatch_attempts: number;
  next_attempt_at: string;
  last_error_code: string | null;
  last_error_message: string | null;
  event_ids: string[];
  context: Record<string, string | number | boolean | null>;
  dispatched_at: string | null;
  dead_letter_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowDispatchRequest {
  id: string;
  tenantId: string;
  productArea: string;
  workflowName: string;
  subject: { type: string; id: string };
  idempotencyKey: string;
  schemaVersion: number;
  status: WorkflowDispatchRequestStatus;
  dispatchAttempts: number;
  nextAttemptAt: string;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  eventIds: string[];
  context: Record<string, string | number | boolean | null>;
  dispatchedAt: string | null;
  deadLetterAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapWorkflowDispatchRequestRow(
  row: WorkflowDispatchRequestRow,
): WorkflowDispatchRequest {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    productArea: row.product_area,
    workflowName: row.workflow_name,
    subject: { type: row.subject_type, id: row.subject_id },
    idempotencyKey: row.idempotency_key,
    schemaVersion: row.schema_version,
    status: row.status,
    dispatchAttempts: row.dispatch_attempts,
    nextAttemptAt: row.next_attempt_at,
    lastErrorCode: row.last_error_code,
    lastErrorMessage: row.last_error_message,
    eventIds: row.event_ids ?? [],
    context: row.context ?? {},
    dispatchedAt: row.dispatched_at,
    deadLetterAt: row.dead_letter_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateDispatchRequestInput {
  tenantId: string;
  productArea: string;
  workflowName: string;
  subject: { type: string; id: string };
  idempotencyKey: string;
  context?: Record<string, string | number | boolean | null>;
}

export interface CreateDispatchRequestResult {
  request: WorkflowDispatchRequest;
  reused: boolean;
}

/**
 * Create the dispatch request for a product-owned idempotency key, or reuse
 * the existing one. The unique constraint on (tenant_id, idempotency_key)
 * guarantees one ledger row per product work handoff.
 */
export async function createOrReuseDispatchRequest(
  client: WorkflowLedgerClient,
  input: CreateDispatchRequestInput,
): Promise<CreateDispatchRequestResult> {
  const insertRow = {
    tenant_id: input.tenantId,
    product_area: input.productArea,
    workflow_name: input.workflowName,
    subject_type: input.subject.type,
    subject_id: input.subject.id,
    idempotency_key: input.idempotencyKey,
    schema_version: 1,
    status: "pending" as const,
    context: input.context ?? {},
  };

  const inserted = await client
    .from(LEDGER_TABLE)
    .upsert(insertRow, {
      onConflict: "tenant_id,idempotency_key",
      ignoreDuplicates: true,
    })
    .select()
    .maybeSingle();

  if (inserted.error) {
    throw new Error(
      `workflow_dispatch_request_create_failed: ${inserted.error.message}`,
    );
  }

  if (inserted.data) {
    return {
      request: mapWorkflowDispatchRequestRow(
        inserted.data as WorkflowDispatchRequestRow,
      ),
      reused: false,
    };
  }

  const existing = await client
    .from(LEDGER_TABLE)
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("idempotency_key", input.idempotencyKey)
    .single();

  if (existing.error || !existing.data) {
    throw new Error(
      `workflow_dispatch_request_lookup_failed: ${existing.error?.message ?? "missing row"}`,
    );
  }

  return {
    request: mapWorkflowDispatchRequestRow(
      existing.data as WorkflowDispatchRequestRow,
    ),
    reused: true,
  };
}

interface RecordOutcomeInput {
  request: WorkflowDispatchRequest;
  result: WorkflowDispatchResult;
  now?: Date;
}

async function recordDispatchOutcome(
  client: WorkflowLedgerClient,
  { request, result, now = new Date() }: RecordOutcomeInput,
): Promise<WorkflowDispatchRequest> {
  const attempts = request.dispatchAttempts + 1;

  const patch = result.dispatched
    ? {
        status: "dispatched" as const,
        dispatch_attempts: attempts,
        event_ids: result.eventIds,
        dispatched_at: now.toISOString(),
        last_error_code: null,
        last_error_message: null,
      }
    : {
        status: "failed" as const,
        dispatch_attempts: attempts,
        last_error_code: "workflow_dispatch_failed",
        last_error_message: result.error,
        next_attempt_at: new Date(
          now.getTime() + RETRY_BACKOFF_MS * attempts,
        ).toISOString(),
      };

  const updated = await client
    .from(LEDGER_TABLE)
    .update(patch)
    .eq("id", request.id)
    .in("status", ["pending", "failed"])
    .select()
    .maybeSingle();

  if (updated.error) {
    throw new Error(
      `workflow_dispatch_request_update_failed: ${updated.error.message}`,
    );
  }

  if (updated.data) {
    return mapWorkflowDispatchRequestRow(
      updated.data as WorkflowDispatchRequestRow,
    );
  }

  // Another concurrent handoff already moved the row out of pending/failed
  // (for example immediate dispatch vs recovery scan). Never downgrade
  // dispatched to failed via last-writer-wins.
  const existing = await client
    .from(LEDGER_TABLE)
    .select("*")
    .eq("id", request.id)
    .single();

  if (existing.error || !existing.data) {
    throw new Error(
      `workflow_dispatch_request_update_failed: ${existing.error?.message ?? "missing row"}`,
    );
  }

  return mapWorkflowDispatchRequestRow(
    existing.data as WorkflowDispatchRequestRow,
  );
}

export type WorkflowDispatchOutcome =
  | "dispatched"
  | "failed"
  | "already_dispatched";

export interface RequestWorkflowDispatchResult {
  outcome: WorkflowDispatchOutcome;
  request: WorkflowDispatchRequest;
  reused: boolean;
  error: string | null;
}

export interface RequestWorkflowDispatchDeps {
  client: WorkflowLedgerClient;
  dispatcher?: (
    input: WorkflowDispatchInput,
  ) => Promise<WorkflowDispatchResult>;
}

export interface DispatchLedgerRequestResult {
  outcome: "dispatched" | "failed";
  request: WorkflowDispatchRequest;
  error: string | null;
}

/**
 * Hand an existing ledger request to workflow orchestration and record the
 * outcome. Used for immediate handoffs and by the dispatch recovery scan;
 * the event envelope is rebuilt from the durable ledger row.
 */
export async function dispatchLedgerRequest(
  deps: RequestWorkflowDispatchDeps,
  request: WorkflowDispatchRequest,
): Promise<DispatchLedgerRequestResult> {
  const dispatcher = deps.dispatcher ?? dispatchWorkflowEvent;

  const envelopeCandidate: WorkflowEventEnvelope = {
    tenantId: request.tenantId,
    workflowName: request.workflowName,
    schemaVersion: 1,
    subject: request.subject,
    dispatchRequestId: request.id,
    ...(Object.keys(request.context).length > 0
      ? { context: request.context }
      : {}),
  };

  const parsedEnvelope =
    workflowEventEnvelopeSchema.safeParse(envelopeCandidate);

  if (!parsedEnvelope.success) {
    const error = envelopeInvalidMessage(parsedEnvelope.error);

    const failed = await recordDispatchOutcome(deps.client, {
      request,
      result: { dispatched: false, eventIds: [], error },
    });

    return { outcome: "failed", request: failed, error };
  }

  const result = await dispatcher({
    name: request.workflowName,
    envelope: parsedEnvelope.data,
    dedupeId: `${request.workflowName}:${request.id}`,
  });

  const updated = await recordDispatchOutcome(deps.client, {
    request,
    result,
  });

  const outcome: DispatchLedgerRequestResult["outcome"] =
    updated.status === "dispatched" ? "dispatched" : "failed";

  return {
    outcome,
    request: updated,
    error: outcome === "dispatched" ? null : result.error,
  };
}

/**
 * The stable dispatch ledger interface: create or reuse the product-owned
 * dispatch request, attempt the immediate workflow handoff, and record the
 * outcome durably. A failed handoff stays recoverable by the dispatch
 * recovery scan; an already dispatched request is never re-sent. Sensitive
 * context is rejected before it can be persisted to the ledger.
 */
export async function requestWorkflowDispatch(
  deps: RequestWorkflowDispatchDeps,
  input: CreateDispatchRequestInput,
): Promise<RequestWorkflowDispatchResult> {
  const candidate: WorkflowEventEnvelope = {
    tenantId: input.tenantId,
    workflowName: input.workflowName,
    schemaVersion: 1,
    subject: input.subject,
    ...(input.context ? { context: input.context } : {}),
  };
  const parsedCandidate = workflowEventEnvelopeSchema.safeParse(candidate);

  if (!parsedCandidate.success) {
    const error = envelopeInvalidMessage(parsedCandidate.error);

    // Record the attempted handoff durably, but never persist the
    // rejected context payload.
    const { request, reused } = await createOrReuseDispatchRequest(
      deps.client,
      { ...input, context: {} },
    );

    if (request.status === "dispatched") {
      return { outcome: "already_dispatched", request, reused, error: null };
    }

    const failed = await recordDispatchOutcome(deps.client, {
      request,
      result: { dispatched: false, eventIds: [], error },
    });

    return { outcome: "failed", request: failed, reused, error };
  }

  const { request, reused } = await createOrReuseDispatchRequest(
    deps.client,
    input,
  );

  if (request.status === "dispatched") {
    return { outcome: "already_dispatched", request, reused, error: null };
  }

  const result = await dispatchLedgerRequest(deps, request);

  return {
    outcome: result.outcome,
    request: result.request,
    reused,
    error: result.error,
  };
}
