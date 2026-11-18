import { spawnSync } from "node:child_process";

import {
  DATABASE_URL_QUERY_ENV,
  HOSTED_LIBPQ_ENV,
  databaseUrlProblem,
  isLoopbackDatabaseUrl,
  keptAmbientLibpqEnv,
  libpqQueryEntries,
} from "../../../packages/env/src/database-url.mjs";
import { LOCAL_DATABASE_URL } from "./local-data.mjs";

function getPsqlConnection(databaseUrl) {
  let connection;
  try {
    connection = new URL(databaseUrl);
  } catch {
    throw new Error("CMS database connection must be a valid Postgres URL.");
  }
  if (!["postgres:", "postgresql:"].includes(connection.protocol)) {
    throw new Error("CMS database connection must use Postgres.");
  }
  // Review L2: the one check judges every address, and nothing in the query
  // passes to libpq unread; a query host is never a target.
  const problem = databaseUrlProblem(databaseUrl);
  if (problem !== null) {
    throw new Error(`CMS database connection is refused: ${problem}.`);
  }
  let fields;
  try {
    fields = {
      // Never decoded (review L1).
      PGHOST: connection.hostname.replace(/^\[|\]$/g, ""),
      PGPORT: connection.port,
      PGDATABASE: decodeURIComponent(connection.pathname.slice(1)),
      PGUSER: decodeURIComponent(connection.username),
      PGPASSWORD: decodeURIComponent(connection.password),
    };
  } catch {
    throw new Error("CMS database connection must be a valid Postgres URL.");
  }
  // Reviews L2 and M3: the address is the whole target. The runner keeps
  // only the shared list of ambient settings: the CA file the release job
  // hands it as PGSSLROOTCERT, and a password kept out of the address.
  const env = keptAmbientLibpqEnv(process.env);
  for (const [key, value] of Object.entries(fields)) {
    if (value) env[key] = value;
  }
  for (const [key, value] of libpqQueryEntries(databaseUrl)) {
    if (key === "password" && fields.PGPASSWORD) continue;
    // Node pg's encrypted, non-verifying mode is named `require` in libpq.
    env[DATABASE_URL_QUERY_ENV[key]] =
      key === "sslmode" && value === "no-verify" ? "require" : value;
  }
  // Review L1: a hosted server may never ask for the password in clear text.
  if (!isLoopbackDatabaseUrl(connection)) Object.assign(env, HOSTED_LIBPQ_ENV);
  return { env, args: [] };
}

// Local CMS scripts read Payload's connection, never the Core migration
// string (NA-04).
export function getLocalDatabaseUrl() {
  return process.env.PAYLOAD_DATABASE_URI || LOCAL_DATABASE_URL;
}

export function runPsql(sql, options = {}) {
  const databaseUrl = options.databaseUrl ?? getLocalDatabaseUrl();
  const connection = getPsqlConnection(databaseUrl);
  const args = [
    "--no-psqlrc",
    ...connection.args,
    "-v",
    "ON_ERROR_STOP=1",
    "-P",
    "pager=off",
    "-c",
    sql,
  ];

  if (options.tuplesOnly !== false) {
    args.push("-t", "-A");
  }

  const result = spawnSync(process.env.PSQL_BIN || "psql", args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: connection.env,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    throw new Error(`Failed to run psql: ${result.error.message}`, {
      cause: result.error,
    });
  }

  if (result.status !== 0) {
    throw new Error(
      `psql failed with exit code ${result.status ?? 1}: ${result.stderr.trim()}`,
    );
  }

  return result.stdout.trim();
}

export function queryJson(sql, options = {}) {
  const output = runPsql(sql, options);
  if (!output) {
    return null;
  }

  return JSON.parse(output);
}

export function executeSql(sql, options = {}) {
  runPsql(sql, { ...options, tuplesOnly: false });
}

export function runPsqlFile(filePath, options = {}) {
  const databaseUrl = options.databaseUrl ?? getLocalDatabaseUrl();
  const connection = getPsqlConnection(databaseUrl);
  const args = [
    "--no-psqlrc",
    ...connection.args,
    "-v",
    "ON_ERROR_STOP=1",
    "-P",
    "pager=off",
  ];

  if (options.singleTransaction) {
    args.push("--single-transaction");
  }

  args.push("-f", filePath);

  const result = spawnSync(process.env.PSQL_BIN || "psql", args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: connection.env,
    shell: false,
    stdio: options.stdio ?? "inherit",
  });

  if (result.error) {
    throw new Error(`Failed to run psql file: ${result.error.message}`, {
      cause: result.error,
    });
  }

  if (result.status !== 0) {
    throw new Error(
      `psql file failed with exit code ${result.status ?? 1}: ${filePath}`,
    );
  }

  return result;
}
