import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { buildPostgresUpgradeProbe } from "../lib/postgres-upgrade-preflight.mjs";
import {
  formatTenantRlsCatalogSummary,
  runTenantRlsCatalogGate,
} from "./tenant-rls-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const databaseUrl = process.env.DATABASE_URL?.trim();
const psqlBin = process.env.PSQL_BIN?.trim() || "psql";
const localHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
const foundationMigration = "20260214090000_foundation_1_schema.sql";

if (!databaseUrl) {
  console.error(
    "error: Missing DATABASE_URL. Point it at a disposable local Postgres database before running this verifier.",
  );
  process.exit(1);
}

let parsedDatabaseUrl;
try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch {
  console.error("error: DATABASE_URL is not a valid Postgres URL.");
  process.exit(1);
}

if (!localHosts.has(parsedDatabaseUrl.hostname)) {
  console.error(
    "error: Refusing to run migration verification against a non-local host. Use a disposable localhost database; the required field-policy census has the same local-only contract.",
  );
  process.exit(1);
}

function runPsql(label, args, input) {
  console.log(`==> ${label}`);
  const result = spawnSync(psqlBin, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: input === undefined ? "inherit" : ["pipe", "inherit", "inherit"],
    ...(input === undefined ? {} : { input }),
  });

  if (result.error) {
    console.error(`error: Failed to run psql: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const bootstrapPath = path.join(
  repoRoot,
  "scripts",
  "sql",
  "supabase-compat-bootstrap.sql",
);
const migrationsRoot = path.join(repoRoot, "supabase", "migrations");
const migrationFiles = readdirSync(migrationsRoot)
  .filter((fileName) => /^\d{14}_.+\.sql$/.test(fileName))
  .sort();

runPsql("bootstrap Supabase compatibility schemas", [
  databaseUrl,
  "-v",
  "ON_ERROR_STOP=1",
  "-f",
  bootstrapPath,
]);

for (const fileName of migrationFiles) {
  const migrationPath = path.join(migrationsRoot, fileName);
  const args = [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", migrationPath];

  if (fileName === foundationMigration) {
    args.splice(1, 0, "--single-transaction");
  }

  runPsql(`apply ${fileName}`, args);
}

runPsql(
  "verify PostgreSQL upgrade preflight detects mixed-case callers",
  [databaseUrl, "-v", "ON_ERROR_STOP=1"],
  buildPostgresUpgradeProbe(),
);

console.log("==> verify reviewed field-policy census");
const censusResult = spawnSync(
  process.execPath,
  [path.join(repoRoot, "scripts/verify/field-policy-census.mjs")],
  { cwd: repoRoot, env: process.env, stdio: "inherit", shell: false },
);
if (censusResult.error) {
  console.error(
    `error: Failed to run field-policy census: ${censusResult.error.message}`,
  );
  process.exit(1);
}
if (censusResult.status !== 0) process.exit(censusResult.status ?? 1);

console.log("==> verify tenant RLS catalog gate");
let catalogGate;
try {
  catalogGate = runTenantRlsCatalogGate({ databaseUrl, psqlBin });
} catch (error) {
  console.error(`error: tenant RLS catalog gate: ${error.message}`);
  process.exit(1);
}
if (!catalogGate.ok) {
  for (const { code, table, function: fn, detail } of catalogGate.failures)
    console.error(`${code} ${table ?? fn ?? "-"}: ${detail}`);
  console.error(
    "error: tenant RLS catalog gate failed. See docs/security/tenant-guard.md#ci-gates.",
  );
  process.exit(1);
}
console.log(formatTenantRlsCatalogSummary(catalogGate));

console.log(`Verified ${migrationFiles.length} forward Supabase migrations.`);
