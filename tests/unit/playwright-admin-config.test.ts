import { describe, expect, it } from "vitest";
import { shouldReuseExistingServer } from "../../playwright.admin.config";

describe("admin shouldReuseExistingServer", () => {
  it("allows CI to reuse a manually started admin server", () => {
    expect(
      shouldReuseExistingServer({
        CI: "1",
        PLAYWRIGHT_REUSE_EXISTING_SERVER: "1",
      }),
    ).toBe(true);
  });

  it("keeps the default CI behavior when reuse is not explicit", () => {
    expect(shouldReuseExistingServer({ CI: "1" })).toBe(false);
  });
});
