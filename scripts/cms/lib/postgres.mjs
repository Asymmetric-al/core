import { spawnSync } from "node:child_process";

import { LOCAL_DATABASE_URL } from "./local-data.mjs";

const CONNECTION_ENV_KEYS = {
  application_name: "PGAPPNAME",
  channel_binding: "PGCHANNELBINDING",
  client_encoding: "PGCLIENTENCODING",
  connect_timeout: "PGCONNECT_TIMEOUT",
  dbname: "PGDATABASE",
  gssencmode: "PGGSSENCMODE",
  host: "PGHOST",
  hostaddr: "PGHOSTADDR",
  options: "PGOPTIONS",
  passfile: "PGPASSFILE",
  password: "PGPASSWORD",
  port: "PGPORT",
  sslcert: "PGSSLCERT",
  sslcrl: "PGSSLCRL",
  sslcrldir: "PGSSLCRLDIR",
  sslkey: "PGSSLKEY",
  sslmode: "PGSSLMODE",
  sslrootcert: "PGSSLROOTCERT",
  target_session_attrs: "PGTARGETSESSIONATTRS",
  user: "PGUSER",
};

function getPsqlConnection(databaseUrl) {
  let connection;
  let fields;
  try {
    connection = new URL(databaseUrl);
    fields = {
      PGHOST: decodeURIComponent(connection.hostname).replace(/^\[|\]$/g, ""),
      PGPORT: connection.port,
      PGDATABASE: decodeURIComponent(connection.pathname.slice(1)),
      PGUSER: decodeURIComponent(connection.username),
      PGPASSWORD: decodeURIComponent(connection.password),
    };
  } catch {
    throw new Error("CMS database connection must be a valid Postgres URL.");
  }
  if (!["postgres:", "postgresql:"].includes(connection.protocol)) {
    throw new Error("CMS database connection must use Postgres.");
  }
  if (connection.searchParams.has("service")) {
    throw new Error(
      "CMS psql does not allow service routing; supply an explicit database URL.",
    );
  }

  // Match libpq precedence: only explicit URI values replace ambient defaults.
  const env = { ...process.env };
  // A libpq service is expanded before environment defaults. Do not let an
  // ambient service replace the target supplied by the explicit database URL.
  delete env.PGSERVICE;
  for (const [key, value] of Object.entries(fields)) {
    if (value) env[key] = value;
  }

  const remaining = new URLSearchParams();

  for (const [key, value] of connection.searchParams) {
    const envKey = Object.hasOwn(CONNECTION_ENV_KEYS, key)
      ? CONNECTION_ENV_KEYS[key]
      : null;
    if (!envKey) {
      if (/password|secret|token/i.test(key)) {
        throw new Error(
          "CMS psql cannot pass this credential parameter securely through the environment.",
        );
      }
      remaining.append(key, value);
      continue;
    }
    // Node pg's encrypted, non-verifying mode is named `require` in libpq.
    env[envKey] =
      key === "sslmode" && value === "no-verify" ? "require" : value;
  }

  // Leave options without PG* equivalents (e.g. TCP keepalives) to libpq.
  // The URI contains no host, database, user, password, or mapped options.
  const args = remaining.size
    ? [
        "--dbname",
        `postgresql:///?${remaining.toString().replace(/\+/g, "%20")}`,
      ]
    : [];
  return { env, args };
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
