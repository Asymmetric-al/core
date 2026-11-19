import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

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
import { readDatabaseCa } from "../../release/release-database.mjs";
import { LOCAL_DATABASE_URL } from "./local-data.mjs";

/**
 * Throws unless `file` holds the project's CA (the last check's P3, phase
 * 15): the CA file a hosted connection's psql reads, as PGSSLROOTCERT. libpq
 * reads `system` as the machine's whole certificate store, so that is refused
 * by name. The path must be absolute (phase 16, Q5): this check would read a
 * relative one against Node's working directory, and psql against the one it
 * is started in. Otherwise the file must be readable and pass the release
 * job's own check of its CA (readDatabaseCa): exactly one certificate and
 * nothing else, a CA, valid now. The release job hands the runner such a
 * file; a hand-run hosted command must too. Messages name what was found,
 * never the content. Returns the one certificate as a PEM block.
 */
export function assertProjectCaFile(file) {
  if (file === "system")
    throw new Error(
      "PGSSLROOTCERT=system would make psql trust every certificate authority this machine trusts. Set PGSSLROOTCERT to a file holding the project's CA certificate, the PEM from its Database settings.",
    );
  if (!path.isAbsolute(file))
    throw new Error(
      "PGSSLROOTCERT names a relative path, which psql would resolve against its own working directory rather than this check's. Set it to the absolute path of a file holding the project's CA certificate.",
    );
  let pem;
  try {
    pem = readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(
      `PGSSLROOTCERT names a file that cannot be read (${error?.code ?? "error"}). Set it to a file holding the project's CA certificate, the PEM from its Database settings.`,
    );
  }
  return readDatabaseCa(pem, { name: "PGSSLROOTCERT's file" });
}

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
    // Node pg's encrypted, non-verifying mode is named `require` in libpq.
    env[DATABASE_URL_QUERY_ENV[key]] =
      key === "sslmode" && value === "no-verify" ? "require" : value;
  }
  if (!isLoopbackDatabaseUrl(connection)) {
    assertHostedDatabaseTls(connection);
    // Review L1: a hosted server may never ask for the password in clear text.
    Object.assign(env, HOSTED_LIBPQ_ENV);
    // The last check's P3: a CA file psql is handed for a hosted address,
    // ambient or from the address, is the project's CA. Phase 16, Q4: and
    // there is one. With none named, libpq reads ~/.postgresql/root.crt
    // unchecked, or under sslmode=require checks nothing at all. The local
    // CMS scripts reach this builder without the hosted target check.
    if (!env.PGSSLROOTCERT)
      throw new Error(
        "CMS database connection is refused: a hosted address needs the project's CA, and none is named. Set PGSSLROOTCERT to a file holding the project's CA certificate, the PEM from its Database settings.",
      );
    try {
      assertProjectCaFile(env.PGSSLROOTCERT);
    } catch (error) {
      throw new Error(`CMS database connection is refused: ${error.message}`);
    }
  }
  return { env, args: [] };
}

// Local CMS scripts read Payload's connection, never the Core migration
// string (NA-04).
export function getLocalDatabaseUrl() {
  return process.env.PAYLOAD_DATABASE_URI || LOCAL_DATABASE_URL;
}

/**
 * Review N6: before psql starts on a hosted address, which takes
 * PGREQUIREAUTH, the psql it would run must be 16 or later.
 */
function requireFloor(connection) {
  if (connection.env.PGREQUIREAUTH)
    requirePsqlHonoursRequireAuth({
      psqlBin: process.env.PSQL_BIN || "psql",
      run: spawnSync,
      env: keptAmbientLibpqEnv(connection.env, []),
    });
}

export function runPsql(sql, options = {}) {
  const databaseUrl = options.databaseUrl ?? getLocalDatabaseUrl();
  const connection = getPsqlConnection(databaseUrl);
  requireFloor(connection);
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
  requireFloor(connection);
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
