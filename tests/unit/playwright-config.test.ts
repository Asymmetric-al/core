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
        "**/auth-login-screen-admin.spec.ts",
        "**/auth-demo-missionary.spec.ts",
        "**/auth-login-screen-missionary.spec.ts",
        "**/boneyard-smoke.spec.ts",
        "**/cms-*.spec.ts",
        "**/cms-local-happy-path.spec.ts",
        "**/site-studio-video-tour.spec.ts",
        "**/support-hub.smoke.spec.ts",
      ]),
    );
  });

  it("excludes admin and non-donor specs when the admin server is disabled", () => {
    expect(
      getDefaultProjectTestIgnore({
        PLAYWRIGHT_INCLUDE_ADMIN: "0",
      }),
    ).toEqual(
      expect.arrayContaining([
        "**/admin-*.spec.ts",
        "**/auth-demo-admin.spec.ts",
        "**/auth-login-screen-admin.spec.ts",
        "**/auth-demo-missionary.spec.ts",
        "**/auth-login-screen-missionary.spec.ts",
        "**/boneyard-smoke.spec.ts",
        "**/cms-*.spec.ts",
        "**/site-studio-video-tour.spec.ts",
        "**/support-hub.smoke.spec.ts",
        "**/cms-local-happy-path.spec.ts",
      ]),
    );
  });

  it("keeps admin specs eligible when the admin server is enabled", () => {
    expect(
      getDefaultProjectTestIgnore({ PLAYWRIGHT_INCLUDE_ADMIN: "1" }),
    ).toEqual([
      "**/upload-crop.spec.ts",
      "**/donor-giving-history.spec.ts",
      "**/mc-contributions-live-query.spec.ts",
    ]);
  });
});
