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
    ["123-45-6789", "customer_or_donor_pii"],
    ["Call me at (415) 555-2671.", "customer_or_donor_pii"],
    ["Send the packet to 742 Evergreen Terrace.", "customer_or_donor_pii"],
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

  it.each([
    "-----BEGIN PRIVATE KEY-----",
    "-----BEGIN ENCRYPTED PRIVATE KEY-----",
    "-----BEGIN RSA PRIVATE KEY-----",
    "-----BEGIN EC PRIVATE KEY-----",
    "-----BEGIN DSA PRIVATE KEY-----",
    "-----BEGIN ED25519 PRIVATE KEY-----",
    "-----BEGIN OPENSSH PRIVATE KEY-----",
    "-----BEGIN PGP PRIVATE KEY BLOCK-----",
  ])("rejects a private-key header: %s", (candidate) => {
    expect(classifyEveAdminMemoryExclusions(candidate)).toContain(
      "private_key",
    );
  });

  it.each([
    "-----BEGIN PUBLIC KEY-----",
    "-----BEGIN RSA PUBLIC KEY-----",
    "The private key rotation is scheduled for next week.",
    "Prose before -----BEGIN PRIVATE KEY-----",
  ])("allows a private-key near miss: %s", (candidate) => {
    expect(classifyEveAdminMemoryExclusions(candidate)).toEqual([]);
  });

  it.each([
    "Release v1.2.3 is planned for 2026-07-19.",
    "Decision 12345 stays with the existing owner.",
    "The main road remains open after lunch.",
    "Review the mailing workflow before launch.",
  ])("allows a non-PII near miss: %s", (candidate) => {
    expect(classifyEveAdminMemoryExclusions(candidate)).toEqual([]);
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
