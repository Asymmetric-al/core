import { describe, expect, it, vi } from "vitest";

import { createWorkflowDispatcher } from "../../src/workflows/dispatch";

/**
 * Interface tests for the workflow dispatch adapter. The adapter is built
 * around the injected WorkflowSendClient seam, so a hand-built fake send
 * client drives every path: validated handoff, dedupe id passthrough,
 * envelope refusal, and the never-throws failure contract that keeps a
 * failed handoff recordable (and therefore recoverable) by the Workflow
 * Dispatch Ledger.
 */

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const DISPATCH_REQUEST_ID = "22222222-2222-4222-8222-222222222222";

function safeEnvelope() {
  return {
    tenantId: TENANT_ID,
    workflowName: "donations/saga.recovery.requested",
    schemaVersion: 1 as const,
    subject: { type: "donation_saga_outbox", id: "outbox-1" },
    dispatchRequestId: DISPATCH_REQUEST_ID,
  };
}

describe("workflow dispatch adapter", () => {
  it("hands a validated envelope to the send client and reports a dispatched outcome", async () => {
    const send = vi.fn().mockResolvedValue({ ids: ["evt-1", "evt-2"] });
    const dispatch = createWorkflowDispatcher({ send });

    const result = await dispatch({
      name: "donations/saga.recovery.requested",
      envelope: safeEnvelope(),
    });

    expect(result).toEqual({
      dispatched: true,
      eventIds: ["evt-1", "evt-2"],
      error: null,
    });
    expect(send).toHaveBeenCalledWith({
      name: "donations/saga.recovery.requested",
      data: safeEnvelope(),
    });
    // Without a dedupe id, no event id is forced onto the handoff.
    expect(send.mock.calls[0]?.[0]).not.toHaveProperty("id");
  });

  it("forwards the dedupe id so repeated handoffs collapse to one event", async () => {
    const send = vi.fn().mockResolvedValue({ ids: ["evt-1"] });
    const dispatch = createWorkflowDispatcher({ send });

    await dispatch({
      name: "donations/saga.recovery.requested",
      envelope: safeEnvelope(),
      dedupeId: `donations/saga.recovery.requested:${DISPATCH_REQUEST_ID}`,
    });

    expect(send).toHaveBeenCalledWith({
      id: `donations/saga.recovery.requested:${DISPATCH_REQUEST_ID}`,
      name: "donations/saga.recovery.requested",
      data: safeEnvelope(),
    });
  });

  it("refuses to send an envelope that fails validation", async () => {
    const send = vi.fn();
    const dispatch = createWorkflowDispatcher({ send });
    const { tenantId: _omitted, ...withoutTenant } = safeEnvelope();

    const result = await dispatch({
      name: "donations/saga.recovery.requested",
      envelope: withoutTenant as never,
    });

    expect(result.dispatched).toBe(false);
    expect(result.eventIds).toEqual([]);
    expect(result.error).toMatch(/workflow_envelope_invalid/);
    expect(send).not.toHaveBeenCalled();
  });

  it("records a send failure as a dispatch outcome instead of throwing", async () => {
    const send = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));
    const dispatch = createWorkflowDispatcher({ send });

    const result = await dispatch({
      name: "donations/saga.recovery.requested",
      envelope: safeEnvelope(),
    });

    expect(result).toEqual({
      dispatched: false,
      eventIds: [],
      error: "connect ECONNREFUSED",
    });
  });

  it("falls back to the generic workflow_dispatch_failed error for non-Error rejections", async () => {
    const send = vi.fn().mockRejectedValue("string rejection");
    const dispatch = createWorkflowDispatcher({ send });

    const result = await dispatch({
      name: "donations/saga.recovery.requested",
      envelope: safeEnvelope(),
    });

    expect(result).toEqual({
      dispatched: false,
      eventIds: [],
      error: "workflow_dispatch_failed",
    });
  });
});
