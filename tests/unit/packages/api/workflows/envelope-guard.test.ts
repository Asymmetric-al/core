import { describe, expect, it } from "vitest";

import { parseWorkflowEnvelopeOrThrow } from "../../../../../packages/api/src/workflows/envelope-guard";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";

describe("workflow envelope guard", () => {
  it("returns the parsed envelope for a valid payload", () => {
    const envelope = parseWorkflowEnvelopeOrThrow({
      tenantId: TENANT_ID,
      workflowName: "workflows/smoke.requested",
      schemaVersion: 1,
      subject: { type: "smoke_check", id: "smoke-1" },
    });

    expect(envelope.tenantId).toBe(TENANT_ID);
    expect(envelope.subject).toEqual({ type: "smoke_check", id: "smoke-1" });
  });

  it("throws a NonRetriableError naming the invalid paths, not the values", () => {
    let thrown: unknown;
    try {
      parseWorkflowEnvelopeOrThrow({
        tenantId: "not-a-uuid",
        workflowName: "workflows/smoke.requested",
        schemaVersion: 1,
        subject: { type: "smoke_check", id: "smoke-1" },
        context: { stripeClientSecret: "pi_secret_super_sensitive" },
      });
    } catch (error) {
      thrown = error;
    }

    // NonRetriableError cannot be imported here (inngest is a packages/api
    // dependency, not a test-root one) — assert on the error name instead.
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).name).toBe("NonRetriableError");
    const message = (thrown as Error).message;
    expect(message).toContain("workflow_envelope_invalid");
    expect(message).toContain("tenantId");
    // Issue paths only — never the rejected values themselves.
    expect(message).not.toContain("super_sensitive");
  });
});
