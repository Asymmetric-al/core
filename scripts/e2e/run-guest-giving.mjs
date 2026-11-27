#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { authMailEnvFromStatus, statusArguments } from "./run-auth-mail.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export function guestGivingEnvFromStatus(output) {
  const stack = authMailEnvFromStatus(output);
  return {
    NEXT_PUBLIC_SUPABASE_URL: stack.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: stack.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: stack.SUPABASE_SERVICE_ROLE_KEY,
    GUEST_GIVING_E2E_DB_URL: stack.E2E_AUTH_MAIL_DB_URL,
  };
}

function main(args) {
  const status = spawnSync(
    process.execPath,
    ["scripts/supabase-cli.mjs", ...statusArguments()],
    { cwd: repoRoot, encoding: "utf8", shell: false },
  );
  if (status.error || status.status !== 0) {
    console.error(
      `error: could not read the local Supabase stack (\`supabase status\` exit ${status.status ?? status.error?.message}).`,
    );
    return 1;
  }
  let suiteEnv;
  try {
    suiteEnv = guestGivingEnvFromStatus(status.stdout);
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
  const env = { ...process.env, ...suiteEnv, STRIPE_SECRET_KEY: "" };
  delete env.GIVING_STRIPE_TEST_PROOF;
  const run = spawnSync(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "-c",
      "playwright.guest-giving.config.ts",
      ...args,
    ],
    {
      cwd: repoRoot,
      env,
      stdio: "inherit",
      shell: false,
    },
  );
  return run.status ?? 1;
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) process.exit(main(process.argv.slice(2)));
