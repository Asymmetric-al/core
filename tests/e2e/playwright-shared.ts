import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";

/**
 * Shared Playwright surface configuration. The main playwright.config.ts and
 * the per-app "boneyard" configs (playwright.admin/donor/missionary.config.ts)
 * take base-URL normalization, worker counts, server-reuse policy and the
 * dev-server command from here; the boneyard configs also take their whole
 * run policy from {@link defineBoneyardConfig}. Change that policy here rather
 * than in one config, so the configs cannot drift apart.
 */

const DEFAULT_LOCAL_WORKERS = 1;
const DEFAULT_WEB_SERVER_TIMEOUT_MS = 120_000;
/**
 * Every assertion's timeout, stated rather than inherited from Playwright, so
 * that a wait which must cover a route's first compile in `next dev` says
 * so with its own timeout in the spec instead of hiding behind this one or
 * behind CI's retries (council round 1, A17).
 */
const EXPECT_TIMEOUT_MS = 5_000;

export interface BoneyardSurface {
  /** Workspace directory under apps/ that owns the dev server. */
  app: "admin" | "donor" | "missionary";
  /** Playwright project name for this surface's boneyard run. */
  projectName: string;
  /** Port the dev server binds when no base URL is configured. */
  defaultPort: number;
  /** Env vars consulted for the surface base URL, in precedence order. */
  baseUrlEnvVars: readonly string[];
  /** Hostname passed to the dev server command. */
  serverHostname: string;
  /** Per-test timeout override (admin first-hit compilation exceeds 30s). */
  testTimeout?: number;
  /**
   * Donor semantics: when a base URL env var is set — even a local one — the
   * caller owns the server lifecycle, so no webServer entry is emitted.
   */
  skipWebServerWhenBaseUrlConfigured?: boolean;
}

export const ADMIN_SURFACE: BoneyardSurface = {
  app: "admin",
  projectName: "admin-boneyard",
  defaultPort: 3030,
  baseUrlEnvVars: ["PLAYWRIGHT_ADMIN_BASE_URL", "QA_ADMIN_BASE_URL"],
  serverHostname: "localhost",
  testTimeout: 180_000,
};

export const DONOR_SURFACE: BoneyardSurface = {
  app: "donor",
  projectName: "donor-boneyard",
  defaultPort: 3000,
  baseUrlEnvVars: ["PLAYWRIGHT_DONOR_BASE_URL", "QA_DONOR_BASE_URL"],
  serverHostname: "127.0.0.1",
  skipWebServerWhenBaseUrlConfigured: true,
};

export const MISSIONARY_SURFACE: BoneyardSurface = {
  app: "missionary",
  projectName: "missionary-boneyard",
  defaultPort: 4000,
  baseUrlEnvVars: ["PLAYWRIGHT_MISSIONARY_BASE_URL", "QA_MISSIONARY_BASE_URL"],
  serverHostname: "localhost",
};

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.+$/, "");
}

export function isLocalHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname).replace(/^\[(.*)\]$/, "$1");
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
}

/**
 * Map any loopback base URL onto http://localhost:<port> so cookies, CORS,
 * and readiness checks agree on one origin; pass remote URLs through.
 * Invalid URLs fall back to the surface default.
 */
export function normalizeLocalBaseUrl(
  baseUrl: string,
  defaultPort: number,
): string {
  try {
    const parsed = new URL(baseUrl);
    if (!isLocalHostname(parsed.hostname)) {
      return baseUrl;
    }

    const port =
      parsed.port || String(parsed.protocol === "https:" ? 443 : defaultPort);
    return `http://localhost:${port}`;
  } catch {
    return `http://localhost:${defaultPort}`;
  }
}

export function isLocalBaseUrl(baseUrl: string): boolean {
  try {
    const parsed = new URL(baseUrl);
    return isLocalHostname(parsed.hostname);
  } catch {
    return true;
  }
}

export function getWorkerCount(env: NodeJS.ProcessEnv = process.env): number {
  const envWorkers = Number(env.PLAYWRIGHT_WORKERS);
  if (Number.isFinite(envWorkers) && envWorkers > 0) {
    return envWorkers;
  }

  return env.CI ? 1 : DEFAULT_LOCAL_WORKERS;
}

/**
 * Reuse an already-running dev server unless CI; PLAYWRIGHT_REUSE_EXISTING_SERVER
 * ("1"/"true"/"0"/"false") overrides in either direction.
 */
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

/**
 * Dev-server launch command: the app's dev:playwright. It never deletes
 * `.next/dev/lock`: Next.js holds it as an operating-system lock released
 * when its process dies, so a crashed run does not block the next start, and
 * a live lock means a dev server is already running there. Outside CI the
 * command first runs ./dev-server-lock.mjs, which names such a server and
 * says what to do instead of letting a second `next dev` exit. CI keeps the
 * plain command: its jobs start each server once and reuse it.
 */
export function devServerCommand(
  app: string,
  port: number,
  hostname: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const start = `bun run --cwd apps/${app} dev:playwright -- --port ${port} --hostname ${hostname}`;
  return env.CI
    ? start
    : `node tests/e2e/dev-server-lock.mjs ${app} ${port} ${hostname} && ${start}`;
}

function firstConfiguredEnvValue(
  envVars: readonly string[],
  env: NodeJS.ProcessEnv,
): string | undefined {
  for (const name of envVars) {
    const value = env[name];
    if (value) {
      return value;
    }
  }
  return undefined;
}

export function resolveSurfaceBaseUrl(
  surface: BoneyardSurface,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configured = firstConfiguredEnvValue(surface.baseUrlEnvVars, env);
  return normalizeLocalBaseUrl(
    configured || `http://localhost:${surface.defaultPort}`,
    surface.defaultPort,
  );
}

/**
 * Build the full boneyard config for one app surface. Owns the shared run
 * policy (serial, CI retries, artifact capture) and the local dev-server
 * lifecycle, including the E2E_AUTH_BYPASS default that dev servers need when
 * tests run without scripts/run-with-ci-env.mjs.
 */
export function defineBoneyardConfig(
  surface: BoneyardSurface,
  env: NodeJS.ProcessEnv = process.env,
): PlaywrightTestConfig {
  const baseURL = resolveSurfaceBaseUrl(surface, env);
  const baseUrlConfigured = Boolean(
    firstConfiguredEnvValue(surface.baseUrlEnvVars, env),
  );
  const startLocalWebServer =
    isLocalBaseUrl(baseURL) &&
    !(surface.skipWebServerWhenBaseUrlConfigured && baseUrlConfigured);

  return defineConfig({
    testDir: "./tests/e2e",
    outputDir: `test-results/${surface.projectName}`,
    fullyParallel: false,
    forbidOnly: !!env.CI,
    retries: env.CI ? 2 : 0,
    workers: getWorkerCount(env),
    ...(surface.testTimeout ? { timeout: surface.testTimeout } : {}),
    expect: { timeout: EXPECT_TIMEOUT_MS },
    reporter: [["list"]],
    use: {
      baseURL,
      trace: "retain-on-failure",
      screenshot: "only-on-failure",
      video: "retain-on-failure",
    },
    projects: [
      { name: surface.projectName, use: { ...devices["Desktop Chrome"] } },
    ],
    webServer: startLocalWebServer
      ? {
          // Serve on the base URL's port, so a checkout beside others can
          // pick its own.
          command: devServerCommand(
            surface.app,
            Number(new URL(baseURL).port) || surface.defaultPort,
            surface.serverHostname,
            env,
          ),
          url: baseURL,
          env: {
            ...env,
            E2E_AUTH_BYPASS: env.E2E_AUTH_BYPASS || "true",
            E2E_AUTH_TENANT_ID:
              env.E2E_AUTH_TENANT_ID || "00000000-0000-0000-0000-000000000001",
            // The E2E cookie is chosen by port for the default ports only.
            ASYM_E2E_AUTH_SURFACE: surface.app,
          } as Record<string, string>,
          reuseExistingServer: shouldReuseExistingServer(env),
          timeout: DEFAULT_WEB_SERVER_TIMEOUT_MS,
        }
      : undefined,
  });
}
