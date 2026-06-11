import {
  dispatchWorkflowEvent,
  type WorkflowDispatchInput,
  type WorkflowDispatchResult,
} from "./dispatch";
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
    .select()
    .single();

  if (updated.error || !updated.data) {
    throw new Error(
      `workflow_dispatch_request_update_failed: ${updated.error?.message ?? "missing row"}`,
    );
  }

  return mapWorkflowDispatchRequestRow(
    updated.data as WorkflowDispatchRequestRow,
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

/**
 * The stable dispatch ledger interface: create or reuse the product-owned
 * dispatch request, attempt the immediate workflow handoff, and record the
 * outcome durably. A failed handoff stays recoverable by the dispatch
 * recovery scan; an already dispatched request is never re-sent.
 */
export async function requestWorkflowDispatch(
  deps: RequestWorkflowDispatchDeps,
  input: CreateDispatchRequestInput,
): Promise<RequestWorkflowDispatchResult> {
  const dispatcher = deps.dispatcher ?? dispatchWorkflowEvent;

  const { request, reused } = await createOrReuseDispatchRequest(
    deps.client,
    input,
  );

  if (request.status === "dispatched") {
    return { outcome: "already_dispatched", request, reused, error: null };
  }

  const envelopeCandidate: WorkflowEventEnvelope = {
    tenantId: input.tenantId,
    workflowName: input.workflowName,
    schemaVersion: 1,
    subject: input.subject,
    dispatchRequestId: request.id,
    ...(input.context ? { context: input.context } : {}),
  };

  const parsedEnvelope =
    workflowEventEnvelopeSchema.safeParse(envelopeCandidate);

  if (!parsedEnvelope.success) {
    const invalidPaths = parsedEnvelope.error.issues
      .map((issue) => issue.path.join(".") || issue.code)
      .join(", ");
    const error = `workflow_envelope_invalid: ${invalidPaths}`;

    const failed = await recordDispatchOutcome(deps.client, {
      request,
      result: { dispatched: false, eventIds: [], error },
    });

    return { outcome: "failed", request: failed, reused, error };
  }

  const result = await dispatcher({
    name: input.workflowName,
    envelope: parsedEnvelope.data,
    dedupeId: `${input.workflowName}:${request.id}`,
  });

  const updated = await recordDispatchOutcome(deps.client, {
    request,
    result,
  });

  return {
    outcome: result.dispatched ? "dispatched" : "failed",
    request: updated,
    reused,
    error: result.error,
  };
}
