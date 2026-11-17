import { defineConfig, devices } from "@playwright/test";

import {
  devServerCommand,
  shouldReuseExistingServer,
} from "./tests/e2e/playwright-shared";

/**
 * Supabase Auth email journeys against a local Supabase stack and its mail
 * catcher: each spec runs once per app, on servers this config starts.
 *
 * Needs, all pointing at the local stack (`supabase status -o env`):
 * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (or
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), SUPABASE_SERVICE_ROLE_KEY and
 * E2E_AUTH_MAIL_URL (Mailpit). The specs skip without them and refuse a
 * Supabase URL that is not on this machine.
 *
 * The servers listen on 127.0.0.1 and the tests open them as localhost, so
 * the email links must come back through the local redirect allowlist. The
 * ports stay clear of the apps' everyday dev ports; override them with
 * AUTH_MAIL_DONOR_PORT, AUTH_MAIL_ADMIN_PORT and AUTH_MAIL_MISSIONARY_PORT.
 */

const SERVER_HOST = "127.0.0.1";
const SERVER_TIMEOUT_MS = Number(
  process.env.PLAYWRIGHT_WEB_SERVER_TIMEOUT_MS || 600_000,
);

const surfaces = [
  {
    app: "donor",
    port: Number(process.env.AUTH_MAIL_DONOR_PORT || 3105),
    readyPath: "/api/playwright-ready",
  },
  {
    app: "admin",
    port: Number(process.env.AUTH_MAIL_ADMIN_PORT || 3130),
    readyPath: "/api/playwright-ready",
  },
  {
    app: "missionary",
    port: Number(process.env.AUTH_MAIL_MISSIONARY_PORT || 4100),
    readyPath: "/login",
  },
] as const;

const serverEnv = {
  ...process.env,
  // Real sessions only: the e2e cookie bypass would hide auth defects.
  E2E_AUTH_BYPASS: "false",
  SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || "1",
  // These journeys never reach the assistant runtime. A set base URL stops
  // Mission Control's dev server from building and starting it (`eve/next`).
  EVE_BASE_URL: process.env.EVE_BASE_URL || "http://127.0.0.1:9",
} as Record<string, string>;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "**/auth-password-recovery.spec.ts",
    "**/auth-signup-confirmation.spec.ts",
  ],
  outputDir: "test-results/auth-mail",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  // Each journey visits four or five routes, each compiled on first visit by
  // a dev server; on a loaded machine one compile can take minutes.
  timeout: 900_000,
  expect: { timeout: 120_000 },
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    navigationTimeout: 300_000,
    actionTimeout: 120_000,
  },
  projects: surfaces.map(({ app, port }) => ({
    name: `auth-mail-${app}`,
    use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${port}` },
  })),
  webServer: surfaces.map(({ app, port, readyPath }) => ({
    command: devServerCommand(app, port, SERVER_HOST),
    url: `http://${SERVER_HOST}:${port}${readyPath}`,
    env: serverEnv,
    reuseExistingServer: shouldReuseExistingServer(process.env),
    timeout: SERVER_TIMEOUT_MS,
  })),
});
