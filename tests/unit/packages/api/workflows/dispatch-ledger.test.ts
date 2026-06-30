import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import { workflowEventEnvelopeSchema } from "../../../../../packages/api/src/workflows/events";
import {
  createOrReuseDispatchRequest,
  requestWorkflowDispatch,
  type WorkflowDispatchRequestRow,
} from "../../../../../packages/api/src/workflows/ledger";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const REQUEST_ID = "33333333-3333-4333-8333-333333333333";

function baseEnvelope() {
  return {
    tenantId: TENANT_ID,
    workflowName: "donations/saga.recovery.requested",
    schemaVersion: 1 as const,
    subject: { type: "donation_saga_outbox", id: "outbox-1" },
  };
}

function ledgerRow(
  overrides: Partial<WorkflowDispatchRequestRow> = {},
): WorkflowDispatchRequestRow {
  return {
    id: REQUEST_ID,
    tenant_id: TENANT_ID,
    product_area: "donations",
    workflow_name: "donations/saga.recovery.requested",
    subject_type: "donation_saga_outbox",
    subject_id: "outbox-1",
    idempotency_key: "donation-saga/outbox-1",
    schema_version: 1,
    status: "pending",
    dispatch_attempts: 0,
    next_attempt_at: "2026-06-11T00:00:00.000Z",
    last_error_code: null,
    last_error_message: null,
    event_ids: [],
    context: {},
    dispatched_at: null,
    dead_letter_at: null,
    created_at: "2026-06-11T00:00:00.000Z",
    updated_at: "2026-06-11T00:00:00.000Z",
    ...overrides,
  };
}

interface LedgerClientMockOptions {
  upsertData?: WorkflowDispatchRequestRow | null;
  existingData?: WorkflowDispatchRequestRow | null;
  updateData?: WorkflowDispatchRequestRow | null;
}

function createLedgerClientMock(options: LedgerClientMockOptions) {
  const upsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: options.upsertData ?? null, error: null }),
    }),
  });

  const existingSingle = vi
    .fn()
    .mockResolvedValue({ data: options.existingData ?? null, error: null });
  const select = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ single: existingSingle }),
    }),
  });

  const updateSingle = vi
    .fn()
    .mockResolvedValue({ data: options.updateData ?? null, error: null });
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: updateSingle }),
    }),
  });

  const from = vi.fn().mockReturnValue({ upsert, select, update });

  return { client: { from } as never, from, upsert, select, update };
}

describe("workflow event envelope context safety (#288)", () => {
  it("accepts bounded safe routing context", () => {
    const parsed = workflowEventEnvelopeSchema.safeParse({
      ...baseEnvelope(),
      dispatchRequestId: REQUEST_ID,
      context: { productArea: "donations", attempt: 2, replayed: false },
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects context keys that look like sensitive content", () => {
    for (const key of [
      "emailBody",
      "renderedHtml",
      "stripeClientSecret",
      "bankAccountNumber",
      "rawPayload",
      "attachmentUrl",
    ]) {
      const parsed = workflowEventEnvelopeSchema.safeParse({
        ...baseEnvelope(),
        context: { [key]: "value" },
      });

      expect(parsed.success, `expected ${key} to be rejected`).toBe(false);
    }
  });

  it("rejects oversized context values that could smuggle record snapshots", () => {
    const parsed = workflowEventEnvelopeSchema.safeParse({
      ...baseEnvelope(),
      context: { note: "x".repeat(400) },
    });

    expect(parsed.success).toBe(false);
  });
});

describe("workflow dispatch ledger (#288)", () => {
  it("creates a new dispatch request when none exists for the idempotency key", async () => {
    const row = ledgerRow();
    const mock = createLedgerClientMock({ upsertData: row });

    const result = await createOrReuseDispatchRequest(mock.client, {
      tenantId: TENANT_ID,
      productArea: "donations",
      workflowName: "donations/saga.recovery.requested",
      subject: { type: "donation_saga_outbox", id: "outbox-1" },
      idempotencyKey: "donation-saga/outbox-1",
    });

    expect(result.reused).toBe(false);
    expect(result.request.id).toBe(REQUEST_ID);
    expect(result.request.status).toBe("pending");
    expect(mock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: TENANT_ID,
        product_area: "donations",
        idempotency_key: "donation-saga/outbox-1",
      }),
      expect.objectContaining({
        onConflict: "tenant_id,idempotency_key",
        ignoreDuplicates: true,
      }),
    );
  });

  it("reuses the existing dispatch request for a repeated idempotency key", async () => {
    const existing = ledgerRow({ status: "failed", dispatch_attempts: 2 });
    const mock = createLedgerClientMock({
      upsertData: null,
      existingData: existing,
    });

    const result = await createOrReuseDispatchRequest(mock.client, {
      tenantId: TENANT_ID,
      productArea: "donations",
      workflowName: "donations/saga.recovery.requested",
      subject: { type: "donation_saga_outbox", id: "outbox-1" },
      idempotencyKey: "donation-saga/outbox-1",
    });

    expect(result.reused).toBe(true);
    expect(result.request.status).toBe("failed");
    expect(result.request.dispatchAttempts).toBe(2);
  });

  it("records a successful immediate dispatch on the ledger row", async () => {
    const row = ledgerRow();
    const mock = createLedgerClientMock({
      upsertData: row,
      updateData: ledgerRow({ status: "dispatched" }),
    });
    const dispatcher = vi.fn().mockResolvedValue({
      dispatched: true,
      eventIds: ["evt-9"],
      error: null,
    });

    const result = await requestWorkflowDispatch(
      { client: mock.client, dispatcher },
      {
        tenantId: TENANT_ID,
        productArea: "donations",
        workflowName: "donations/saga.recovery.requested",
        subject: { type: "donation_saga_outbox", id: "outbox-1" },
        idempotencyKey: "donation-saga/outbox-1",
      },
    );

    expect(result.outcome).toBe("dispatched");
    expect(dispatcher).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "donations/saga.recovery.requested",
        dedupeId: `donations/saga.recovery.requested:${REQUEST_ID}`,
        envelope: expect.objectContaining({
          tenantId: TENANT_ID,
          dispatchRequestId: REQUEST_ID,
        }),
      }),
    );
    expect(mock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "dispatched",
        event_ids: ["evt-9"],
        dispatch_attempts: 1,
      }),
    );
  });

  it("records a failed immediate dispatch so a later scan can recover it", async () => {
    const row = ledgerRow();
    const mock = createLedgerClientMock({
      upsertData: row,
      updateData: ledgerRow({ status: "failed" }),
    });
    const dispatcher = vi.fn().mockResolvedValue({
      dispatched: false,
      eventIds: [],
      error: "connect ECONNREFUSED",
    });

    const result = await requestWorkflowDispatch(
      { client: mock.client, dispatcher },
      {
        tenantId: TENANT_ID,
        productArea: "donations",
        workflowName: "donations/saga.recovery.requested",
        subject: { type: "donation_saga_outbox", id: "outbox-1" },
        idempotencyKey: "donation-saga/outbox-1",
      },
    );

    expect(result.outcome).toBe("failed");
    expect(mock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        dispatch_attempts: 1,
        last_error_message: "connect ECONNREFUSED",
      }),
    );
  });

  it("does not re-send when the dispatch request was already dispatched", async () => {
    const dispatched = ledgerRow({ status: "dispatched" });
    const mock = createLedgerClientMock({
      upsertData: null,
      existingData: dispatched,
    });
    const dispatcher = vi.fn();

    const result = await requestWorkflowDispatch(
      { client: mock.client, dispatcher },
      {
        tenantId: TENANT_ID,
        productArea: "donations",
        workflowName: "donations/saga.recovery.requested",
        subject: { type: "donation_saga_outbox", id: "outbox-1" },
        idempotencyKey: "donation-saga/outbox-1",
      },
    );

    expect(result.outcome).toBe("already_dispatched");
    expect(dispatcher).not.toHaveBeenCalled();
    expect(mock.update).not.toHaveBeenCalled();
  });

  it("refuses dispatch when the envelope would carry sensitive context", async () => {
    const row = ledgerRow();
    const mock = createLedgerClientMock({
      upsertData: row,
      updateData: ledgerRow({ status: "failed" }),
    });
    const dispatcher = vi.fn();

    const result = await requestWorkflowDispatch(
      { client: mock.client, dispatcher },
      {
        tenantId: TENANT_ID,
        productArea: "donations",
        workflowName: "donations/saga.recovery.requested",
        subject: { type: "donation_saga_outbox", id: "outbox-1" },
        idempotencyKey: "donation-saga/outbox-1",
        context: { emailBody: "never put this in an event" },
      },
    );

    expect(result.outcome).toBe("failed");
    expect(dispatcher).not.toHaveBeenCalled();
    expect(result.error).toMatch(/workflow_envelope_invalid/);
  });
});

describe("workflow dispatch ledger migration", () => {
  const migration = readFileSync(
    new URL(
      "../../../../../supabase/migrations/20260611134500_workflow_dispatch_ledger.sql",
      import.meta.url,
    ),
    "utf8",
  );

  it("scopes dispatch request idempotency by tenant", () => {
    expect(migration).toMatch(/UNIQUE \(tenant_id, idempotency_key\)/);
    expect(migration).toMatch(
      /tenant_id UUID NOT NULL REFERENCES public\.tenants/,
    );
  });

  it("tracks handoff status, attempts, and recovery eligibility", () => {
    expect(migration).toMatch(
      /status IN \('pending', 'dispatched', 'failed', 'dead_letter'\)/,
    );
    expect(migration).toMatch(/dispatch_attempts INTEGER NOT NULL DEFAULT 0/);
    expect(migration).toMatch(
      /idx_workflow_dispatch_requests_recovery[\s\S]*WHERE status IN \('pending', 'failed'\)/,
    );
  });

  it("locks the ledger down to the service role", () => {
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(migration).toMatch(
      /REVOKE ALL ON TABLE public\.workflow_dispatch_requests FROM anon/,
    );
    expect(migration).toMatch(
      /REVOKE ALL ON TABLE public\.workflow_dispatch_requests FROM authenticated/,
    );
    expect(migration).toMatch(
      /GRANT ALL ON TABLE public\.workflow_dispatch_requests TO service_role/,
    );
  });
});
