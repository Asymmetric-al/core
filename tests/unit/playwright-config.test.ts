import { describe, expect, it } from "vitest";

import { getDefaultProjectTestIgnore } from "../../playwright.config";

// shouldReuseExistingServer behavior is covered at its module interface in
// tests/unit/playwright-shared.test.ts.

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
