import { defineConfig, devices } from "@playwright/test";

const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_LOCAL_WORKERS = 1;

function normalizeBaseUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    if (
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "::1"
    ) {
      const port =
        parsed.port || String(parsed.protocol === "https:" ? 443 : 3000);
      return `http://localhost:${port}`;
    }

    return baseUrl;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

function getWorkerCount(): number {
  const envWorkers = Number(process.env.PLAYWRIGHT_WORKERS);
  if (Number.isFinite(envWorkers) && envWorkers > 0) {
    return envWorkers;
  }

  return process.env.CI ? 1 : DEFAULT_LOCAL_WORKERS;
}

export function resolveDonorBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return normalizeBaseUrl(
    env.PLAYWRIGHT_DONOR_BASE_URL || env.QA_DONOR_BASE_URL || DEFAULT_BASE_URL,
  );
}

function hasConfiguredDonorBaseUrl(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.PLAYWRIGHT_DONOR_BASE_URL || env.QA_DONOR_BASE_URL);
}

const baseURL = resolveDonorBaseUrl();

const isLocalBaseUrl = (() => {
  try {
    const parsed = new URL(baseURL);
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  } catch {
    return true;
  }
})();

const shouldStartLocalWebServer =
  isLocalBaseUrl && !hasConfiguredDonorBaseUrl();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: getWorkerCount(),
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "donor-boneyard", use: { ...devices["Desktop Chrome"] } }],
  webServer: shouldStartLocalWebServer
    ? {
        command:
          "node -e \"try{require('fs').rmSync('apps/donor/.next/dev/lock',{force:true})}catch{}\" && bun run --cwd apps/donor dev:playwright -- --port 3000 --hostname 127.0.0.1",
        url: baseURL,
        env: {
          ...process.env,
          E2E_AUTH_BYPASS: process.env.E2E_AUTH_BYPASS || "true",
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});
