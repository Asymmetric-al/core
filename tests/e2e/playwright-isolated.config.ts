import { defineConfig } from "@playwright/test";

// Real React components with synthetic boundaries: no live server, credentials,
// external provider calls, or authenticated fixtures are loaded by this config.
export default defineConfig({
  testDir: ".",
  testMatch: [
    "teams-surface.spec.ts",
    "missionary-dashboard-charts.spec.ts",
    "donor-wallet-layout.spec.ts",
    "data-table-accessibility.spec.ts",
    "popover-positioning.spec.ts",
    "react-cleanup-contributions.spec.ts",
    "react-cleanup-grid.spec.ts",
    "react-cleanup-map.spec.ts",
    "react-cleanup-memory.spec.ts",
  ],
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [["list"]],
  use: {
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  outputDir: "../../.reference/react-cleanup-browser-results",
});
