import { describe, expect, it } from "vitest";
import {
  getDefaultProjectTestIgnore,
  shouldReuseExistingServer,
} from "../../playwright.config";

describe("shouldReuseExistingServer", () => {
  it("defaults to reusing an existing server outside CI", () => {
    expect(shouldReuseExistingServer({})).toBe(true);
  });

  it("defaults to starting a fresh server in CI", () => {
    expect(shouldReuseExistingServer({ CI: "1" })).toBe(false);
  });

  it("allows CI to reuse a manually started server", () => {
    expect(
      shouldReuseExistingServer({
        CI: "1",
        PLAYWRIGHT_REUSE_EXISTING_SERVER: "1",
      }),
    ).toBe(true);
  });

  it("allows an explicit false value to override local reuse", () => {
    expect(
      shouldReuseExistingServer({
        PLAYWRIGHT_REUSE_EXISTING_SERVER: "false",
      }),
    ).toBe(false);
  });
});

describe("getDefaultProjectTestIgnore", () => {
  it("keeps admin-required specs when the admin server is included", () => {
    expect(getDefaultProjectTestIgnore(true)).not.toContain(
      "**/admin-*.spec.ts",
    );
  });

  it("excludes admin-required specs when the admin server is omitted", () => {
    expect(getDefaultProjectTestIgnore(false)).toEqual(
      expect.arrayContaining([
        "**/admin-*.spec.ts",
        "**/auth-demo-admin.spec.ts",
        "**/cms-*.spec.ts",
        "**/site-studio-video-tour.spec.ts",
        "**/support-hub.smoke.spec.ts",
      ]),
    );
  });
});
