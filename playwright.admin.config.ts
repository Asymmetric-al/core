import { defineConfig, devices } from "@playwright/test";

const DEFAULT_BASE_URL = "http://127.0.0.1:3030";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || DEFAULT_BASE_URL;

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
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
          "node -e \"try{require('fs').rmSync('apps/admin/.next/dev/lock',{force:true})}catch{}\" && bun run --cwd apps/admin dev -- --port 3030 --hostname 127.0.0.1",
        url: DEFAULT_BASE_URL,
        reuseExistingServer: true,
        timeout: 120000,
      }
    : undefined,
});
