// Checks the row counts the demo seed must produce (CI's `migrate` job,
// "Verify seed counts"). The expectation lives in the repository, in
// supabase/seed-expectations.json, so a change to supabase/seed.sql updates
// that file and never the workflow. A wrong count fails and says what it
// found.
//
// Usage: DATABASE_URL=<seeded database> node scripts/verify/seed-counts.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runPsqlQuery } from "../lib/psql.mjs";

export const EXPECTATIONS_PATH = "supabase/seed-expectations.json";
const TABLE = /^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*$/;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** The validated `{ "schema.table": count }` map from the expectation file. */
export function readSeedExpectations(root = repoRoot) {
  const file = path.join(root, EXPECTATIONS_PATH);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(
      `${EXPECTATIONS_PATH} could not be read: ${error instanceof Error ? error.message : error}`,
    );
  }
  return validateSeedExpectations(parsed);
}

export function validateSeedExpectations(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error(`${EXPECTATIONS_PATH} must be a JSON object.`);
  const unknown = Object.keys(parsed).filter(
    (key) => !["description", "counts"].includes(key),
  );
  if (unknown.length > 0)
    throw new Error(
      `${EXPECTATIONS_PATH} has unknown keys: ${unknown.join(", ")}.`,
    );
  const { counts } = parsed;
  if (!counts || typeof counts !== "object" || Array.isArray(counts))
    throw new Error(`${EXPECTATIONS_PATH} needs a "counts" object.`);
  const entries = Object.entries(counts);
  if (entries.length === 0)
    throw new Error(`${EXPECTATIONS_PATH} lists no table.`);
  for (const [table, count] of entries) {
    if (!TABLE.test(table))
      throw new Error(
        `${EXPECTATIONS_PATH}: ${JSON.stringify(table)} is not a schema-qualified table name.`,
      );
    if (!Number.isSafeInteger(count) || count < 0)
      throw new Error(
        `${EXPECTATIONS_PATH}: the count for ${table} must be a whole number of rows.`,
      );
  }
  return Object.fromEntries(entries);
}

/** `SELECT count(*)` for one validated `schema.table`, quoted. */
export function countSql(table) {
  if (!TABLE.test(table)) throw new Error(`not a table name: ${table}`);
  const [schema, name] = table.split(".");
  return `SELECT count(*) FROM "${schema}"."${name}";`;
}

/**
 * Counts rows through the shared psql runner (scripts/lib/psql.mjs), which
 * keeps the password out of the argument list; the result is the output
 * without whitespace, as text.
 */
export function psqlCount({
  databaseUrl,
  table,
  psqlBin = process.env.PSQL_BIN?.trim() || "psql",
}) {
  const sql = countSql(table);
  try {
    return runPsqlQuery({ databaseUrl, sql, psqlBin }).replace(/\s/g, "");
  } catch (error) {
    throw new Error(
      `psql could not count ${table}: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * Compares every expected count with the database. Returns the lines to print
 * and whether all matched.
 */
export function checkSeedCounts({ expectations, count }) {
  const lines = [];
  let ok = true;
  for (const [table, expected] of Object.entries(expectations)) {
    const found = count(table);
    if (found === String(expected)) {
      lines.push(`Verified ${table} seeded row count: ${found}`);
    } else {
      ok = false;
      lines.push(
        `Expected ${table} count to be ${expected} after seeding, got: ${found}`,
      );
    }
  }
  return { ok, lines };
}

export function main({
  env = process.env,
  root = repoRoot,
  count,
  print = console.log,
  printError = console.error,
} = {}) {
  try {
    const expectations = readSeedExpectations(root);
    const databaseUrl = env.DATABASE_URL?.trim();
    if (!count && !databaseUrl)
      throw new Error("Set DATABASE_URL to the seeded database.");
    const result = checkSeedCounts({
      expectations,
      count: count ?? ((table) => psqlCount({ databaseUrl, table })),
    });
    for (const line of result.lines) (result.ok ? print : printError)(line);
    return result.ok ? 0 : 1;
  } catch (error) {
    printError(`error: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = main();
}
