import { resolve } from "node:path";

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./specs",
  outputDir: resolve(
    __dirname,
    "../../../test-results/base-ui-compliance/playwright",
  ),
  timeout: 45_000,
  globalTimeout: 240_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  workers: 2,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: resolve(
          __dirname,
          "../../../test-results/base-ui-compliance/report",
        ),
        open: "never",
      },
    ],
  ],
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:5198",
    hasTouch: true,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-light",
      use: {
        viewport: { width: 1280, height: 844 },
        colorScheme: "light",
        contextOptions: { reducedMotion: "no-preference" },
      },
    },
    {
      name: "mobile-light",
      use: {
        viewport: { width: 390, height: 844 },
        colorScheme: "light",
        contextOptions: { reducedMotion: "no-preference" },
      },
    },
    {
      name: "desktop-dark-reduced",
      use: {
        viewport: { width: 1280, height: 844 },
        colorScheme: "dark",
        contextOptions: { reducedMotion: "reduce" },
      },
    },
    {
      name: "mobile-dark-reduced",
      use: {
        viewport: { width: 390, height: 844 },
        colorScheme: "dark",
        contextOptions: { reducedMotion: "reduce" },
      },
    },
  ],
  webServer: {
    command: "node tests/fixtures/base-ui-compliance/server.mjs",
    cwd: resolve(__dirname, "../../.."),
    url: "http://127.0.0.1:5198",
    reuseExistingServer: false,
    timeout: 60_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
