import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

/**
 * Shared Playwright surface configuration.
 *
 * The per-app "boneyard" configs (playwright.admin/donor/missionary.config.ts)
 * and the main playwright.config.ts previously each re-implemented base-URL
 * normalization, worker counts, server-reuse policy, and the dev-server
 * command, and had already drifted (reuse policy, E2E_AUTH_BYPASS defaults).
 * This module owns that policy; configs compose it instead of re-typing it.
 */

const DEFAULT_LOCAL_WORKERS = 1;
const DEFAULT_WEB_SERVER_TIMEOUT_MS = 120_000;

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

export function getWorkerCount(
  env: NodeJS.ProcessEnv = process.env,
): number {
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
 * Dev-server launch command: clears a stale Next dev lock (crashed runs leave
 * it behind and block the next start), then runs the app's dev:playwright.
 */
export function devServerCommand(
  app: string,
  port: number,
  hostname: string,
): string {
  return `node -e "try{require('fs').rmSync('apps/${app}/.next/dev/lock',{force:true})}catch{}" && bun run --cwd apps/${app} dev:playwright -- --port ${port} --hostname ${hostname}`;
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
    fullyParallel: false,
    forbidOnly: !!env.CI,
    retries: env.CI ? 2 : 0,
    workers: getWorkerCount(env),
    ...(surface.testTimeout ? { timeout: surface.testTimeout } : {}),
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
          command: devServerCommand(
            surface.app,
            surface.defaultPort,
            surface.serverHostname,
          ),
          url: baseURL,
          env: {
            ...env,
            E2E_AUTH_BYPASS: env.E2E_AUTH_BYPASS || "true",
          } as Record<string, string>,
          reuseExistingServer: shouldReuseExistingServer(env),
          timeout: DEFAULT_WEB_SERVER_TIMEOUT_MS,
        }
      : undefined,
  });
}
