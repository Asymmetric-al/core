import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/n2-on-*.spec.ts"],
  outputDir: "test-results/n2-on",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 240_000,
  expect: { timeout: 30_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.N2_ON_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    navigationTimeout: 90_000,
    actionTimeout: 30_000,
  },
  projects: [{ name: "n2-on", use: { ...devices["Desktop Chrome"] } }],
});
