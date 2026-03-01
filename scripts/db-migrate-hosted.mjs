import { spawnSync } from "node:child_process";

const dbUrl = process.env.SUPABASE_DB_URL?.trim();

if (!dbUrl) {
  console.error(
    "error: Missing SUPABASE_DB_URL. Set it to your direct Postgres connection string before running `bun run db:migrate:hosted`.",
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["scripts/supabase-cli.mjs", "db", "push", "--db-url", dbUrl],
  {
    stdio: "inherit",
    env: process.env,
  },
);

if (result.error) {
  console.error(
    `error: Failed to run hosted migration: ${result.error.message}`,
  );
}

process.exit(result.status ?? 1);
