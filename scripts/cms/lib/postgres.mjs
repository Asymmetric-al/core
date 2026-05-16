import { spawnSync } from "node:child_process";

import { LOCAL_DATABASE_URL } from "./local-data.mjs";

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
    databaseUrl,
    "-v",
    "ON_ERROR_STOP=1",
    "-P",
    "pager=off",
    "-c",
    sql,
  ];

  if (options.tuplesOnly !== false) {
    args.splice(1, 0, "-t", "-A");
  }

  const result = spawnSync(process.env.PSQL_BIN || "psql", args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: process.env,
    shell: process.platform === "win32",
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
  const args = [databaseUrl, "-v", "ON_ERROR_STOP=1", "-P", "pager=off"];

  if (options.singleTransaction) {
    args.push("--single-transaction");
  }

  args.push("-f", filePath);

  const result = spawnSync(process.env.PSQL_BIN || "psql", args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: process.env,
    shell: process.platform === "win32",
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
