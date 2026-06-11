import {
  mapWorkflowDispatchRequestRow,
  type WorkflowDispatchRequestRow,
} from "./ledger";

import type { getAdminClient } from "@asym/database/supabase/admin";

type SummariesClient = NonNullable<ReturnType<typeof getAdminClient>["client"]>;

export type WorkflowSummaryState =
  | "dispatching"
  | "processing"
  | "retrying"
  | "completed"
  | "failed"
  | "dead_letter";

/**
 * Product-owned workflow run summary. The latest useful status for staff —
 * never raw Inngest step logs, secrets, provider internals, signed URLs,
 * stack traces, or cross-tenant details. Inngest keeps the detailed
 * orchestration timeline; product records stay authoritative.
 */
export interface WorkflowRunSummary {
  dispatchRequestId: string;
  productArea: string;
  workflowName: string;
  subjectType: string;
  subjectId: string;
  state: WorkflowSummaryState;
  attempts: number;
  /** Safe machine code only (e.g. workflow_dispatch_failed); never raw text. */
  lastErrorCode: string | null;
  createdAt: string;
  dispatchedAt: string | null;
}

function dispatchStateFor(
  row: WorkflowDispatchRequestRow,
): WorkflowSummaryState {
  if (row.status === "dead_letter") return "dead_letter";
  if (row.status === "failed") return "retrying";
  if (row.status === "pending") return "dispatching";
  return "processing";
}

type OutcomeBySubjectId = Map<string, WorkflowSummaryState>;

async function loadDonationSagaOutcomes(
  client: SummariesClient,
  tenantId: string,
  subjectIds: string[],
): Promise<OutcomeBySubjectId> {
  const outcomes: OutcomeBySubjectId = new Map();
  if (subjectIds.length === 0) return outcomes;

  const { data } = await client
    .from("donation_saga_outbox")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .in("id", subjectIds);

  for (const row of data ?? []) {
    const status = String(row.status);
    if (status === "completed") outcomes.set(String(row.id), "completed");
    else if (status === "dead_letter")
      outcomes.set(String(row.id), "dead_letter");
    else if (status === "failed") outcomes.set(String(row.id), "retrying");
    else outcomes.set(String(row.id), "processing");
  }

  return outcomes;
}

async function loadStripeEventOutcomes(
  client: SummariesClient,
  tenantId: string,
  subjectIds: string[],
): Promise<OutcomeBySubjectId> {
  const outcomes: OutcomeBySubjectId = new Map();
  if (subjectIds.length === 0) return outcomes;

  const { data } = await client
    .from("stripe_raw_events")
    .select("id, processing_status")
    .eq("tenant_id", tenantId)
    .in("id", subjectIds);

  for (const row of data ?? []) {
    const status = String(row.processing_status);
    if (status === "processed" || status === "ignored") {
      outcomes.set(String(row.id), "completed");
    } else if (status === "dead_letter") {
      outcomes.set(String(row.id), "dead_letter");
    } else if (status === "failed") {
      outcomes.set(String(row.id), "retrying");
    } else {
      outcomes.set(String(row.id), "processing");
    }
  }

  return outcomes;
}

async function loadInboundEmailOutcomes(
  client: SummariesClient,
  tenantId: string,
  subjectIds: string[],
): Promise<OutcomeBySubjectId> {
  const outcomes: OutcomeBySubjectId = new Map();
  if (subjectIds.length === 0) return outcomes;

  const { data } = await client
    .from("email_inbound_messages")
    .select("id, body_retrieval_status, support_message_id")
    .eq("tenant_id", tenantId)
    .in("id", subjectIds);

  for (const row of data ?? []) {
    if (row.support_message_id) {
      outcomes.set(String(row.id), "completed");
    } else if (String(row.body_retrieval_status) === "failed") {
      outcomes.set(String(row.id), "failed");
    } else {
      outcomes.set(String(row.id), "processing");
    }
  }

  return outcomes;
}

export interface SummarizeWorkflowRunsOptions {
  limit?: number;
}

/**
 * Workflow Run Summary Projector: project the tenant's recent dispatch
 * requests into staff-facing summaries. Handoff state comes from the
 * dispatch ledger; run outcomes come from the authoritative product records
 * (donation saga rows, stored Stripe events, inbound email records) — never
 * from a mirror of Inngest step logs.
 */
export async function summarizeWorkflowRuns(
  client: SummariesClient,
  tenantId: string,
  options: SummarizeWorkflowRunsOptions = {},
): Promise<WorkflowRunSummary[]> {
  const limit = options.limit ?? 50;

  const { data, error } = await client
    .from("workflow_dispatch_requests")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`workflow_summaries_failed: ${error.message}`);
  }

  const rows = (data ?? []) as WorkflowDispatchRequestRow[];

  const subjectIdsByType = new Map<string, string[]>();
  for (const row of rows) {
    if (row.status !== "dispatched") continue;
    const list = subjectIdsByType.get(row.subject_type) ?? [];
    list.push(row.subject_id);
    subjectIdsByType.set(row.subject_type, list);
  }

  const [sagaOutcomes, stripeOutcomes, inboundOutcomes] = await Promise.all([
    loadDonationSagaOutcomes(
      client,
      tenantId,
      subjectIdsByType.get("donation_saga_outbox") ?? [],
    ),
    loadStripeEventOutcomes(
      client,
      tenantId,
      subjectIdsByType.get("stripe_raw_event") ?? [],
    ),
    loadInboundEmailOutcomes(
      client,
      tenantId,
      subjectIdsByType.get("email_inbound_message") ?? [],
    ),
  ]);

  return rows.map((row) => {
    const request = mapWorkflowDispatchRequestRow(row);
    let state = dispatchStateFor(row);

    if (row.status === "dispatched") {
      const outcome =
        row.subject_type === "donation_saga_outbox"
          ? sagaOutcomes.get(row.subject_id)
          : row.subject_type === "stripe_raw_event"
            ? stripeOutcomes.get(row.subject_id)
            : row.subject_type === "email_inbound_message"
              ? inboundOutcomes.get(row.subject_id)
              : undefined;
      if (outcome) state = outcome;
    }

    return {
      dispatchRequestId: request.id,
      productArea: request.productArea,
      workflowName: request.workflowName,
      subjectType: request.subject.type,
      subjectId: request.subject.id,
      state,
      attempts: request.dispatchAttempts,
      lastErrorCode: request.lastErrorCode,
      createdAt: request.createdAt,
      dispatchedAt: request.dispatchedAt,
    };
  });
}
