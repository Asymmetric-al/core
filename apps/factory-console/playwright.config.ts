import os from "node:os";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

// The production build runs against TEST-ONLY loopback fixtures: a synthetic
// Archon HTTP surface on 39994 and two fake executables standing in for the
// Archon CLI and control.mjs. The Console spawns them through its normal
// adapters; nothing in src/ knows they are fixtures.
const node = process.execPath;
const fixtures = path.resolve(import.meta.dirname, "tests", "fixtures");

const environment = {
  CONSOLE_ORIGIN: "http://127.0.0.1:3093",
  CONSOLE_OWNER: "fixture",
  CONSOLE_PASSWORD: "fixture-password-not-a-real-secret",
  ARCHON_URL: "http://127.0.0.1:39994",
  ARCHON_CODEBASE_ID: "fixture-core",
  ARCHON_STORE_ID: "fixture-store",
  FACTORY_ARCHON_CLI: JSON.stringify([
    node,
    path.join(fixtures, "archon-cli.mjs"),
  ]),
  FACTORY_NODE: node,
  FACTORY_CONTROL_SCRIPT: path.join(fixtures, "control-cli.mjs"),
  FACTORY_CONTROL_CWD: import.meta.dirname,
  FACTORY_ARCHON_HOME: fixtures,
  FACTORY_SERVICE_HOME: os.tmpdir(),
  FACTORY_PATH: path.dirname(node),
  // Scope owners and the admission limit come from this core-factory.json.
  FACTORY_CONFIG_FILE: path.join(fixtures, "core-factory.json"),
  FACTORY_REPOSITORY: "Asymmetric-al/core",
  // TEST-ONLY: every page of this run is labeled as synthetic fixture data.
  FACTORY_FIXTURE_LABEL: "Playwright loopback fixtures",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: environment.CONSOLE_ORIGIN,
    httpCredentials: {
      username: environment.CONSOLE_OWNER,
      password: environment.CONSOLE_PASSWORD,
    },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "bun tests/native-fixture.ts",
      url: "http://127.0.0.1:39994/api/health",
      reuseExistingServer: false,
    },
    {
      command:
        "bun node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3093",
      url: environment.CONSOLE_ORIGIN,
      env: environment,
      reuseExistingServer: false,
    },
  ],
});
