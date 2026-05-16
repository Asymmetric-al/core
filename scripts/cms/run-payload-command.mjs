import { spawnSync } from "node:child_process";

import nextEnv from "@next/env";

import { LOCAL_DATABASE_URL, LOCAL_PAYLOAD_SECRET } from "./lib/local-data.mjs";
import { queryJson } from "./lib/postgres.mjs";
import { adminAppDir, repoRoot } from "./lib/paths.mjs";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(repoRoot);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node scripts/cms/run-payload-command.mjs <payload args...>",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "development",
  PAYLOAD_DATABASE_URI:
    process.env.PAYLOAD_DATABASE_URI ||
    process.env.SUPABASE_DB_URL ||
    LOCAL_DATABASE_URL,
  PAYLOAD_DISABLE_SCHEMA_PUSH: process.env.PAYLOAD_DISABLE_SCHEMA_PUSH || "1",
};

if (!env.PAYLOAD_SECRET && env.NODE_ENV !== "production") {
  env.PAYLOAD_SECRET = LOCAL_PAYLOAD_SECRET;
}

process.env.PAYLOAD_DATABASE_URI = env.PAYLOAD_DATABASE_URI;

function assertNoPayloadDevMigrationMarker() {
  const table = queryJson(`
    SELECT json_build_object(
      'exists',
      to_regclass('cms.payload_migrations') IS NOT NULL
    )::text;
  `);

  if (table?.exists !== true) {
    return;
  }

  const result = queryJson(`
    SELECT json_build_object(
      'hasMarker',
      EXISTS (
        SELECT 1
        FROM cms.payload_migrations
        WHERE batch = -1 AND name = 'dev'
      )
    )::text;
  `);

  if (result?.hasMarker === true) {
    console.error(
      "error: Payload recorded a development schema-push marker in cms.payload_migrations. The local CMS workflow disables schema push so migrations remain deterministic. Run `bun run cms:local:reset` to realign the local database, or remove the local dev marker only after confirming the schema matches committed migrations.",
    );
    process.exit(1);
  }
}

if (args[0] === "migrate") {
  assertNoPayloadDevMigrationMarker();
}

const result = spawnSync(
  "bun",
  ["run", "--cwd", adminAppDir, "payload", ...args],
  {
    cwd: repoRoot,
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(`error: Failed to run Payload CLI: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
