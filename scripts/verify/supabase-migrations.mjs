import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { buildPostgresUpgradeProbe } from "../lib/postgres-upgrade-preflight.mjs";
import { isLoopbackDatabaseUrl, spawnPsql } from "../lib/psql.mjs";
import {
  formatTenantRlsCatalogSummary,
  runTenantRlsCatalogGate,
} from "./tenant-rls-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const databaseUrl = process.env.DATABASE_URL?.trim();
const psqlBin = process.env.PSQL_BIN?.trim() || "psql";
const foundationMigration = "20260214090000_foundation_1_schema.sql";

// `--hosted-defaults` replays the chain as hosted Supabase applies it: with the
// default privileges the platform gives `postgres` in `public` before any
// migration (scripts/sql/hosted-default-privileges.sql). The release job's
// fingerprint gate compares a hosted database with this replay (WP1.6). Any
// other argument is refused, so a misspelt flag never replays without them.
const HOSTED_DEFAULTS = "scripts/sql/hosted-default-privileges.sql";
const cliArgs = process.argv.slice(2);
const unknownArgs = cliArgs.filter((arg) => arg !== "--hosted-defaults");
if (unknownArgs.length > 0) {
  console.error(
    `error: Unknown argument ${unknownArgs.join(" ")}. The only argument is --hosted-defaults.`,
  );
  process.exit(1);
}
const hostedDefaults = cliArgs.includes("--hosted-defaults");

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

if (!isLoopbackDatabaseUrl(parsedDatabaseUrl.href)) {
  console.error(
    "error: Refusing to run migration verification against a non-local host. Use a disposable localhost database; the required field-policy census has the same local-only contract.",
  );
  process.exit(1);
}

// Every psql below runs through psqlConnection: the URL is the whole target,
// so an ambient PGHOSTADDR, PGHOST, PGSERVICE or PGOPTIONS cannot redirect
// it, and the password travels in PGPASSWORD, not in the arguments.
function runPsql(label, args, input) {
  console.log(`==> ${label}`);
  const result = spawnPsql({
    databaseUrl,
    args,
    input,
    psqlBin,
    cwd: repoRoot,
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
  "-v",
  "ON_ERROR_STOP=1",
  "-f",
  bootstrapPath,
]);

if (hostedDefaults) {
  runPsql(`apply hosted Supabase default privileges (${HOSTED_DEFAULTS})`, [
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    path.join(repoRoot, HOSTED_DEFAULTS),
  ]);
}

for (const fileName of migrationFiles) {
  const migrationPath = path.join(migrationsRoot, fileName);
  const args = ["-v", "ON_ERROR_STOP=1", "-f", migrationPath];

  if (fileName === foundationMigration) {
    args.unshift("--single-transaction");
  }

  runPsql(`apply ${fileName}`, args);
}

runPsql(
  "verify PostgreSQL upgrade preflight detects mixed-case callers",
  ["-v", "ON_ERROR_STOP=1"],
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
