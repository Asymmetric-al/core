import { describe, expect, it, vi } from "vitest";
import { InngestTestEngine } from "@inngest/test";

import {
  WORKFLOW_SMOKE_EVENT,
  workflowEventEnvelopeSchema,
} from "../../../../../packages/api/src/workflows/events";
import { workflowSmoke } from "../../../../../packages/api/src/workflows/functions/workflow-smoke";
import { createWorkflowDispatcher } from "../../../../../packages/api/src/workflows/dispatch";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const DISPATCH_REQUEST_ID = "22222222-2222-4222-8222-222222222222";

function safeSmokeEnvelope() {
  return {
    tenantId: TENANT_ID,
    workflowName: WORKFLOW_SMOKE_EVENT,
    schemaVersion: 1,
    subject: { type: "workflow_smoke", id: "smoke-1" },
    dispatchRequestId: DISPATCH_REQUEST_ID,
  };
}

describe("workflow runtime smoke (#287)", () => {
  describe("workflow event envelope", () => {
    it("accepts a tenant-scoped identifier-only envelope", () => {
      const parsed = workflowEventEnvelopeSchema.safeParse(safeSmokeEnvelope());

      expect(parsed.success).toBe(true);
    });

    it("rejects an envelope without a tenant id", () => {
      const { tenantId: _omitted, ...withoutTenant } = safeSmokeEnvelope();

      const parsed = workflowEventEnvelopeSchema.safeParse(withoutTenant);

      expect(parsed.success).toBe(false);
    });

    it("rejects unknown payload fields so events stay identifier-only", () => {
      const parsed = workflowEventEnvelopeSchema.safeParse({
        ...safeSmokeEnvelope(),
        emailBody: "full email body should never ride in a workflow event",
      });

      expect(parsed.success).toBe(false);
    });
  });

  describe("workflowSmoke function", () => {
    it("acknowledges a safe envelope without business side effects", async () => {
      const engine = new InngestTestEngine({ function: workflowSmoke });

      const { result } = await engine.execute({
        events: [{ name: WORKFLOW_SMOKE_EVENT, data: safeSmokeEnvelope() }],
      });

      expect(result).toMatchObject({
        acknowledged: true,
        noOp: true,
        tenantId: TENANT_ID,
        dispatchRequestId: DISPATCH_REQUEST_ID,
      });
    });

    it("fails without retries when the envelope is not tenant-scoped", async () => {
      const engine = new InngestTestEngine({ function: workflowSmoke });
      const { tenantId: _omitted, ...withoutTenant } = safeSmokeEnvelope();

      const { error } = await engine.execute({
        events: [{ name: WORKFLOW_SMOKE_EVENT, data: withoutTenant }],
      });

      expect(error).toBeDefined();
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      expect(message).toMatch(/workflow_envelope_invalid/);
    });
  });

  describe("dispatch adapter", () => {
    it("dispatches a validated envelope and reports the event ids", async () => {
      const send = vi.fn().mockResolvedValue({ ids: ["evt-1"] });
      const dispatch = createWorkflowDispatcher({ send });

      const result = await dispatch({
        name: WORKFLOW_SMOKE_EVENT,
        envelope: safeSmokeEnvelope(),
      });

      expect(result).toEqual({
        dispatched: true,
        eventIds: ["evt-1"],
        error: null,
      });
      expect(send).toHaveBeenCalledWith({
        name: WORKFLOW_SMOKE_EVENT,
        data: safeSmokeEnvelope(),
      });
    });

    it("uses the dispatch request id for handoff-level deduplication", async () => {
      const send = vi.fn().mockResolvedValue({ ids: ["evt-1"] });
      const dispatch = createWorkflowDispatcher({ send });

      await dispatch({
        name: WORKFLOW_SMOKE_EVENT,
        envelope: safeSmokeEnvelope(),
        dedupeId: `workflow-smoke-${DISPATCH_REQUEST_ID}`,
      });

      expect(send).toHaveBeenCalledWith({
        id: `workflow-smoke-${DISPATCH_REQUEST_ID}`,
        name: WORKFLOW_SMOKE_EVENT,
        data: safeSmokeEnvelope(),
      });
    });

    it("refuses to send an envelope that fails validation", async () => {
      const send = vi.fn();
      const dispatch = createWorkflowDispatcher({ send });
      const { tenantId: _omitted, ...withoutTenant } = safeSmokeEnvelope();

      const result = await dispatch({
        name: WORKFLOW_SMOKE_EVENT,
        envelope: withoutTenant as never,
      });

      expect(result.dispatched).toBe(false);
      expect(result.error).toMatch(/workflow_envelope_invalid/);
      expect(send).not.toHaveBeenCalled();
    });

    it("reports send failures without throwing so callers can recover", async () => {
      const send = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));
      const dispatch = createWorkflowDispatcher({ send });

      const result = await dispatch({
        name: WORKFLOW_SMOKE_EVENT,
        envelope: safeSmokeEnvelope(),
      });

      expect(result.dispatched).toBe(false);
      expect(result.eventIds).toEqual([]);
      expect(result.error).toMatch(/ECONNREFUSED/);
    });
  });

  describe("serve endpoint module", () => {
    it("exposes GET, POST, and PUT handlers for the thin app route", async () => {
      const serveModule = await import(
        "../../../../../packages/api/src/workflows/serve"
      );

      expect(typeof serveModule.GET).toBe("function");
      expect(typeof serveModule.POST).toBe("function");
      expect(typeof serveModule.PUT).toBe("function");
    });
  });
});
