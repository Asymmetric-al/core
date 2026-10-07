import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: new URL("../../../tests/e2e", import.meta.url).pathname,
  testMatch: [
    "data-table-accessibility.spec.ts",
    "shared-primitive-contrast.spec.ts",
    "dialog-dismissal.spec.ts",
    "popover-positioning.spec.ts",
    "missionary-dashboard-charts.spec.ts",
    "missionary-summary-layout.spec.ts",
    "public-about-layout.spec.ts",
    "donor-wallet-layout.spec.ts",
  ],
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  outputDir: new URL(
    "../../../test-results/core-ui-components",
    import.meta.url,
  ).pathname,
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: {
      executablePath:
        process.env.UI_AUDIT_CHROMIUM_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
