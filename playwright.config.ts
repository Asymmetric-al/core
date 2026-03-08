import { defineConfig, devices } from "@playwright/test";

const DEFAULT_PORT = 3005;
const DEFAULT_SUPABASE_URL = "https://example.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "example-anon-key";
const PLAYWRIGHT_APP = process.env.PLAYWRIGHT_APP ?? "donor";

const PLAYWRIGHT_APPS = {
  admin: {
    defaultPort: 3030,
    devCommand:
      'node -e "try{require(\'fs\').rmSync(\'apps/admin/.next/dev/lock\',{force:true})}catch{}" && bun run --cwd apps/admin dev -- --port __PORT__ --hostname 127.0.0.1',
  },
  donor: {
    defaultPort: DEFAULT_PORT,
    devCommand:
      'node -e "try{require(\'fs\').rmSync(\'apps/donor/.next/dev/lock\',{force:true})}catch{}" && bun run --cwd apps/donor dev -- --port __PORT__ --hostname 127.0.0.1',
  },
  missionary: {
    defaultPort: 4000,
    devCommand:
      'node -e "try{require(\'fs\').rmSync(\'apps/missionary/.next/dev/lock\',{force:true})}catch{}" && bun run --cwd apps/missionary dev -- --port __PORT__ --hostname 127.0.0.1',
  },
} as const;

function getPlaywrightAppConfig() {
  const appConfig =
    PLAYWRIGHT_APPS[PLAYWRIGHT_APP as keyof typeof PLAYWRIGHT_APPS];

  if (!appConfig) {
    throw new Error(
      `Unsupported PLAYWRIGHT_APP: ${PLAYWRIGHT_APP}. Expected one of ${Object.keys(
        PLAYWRIGHT_APPS,
      ).join(", ")}`,
    );
  }

  return appConfig;
}

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

function getLocalBaseUrlAndPort(): { baseURL: string; port: number } {
  const appConfig = getPlaywrightAppConfig();
  const envBase = process.env.PLAYWRIGHT_BASE_URL;
  const envPort = Number(process.env.PLAYWRIGHT_PORT || appConfig.defaultPort);

  if (!envBase) {
    return { baseURL: `http://127.0.0.1:${envPort}`, port: envPort };
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
      // Prefer IPv4 loopback to avoid "localhost" resolving to ::1 and failing
      // when the server binds only on 127.0.0.1.
      baseURL: isLocalHost ? `http://127.0.0.1:${portFromUrl}` : envBase,
      port: portFromUrl,
    };
  } catch {
    // If it's not a valid URL string, fall back to port-based local URL.
    return { baseURL: `http://127.0.0.1:${envPort}`, port: envPort };
  }
}

const { baseURL, port } = getLocalBaseUrlAndPort();
const selectedApp = getPlaywrightAppConfig();

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

const webServer = isRemoteBaseUrl
  ? undefined
  : {
      command: selectedApp.devCommand.replace("__PORT__", String(port)),
      env: withCiEquivalentEnvDefaults(process.env),
      url: baseURL,
      // Always reuse if already running; otherwise start it.
      reuseExistingServer: true,
      timeout: 120000,
    };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
