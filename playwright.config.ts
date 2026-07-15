import path from "path";

import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

import { nextDevReadyURL } from "./tests/e2e/base-urls";

// Load root .env.local (and .env*) into process.env before the webServer env
// blocks below are computed. Without this, keys like DEMO_ADMIN_EMAIL are set
// to "" for the dev servers, which beats .env.local inside `next dev` and
// makes every demo-gated e2e test skip silently with exit 0. Shell-set vars
// always win — loadEnvConfig never overrides existing process.env keys.
// Skipped under ASYM_USE_CI_ENV_DEFAULTS (hermetic CI simulation) and under
// Vitest (unit tests import this module and must stay off live secrets).
if (process.env.ASYM_USE_CI_ENV_DEFAULTS !== "1" && !process.env.VITEST) {
  loadEnvConfig(__dirname);
}

const DEFAULT_DONOR_PORT = 3005;
const DEFAULT_ADMIN_PORT = 3030;
const DEFAULT_LOCAL_HOSTNAME = "localhost";
const DEFAULT_SUPABASE_URL = "https://example.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "example-anon-key";
const DEFAULT_PAYLOAD_DATABASE_URI =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const DEFAULT_PAYLOAD_SECRET = "playwright-secret";
const DEFAULT_LOCAL_WORKERS = 1;
const DEFAULT_PROJECT_TEST_IGNORE = Object.freeze([
  "**/upload-crop.spec.ts",
  "**/donor-giving-history.spec.ts",
  "**/mc-contributions-live-query.spec.ts",
]);
const DONOR_ONLY_ADDITIONAL_TEST_IGNORE = Object.freeze([
  "**/admin-*.spec.ts",
  "**/auth-demo-admin.spec.ts",
  "**/auth-login-screen-admin.spec.ts",
  "**/auth-demo-missionary.spec.ts",
  "**/auth-login-screen-missionary.spec.ts",
  "**/boneyard-smoke.spec.ts",
  "**/cms-*.spec.ts",
  "**/cms-local-happy-path.spec.ts",
  "**/site-studio-video-tour.spec.ts",
  "**/support-hub.smoke.spec.ts",
]);

function withCiEquivalentEnvDefaults(
  env: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  if (env.ASYM_USE_CI_ENV_DEFAULTS !== "1") {
    return { ...env };
  }

  return {
    ...env,
    SKIP_ENV_VALIDATION: env.SKIP_ENV_VALIDATION || "1",
    NEXT_PUBLIC_SUPABASE_URL:
      env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  };
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.+$/, "");
}

function isLocalHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname).replace(/^\[(.*)\]$/, "$1");
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
}

function withPlaywrightEnvDefaults(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const nextEnv = withCiEquivalentEnvDefaults(env);

  if (nextEnv.ASYM_USE_CI_ENV_DEFAULTS === "1" && !nextEnv.E2E_AUTH_BYPASS) {
    // Must match @asym/env optionalBoolean ("true"|"false"), not "1".
    nextEnv.E2E_AUTH_BYPASS = "true";
  }

  return nextEnv;
}

function getWorkerCount(): number {
  const envWorkers = Number(process.env.PLAYWRIGHT_WORKERS);
  if (Number.isFinite(envWorkers) && envWorkers > 0) {
    return envWorkers;
  }

  return process.env.CI ? 1 : DEFAULT_LOCAL_WORKERS;
}

export function shouldReuseExistingServer(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const configuredValue =
    env.PLAYWRIGHT_REUSE_EXISTING_SERVER?.trim().toLowerCase();

  if (configuredValue === "1" || configuredValue === "true") {
    return true;
  }

  if (configuredValue === "0" || configuredValue === "false") {
    return false;
  }

  return !env.CI;
}

export function resolveDonorBaseUrlEnv(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return env.PLAYWRIGHT_BASE_URL || env.QA_DONOR_BASE_URL;
}

export function resolveAdminBaseUrlEnv(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return env.PLAYWRIGHT_ADMIN_BASE_URL || env.QA_ADMIN_BASE_URL;
}

export function getDefaultProjectTestIgnore(
  includeAdminOrEnv: boolean | NodeJS.ProcessEnv = process.env,
): string[] {
  const includeAdmin =
    typeof includeAdminOrEnv === "boolean"
      ? includeAdminOrEnv
      : includeAdminOrEnv.PLAYWRIGHT_INCLUDE_ADMIN !== "0";

  return includeAdmin
    ? [...DEFAULT_PROJECT_TEST_IGNORE]
    : [...DEFAULT_PROJECT_TEST_IGNORE, ...DONOR_ONLY_ADDITIONAL_TEST_IGNORE];
}

function getLocalBaseUrlAndPort(defaultPort: number): {
  baseURL: string;
  port: number;
} {
  const envBase = resolveDonorBaseUrlEnv();
  const envPort = Number(process.env.PLAYWRIGHT_PORT || defaultPort);

  if (!envBase) {
    return {
      baseURL: `http://${DEFAULT_LOCAL_HOSTNAME}:${envPort}`,
      port: envPort,
    };
  }

  try {
    const url = new URL(envBase);
    const isLocalHost = isLocalHostname(url.hostname);
    const portFromUrl = url.port
      ? Number(url.port)
      : url.protocol === "https:"
        ? 443
        : 80;

    return {
      baseURL: isLocalHost
        ? `http://${DEFAULT_LOCAL_HOSTNAME}:${portFromUrl}`
        : envBase,
      port: portFromUrl,
    };
  } catch {
    return {
      baseURL: `http://${DEFAULT_LOCAL_HOSTNAME}:${envPort}`,
      port: envPort,
    };
  }
}

function normalizeBaseUrl(baseUrl: string, defaultPort: number): string {
  try {
    const url = new URL(baseUrl);
    if (!isLocalHostname(url.hostname)) {
      return baseUrl;
    }

    const port =
      url.port || String(url.protocol === "https:" ? 443 : defaultPort);
    return `http://${DEFAULT_LOCAL_HOSTNAME}:${port}`;
  } catch {
    return `http://${DEFAULT_LOCAL_HOSTNAME}:${defaultPort}`;
  }
}

const { baseURL, port } = getLocalBaseUrlAndPort(DEFAULT_DONOR_PORT);
const adminPort = Number(
  process.env.PLAYWRIGHT_ADMIN_PORT || DEFAULT_ADMIN_PORT,
);
const adminBaseURL = normalizeBaseUrl(
  resolveAdminBaseUrlEnv() || `http://${DEFAULT_LOCAL_HOSTNAME}:${adminPort}`,
  adminPort,
);
const resolvedEnv = withPlaywrightEnvDefaults(process.env);
const supabaseURL =
  resolvedEnv.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  resolvedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const reuseExistingServer = shouldReuseExistingServer(process.env);

const isRemoteBaseUrl = (() => {
  const envBase = resolveDonorBaseUrlEnv();
  if (!envBase) return false;
  try {
    const url = new URL(envBase);
    return !isLocalHostname(url.hostname);
  } catch {
    return false;
  }
})();

/** First-run Turbopack compiles for donor + admin can exceed 3 minutes in CI/sandboxes. */
const PLAYWRIGHT_WEB_SERVER_TIMEOUT_MS = Number(
  process.env.PLAYWRIGHT_WEB_SERVER_TIMEOUT_MS || 600_000,
);

const donorServer = {
  command: `node -e "try{require('fs').rmSync('apps/donor/.next/dev/lock',{force:true})}catch{}" && bun run --cwd apps/donor dev:playwright -- --port ${port} --hostname ${DEFAULT_LOCAL_HOSTNAME}`,
  env: {
    ...resolvedEnv,
    // Match admin Playwright server: bypass must be on in dev or middleware/RSC
    // ignore the E2E cookie even when tests run without run-with-ci-env.mjs.
    // @asym/env only accepts "true"|"false" for E2E_AUTH_BYPASS (not "1").
    E2E_AUTH_BYPASS: resolvedEnv.E2E_AUTH_BYPASS || "true",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_SUPABASE_URL: supabaseURL,
    DEMO_ADMIN_EMAIL: resolvedEnv.DEMO_ADMIN_EMAIL || "",
    DEMO_DONOR_EMAIL: resolvedEnv.DEMO_DONOR_EMAIL || "",
    DEMO_MISSIONARY_EMAIL: resolvedEnv.DEMO_MISSIONARY_EMAIL || "",
    DEMO_PASSWORD: resolvedEnv.DEMO_PASSWORD || "",
  },
  url: nextDevReadyURL(baseURL),
  reuseExistingServer,
  timeout: PLAYWRIGHT_WEB_SERVER_TIMEOUT_MS,
} as const;

const adminServer = {
  command: `node -e "try{require('fs').rmSync('apps/admin/.next/dev/lock',{force:true})}catch{}" && bun run --cwd apps/admin dev:playwright -- --port ${adminPort} --hostname ${DEFAULT_LOCAL_HOSTNAME}`,
  env: {
    ...resolvedEnv,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_SUPABASE_URL: supabaseURL,
    PAYLOAD_DATABASE_URI:
      resolvedEnv.PAYLOAD_DATABASE_URI || DEFAULT_PAYLOAD_DATABASE_URI,
    PAYLOAD_SECRET: resolvedEnv.PAYLOAD_SECRET || DEFAULT_PAYLOAD_SECRET,
    DEMO_ADMIN_EMAIL: resolvedEnv.DEMO_ADMIN_EMAIL || "",
    DEMO_DONOR_EMAIL: resolvedEnv.DEMO_DONOR_EMAIL || "",
    DEMO_MISSIONARY_EMAIL: resolvedEnv.DEMO_MISSIONARY_EMAIL || "",
    DEMO_PASSWORD: resolvedEnv.DEMO_PASSWORD || "",
  },
  url: nextDevReadyURL(adminBaseURL),
  reuseExistingServer,
  timeout: PLAYWRIGHT_WEB_SERVER_TIMEOUT_MS,
} as const;

const includeAdminServer =
  !isRemoteBaseUrl && process.env.PLAYWRIGHT_INCLUDE_ADMIN !== "0";
const defaultProjectTestIgnore =
  getDefaultProjectTestIgnore(includeAdminServer);

const webServer = isRemoteBaseUrl
  ? undefined
  : includeAdminServer
    ? [donorServer, adminServer]
    : donorServer;

const donorAuthState = path.join(__dirname, ".auth", "donor.json");
const adminAuthState = path.join(__dirname, ".auth", "admin.json");

export default defineConfig({
  globalSetup: path.join(__dirname, "tests", "e2e", "global-setup.ts"),
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: getWorkerCount(),
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
      testIgnore: defaultProjectTestIgnore,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: defaultProjectTestIgnore,
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
        baseURL: adminBaseURL,
        storageState: adminAuthState,
      },
      testMatch: ["**/mc-contributions-live-query.spec.ts"],
    },
  ],
  ...(webServer ? { webServer } : {}),
});
