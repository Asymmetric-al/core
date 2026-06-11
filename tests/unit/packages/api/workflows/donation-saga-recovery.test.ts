import { beforeEach, describe, expect, it, vi } from "vitest";
import { InngestTestEngine } from "@inngest/test";

const {
  processDonationSagaOutboxEventMock,
  getAdminClientMock,
  stripeCtorMock,
} = vi.hoisted(() => ({
  processDonationSagaOutboxEventMock: vi.fn(),
  getAdminClientMock: vi.fn(),
  stripeCtorMock: vi.fn(),
}));

vi.mock("../../../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: processDonationSagaOutboxEventMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("stripe", () => ({
  default: stripeCtorMock,
}));

import {
  DONATION_SAGA_RECOVERY_EVENT,
  WORKFLOW_SYSTEM_ACTOR_ID,
} from "../../../../../packages/api/src/workflows/events";
import {
  requestDonationSagaRecoveryDispatch,
  runDonationSagaRecoveryScan,
} from "../../../../../packages/api/src/workflows/adapters/donations";
import { donationSagaRecovery } from "../../../../../packages/api/src/workflows/functions/donation-saga-recovery";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const OUTBOX_ID = "88888888-8888-4888-8888-888888888888";
const REQUEST_ID = "33333333-3333-4333-8333-333333333333";

function recoveryEnvelope() {
  return {
    tenantId: TENANT_ID,
    workflowName: DONATION_SAGA_RECOVERY_EVENT,
    schemaVersion: 1,
    subject: { type: "donation_saga_outbox", id: OUTBOX_ID },
    dispatchRequestId: REQUEST_ID,
  };
}

beforeEach(() => {
  processDonationSagaOutboxEventMock.mockReset();
  getAdminClientMock.mockReset();
  stripeCtorMock.mockReset();
});

describe("donation saga recovery dispatch adapter (#290)", () => {
  it("creates an attempt-scoped dispatch request and hands off the event", async () => {
    const requestDispatch = vi.fn().mockResolvedValue({
      outcome: "dispatched",
      request: { id: REQUEST_ID },
      reused: false,
      error: null,
    });

    const result = await requestDonationSagaRecoveryDispatch(
      { client: {} as never, requestDispatch },
      {
        tenantId: TENANT_ID,
        outboxId: OUTBOX_ID,
        attemptCount: 2,
      },
    );

    expect(result.outcome).toBe("dispatched");
    expect(requestDispatch).toHaveBeenCalledWith(
      { client: {} },
      expect.objectContaining({
        tenantId: TENANT_ID,
        productArea: "donations",
        workflowName: DONATION_SAGA_RECOVERY_EVENT,
        subject: { type: "donation_saga_outbox", id: OUTBOX_ID },
        idempotencyKey: `donation-saga-recovery/${OUTBOX_ID}/attempt-2`,
      }),
    );
  });
});

describe("donation saga recovery scan (#290)", () => {
  function createScanClient(rows: unknown[]) {
    const limit = vi.fn().mockResolvedValue({ data: rows, error: null });
    const order = vi.fn().mockReturnValue({ limit });
    const lte = vi.fn().mockReturnValue({ order });
    const inFilter = vi.fn().mockReturnValue({ lte });
    const select = vi.fn().mockReturnValue({ in: inFilter });
    const from = vi.fn().mockReturnValue({ select });
    return { client: { from } as never, from, select, inFilter };
  }

  it("dispatches one recovery event per due saga outbox row", async () => {
    const rows = [
      { id: OUTBOX_ID, tenant_id: TENANT_ID, attempt_count: 1 },
      {
        id: "99999999-9999-4999-8999-999999999999",
        tenant_id: TENANT_ID,
        attempt_count: 3,
      },
    ];
    const scan = createScanClient(rows);
    const requestDispatch = vi.fn().mockResolvedValue({
      outcome: "dispatched",
      request: { id: REQUEST_ID },
      reused: false,
      error: null,
    });

    const summary = await runDonationSagaRecoveryScan(
      { client: scan.client, requestDispatch },
      { limit: 10 },
    );

    expect(summary.scanned).toBe(2);
    expect(summary.dispatched).toBe(2);
    expect(requestDispatch).toHaveBeenCalledTimes(2);
    expect(scan.from).toHaveBeenCalledWith("donation_saga_outbox");
    expect(scan.inFilter).toHaveBeenCalledWith("status", ["pending", "failed"]);
  });

  it("counts failed handoffs without aborting the scan", async () => {
    const rows = [
      { id: OUTBOX_ID, tenant_id: TENANT_ID, attempt_count: 1 },
      {
        id: "99999999-9999-4999-8999-999999999999",
        tenant_id: TENANT_ID,
        attempt_count: 1,
      },
    ];
    const scan = createScanClient(rows);
    const requestDispatch = vi
      .fn()
      .mockResolvedValueOnce({
        outcome: "failed",
        request: { id: REQUEST_ID },
        reused: false,
        error: "boom",
      })
      .mockResolvedValueOnce({
        outcome: "dispatched",
        request: { id: REQUEST_ID },
        reused: false,
        error: null,
      });

    const summary = await runDonationSagaRecoveryScan(
      { client: scan.client, requestDispatch },
      { limit: 10 },
    );

    expect(summary.dispatched).toBe(1);
    expect(summary.failed).toBe(1);
  });
});

describe("donation saga recovery workflow function (#290)", () => {
  function mockAdminWithTenantKey(stripeSecretKey: string | null) {
    const single = vi.fn().mockResolvedValue({
      data: { id: TENANT_ID, stripe_secret_key: stripeSecretKey },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    getAdminClientMock.mockReturnValue({ client: { from }, error: null });
    return { from };
  }

  it("processes one claimed saga outbox row with the system workflow actor", async () => {
    mockAdminWithTenantKey("sk_test_tenant");
    stripeCtorMock.mockImplementation(() => ({ kind: "stripe-client" }));
    processDonationSagaOutboxEventMock.mockResolvedValue({
      status: "completed",
      donationId: "donation-1",
      outboxId: OUTBOX_ID,
      paymentIntentId: "pi_1",
    });

    const engine = new InngestTestEngine({ function: donationSagaRecovery });
    const { result } = await engine.execute({
      events: [
        { name: DONATION_SAGA_RECOVERY_EVENT, data: recoveryEnvelope() },
      ],
    });

    expect(processDonationSagaOutboxEventMock).toHaveBeenCalledTimes(1);
    expect(processDonationSagaOutboxEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        outboxId: OUTBOX_ID,
        actorUserId: WORKFLOW_SYSTEM_ACTOR_ID,
      }),
    );
    expect(result).toMatchObject({ status: "completed", outboxId: OUTBOX_ID });
  });

  it("passes through claim-not-acquired results without duplicate stripe work", async () => {
    mockAdminWithTenantKey("sk_test_tenant");
    stripeCtorMock.mockImplementation(() => ({}));
    processDonationSagaOutboxEventMock.mockResolvedValue({
      status: "processing",
      donationId: "donation-1",
      outboxId: OUTBOX_ID,
      error: "Donation is still being processed",
    });

    const engine = new InngestTestEngine({ function: donationSagaRecovery });
    const { result } = await engine.execute({
      events: [
        { name: DONATION_SAGA_RECOVERY_EVENT, data: recoveryEnvelope() },
      ],
    });

    expect(result).toMatchObject({ status: "processing" });
    expect(processDonationSagaOutboxEventMock).toHaveBeenCalledTimes(1);
  });

  it("rejects events without a valid tenant-scoped envelope", async () => {
    const { tenantId: _omitted, ...invalid } = recoveryEnvelope();

    const engine = new InngestTestEngine({ function: donationSagaRecovery });
    const { error } = await engine.execute({
      events: [{ name: DONATION_SAGA_RECOVERY_EVENT, data: invalid }],
    });

    expect(error).toBeDefined();
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    expect(message).toMatch(/workflow_envelope_invalid/);
    expect(processDonationSagaOutboxEventMock).not.toHaveBeenCalled();
  });

  it("surfaces transient saga failures so the run retries", async () => {
    mockAdminWithTenantKey("sk_test_tenant");
    stripeCtorMock.mockImplementation(() => ({}));
    processDonationSagaOutboxEventMock.mockRejectedValue(
      new Error("stripe timeout"),
    );

    const engine = new InngestTestEngine({ function: donationSagaRecovery });
    const { error } = await engine.execute({
      events: [
        { name: DONATION_SAGA_RECOVERY_EVENT, data: recoveryEnvelope() },
      ],
    });

    expect(error).toBeDefined();
  });
});
