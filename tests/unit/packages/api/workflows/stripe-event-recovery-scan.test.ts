import { describe, expect, it, vi } from "vitest";

import { runStripeEventRecoveryScan } from "../../../../../packages/api/src/workflows/adapters/stripe-events";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const EVENT_A = "aaaaaaaa-1111-4111-8111-111111111111";
const EVENT_B = "bbbbbbbb-2222-4222-8222-222222222222";

function createScanClient(rows: unknown[]) {
  const limit = vi.fn().mockResolvedValue({ data: rows, error: null });
  const order = vi.fn().mockReturnValue({ limit });
  const lte = vi.fn().mockReturnValue({ order });
  const notFilter = vi.fn().mockReturnValue({ lte });
  const eq = vi.fn().mockReturnValue({ not: notFilter });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { client: { from } as never, from, eq, notFilter };
}

describe("failed stripe event recovery scan (plan 002)", () => {
  it("dispatches one recovery event per due failed stripe event", async () => {
    const rows = [
      { id: EVENT_A, tenant_id: TENANT_ID, process_attempts: 2 },
      { id: EVENT_B, tenant_id: TENANT_ID, process_attempts: 5 },
    ];
    const scan = createScanClient(rows);
    const requestDispatch = vi.fn().mockResolvedValue({
      outcome: "dispatched",
      request: { id: "wdr-1" },
      reused: false,
      error: null,
    });

    const summary = await runStripeEventRecoveryScan(
      { client: scan.client, requestDispatch },
      { limit: 10 },
    );

    expect(summary.scanned).toBe(2);
    expect(summary.dispatched).toBe(2);
    expect(scan.from).toHaveBeenCalledWith("stripe_raw_events");
    expect(scan.eq).toHaveBeenCalledWith("processing_status", "failed");

    const keys = requestDispatch.mock.calls.map(
      ([, input]) => (input as { idempotencyKey: string }).idempotencyKey,
    );
    expect(keys).toEqual([
      `stripe-event-recovery/${EVENT_A}/attempt-2`,
      `stripe-event-recovery/${EVENT_B}/attempt-5`,
    ]);
    expect(requestDispatch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: TENANT_ID,
        productArea: "giving",
        subject: { type: "stripe_raw_event", id: EVENT_A },
      }),
    );
  });

  it("counts failed handoffs without aborting the scan", async () => {
    const rows = [
      { id: EVENT_A, tenant_id: TENANT_ID, process_attempts: 1 },
      { id: EVENT_B, tenant_id: TENANT_ID, process_attempts: 1 },
    ];
    const scan = createScanClient(rows);
    const requestDispatch = vi
      .fn()
      .mockResolvedValueOnce({
        outcome: "failed",
        request: { id: "wdr-1" },
        reused: false,
        error: "boom",
      })
      .mockResolvedValueOnce({
        outcome: "dispatched",
        request: { id: "wdr-2" },
        reused: false,
        error: null,
      });

    const summary = await runStripeEventRecoveryScan(
      { client: scan.client, requestDispatch },
      { limit: 10 },
    );

    expect(summary.dispatched).toBe(1);
    expect(summary.failed).toBe(1);
    expect(requestDispatch).toHaveBeenCalledTimes(2);
  });
});
