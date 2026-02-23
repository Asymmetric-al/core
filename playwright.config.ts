import { defineConfig, devices } from "@playwright/test";

const DEFAULT_DONOR_PORT = 3005;
const DEFAULT_ADMIN_PORT = 3030;

function getLocalBaseUrlAndPort(
  defaultPort: number,
): { baseURL: string; port: number } {
  const envBase = process.env.PLAYWRIGHT_BASE_URL;
  const envPort = Number(process.env.PLAYWRIGHT_PORT || defaultPort);

  if (!envBase) {
    return { baseURL: `http://127.0.0.1:${envPort}`, port: envPort };
  }

  // If the user points to a local URL (common in `.env.local`), still start/reuse
  // the dev server. If they point to a remote URL, don't start a local server.
  try {
    const url = new URL(envBase);
    const isLocalHost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
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

const { baseURL, port } = getLocalBaseUrlAndPort(DEFAULT_DONOR_PORT);
const adminPort = Number(process.env.PLAYWRIGHT_ADMIN_PORT || DEFAULT_ADMIN_PORT);
const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || `http://127.0.0.1:${adminPort}`;

const isRemoteBaseUrl = (() => {
  const envBase = process.env.PLAYWRIGHT_BASE_URL;
  if (!envBase) return false;
  try {
    const url = new URL(envBase);
    return url.hostname !== "localhost" && url.hostname !== "127.0.0.1";
  } catch {
    return false;
  }
})();

const webServer = isRemoteBaseUrl
  ? undefined
  : [
      {
        command: `node -e "try{require('fs').rmSync('apps/donor/.next/dev/lock',{force:true})}catch{}" && SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key bun run --cwd apps/donor dev -- --port ${port} --hostname 127.0.0.1`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000,
      },
      {
        command: `node -e "try{require('fs').rmSync('apps/admin/.next/dev/lock',{force:true})}catch{}" && SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key PAYLOAD_SECRET=playwright-secret PAYLOAD_DATABASE_URI=postgresql://postgres:postgres@127.0.0.1:54322/postgres bun run --cwd apps/admin dev -- --port ${adminPort} --hostname 127.0.0.1`,
        url: `${adminBaseURL}/login`,
        reuseExistingServer: true,
        timeout: 120000,
      },
    ];

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
