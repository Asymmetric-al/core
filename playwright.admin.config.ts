import { defineConfig, devices } from "@playwright/test";

const ADMIN_PORT = 3030;
const BASE_URL = process.env.PLAYWRIGHT_ADMIN_BASE_URL ?? `http://127.0.0.1:${ADMIN_PORT}`;

const isRemote = (() => {
  if (!process.env.PLAYWRIGHT_ADMIN_BASE_URL) return false;
  try {
    const url = new URL(process.env.PLAYWRIGHT_ADMIN_BASE_URL);
    const h = url.hostname.toLowerCase();
    return h !== "localhost" && h !== "127.0.0.1" && h !== "::1";
  } catch {
    return false;
  }
})();

const webServer = isRemote
  ? undefined
  : {
      command: `SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ci-placeholder.supabase.co"} NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "ci-placeholder"} bun run --cwd apps/admin dev -- --port ${ADMIN_PORT} --hostname 127.0.0.1`,
      url: `${BASE_URL}/api/health`,
      reuseExistingServer: true,
      timeout: 120_000,
    };

export default defineConfig({
  testDir: "./tests/e2e-admin",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report-admin" }],
    ["json", { outputFile: "playwright-report-admin/results.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  ...(webServer ? { webServer } : {}),
});
