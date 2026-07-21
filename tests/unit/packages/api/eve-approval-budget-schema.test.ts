import { describe, expect, it } from "vitest";

import { mutateEveApprovalBudgetSchema } from "../../../../packages/api/src/eve/approval-budget/schema";

describe("Eve approval and budget route schema", () => {
  it("rejects caller-selected trust zones and write classes", () => {
    expect(
      mutateEveApprovalBudgetSchema.safeParse({
        action: "execute",
        actionId: "engineering.review_artifact.write",
        targetKey: "review:one",
        trustZone: "engineering",
        writeClass: "operational",
      }).success,
    ).toBe(false);
  });

  it("rejects payload-like target values", () => {
    expect(
      mutateEveApprovalBudgetSchema.safeParse({
        action: "execute",
        actionId: "engineering.review_artifact.write",
        targetKey: "donor@example.com",
      }).success,
    ).toBe(false);
  });

  it("requires an emergency override to be a positive increase", () => {
    expect(
      mutateEveApprovalBudgetSchema.safeParse({
        action: "override_budget",
        scopeType: "expensive_feature",
        scopeId: "policy-tracer",
        additionalRequests: 0,
        additionalUsdMicros: 0,
        additionalInputTokens: 0,
        additionalOutputTokens: 0,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        reason: "No increase",
      }).success,
    ).toBe(false);
  });
});
