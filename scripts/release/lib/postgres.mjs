// psql for the release job. The connection travels in PG* environment
// variables, never in argv, and SQL travels on stdin. Errors carry psql's exit
// status and a redacted message, never the connection string.
import { spawnSync } from "node:child_process";

import {
  DATABASE_URL_QUERY_ENV,
  HOSTED_LIBPQ_ENV,
  assertHostedDatabaseTls,
  databaseUrlProblem,
  isLoopbackDatabaseUrl,
  keptAmbientLibpqEnv,
  libpqQueryEntries,
} from "../../../packages/env/src/database-url.mjs";
import { requirePsqlHonoursRequireAuth } from "../../lib/psql.mjs";

const URL_FIELDS = {
  // Never decoded (review L1): an escaped comma or slash stays inert.
  PGHOST: (url) => url.hostname.replace(/^\[|\]$/g, ""),
  PGPORT: (url) => url.port,
  PGDATABASE: (url) => decodeURIComponent(url.pathname.slice(1)),
  PGUSER: (url) => decodeURIComponent(url.username),
  PGPASSWORD: (url) => decodeURIComponent(url.password),
};

export function redact(text) {
  return String(text ?? "")
    .replace(/\b(?:postgres(?:ql)?):\/\/\S+/gi, "[redacted-connection]")
    .replace(/(password[^\n]{0,20}?)(["'][^"'\n]*["'])/gi, "$1[redacted]")
    .replace(/SCRAM-SHA-256\$\S+/g, "[redacted-verifier]");
}

/** libpq environment for one connection string. */
export function connectionEnvironment(databaseUrl, base = process.env) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("The database connection is not a valid URL.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("The database connection is not a Postgres URL.");
  }
  // Review L2: the one check judges the address, and the query is read as
  // libpq reads it, through the same map as the CMS runner.
  const problem = databaseUrlProblem(databaseUrl, { forPsql: true });
  if (problem !== null)
    throw new Error(`The database connection is refused: ${problem}.`);
  // Review M3: the shared allow-list, not a deny-list; then the address's
  // own parts and query replace even the kept ones, so this builder keeps no
  // ambient PG* setting at all.
  const env = keptAmbientLibpqEnv(base);
  delete env.DATABASE_URL;
  for (const key of Object.keys(URL_FIELDS)) delete env[key];
  for (const key of Object.values(DATABASE_URL_QUERY_ENV)) delete env[key];
  for (const [key, read] of Object.entries(URL_FIELDS)) {
    const value = read(url);
    if (value) env[key] = value;
  }
  for (const [key, value] of libpqQueryEntries(databaseUrl)) {
    if (key === "password" && env.PGPASSWORD) continue;
    env[DATABASE_URL_QUERY_ENV[key]] = value;
  }
  // Review L1: a hosted server may never ask for the password in clear text.
  delete env.PGREQUIREAUTH;
  if (!isLoopbackDatabaseUrl(url)) {
    assertHostedDatabaseTls(url);
    Object.assign(env, HOSTED_LIBPQ_ENV);
  }
  return env;
}

/**
 * Runs SQL from stdin with ON_ERROR_STOP and returns stdout.
 * `variables` are exported to psql's environment and read in SQL with
 * `\getenv`, so their values appear neither in argv nor in the SQL text.
 */
export function runPsql({
  databaseUrl,
  sql,
  variables = {},
  psqlBin = process.env.PSQL_BIN?.trim() || "psql",
  run = spawnSync,
  label = "psql",
}) {
  const env = connectionEnvironment(databaseUrl);
  if (Object.keys(variables).some((key) => /^(PG|DATABASE_URL$)/i.test(key))) {
    throw new Error(
      `${label}: reserved database connection variables are not allowed.`,
    );
  }
  // Review N6: a hosted address takes PGREQUIREAUTH, which a psql older than
  // 16 ignores; the floor holds wherever this builder runs.
  if (env.PGREQUIREAUTH) {
    try {
      requirePsqlHonoursRequireAuth({
        psqlBin,
        run,
        env: keptAmbientLibpqEnv(env, []),
      });
    } catch (error) {
      throw new Error(`${label}: ${error.message}`);
    }
  }
  for (const [key, value] of Object.entries(variables)) env[key] = value;
  const result = run(
    psqlBin,
    ["-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-f", "-"],
    { input: sql, env, encoding: "utf8", shell: false, maxBuffer: 64 << 20 },
  );
  if (result.error) {
    throw new Error(
      `${label}: could not run psql (${result.error.code ?? "error"}).`,
    );
  }
  if (result.status !== 0) {
    const detail = redact(result.stderr).trim().split("\n").slice(-3).join(" ");
    throw new Error(`${label}: psql exited ${result.status}. ${detail}`.trim());
  }
  return result.stdout ?? "";
}

/** Runs SQL whose last output line is one JSON value, and parses it. */
export function queryJson(options) {
  const output = runPsql(options).trim().split("\n").filter(Boolean).at(-1);
  if (output === undefined) {
    throw new Error(`${options.label ?? "psql"}: the query returned no rows.`);
  }
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(
      `${options.label ?? "psql"}: the query did not return JSON.`,
    );
  }
}
