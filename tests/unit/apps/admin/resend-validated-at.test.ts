import { describe, expect, it } from "vitest";

import { formatValidatedAtUtcLabel } from "../../../../apps/admin/app/(app)/settings/integrations/resend/validated-at";

describe("formatValidatedAtUtcLabel", () => {
  it("returns a deterministic UTC label for valid timestamps", () => {
    expect(formatValidatedAtUtcLabel("2026-04-02T12:34:56.000Z")).toBe(
      "2026-04-02 12:34 UTC",
    );
  });

  it("returns null for invalid timestamps", () => {
    expect(formatValidatedAtUtcLabel("not-a-date")).toBeNull();
  });

  it("returns null when the timestamp is missing", () => {
    expect(formatValidatedAtUtcLabel()).toBeNull();
  });
});
