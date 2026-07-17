import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOrReuseDispatchRequest,
  dispatchLedgerRequest,
  mapWorkflowDispatchRequestRow,
  requestWorkflowDispatch,
  type WorkflowDispatchRequest,
  type WorkflowDispatchRequestRow,
} from "../../src/workflows/ledger";

/**
 * Interface tests for the Workflow Dispatch Ledger. The ledger is driven
 * through hand-built chainable Supabase fakes injected via the deps seam —
 * no module mocking — so every assertion pins observable behavior of the
 * exported interface: idempotent upsert, dispatch outcome recording, and
 * the never-downgrade concurrency guard.
 */

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const REQUEST_ID = "33333333-3333-4333-8333-333333333333";

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

function ledgerRequest(
  overrides: Partial<WorkflowDispatchRequest> = {},
): WorkflowDispatchRequest {
  return {
    id: REQUEST_ID,
    tenantId: TENANT_ID,
    productArea: "donations",
    workflowName: "donations/saga.recovery.requested",
    subject: { type: "donation_saga_outbox", id: "outbox-1" },
    idempotencyKey: "donation-saga/outbox-1",
    schemaVersion: 1,
    status: "pending",
    dispatchAttempts: 0,
    nextAttemptAt: "2026-06-11T00:00:00.000Z",
    lastErrorCode: null,
    lastErrorMessage: null,
    eventIds: [],
    context: {},
    dispatchedAt: null,
    deadLetterAt: null,
    createdAt: "2026-06-11T00:00:00.000Z",
    updatedAt: "2026-06-11T00:00:00.000Z",
    ...overrides,
  };
}

interface QueryResult {
  data: WorkflowDispatchRequestRow | null;
  error: { message: string } | null;
}

function queryResult(
  data: WorkflowDispatchRequestRow | null = null,
  error: { message: string } | null = null,
): QueryResult {
  return { data, error };
}

interface LedgerFakeOptions {
  upsertResult?: QueryResult;
  updateResults?: QueryResult[];
  singleResults?: QueryResult[];
}

/**
 * Chainable fake for the admin Supabase client, supporting the exact call
 * chains the ledger uses:
 *   from().upsert().select().maybeSingle()
 *   from().select("*").eq()...eq().single()
 *   from().update().eq().in().select().maybeSingle()
 */
function createLedgerClientFake(options: LedgerFakeOptions = {}) {
  const upsertMaybeSingle = vi
    .fn()
    .mockResolvedValue(options.upsertResult ?? queryResult());
  const upsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ maybeSingle: upsertMaybeSingle }),
  });

  const updateQueue = [...(options.updateResults ?? [])];
  const updateMaybeSingle = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(updateQueue.shift() ?? queryResult()),
    );
  const updateIn = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ maybeSingle: updateMaybeSingle }),
  });
  const updateEq = vi.fn().mockReturnValue({ in: updateIn });
  const update = vi.fn().mockReturnValue({ eq: updateEq });

  const singleQueue = [...(options.singleResults ?? [])];
  const single = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(singleQueue.shift() ?? queryResult()),
    );
  const selectEq = vi.fn();
  selectEq.mockReturnValue({ eq: selectEq, single });
  const select = vi.fn().mockReturnValue({ eq: selectEq });

  const from = vi.fn().mockReturnValue({ upsert, select, update });

  return {
    client: { from } as never,
    from,
    upsert,
    update,
    updateEq,
    updateIn,
    select,
    selectEq,
    single,
  };
}

function createInput(overrides = {}) {
  return {
    tenantId: TENANT_ID,
    productArea: "donations",
    workflowName: "donations/saga.recovery.requested",
    subject: { type: "donation_saga_outbox", id: "outbox-1" },
    idempotencyKey: "donation-saga/outbox-1",
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Workflow Dispatch Ledger row mapping", () => {
  it("maps the persisted snake_case row to the camelCase dispatch request", () => {
    const request = mapWorkflowDispatchRequestRow(
      ledgerRow({
        status: "failed",
        dispatch_attempts: 3,
        last_error_code: "workflow_dispatch_failed",
        last_error_message: "connect ECONNREFUSED",
        event_ids: ["evt-1"],
        context: { productArea: "donations" },
        dispatched_at: "2026-06-11T00:01:00.000Z",
      }),
    );

    expect(request).toEqual(
      ledgerRequest({
        status: "failed",
        dispatchAttempts: 3,
        lastErrorCode: "workflow_dispatch_failed",
        lastErrorMessage: "connect ECONNREFUSED",
        eventIds: ["evt-1"],
        context: { productArea: "donations" },
        dispatchedAt: "2026-06-11T00:01:00.000Z",
      }),
    );
  });

  it("defaults missing event ids and context so consumers never see null", () => {
    const row = {
      ...ledgerRow(),
      event_ids: null,
      context: null,
    } as unknown as WorkflowDispatchRequestRow;

    const request = mapWorkflowDispatchRequestRow(row);

    expect(request.eventIds).toEqual([]);
    expect(request.context).toEqual({});
  });
});

describe("Workflow Dispatch Ledger idempotent upsert", () => {
  it("creates one pending dispatch request keyed by tenant and idempotency key", async () => {
    const fake = createLedgerClientFake({
      upsertResult: queryResult(ledgerRow()),
    });

    const result = await createOrReuseDispatchRequest(
      fake.client,
      createInput(),
    );

    expect(result.reused).toBe(false);
    expect(result.request.id).toBe(REQUEST_ID);
    expect(result.request.status).toBe("pending");
    expect(fake.from).toHaveBeenCalledWith("workflow_dispatch_requests");
    expect(fake.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: TENANT_ID,
        idempotency_key: "donation-saga/outbox-1",
        schema_version: 1,
        status: "pending",
        context: {},
      }),
      { onConflict: "tenant_id,idempotency_key", ignoreDuplicates: true },
    );
  });

  it("reuses the existing dispatch request instead of duplicating it", async () => {
    const fake = createLedgerClientFake({
      upsertResult: queryResult(null),
      singleResults: [
        queryResult(ledgerRow({ status: "failed", dispatch_attempts: 2 })),
      ],
    });

    const result = await createOrReuseDispatchRequest(
      fake.client,
      createInput(),
    );

    expect(result.reused).toBe(true);
    expect(result.request.status).toBe("failed");
    expect(result.request.dispatchAttempts).toBe(2);
    expect(fake.upsert).toHaveBeenCalledTimes(1);
    expect(fake.selectEq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(fake.selectEq).toHaveBeenCalledWith(
      "idempotency_key",
      "donation-saga/outbox-1",
    );
  });

  it("surfaces upsert failures as workflow_dispatch_request_create_failed", async () => {
    const fake = createLedgerClientFake({
      upsertResult: queryResult(null, { message: "permission denied" }),
    });

    await expect(
      createOrReuseDispatchRequest(fake.client, createInput()),
    ).rejects.toThrow(
      "workflow_dispatch_request_create_failed: permission denied",
    );
  });

  it("surfaces a missing reuse row as workflow_dispatch_request_lookup_failed", async () => {
    const fake = createLedgerClientFake({
      upsertResult: queryResult(null),
      singleResults: [queryResult(null)],
    });

    await expect(
      createOrReuseDispatchRequest(fake.client, createInput()),
    ).rejects.toThrow("workflow_dispatch_request_lookup_failed");
  });
});

describe("Workflow Dispatch Ledger dispatch outcome recording", () => {
  it("records a dispatched outcome with incremented attempts and cleared error fields", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-11T12:00:00.000Z"));

    const fake = createLedgerClientFake({
      updateResults: [
        queryResult(ledgerRow({ status: "dispatched", dispatch_attempts: 3 })),
      ],
    });
    const dispatcher = vi.fn().mockResolvedValue({
      dispatched: true,
      eventIds: ["evt-9"],
      error: null,
    });

    const result = await dispatchLedgerRequest(
      { client: fake.client, dispatcher },
      ledgerRequest({ dispatchAttempts: 2, status: "failed" }),
    );

    expect(result.outcome).toBe("dispatched");
    expect(result.error).toBeNull();
    expect(dispatcher).toHaveBeenCalledWith({
      name: "donations/saga.recovery.requested",
      dedupeId: `donations/saga.recovery.requested:${REQUEST_ID}`,
      envelope: expect.objectContaining({
        tenantId: TENANT_ID,
        dispatchRequestId: REQUEST_ID,
        subject: { type: "donation_saga_outbox", id: "outbox-1" },
      }),
    });
    expect(fake.update).toHaveBeenCalledWith({
      status: "dispatched",
      dispatch_attempts: 3,
      event_ids: ["evt-9"],
      dispatched_at: "2026-06-11T12:00:00.000Z",
      last_error_code: null,
      last_error_message: null,
    });
    expect(fake.updateEq).toHaveBeenCalledWith("id", REQUEST_ID);
  });

  it("records a failed dispatch outcome with linear backoff so the recovery scan can retry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-11T12:00:00.000Z"));

    const fake = createLedgerClientFake({
      updateResults: [
        queryResult(ledgerRow({ status: "failed", dispatch_attempts: 3 })),
      ],
    });
    const dispatcher = vi.fn().mockResolvedValue({
      dispatched: false,
      eventIds: [],
      error: "connect ECONNREFUSED",
    });

    const result = await dispatchLedgerRequest(
      { client: fake.client, dispatcher },
      ledgerRequest({ dispatchAttempts: 2, status: "failed" }),
    );

    expect(result.outcome).toBe("failed");
    expect(result.error).toBe("connect ECONNREFUSED");
    expect(result.request.status).toBe("failed");
    // Third attempt backs off 3 * 60s from now.
    expect(fake.update).toHaveBeenCalledWith({
      status: "failed",
      dispatch_attempts: 3,
      last_error_code: "workflow_dispatch_failed",
      last_error_message: "connect ECONNREFUSED",
      next_attempt_at: "2026-06-11T12:03:00.000Z",
    });
  });

  it("never downgrades a dispatched request when a late failure recording loses the race", async () => {
    const dispatchedRow = ledgerRow({
      status: "dispatched",
      dispatch_attempts: 1,
      event_ids: ["evt-winner"],
    });
    // The guarded update matches no row (status already dispatched); the
    // ledger re-reads and reports the winning dispatched state instead of
    // last-writer-wins downgrading it to failed.
    const fake = createLedgerClientFake({
      updateResults: [queryResult(null)],
      singleResults: [queryResult(dispatchedRow)],
    });
    const dispatcher = vi.fn().mockResolvedValue({
      dispatched: false,
      eventIds: [],
      error: "connect ECONNREFUSED",
    });

    const result = await dispatchLedgerRequest(
      { client: fake.client, dispatcher },
      ledgerRequest(),
    );

    expect(result.outcome).toBe("dispatched");
    expect(result.error).toBeNull();
    expect(result.request.status).toBe("dispatched");
    expect(result.request.eventIds).toEqual(["evt-winner"]);
    expect(fake.updateEq).toHaveBeenCalledWith("id", REQUEST_ID);
    expect(fake.updateIn).toHaveBeenCalledWith("status", ["pending", "failed"]);
  });

  it("refuses the handoff when the persisted context fails envelope validation", async () => {
    const fake = createLedgerClientFake({
      updateResults: [queryResult(ledgerRow({ status: "failed" }))],
    });
    const dispatcher = vi.fn();

    const result = await dispatchLedgerRequest(
      { client: fake.client, dispatcher },
      ledgerRequest({ context: { rawPayload: "provider payload" } }),
    );

    expect(result.outcome).toBe("failed");
    expect(result.error).toMatch(/workflow_envelope_invalid/);
    expect(dispatcher).not.toHaveBeenCalled();
    expect(fake.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        last_error_code: "workflow_dispatch_failed",
      }),
    );
  });

  it("surfaces outcome update failures as workflow_dispatch_request_update_failed", async () => {
    const fake = createLedgerClientFake({
      updateResults: [queryResult(null, { message: "deadlock detected" })],
    });
    const dispatcher = vi.fn().mockResolvedValue({
      dispatched: true,
      eventIds: ["evt-1"],
      error: null,
    });

    await expect(
      dispatchLedgerRequest(
        { client: fake.client, dispatcher },
        ledgerRequest(),
      ),
    ).rejects.toThrow(
      "workflow_dispatch_request_update_failed: deadlock detected",
    );
  });

  it("surfaces a vanished ledger row as workflow_dispatch_request_update_failed", async () => {
    const fake = createLedgerClientFake({
      updateResults: [queryResult(null)],
      singleResults: [queryResult(null)],
    });
    const dispatcher = vi.fn().mockResolvedValue({
      dispatched: true,
      eventIds: ["evt-1"],
      error: null,
    });

    await expect(
      dispatchLedgerRequest(
        { client: fake.client, dispatcher },
        ledgerRequest(),
      ),
    ).rejects.toThrow("workflow_dispatch_request_update_failed: missing row");
  });
});

describe("Workflow Dispatch Ledger full handoff", () => {
  it("never re-sends a request that was already dispatched", async () => {
    const fake = createLedgerClientFake({
      upsertResult: queryResult(null),
      singleResults: [queryResult(ledgerRow({ status: "dispatched" }))],
    });
    const dispatcher = vi.fn();

    const result = await requestWorkflowDispatch(
      { client: fake.client, dispatcher },
      createInput(),
    );

    expect(result.outcome).toBe("already_dispatched");
    expect(result.reused).toBe(true);
    expect(result.error).toBeNull();
    expect(dispatcher).not.toHaveBeenCalled();
    expect(fake.update).not.toHaveBeenCalled();
  });

  it("records the failed handoff durably without persisting rejected sensitive context", async () => {
    const fake = createLedgerClientFake({
      upsertResult: queryResult(ledgerRow()),
      updateResults: [queryResult(ledgerRow({ status: "failed" }))],
    });
    const dispatcher = vi.fn();

    const result = await requestWorkflowDispatch(
      { client: fake.client, dispatcher },
      createInput({ context: { cardNumber: "4242424242424242" } }),
    );

    expect(result.outcome).toBe("failed");
    expect(result.error).toMatch(/workflow_envelope_invalid/);
    expect(dispatcher).not.toHaveBeenCalled();
    // The rejected context never reaches the durable ledger row.
    expect(fake.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ context: {} }),
      expect.anything(),
    );
    expect(fake.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        last_error_code: "workflow_dispatch_failed",
      }),
    );
  });

  it("reports already_dispatched for rejected context when the reused request already dispatched", async () => {
    const fake = createLedgerClientFake({
      upsertResult: queryResult(null),
      singleResults: [queryResult(ledgerRow({ status: "dispatched" }))],
    });
    const dispatcher = vi.fn();

    const result = await requestWorkflowDispatch(
      { client: fake.client, dispatcher },
      createInput({ context: { emailBody: "full body" } }),
    );

    expect(result.outcome).toBe("already_dispatched");
    expect(result.error).toBeNull();
    expect(dispatcher).not.toHaveBeenCalled();
    expect(fake.update).not.toHaveBeenCalled();
  });
});
