import { describe, expect, it } from "vitest";

import { mutateEveRetentionSchema } from "../../../../packages/api/src/eve/retention/schema";

describe("Eve retention route schema", () => {
  it("accepts bounded lifecycle actions", () => {
    expect(
      mutateEveRetentionSchema.safeParse({
        action: "set_hold",
        holdType: "incident",
        scopeType: "category",
        targetId: "replay_artifact",
        reason: "Preserve investigation evidence.",
      }).success,
    ).toBe(true);
  });

  it("rejects raw paths, arbitrary categories, and oversized expiry batches", () => {
    expect(
      mutateEveRetentionSchema.safeParse({
        action: "store_artifact",
        artifactKind: "replay",
        content: "{}",
        storagePath: "another-tenant/private.json",
        category: "never_delete",
        redactedSummary: "safe",
      }).success,
    ).toBe(false);
    expect(
      mutateEveRetentionSchema.safeParse({ action: "run_expiry", limit: 501 })
        .success,
    ).toBe(false);
  });

  it("rejects missing server-redacted content", () => {
    expect(
      mutateEveRetentionSchema.safeParse({
        action: "store_artifact",
        artifactKind: "debug",
        content: "",
        redactedSummary: "safe",
      }).success,
    ).toBe(false);
  });

  it("rejects gateway telemetry bodies at the mutation boundary", () => {
    expect(
      mutateEveRetentionSchema.safeParse({
        action: "store_artifact",
        artifactKind: "gateway_telemetry",
        content: JSON.stringify({ response: "private response" }),
        redactedSummary: "Gateway telemetry",
      }).success,
    ).toBe(false);
  });
});
