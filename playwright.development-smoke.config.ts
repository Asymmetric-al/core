import { defineConfig, devices } from "@playwright/test";

/**
 * Headless development/PR-preview smoke tests.
 *
 * This config targets deployed Vercel URLs using Protection Bypass for
 * Automation headers so headless Playwright sessions can test protected
 * previews without putting bypass secrets in URLs.
 */

type SurfaceKey = "admin" | "donor" | "missionary";

const SURFACE_ENV_KEYS: Record<SurfaceKey, { base: string; secret: string }> = {
  admin: {
    base: "QA_ADMIN_BASE_URL",
    secret: "VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET",
  },
  donor: {
    base: "QA_DONOR_BASE_URL",
    secret: "VERCEL_DONOR_AUTOMATION_BYPASS_SECRET",
  },
  missionary: {
    base: "QA_MISSIONARY_BASE_URL",
    secret: "VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET",
  },
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

export function buildVercelProtectionHeaders(
  bypassSecret: string | undefined,
): Record<string, string> | undefined {
  const trimmedSecret = bypassSecret?.trim();

  if (!trimmedSecret) {
    return undefined;
  }

  return {
    "x-vercel-protection-bypass": trimmedSecret,
  };
}

function surfaceProject(name: `development-${SurfaceKey}`, key: SurfaceKey) {
  const baseURL = readEnv(SURFACE_ENV_KEYS[key].base);
  const extraHTTPHeaders = buildVercelProtectionHeaders(
    readEnv(SURFACE_ENV_KEYS[key].secret),
  );

  return {
    name,
    testMatch: [`**/${key}.*.spec.ts`],
    use: {
      ...devices["Desktop Chrome"],
      ...(baseURL ? { baseURL } : {}),
      ...(extraHTTPHeaders ? { extraHTTPHeaders } : {}),
    },
  };
}

export default defineConfig({
  testDir: "./tests/e2e/development-smoke",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    [
      "html",
      { outputFolder: "playwright-report/development-smoke", open: "never" },
    ],
    [
      "json",
      { outputFile: "playwright-report/development-smoke/results.json" },
    ],
  ],
  use: {
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 60_000,
    actionTimeout: 20_000,
  },
  projects: [
    surfaceProject("development-admin", "admin"),
    surfaceProject("development-donor", "donor"),
    surfaceProject("development-missionary", "missionary"),
  ],
});
