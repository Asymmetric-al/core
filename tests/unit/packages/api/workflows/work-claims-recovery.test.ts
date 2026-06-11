import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  acquireWorkClaim,
  releaseWorkClaim,
} from "../../../../../packages/api/src/workflows/claims";
import type { WorkflowDispatchRequestRow } from "../../../../../packages/api/src/workflows/ledger";
import { runDispatchRecoveryScan } from "../../../../../packages/api/src/workflows/recovery";

const TENANT_A = "11111111-1111-4111-8111-111111111111";
const TENANT_B = "44444444-4444-4444-8444-444444444444";
const CLAIM_ID = "55555555-5555-4555-8555-555555555555";

function recoverableRow(
  overrides: Partial<WorkflowDispatchRequestRow> = {},
): WorkflowDispatchRequestRow {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    tenant_id: TENANT_A,
    product_area: "donations",
    workflow_name: "donations/saga.recovery.requested",
    subject_type: "donation_saga_outbox",
    subject_id: "outbox-1",
    idempotency_key: "donation-saga/outbox-1",
    schema_version: 1,
    status: "failed",
    dispatch_attempts: 1,
    next_attempt_at: "2026-06-11T00:00:00.000Z",
    last_error_code: "workflow_dispatch_failed",
    last_error_message: "connect ECONNREFUSED",
    event_ids: [],
    context: {},
    dispatched_at: null,
    dead_letter_at: null,
    created_at: "2026-06-11T00:00:00.000Z",
    updated_at: "2026-06-11T00:00:00.000Z",
    ...overrides,
  };
}

describe("product work claims (#289)", () => {
  it("acquires a claim for a tenant-scoped work item", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        acquired: true,
        claim_id: CLAIM_ID,
        expires_at: "2026-06-11T00:05:00.000Z",
      },
      error: null,
    });

    const result = await acquireWorkClaim({ rpc } as never, {
      tenantId: TENANT_A,
      subject: { type: "donation_saga_outbox", id: "outbox-1" },
      claimedBy: "dispatch-recovery-scan",
    });

    expect(result.acquired).toBe(true);
    expect(result.claimId).toBe(CLAIM_ID);
    expect(rpc).toHaveBeenCalledWith("acquire_workflow_work_claim", {
      p_tenant_id: TENANT_A,
      p_subject_type: "donation_saga_outbox",
      p_subject_id: "outbox-1",
      p_claimed_by: "dispatch-recovery-scan",
      p_ttl_seconds: 300,
    });
  });

  it("reports a duplicate attempt when an active claim already exists", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { acquired: false },
      error: null,
    });

    const result = await acquireWorkClaim({ rpc } as never, {
      tenantId: TENANT_A,
      subject: { type: "donation_saga_outbox", id: "outbox-1" },
      claimedBy: "manual-replay",
    });

    expect(result.acquired).toBe(false);
    expect(result.claimId).toBeNull();
  });

  it("releases an acquired claim", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });

    const released = await releaseWorkClaim({ rpc } as never, {
      claimId: CLAIM_ID,
    });

    expect(released).toBe(true);
    expect(rpc).toHaveBeenCalledWith("release_workflow_work_claim", {
      p_claim_id: CLAIM_ID,
      p_status: "released",
    });
  });
});

interface ScanClientOptions {
  rows: WorkflowDispatchRequestRow[];
  acquireResults: Array<{ acquired: boolean; claim_id?: string }>;
}

function createScanClientMock(options: ScanClientOptions) {
  const limit = vi.fn().mockResolvedValue({ data: options.rows, error: null });
  const order = vi.fn().mockReturnValue({ limit });
  const lte = vi.fn().mockReturnValue({ order });
  const inFilter = vi.fn().mockReturnValue({ lte });
  const select = vi.fn().mockReturnValue({ in: inFilter });

  const updateSingle = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve({
        data: recoverableRow({ status: "dispatched" }),
        error: null,
      }),
    );
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: updateSingle }),
    }),
  });

  const from = vi.fn().mockReturnValue({ select, update });

  const rpc = vi.fn();
  rpc.mockImplementation((fn: string) => {
    if (fn === "acquire_workflow_work_claim") {
      const next = options.acquireResults.shift() ?? {
        acquired: true,
        claim_id: CLAIM_ID,
      };
      return Promise.resolve({ data: next, error: null });
    }
    return Promise.resolve({ data: true, error: null });
  });

  return { client: { from, rpc } as never, from, update, rpc };
}

describe("dispatch recovery scan (#289)", () => {
  it("redispatches recoverable requests after acquiring a work claim", async () => {
    const row = recoverableRow();
    const mock = createScanClientMock({
      rows: [row],
      acquireResults: [{ acquired: true, claim_id: CLAIM_ID }],
    });
    const dispatcher = vi
      .fn()
      .mockResolvedValue({
        dispatched: true,
        eventIds: ["evt-2"],
        error: null,
      });

    const summary = await runDispatchRecoveryScan(
      { client: mock.client, dispatcher },
      { limit: 10 },
    );

    expect(summary.scanned).toBe(1);
    expect(summary.dispatched).toBe(1);
    expect(dispatcher).toHaveBeenCalledTimes(1);
    expect(mock.rpc).toHaveBeenCalledWith(
      "acquire_workflow_work_claim",
      expect.objectContaining({
        p_tenant_id: TENANT_A,
        p_subject_type: "donation_saga_outbox",
        p_subject_id: "outbox-1",
      }),
    );
    expect(mock.rpc).toHaveBeenCalledWith(
      "release_workflow_work_claim",
      expect.objectContaining({ p_claim_id: CLAIM_ID }),
    );
  });

  it("skips work items that already hold an active claim", async () => {
    const mock = createScanClientMock({
      rows: [recoverableRow()],
      acquireResults: [{ acquired: false }],
    });
    const dispatcher = vi.fn();

    const summary = await runDispatchRecoveryScan(
      { client: mock.client, dispatcher },
      { limit: 10 },
    );

    expect(summary.skippedClaimed).toBe(1);
    expect(summary.dispatched).toBe(0);
    expect(dispatcher).not.toHaveBeenCalled();
  });

  it("moves exhausted requests to dead letter instead of redispatching", async () => {
    const exhausted = recoverableRow({ dispatch_attempts: 10 });
    const mock = createScanClientMock({
      rows: [exhausted],
      acquireResults: [{ acquired: true, claim_id: CLAIM_ID }],
    });
    const dispatcher = vi.fn();

    const summary = await runDispatchRecoveryScan(
      { client: mock.client, dispatcher },
      { limit: 10 },
    );

    expect(summary.deadLettered).toBe(1);
    expect(dispatcher).not.toHaveBeenCalled();
    expect(mock.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "dead_letter" }),
    );
  });

  it("keeps claims tenant-scoped when scanning work from multiple tenants", async () => {
    const rows = [
      recoverableRow(),
      recoverableRow({
        id: "66666666-6666-4666-8666-666666666666",
        tenant_id: TENANT_B,
        subject_id: "outbox-1",
        idempotency_key: "donation-saga/outbox-1",
      }),
    ];
    const mock = createScanClientMock({
      rows,
      acquireResults: [
        { acquired: true, claim_id: CLAIM_ID },
        { acquired: true, claim_id: "77777777-7777-4777-8777-777777777777" },
      ],
    });
    const dispatcher = vi
      .fn()
      .mockResolvedValue({ dispatched: true, eventIds: ["evt"], error: null });

    const summary = await runDispatchRecoveryScan(
      { client: mock.client, dispatcher },
      { limit: 10 },
    );

    expect(summary.dispatched).toBe(2);
    const acquireCalls = mock.rpc.mock.calls.filter(
      ([fn]) => fn === "acquire_workflow_work_claim",
    );
    expect(acquireCalls[0]?.[1]).toMatchObject({ p_tenant_id: TENANT_A });
    expect(acquireCalls[1]?.[1]).toMatchObject({ p_tenant_id: TENANT_B });
  });
});

describe("workflow work claims migration", () => {
  const migration = readFileSync(
    new URL(
      "../../../../../supabase/migrations/20260611140000_workflow_work_claims.sql",
      import.meta.url,
    ),
    "utf8",
  );

  it("allows only one active claim per tenant-scoped work item", () => {
    expect(migration).toMatch(
      /CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_work_claims_active[\s\S]*\(tenant_id, subject_type, subject_id\)[\s\S]*WHERE status = 'active'/,
    );
  });

  it("expires stale claims before acquiring inside the rpc", () => {
    expect(migration).toMatch(/expires_at < NOW\(\)/);
    expect(migration).toMatch(
      /ON CONFLICT \(tenant_id, subject_type, subject_id\) WHERE status = 'active' DO NOTHING/,
    );
  });

  it("restricts claim rpc execution to the service role", () => {
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.acquire_workflow_work_claim[\s\S]*FROM PUBLIC/,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.acquire_workflow_work_claim[\s\S]*TO service_role/,
    );
  });
});
