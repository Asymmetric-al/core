import { defineConfig, devices } from "@playwright/test";

import {
  GUEST_GIVING_PORTS,
  JOURNEY_PUBLISHABLE_KEY,
  TURNSTILE_TEST_KEYS,
} from "./tests/e2e/helpers/guest-giving";
import {
  devServerCommand,
  shouldReuseExistingServer,
} from "./tests/e2e/playwright-shared";

const LEVEL_2 = process.env.GIVING_STRIPE_TEST_PROOF === "1";
const SERVER_TIMEOUT_MS = Number(
  process.env.PLAYWRIGHT_WEB_SERVER_TIMEOUT_MS || 600_000,
);

const givingEnv: Record<string, string | undefined> = {
  ...process.env,
  E2E_AUTH_BYPASS: "false",
  SKIP_ENV_VALIDATION: undefined,
  EVE_BASE_URL: process.env.EVE_BASE_URL || "http://127.0.0.1:9",
  CORE_SERVE_UNDER_PATHS: undefined,
  GUEST_GIVING_ENABLED: "true",
  TURNSTILE_SECRET_KEY: TURNSTILE_TEST_KEYS.secret,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_KEYS.site,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: LEVEL_2
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    : JOURNEY_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: LEVEL_2 ? process.env.STRIPE_SECRET_KEY : "",
  STRIPE_PAYMENT_EVENTS_WEBHOOK_SECRET: LEVEL_2
    ? process.env.STRIPE_PAYMENT_EVENTS_WEBHOOK_SECRET
    : "",
  ...(!process.env.PAYLOAD_DATABASE_URI && process.env.GUEST_GIVING_E2E_DB_URL
    ? { PAYLOAD_DATABASE_URI: process.env.GUEST_GIVING_E2E_DB_URL }
    : {}),
};

const adminEnv: Record<string, string | undefined> = {
  ...givingEnv,
  NODE_OPTIONS: [
    process.env.NODE_OPTIONS?.trim(),
    "--dns-result-order=ipv4first",
  ]
    .filter(Boolean)
    .join(" "),
  OPERATIONS_NAMES: `localhost:${GUEST_GIVING_PORTS.admin}`,
};

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/guest-giving.spec.ts"],
  outputDir: "test-results/guest-giving",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 900_000,
  expect: { timeout: 120_000 },
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    navigationTimeout: 300_000,
    actionTimeout: 120_000,
  },
  projects: [{ name: "guest-giving", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: devServerCommand("donor", GUEST_GIVING_PORTS.donor, "127.0.0.1"),
      url: `http://127.0.0.1:${GUEST_GIVING_PORTS.donor}/api/playwright-ready`,
      env: givingEnv as Record<string, string>,
      reuseExistingServer: shouldReuseExistingServer(process.env),
      timeout: SERVER_TIMEOUT_MS,
    },
    ...(LEVEL_2
      ? [
          {
            command: devServerCommand(
              "admin",
              GUEST_GIVING_PORTS.admin,
              "localhost",
            ),
            url: `http://127.0.0.1:${GUEST_GIVING_PORTS.admin}/api/playwright-ready`,
            env: adminEnv as Record<string, string>,
            reuseExistingServer: shouldReuseExistingServer(process.env),
            timeout: SERVER_TIMEOUT_MS,
          },
        ]
      : []),
  ],
});
