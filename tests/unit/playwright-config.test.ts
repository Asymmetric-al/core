import { describe, expect, it } from "vitest";
import {
  getDefaultProjectTestIgnore,
  shouldReuseExistingServer,
} from "../../playwright.config";
import { nextDevReadyURL } from "../e2e/base-urls";

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
  const defaultProjectIgnores = [
    "**/upload-crop.spec.ts",
    "**/donor-giving-history.spec.ts",
    "**/mc-contributions-live-query.spec.ts",
  ];

  const donorOnlyProjectIgnores = [
    ...defaultProjectIgnores,
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
  ];

  it("keeps admin-required specs when the admin server is included", () => {
    expect(getDefaultProjectTestIgnore(true)).toEqual(defaultProjectIgnores);
  });

  it("excludes admin-required specs when the admin server is omitted", () => {
    expect(getDefaultProjectTestIgnore(false)).toEqual(donorOnlyProjectIgnores);
  });

  it("excludes admin and non-donor specs when the admin server is disabled", () => {
    expect(
      getDefaultProjectTestIgnore({
        PLAYWRIGHT_INCLUDE_ADMIN: "0",
      }),
    ).toEqual(donorOnlyProjectIgnores);
  });

  it("keeps admin specs eligible when the admin server is enabled", () => {
    expect(
      getDefaultProjectTestIgnore({ PLAYWRIGHT_INCLUDE_ADMIN: "1" }),
    ).toEqual(defaultProjectIgnores);
  });
});

describe("nextDevReadyURL", () => {
  it("uses the health endpoint for web server readiness", () => {
    expect(nextDevReadyURL("http://localhost:3030/")).toBe(
      "http://localhost:3030/api/health",
    );
  });
});
