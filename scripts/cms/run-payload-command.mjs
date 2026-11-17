import { spawnSync } from "node:child_process";

import nextEnv from "@next/env";

import { requireDisposableDatabase } from "../lib/environment-marker.mjs";
import { LOCAL_DATABASE_URL, LOCAL_PAYLOAD_SECRET } from "./lib/local-data.mjs";
import {
  CMS_MIGRATION_DATABASE_ENV_KEY,
  resolveCmsMigrationDatabaseUrl,
} from "./lib/migration-connection.mjs";
import { assertCmsMigrationTarget } from "./lib/migration-target.mjs";
import {
  assertPayloadRuntimeRequirements,
  getPayloadCliCommand,
} from "./lib/payload-runtime.mjs";
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

let command;
try {
  assertPayloadRuntimeRequirements();
  command = await getPayloadCliCommand(args);
} catch (cause) {
  console.error(cause instanceof Error ? cause.message : cause);
  process.exit(1);
}

const MIGRATION_WRITE_COMMANDS = [
  "migrate",
  "migrate:down",
  "migrate:reset",
  "migrate:fresh",
  "migrate:refresh",
];
const isMigrationWrite = MIGRATION_WRITE_COMMANDS.includes(command);

// Migrations run on the cms_owner connection; a status check may read through
// the run-time one. Payload's child process receives exactly one connection,
// as PAYLOAD_DATABASE_URI, and never the migration variable itself. Neither
// path falls back to the Core migration string (NA-04).
let databaseUrl;
try {
  databaseUrl =
    isMigrationWrite || command === "migrate:status"
      ? resolveCmsMigrationDatabaseUrl(process.env, {
          readOnly: !isMigrationWrite,
        }).databaseUrl
      : process.env.PAYLOAD_DATABASE_URI?.trim() || LOCAL_DATABASE_URL;
} catch (cause) {
  console.error(
    cause instanceof Error ? cause.message : "CMS connection preflight failed.",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "development",
  PAYLOAD_DATABASE_URI: databaseUrl,
  PAYLOAD_DISABLE_SCHEMA_PUSH: process.env.PAYLOAD_DISABLE_SCHEMA_PUSH || "1",
};
delete env[CMS_MIGRATION_DATABASE_ENV_KEY];

if (!env.PAYLOAD_SECRET && env.NODE_ENV !== "production") {
  env.PAYLOAD_SECRET = LOCAL_PAYLOAD_SECRET;
}

function assertNoPayloadDevMigrationMarker() {
  const table = queryJson(
    `
    SELECT json_build_object(
      'exists',
      to_regclass('cms.payload_migrations') IS NOT NULL
    )::text;
  `,
    { databaseUrl },
  );

  if (table?.exists !== true) {
    return;
  }

  const result = queryJson(
    `
    SELECT json_build_object(
      'hasMarker',
      EXISTS (
        SELECT 1
        FROM cms.payload_migrations
        WHERE batch = -1 AND name = 'dev'
      )
    )::text;
  `,
    { databaseUrl },
  );

  if (result?.hasMarker === true) {
    console.error(
      "error: Payload recorded a development schema-push marker in cms.payload_migrations. The local CMS workflow disables schema push so migrations remain deterministic. Run `bun run cms:local:reset` to realign the local database, or remove the local dev marker only after confirming the schema matches committed migrations.",
    );
    process.exit(1);
  }
}

if (isMigrationWrite) {
  try {
    assertCmsMigrationTarget({
      databaseUrl,
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      approvedProjectRef: env.CMS_HOSTED_MIGRATION_REF,
      environment: env,
    });
    if (command === "migrate") assertNoPayloadDevMigrationMarker();
    // Plan 7.5: rolling migrations back or resetting them runs only on a
    // database marked disposable.
    if (command !== "migrate")
      requireDisposableDatabase({
        databaseUrl: env.PAYLOAD_DATABASE_URI,
        action: `run payload ${command} on`,
      });
  } catch (cause) {
    console.error(
      cause instanceof Error
        ? cause.message
        : "CMS migration preflight failed.",
    );
    process.exit(1);
  }
}

const result = spawnSync(
  "bun",
  ["run", "--cwd", adminAppDir, "payload", ...args],
  {
    cwd: repoRoot,
    env,
    shell: false,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(`error: Failed to run Payload CLI: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
