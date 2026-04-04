import { defineConfig, devices } from "@playwright/test";

const DEFAULT_DONOR_PORT = 3005;
const DEFAULT_ADMIN_PORT = 3030;
const DEFAULT_LOCAL_HOSTNAME = "localhost";
const DEFAULT_SUPABASE_URL = "https://example.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "example-anon-key";
const DEFAULT_PAYLOAD_DATABASE_URI =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const DEFAULT_PAYLOAD_SECRET = "playwright-secret";
const DEFAULT_LOCAL_WORKERS = 1;

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
    nextEnv.E2E_AUTH_BYPASS = "1";
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

function getLocalBaseUrlAndPort(defaultPort: number): {
  baseURL: string;
  port: number;
} {
  const envBase = process.env.PLAYWRIGHT_BASE_URL;
  const envPort = Number(process.env.PLAYWRIGHT_PORT || defaultPort);

  if (!envBase) {
    return {
      baseURL: `http://${DEFAULT_LOCAL_HOSTNAME}:${envPort}`,
      port: envPort,
    };
  }

  // If the user points to a local URL (common in `.env.local`), still start/reuse
  // the dev server. If they point to a remote URL, don't start a local server.
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
    // If it's not a valid URL string, fall back to port-based local URL.
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
  process.env.PLAYWRIGHT_ADMIN_BASE_URL ||
    `http://${DEFAULT_LOCAL_HOSTNAME}:${adminPort}`,
  adminPort,
);
const resolvedEnv = withPlaywrightEnvDefaults(process.env);
const supabaseURL =
  resolvedEnv.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  resolvedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

const isRemoteBaseUrl = (() => {
  const envBase = process.env.PLAYWRIGHT_BASE_URL;
  if (!envBase) return false;
  try {
    const url = new URL(envBase);
    return !isLocalHostname(url.hostname);
  } catch {
    return false;
  }
})();

function shouldIncludeAdminServer() {
  if (process.env.PLAYWRIGHT_INCLUDE_ADMIN === "0") return false;
  if (process.env.PLAYWRIGHT_INCLUDE_ADMIN === "1") return true;

  const cliArgs = process.argv.slice(2);
  for (let index = 0; index < cliArgs.length; index += 1) {
    const arg = cliArgs[index] || "";

    if (arg === "--grep") {
      const pattern = cliArgs[index + 1] || "";
      if (pattern.includes("@cms")) return true;
      continue;
    }

    if (
      arg.includes("tests/e2e/cms-") ||
      arg.includes("site-studio-video-tour.spec.ts")
    ) {
      return true;
    }
  }

  return false;
}

const donorServer = {
  command: `node -e "try{require('fs').rmSync('apps/donor/.next/dev/lock',{force:true})}catch{}" && bun run --cwd apps/donor dev:playwright -- --port ${port} --hostname ${DEFAULT_LOCAL_HOSTNAME}`,
  env: {
    ...resolvedEnv,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_SUPABASE_URL: supabaseURL,
    DEMO_ADMIN_EMAIL: resolvedEnv.DEMO_ADMIN_EMAIL || "",
    DEMO_DONOR_EMAIL: resolvedEnv.DEMO_DONOR_EMAIL || "",
    DEMO_MISSIONARY_EMAIL: resolvedEnv.DEMO_MISSIONARY_EMAIL || "",
    DEMO_PASSWORD: resolvedEnv.DEMO_PASSWORD || "",
  },
  url: baseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
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
  url: `${adminBaseURL}/login`,
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
} as const;

const includeAdminServer = shouldIncludeAdminServer();
const webServer = isRemoteBaseUrl
  ? undefined
  : includeAdminServer
    ? [donorServer, adminServer]
    : donorServer;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: getWorkerCount(),
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  ...(webServer ? { webServer } : {}),
});
