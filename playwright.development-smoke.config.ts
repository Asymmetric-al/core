import { resolve } from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { assertSmokeArtifactDirectories } from "./tests/e2e/development-smoke/safe-reporter";

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

const requestedReportDirectory = resolve(
  readEnv("PLAYWRIGHT_REPORT_DIR") ?? "playwright-report/development-smoke",
);
const requestedOutputDirectory = resolve(
  readEnv("PLAYWRIGHT_OUTPUT_DIR") ?? "test-results",
);
// Validate before Playwright can clear its output directory during startup.
const { reportDirectory, outputDirectories } = assertSmokeArtifactDirectories(
  requestedReportDirectory,
  [requestedOutputDirectory],
);

// Pinned Playwright's automatic error prompt otherwise snapshots input values.
// The suite reporter retains bounded, redacted diagnostics instead.
process.env.PLAYWRIGHT_NO_COPY_PROMPT = "1";

export default defineConfig({
  testDir: "./tests/e2e/development-smoke",
  outputDir: outputDirectories[0],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    [
      resolve(__dirname, "tests/e2e/development-smoke/safe-reporter.ts"),
      { outputFolder: reportDirectory },
    ],
  ],
  use: {
    headless: true,
    trace: "off",
    screenshot: "off",
    video: "off",
    navigationTimeout: 60_000,
    actionTimeout: 20_000,
  },
  projects: [
    surfaceProject("development-admin", "admin"),
    surfaceProject("development-donor", "donor"),
    surfaceProject("development-missionary", "missionary"),
  ],
});
