import { describe, expect, it } from "vitest";

import { workflowEventEnvelopeSchema } from "../../src/workflows/events";

/**
 * Interface tests for the workflow event envelope bounds that are not
 * pinned elsewhere. Sensitive-key rejection, oversized values, and strict
 * top-level fields are already covered by
 * tests/unit/packages/api/workflows/dispatch-ledger.test.ts and
 * runtime-smoke.test.ts; these tests pin the remaining sanitization
 * contract: identifier preservation, the context key budget, key length,
 * and the allowed primitive value types.
 */

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const DISPATCH_REQUEST_ID = "22222222-2222-4222-8222-222222222222";

function baseEnvelope() {
  return {
    tenantId: TENANT_ID,
    workflowName: "donations/saga.recovery.requested",
    schemaVersion: 1 as const,
    subject: { type: "donation_saga_outbox", id: "outbox-1" },
  };
}

describe("workflow event envelope sanitization bounds", () => {
  it("preserves tenant and record identifiers exactly on a valid envelope", () => {
    const envelope = {
      ...baseEnvelope(),
      dispatchRequestId: DISPATCH_REQUEST_ID,
      context: { productArea: "donations" },
    };

    const parsed = workflowEventEnvelopeSchema.safeParse(envelope);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual(envelope);
    }
  });

  it("accepts string, number, boolean, and null context values within bounds", () => {
    const parsed = workflowEventEnvelopeSchema.safeParse({
      ...baseEnvelope(),
      context: {
        productArea: "donations",
        attempt: 3,
        replayed: false,
        batchId: null,
      },
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects context that exceeds the 16-key routing metadata budget", () => {
    const context = Object.fromEntries(
      Array.from({ length: 17 }, (_, index) => [`key${index}`, "value"]),
    );

    const parsed = workflowEventEnvelopeSchema.safeParse({
      ...baseEnvelope(),
      context,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects context keys longer than 64 characters", () => {
    const parsed = workflowEventEnvelopeSchema.safeParse({
      ...baseEnvelope(),
      context: { ["k".repeat(65)]: "value" },
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects unexpected fields inside the subject so it stays identifier-only", () => {
    const parsed = workflowEventEnvelopeSchema.safeParse({
      ...baseEnvelope(),
      subject: {
        type: "donation_saga_outbox",
        id: "outbox-1",
        snapshot: { amount: 100 },
      },
    });

    expect(parsed.success).toBe(false);
  });
});
