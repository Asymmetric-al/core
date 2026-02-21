import { defineConfig, devices } from "@playwright/test";

const DEFAULT_PORT = 3005;

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
  const envBase = process.env.PLAYWRIGHT_BASE_URL;
  const envPort = Number(process.env.PLAYWRIGHT_PORT || DEFAULT_PORT);

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
      command: `node -e "try{require('fs').rmSync('apps/donor/.next/dev/lock',{force:true})}catch{}" && bun run --cwd apps/donor dev -- --port ${port} --hostname 127.0.0.1`,
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
