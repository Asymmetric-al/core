import { describe, expect, it } from "vitest";

import {
  resolveAdminBaseUrl,
  shouldReuseExistingServer,
} from "../../playwright.admin.config";
import {
  resolveAdminBaseUrlEnv,
  resolveDonorBaseUrlEnv,
} from "../../playwright.config";
import {
  buildVercelProtectionHeaders,
  default as previewSmokeConfig,
} from "../../playwright.development-smoke.config";
import { resolveDonorBaseUrl } from "../../playwright.donor.config";
import { resolveMissionaryBaseUrl } from "../../playwright.missionary.config";

describe("Playwright preview smoke base URL env", () => {
  it("accepts QA_* base URL aliases for preview smoke handoff", () => {
    expect(
      resolveAdminBaseUrl({
        QA_ADMIN_BASE_URL: "https://admin-preview.vercel.app",
      }),
    ).toBe("https://admin-preview.vercel.app");
    expect(
      resolveDonorBaseUrl({
        QA_DONOR_BASE_URL: "https://donor-preview.vercel.app",
      }),
    ).toBe("https://donor-preview.vercel.app");
    expect(
      resolveMissionaryBaseUrl({
        QA_MISSIONARY_BASE_URL: "https://missionary-preview.vercel.app",
      }),
    ).toBe("https://missionary-preview.vercel.app");
  });

  it("keeps existing PLAYWRIGHT_* variables as the higher-priority override", () => {
    expect(
      resolveAdminBaseUrl({
        PLAYWRIGHT_ADMIN_BASE_URL: "https://admin-explicit.vercel.app",
        QA_ADMIN_BASE_URL: "https://admin-preview.vercel.app",
      }),
    ).toBe("https://admin-explicit.vercel.app");
    expect(
      resolveDonorBaseUrl({
        PLAYWRIGHT_DONOR_BASE_URL: "https://donor-explicit.vercel.app",
        QA_DONOR_BASE_URL: "https://donor-preview.vercel.app",
      }),
    ).toBe("https://donor-explicit.vercel.app");
    expect(
      resolveMissionaryBaseUrl({
        PLAYWRIGHT_MISSIONARY_BASE_URL:
          "https://missionary-explicit.vercel.app",
        QA_MISSIONARY_BASE_URL: "https://missionary-preview.vercel.app",
      }),
    ).toBe("https://missionary-explicit.vercel.app");
  });

  it("maps root smoke donor and admin aliases to the deployed URL inputs", () => {
    expect(
      resolveDonorBaseUrlEnv({
        QA_DONOR_BASE_URL: "https://donor-preview.vercel.app",
      }),
    ).toBe("https://donor-preview.vercel.app");
    expect(
      resolveAdminBaseUrlEnv({
        QA_ADMIN_BASE_URL: "https://admin-preview.vercel.app",
      }),
    ).toBe("https://admin-preview.vercel.app");
  });

  it("preserves explicit server reuse behavior", () => {
    expect(
      shouldReuseExistingServer({
        CI: "1",
        PLAYWRIGHT_REUSE_EXISTING_SERVER: "true",
      }),
    ).toBe(true);
  });

  it("defines the PR preview smoke projects", () => {
    const projectNames = previewSmokeConfig.projects?.map(
      (project) => project.name,
    );

    expect(projectNames).toEqual([
      "development-admin",
      "development-donor",
      "development-missionary",
    ]);
  });

  it("uses Vercel deployment protection bypass secrets as headers only", () => {
    expect(buildVercelProtectionHeaders("secret-value")).toEqual({
      "x-vercel-protection-bypass": "secret-value",
    });
    expect(buildVercelProtectionHeaders("")).toBeUndefined();
  });
});
