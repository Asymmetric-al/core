import path from "path";
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 3005);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

const webServer = process.env.PLAYWRIGHT_BASE_URL
  ? undefined
  : {
      command: `bun --bun next dev -p ${port}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
    };

const donorAuthState = path.join(__dirname, ".auth", "donor.json");
const adminAuthState = path.join(__dirname, ".auth", "admin.json");

export default defineConfig({
  globalSetup: path.join(__dirname, "tests", "e2e", "global-setup.ts"),
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 90_000,
    actionTimeout: 45_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [
        "**/upload-crop.spec.ts",
        "**/donor-giving-history.spec.ts",
        "**/mc-contributions-live-query.spec.ts",
      ],
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: [
        "**/upload-crop.spec.ts",
        "**/donor-giving-history.spec.ts",
        "**/mc-contributions-live-query.spec.ts",
      ],
    },
    {
      name: "chromium-donor",
      use: {
        ...devices["Desktop Chrome"],
        storageState: donorAuthState,
      },
      testMatch: ["**/upload-crop.spec.ts", "**/donor-giving-history.spec.ts"],
    },
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: adminAuthState,
      },
      testMatch: ["**/mc-contributions-live-query.spec.ts"],
    },
  ],
  ...(webServer ? { webServer } : {}),
});
