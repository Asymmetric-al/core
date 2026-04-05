import { defineConfig, devices } from "@playwright/test";

const DEFAULT_BASE_URL = "http://localhost:3030";
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
        parsed.port || String(parsed.protocol === "https:" ? 443 : 3030);
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

const baseURL = normalizeBaseUrl(
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || DEFAULT_BASE_URL,
);

const isLocalBaseUrl = (() => {
  try {
    const parsed = new URL(baseURL);
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  } catch {
    return true;
  }
})();

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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: isLocalBaseUrl
    ? {
        command:
          "node -e \"try{require('fs').rmSync('apps/admin/.next/dev/lock',{force:true})}catch{}\" && bun run --cwd apps/admin dev:playwright -- --port 3030 --hostname localhost",
        url: baseURL,
        env: {
          ...process.env,
          // Align with scripts/run-with-ci-env.mjs when tests are run without it.
          E2E_AUTH_BYPASS: process.env.E2E_AUTH_BYPASS || "1",
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});
