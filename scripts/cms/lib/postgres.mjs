import { spawnSync } from "node:child_process";

import { LOCAL_DATABASE_URL } from "./local-data.mjs";

const CONNECTION_ENV_KEYS = {
  application_name: "PGAPPNAME",
  channel_binding: "PGCHANNELBINDING",
  client_encoding: "PGCLIENTENCODING",
  connect_timeout: "PGCONNECT_TIMEOUT",
  gssencmode: "PGGSSENCMODE",
  hostaddr: "PGHOSTADDR",
  options: "PGOPTIONS",
  passfile: "PGPASSFILE",
  sslcert: "PGSSLCERT",
  sslcrl: "PGSSLCRL",
  sslcrldir: "PGSSLCRLDIR",
  sslkey: "PGSSLKEY",
  sslmode: "PGSSLMODE",
  sslrootcert: "PGSSLROOTCERT",
  target_session_attrs: "PGTARGETSESSIONATTRS",
};

function getPsqlEnvironment(databaseUrl) {
  let connection;
  try {
    connection = new URL(databaseUrl);
  } catch {
    throw new Error("CMS database connection must be a valid Postgres URL.");
  }
  if (!["postgres:", "postgresql:"].includes(connection.protocol)) {
    throw new Error("CMS database connection must use Postgres.");
  }

  const env = {
    ...process.env,
    PGHOST: connection.hostname.replace(/^\[|\]$/g, ""),
    PGPORT: connection.port || "5432",
    PGDATABASE: decodeURIComponent(connection.pathname.slice(1)),
    PGUSER: decodeURIComponent(connection.username),
    PGPASSWORD: decodeURIComponent(connection.password),
  };

  for (const [key, value] of connection.searchParams) {
    const envKey = CONNECTION_ENV_KEYS[key];
    if (!envKey) {
      throw new Error(`Unsupported CMS psql connection parameter: ${key}`);
    }
    // Node pg's encrypted, non-verifying mode is named `require` in libpq.
    env[envKey] =
      key === "sslmode" && value === "no-verify" ? "require" : value;
  }

  return env;
}

export function getLocalDatabaseUrl() {
  return (
    process.env.PAYLOAD_DATABASE_URI ||
    process.env.SUPABASE_DB_URL ||
    LOCAL_DATABASE_URL
  );
}

export function runPsql(sql, options = {}) {
  const databaseUrl = options.databaseUrl ?? getLocalDatabaseUrl();
  const args = [
    "--no-psqlrc",
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
    env: getPsqlEnvironment(databaseUrl),
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
  const args = ["--no-psqlrc", "-v", "ON_ERROR_STOP=1", "-P", "pager=off"];

  if (options.singleTransaction) {
    args.push("--single-transaction");
  }

  args.push("-f", filePath);

  const result = spawnSync(process.env.PSQL_BIN || "psql", args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: getPsqlEnvironment(databaseUrl),
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
