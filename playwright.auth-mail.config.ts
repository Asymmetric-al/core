import { defineConfig, devices } from "@playwright/test";

import { adminServerLogFile } from "./tests/e2e/helpers/auth-mail";
import {
  devServerCommand,
  shouldReuseExistingServer,
} from "./tests/e2e/playwright-shared";

/**
 * Supabase Auth email journeys against a local Supabase stack and its mail
 * catcher: each spec runs once per app, on servers this config starts. The
 * same stack carries the request-scope journeys (AL-2675): real sessions
 * reading real rows through each app's tenant-scoped reads.
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
 *
 * Mission Control and the missionary workspace serve every signed-in page
 * through their proxy's rewrite of the tenant address (AL-2675). Bound to a
 * loopback IP literal, Next sends that rewrite out of the server and the
 * proxy answers 500 (record D-19). They bind the loopback name instead,
 * resolved IPv4 first, so they still listen on 127.0.0.1, as
 * scripts/github/e2e-dev-server.sh starts them for CI.
 */

const SERVER_HOST = "127.0.0.1";
const TENANT_ADDRESS_APPS: ReadonlySet<string> = new Set([
  "admin",
  "missionary",
]);
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

const ADMIN_PORT = surfaces.find(({ app }) => app === "admin")!.port;
const TEE = "node scripts/e2e/tee-dev-server.mjs";

const serverEnv = {
  ...process.env,
  // Real sessions only: the e2e cookie bypass would hide auth defects.
  E2E_AUTH_BYPASS: "false",
  SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || "1",
  // These journeys never reach the assistant runtime. A set base URL stops
  // Mission Control's dev server from building and starting it (`eve/next`).
  EVE_BASE_URL: process.env.EVE_BASE_URL || "http://127.0.0.1:9",
  // Web Studio's Payload reads the stack's database. Without this it assumes
  // the default local port, which a stack started on other ports does not use.
  ...(!process.env.PAYLOAD_DATABASE_URI && process.env.E2E_AUTH_MAIL_DB_URL
    ? { PAYLOAD_DATABASE_URI: process.env.E2E_AUTH_MAIL_DB_URL }
    : {}),
} as Record<string, string>;

/** The hostname an app's dev server binds, and the environment it starts with. */
function binding(app: string): {
  hostname: string;
  env: Record<string, string>;
} {
  if (!TENANT_ADDRESS_APPS.has(app)) {
    return { hostname: SERVER_HOST, env: serverEnv };
  }
  const inherited = serverEnv.NODE_OPTIONS?.trim();
  const env = {
    ...serverEnv,
    NODE_OPTIONS: [inherited, "--dns-result-order=ipv4first"]
      .filter(Boolean)
      .join(" "),
  };
  if (app !== "admin") return { hostname: "localhost", env };
  return {
    hostname: "localhost",
    env: {
      ...env,
      OPERATIONS_NAMES:
        process.env.OPERATIONS_NAMES ?? `localhost:${ADMIN_PORT}`,
      AUTH_MAIL_ADMIN_LOG_FILE: adminServerLogFile(),
    },
  };
}

function serverCommand(app: string, port: number): string {
  const command = devServerCommand(app, port, binding(app).hostname);
  if (app !== "admin") return command;
  const start = `bun run --cwd apps/${app} `;
  return command.replace(start, `${TEE} ${start}`);
}

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "**/auth-password-recovery.spec.ts",
    "**/auth-signup-confirmation.spec.ts",
    "**/auth-two-organizations.spec.ts",
    "**/auth-request-scope-reads.spec.ts",
    "**/auth-crm-reads.spec.ts",
    "**/auth-member-care.spec.ts",
    "**/auth-members-invitations.spec.ts",
    "**/auth-sites-settings.spec.ts",
    "**/auth-operator-area.spec.ts",
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
    command: serverCommand(app, port),
    url: `http://${SERVER_HOST}:${port}${readyPath}`,
    env: binding(app).env,
    reuseExistingServer: shouldReuseExistingServer(process.env),
    timeout: SERVER_TIMEOUT_MS,
  })),
});
