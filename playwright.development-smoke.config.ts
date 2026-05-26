import { defineConfig, devices } from "@playwright/test";

/**
 * Headless development-deployment smoke tests.
 *
 * This config targets the live development hosts (development-admin /
 * development-donor / development-missionary) using Vercel Protection Bypass
 * for Automation **headers** so the deployment-protection wall lets headless
 * Playwright sessions through. Secrets and base URLs are injected via env vars
 * by the operator's shell or local helper; this file does not import or read
 * any secret files directly.
 *
 * - No webServer (we hit live deployments, not localhost).
 * - One worker, chromium only, headless.
 * - HTML + JSON report under playwright-report/development-smoke/.
 * - Trace / screenshot / video retained on failure.
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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    // Print only the variable name, never the value.
    throw new Error(
      `Missing required env var for headless development smoke: ${name}. ` +
        `Export the required QA_* and VERCEL_* variables, then run ` +
        `bun run test:e2e:development-smoke[:surface].`,
    );
  }
  return value;
}

function surfaceProject(name: `development-${SurfaceKey}`, key: SurfaceKey) {
  const baseURL = requireEnv(SURFACE_ENV_KEYS[key].base);
  const bypassSecret = requireEnv(SURFACE_ENV_KEYS[key].secret);

  return {
    name,
    testMatch: [`**/development-smoke/${key}.*.spec.ts`],
    use: {
      ...devices["Desktop Chrome"],
      baseURL,
      extraHTTPHeaders: {
        "x-vercel-protection-bypass": bypassSecret,
        "x-vercel-set-bypass-cookie": "true",
      },
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
