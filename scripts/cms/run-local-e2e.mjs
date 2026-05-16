import nextEnv from "@next/env";

import { repoRoot } from "./lib/paths.mjs";
import { runCommand } from "./lib/process.mjs";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(repoRoot);

runCommand(
  "verify local CMS before strict E2E",
  "bun",
  ["run", "cms:local:verify"],
  {
    cwd: repoRoot,
  },
);

runCommand(
  "run strict local CMS E2E suite",
  "node",
  [
    "node_modules/@playwright/test/cli.js",
    "test",
    "tests/e2e/cms-local-happy-path.spec.ts",
    "--project=chromium",
    "--workers=1",
  ],
  {
    cwd: repoRoot,
    env: {
      ...process.env,
      ALLOW_DEMO_ACCOUNTS: process.env.ALLOW_DEMO_ACCOUNTS || "true",
      CMS_BASE_URL: "http://localhost:3030",
      CMS_LOCAL_STRICT: "1",
      DONOR_APP_URL: "http://localhost:3005",
      E2E_AUTH_BYPASS: "false",
      NEXT_PUBLIC_DONOR_URL: "http://localhost:3005",
      PLAYWRIGHT_ADMIN_BASE_URL: "http://localhost:3030",
      PLAYWRIGHT_BASE_URL: "http://localhost:3005",
      PLAYWRIGHT_DONOR_URL: "http://localhost:3005",
      PLAYWRIGHT_INCLUDE_ADMIN: "1",
      SKIP_E2E_AUTH: "1",
    },
  },
);
