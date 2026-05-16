import fs from "node:fs";
import path from "node:path";

import { captureCommand, commandExists, runCommand } from "./process.mjs";
import { parseSupabaseStatusOutput } from "./env.mjs";
import { repoRoot } from "./paths.mjs";
import { executeSql, queryJson, runPsqlFile } from "./postgres.mjs";

const supabaseDir = path.join(repoRoot, "supabase");
const migrationsDir = path.join(supabaseDir, "migrations");
const seedSqlPath = path.join(supabaseDir, "seed.sql");
const baseMigrationFile = "20250101000000_init_schema.sql";

function getTimestampedMigrationFiles() {
  return fs
    .readdirSync(migrationsDir)
    .filter((fileName) => /^\d{14}_.+\.sql$/.test(fileName))
    .sort();
}

function migrationVersion(fileName) {
  return fileName.slice(0, 14);
}

function stageFilesForBaseReset(fileNames) {
  const stagingDir = path.join(
    repoRoot,
    ".tmp",
    `cms-local-reset-${Date.now()}`,
  );
  fs.mkdirSync(stagingDir, { recursive: true });

  const staged = [];
  for (const fileName of fileNames) {
    const from = path.join(migrationsDir, fileName);
    const to = path.join(stagingDir, fileName);
    fs.renameSync(from, to);
    staged.push({ from, to });
  }

  if (fs.existsSync(seedSqlPath)) {
    const to = path.join(stagingDir, "seed.sql");
    fs.renameSync(seedSqlPath, to);
    staged.push({ from: seedSqlPath, to });
  }

  return {
    restore() {
      for (const item of staged.reverse()) {
        if (fs.existsSync(item.to)) {
          fs.renameSync(item.to, item.from);
        }
      }
      fs.rmSync(stagingDir, { recursive: true, force: true });
    },
  };
}

function ensureMigrationLedger() {
  executeSql(`
    CREATE SCHEMA IF NOT EXISTS supabase_migrations;
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY,
      statements text[],
      name text
    );
  `);
}

function recordMigrationVersion(fileName) {
  const version = migrationVersion(fileName);
  const name = fileName.replace(/\.sql$/, "").slice(15);
  executeSql(`
    INSERT INTO supabase_migrations.schema_migrations (version, name)
    VALUES ('${version}', '${name.replaceAll("'", "''")}')
    ON CONFLICT (version) DO NOTHING;
  `);
}

function hasAppliedMigration(fileName) {
  const result = queryJson(`
    SELECT json_build_object(
      'applied',
      EXISTS (
        SELECT 1
        FROM supabase_migrations.schema_migrations
        WHERE version = '${migrationVersion(fileName)}'
      )
    )::text;
  `);

  return result?.applied === true;
}

function applyMigrationFile(fileName) {
  const filePath = path.join(migrationsDir, fileName);
  process.stdout.write(`[info] applying local migration ${fileName}\n`);
  runPsqlFile(filePath);
  recordMigrationVersion(fileName);
}

function applyPendingLocalMigrations() {
  ensureMigrationLedger();

  for (const fileName of getTimestampedMigrationFiles()) {
    if (hasAppliedMigration(fileName)) {
      continue;
    }

    applyMigrationFile(fileName);
  }
}

export function assertLocalPrerequisites() {
  const missing = [];

  for (const command of ["bun", "docker"]) {
    if (!commandExists(command)) {
      missing.push(command);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing local CMS prerequisite command(s): ${missing.join(", ")}. Install/start Docker and Bun before running local CMS setup.`,
    );
  }
}

export function getSupabaseStatusEnv() {
  const envResult = captureCommand(
    "bun",
    ["run", "supabase", "--", "status", "--output", "env"],
    { cwd: repoRoot },
  );

  if (envResult.ok) {
    return parseSupabaseStatusOutput(envResult.stdout);
  }

  const textResult = captureCommand(
    "bun",
    ["run", "supabase", "--", "status"],
    { cwd: repoRoot },
  );

  if (textResult.ok) {
    return parseSupabaseStatusOutput(textResult.stdout);
  }

  return null;
}

export function ensureSupabaseRunning() {
  const current = getSupabaseStatusEnv();
  if (current) {
    process.stdout.write("[ok] local Supabase already running\n");
    return current;
  }

  runCommand(
    "start local Supabase",
    "bun",
    ["run", "supabase", "--", "start"],
    {
      cwd: repoRoot,
    },
  );

  const started = getSupabaseStatusEnv();
  if (!started) {
    throw new Error(
      "Supabase start completed but status could not be read. Run `bun run supabase -- status --debug` for details.",
    );
  }

  process.stdout.write("[ok] local Supabase running\n");
  return started;
}

export function resetLocalSupabase() {
  const stagedMigrationFiles = getTimestampedMigrationFiles().filter(
    (fileName) => fileName !== baseMigrationFile,
  );
  const staged = stageFilesForBaseReset(stagedMigrationFiles);

  try {
    runCommand(
      "reset local Supabase database with base migration",
      "bun",
      ["run", "supabase", "--", "db", "reset", "--local"],
      { cwd: repoRoot },
    );
  } finally {
    staged.restore();
  }

  applyPendingLocalMigrations();
  process.stdout.write("[info] applying local public seed\n");
  runPsqlFile(seedSqlPath);
}

export function pushLocalSupabaseMigrations() {
  applyPendingLocalMigrations();
}
