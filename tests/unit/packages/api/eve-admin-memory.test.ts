import { describe, expect, it } from "vitest";

import { classifyEveAdminMemoryExclusions } from "../../../../packages/api/src/eve/admin-memory/exclusions";
import { createEveAdminMemorySchema } from "../../../../packages/api/src/eve/admin-memory/schema";

describe("Eve private-admin memory boundary", () => {
  it.each([
    ["password: hunter2", "credential"],
    ["Bearer abcdefghijklmnopqrstuvwxyz", "secret"],
    ["-----BEGIN PRIVATE KEY-----", "private_key"],
    ["OTP is 123456", "one_time_code"],
    ["card number: 4242 4242 4242 4242", "payment_data"],
    ["donor@example.com", "customer_or_donor_pii"],
    ["tenant balance: 10000", "sensitive_tenant_fact"],
  ])("rejects %s as %s without returning the value", (candidate, expected) => {
    const result = classifyEveAdminMemoryExclusions(candidate);
    expect(result).toContain(expected);
    expect(JSON.stringify(result)).not.toContain(candidate);
  });

  it("allows non-sensitive preferences, project context, and decisions", () => {
    expect(
      classifyEveAdminMemoryExclusions(
        "Prefer concise updates. Decision: use the shared control plane.",
      ),
    ).toEqual([]);
  });

  it("keeps tenant operational scope out of the application write schema", () => {
    expect(
      createEveAdminMemorySchema.safeParse({
        category: "preference",
        title: "Updates",
        content: "Prefer concise status updates.",
        scopeType: "tenant_operational",
      }).success,
    ).toBe(false);
  });
});
