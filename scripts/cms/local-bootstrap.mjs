import fs from "node:fs";

import { printEnvRepairSummary, writeLocalEnv } from "./lib/env.mjs";
import { adminMediaDir, repoRoot } from "./lib/paths.mjs";
import { runCommand } from "./lib/process.mjs";
import {
  assertLocalPrerequisites,
  ensureSupabaseRunning,
  pushLocalSupabaseMigrations,
} from "./lib/supabase.mjs";

const forceEnv =
  process.argv.includes("--force-env") ||
  process.env.CMS_LOCAL_ENV_FORCE === "1";

function linkEnvToApps() {
  runCommand(
    "link root .env.local into app workspaces",
    "bun",
    ["run", "env:link-apps"],
    {
      cwd: repoRoot,
    },
  );
}

function ensureMediaDirectory() {
  fs.mkdirSync(adminMediaDir, { recursive: true });
  process.stdout.write(`[ok] media directory ready: ${adminMediaDir}\n`);
}

async function main() {
  assertLocalPrerequisites();
  const statusEnv = ensureSupabaseRunning();

  const envResult = writeLocalEnv({ force: forceEnv, statusEnv });
  printEnvRepairSummary(envResult);
  linkEnvToApps();
  ensureMediaDirectory();

  pushLocalSupabaseMigrations();
  runCommand("run Payload migrations", "bun", ["run", "cms:migrate"], {
    cwd: repoRoot,
  });
  runCommand("generate Payload import map", "bun", ["run", "cms:importmap"], {
    cwd: repoRoot,
  });
  runCommand("seed local CMS content", "bun", ["run", "cms:local:seed"], {
    cwd: repoRoot,
  });
  runCommand("verify local CMS setup", "bun", ["run", "cms:local:verify"], {
    cwd: repoRoot,
  });
}

main().catch((error) => {
  console.error(`error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
