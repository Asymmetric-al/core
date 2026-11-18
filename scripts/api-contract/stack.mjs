#!/usr/bin/env node
/**
 * API contract stack (#2708): PostgREST in front of the migrate job's plain
 * Postgres, so tests/integration/api-contract can send real application reads
 * through the Data API.
 *
 *   node scripts/api-contract/stack.mjs up       Local: start Postgres 17, apply
 *                                                 the migrate job's chain and the
 *                                                 seed, then `prepare`.
 *   node scripts/api-contract/stack.mjs prepare  DATABASE_URL is already migrated
 *                                                 and seeded (CI): prepare it and
 *                                                 start PostgREST on the host
 *                                                 network (Linux runners).
 *   node scripts/api-contract/stack.mjs test [vitest args]
 *                                                 Run the api-contract tests
 *                                                 against the running stack.
 *   node scripts/api-contract/stack.mjs down     Remove what this script started.
 *
 * Environment (all optional except DATABASE_URL for `prepare`):
 *   API_CONTRACT_NAME            container prefix (default core-api-contract)
 *   API_CONTRACT_PG_PORT         `up` Postgres port on 127.0.0.1 (default 54400)
 *   API_CONTRACT_REST_PORT       PostgREST port on 127.0.0.1 (default 54401)
 *   API_CONTRACT_STATE_FILE      where the run's state is kept (default: temp dir)
 *
 * The database preparation is local test setup, never a migration: it gives
 * `authenticator` a login with a random password and defines auth.uid() and
 * auth.role() as Supabase Auth does. It grants nothing and changes no policy.
 * The JWT secret and passwords are random per run, kept in a 0600 state file
 * and never printed.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** The image the repository's pinned Supabase CLI runs for its REST service. */
export const POSTGREST_IMAGE =
  "public.ecr.aws/supabase/postgrest:v16.4@sha256:d155c6718ed9a9f990d159a2ab7c0a3f16944dbb6d0a0344557421042acfe0df";
/** The migrate job's Postgres service image (.github/workflows/ci-integration.yml). */
export const POSTGRES_IMAGE =
  "public.ecr.aws/docker/library/postgres:17.11-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
/**
 * Connection-string parameters that node-postgres (pg-connection-string) or
 * libpq (psql) honour over the URL's host, so a loopback hostname would prove
 * nothing while one of them is present.
 */
const HOST_OVERRIDE_PARAMETERS = new Set(["host", "hostaddr", "service"]);

export function assertLoopbackDatabaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL is not a valid Postgres URL");
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:")
    throw new Error("DATABASE_URL is not a Postgres URL");
  if (!LOOPBACK_HOSTS.has(url.hostname))
    throw new Error(
      "Refusing a non-loopback DATABASE_URL: the API contract stack only prepares a disposable local database",
    );
  const overrides = [...url.searchParams.keys()].filter((key) =>
    HOST_OVERRIDE_PARAMETERS.has(key.toLowerCase()),
  );
  if (overrides.length > 0)
    throw new Error(
      `Refusing DATABASE_URL: its ${overrides.join(", ")} parameter can move the connection off the loopback host the URL names`,
    );
  return url;
}

/**
 * What to do with a container name before `docker run`: create it when absent,
 * replace it only when this stack's state file records it (a previous run of
 * this script started it), and refuse otherwise, so a same-named container
 * that another session owns is never removed.
 */
export function containerAction({ name, exists, recorded }) {
  if (!exists) return "create";
  if (recorded.includes(name)) return "replace";
  throw new Error(
    `A container or network named ${name} exists, but this stack did not start it (its state file does not list it). Remove it yourself or set API_CONTRACT_NAME to another prefix.`,
  );
}

/**
 * Where PostgREST listens. On the host network it binds to loopback, so the
 * runner exposes nothing; in a container network it listens inside the
 * container (PostgREST's default, any IPv4) and only the loopback port is
 * published on the host.
 */
export function postgrestBinding({ hostNetwork, restPort }) {
  return hostNetwork
    ? { serverHost: "127.0.0.1", serverPort: restPort, publish: null }
    : {
        serverHost: "!4",
        serverPort: 3000,
        publish: `127.0.0.1:${restPort}:3000`,
      };
}

/** Parses a TOML string array such as `["public", "graphql_public"]`. */
function parseStringArray(raw, key) {
  const match = /^\[(.*)\]$/.exec(raw.trim());
  if (!match) throw new Error(`[api] ${key} is not an inline string array`);
  const body = match[1].trim();
  if (body === "") return [];
  return body.split(",").map((item) => {
    const value = /^\s*"([^"]*)"\s*$/.exec(item);
    if (!value) throw new Error(`[api] ${key} holds a non-string item`);
    return value[1];
  });
}

/**
 * The Data API surface that supabase/config.toml declares: the `[api]` table's
 * `schemas`, `extra_search_path` and `max_rows`, nothing from other tables.
 */
export function readApiSettings(configToml) {
  const values = new Map();
  let inApi = false;
  for (const rawLine of configToml.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const table = /^\[([^\]]+)\]$/.exec(line);
    if (table) {
      inApi = table[1].trim() === "api";
      continue;
    }
    if (!inApi) continue;
    const pair = /^([A-Za-z_]+)\s*=\s*(.+?)\s*(#.*)?$/.exec(line);
    if (pair) values.set(pair[1], pair[2]);
  }
  if (!values.has("schemas"))
    throw new Error("supabase/config.toml [api] declares no schemas");
  if (!values.has("max_rows"))
    throw new Error("supabase/config.toml [api] declares no max_rows");
  const maxRows = Number(values.get("max_rows"));
  if (!Number.isInteger(maxRows) || maxRows <= 0)
    throw new Error(
      "supabase/config.toml [api] max_rows is not a positive integer",
    );
  return {
    schemas: parseStringArray(values.get("schemas"), "schemas"),
    extraSearchPath: values.has("extra_search_path")
      ? parseStringArray(values.get("extra_search_path"), "extra_search_path")
      : [],
    maxRows,
  };
}

/** PostgREST's environment, as the Supabase stack sets it. */
export function postgrestEnvironment({
  settings,
  dbUri,
  jwtSecret,
  serverHost,
  serverPort,
}) {
  if (jwtSecret.length < 32)
    throw new Error("PostgREST needs a JWT secret of at least 32 characters");
  return {
    PGRST_DB_URI: dbUri,
    PGRST_DB_SCHEMAS: settings.schemas.join(","),
    PGRST_DB_EXTRA_SEARCH_PATH: settings.extraSearchPath.join(","),
    PGRST_DB_MAX_ROWS: String(settings.maxRows),
    PGRST_DB_ANON_ROLE: "anon",
    PGRST_JWT_SECRET: jwtSecret,
    PGRST_SERVER_HOST: serverHost,
    PGRST_SERVER_PORT: String(serverPort),
    PGRST_DB_CHANNEL_ENABLED: "true",
    PGRST_LOG_LEVEL: "error",
  };
}

/**
 * Local-only setup on the disposable database. auth.uid() and auth.role() are
 * Supabase Auth's definitions: PostgREST sets only `request.jwt.claims`, and
 * the compat bootstrap's versions read only the single-claim settings.
 */
export const PREPARE_SQL = `
-- Supabase's image creates graphql_public (pg_graphql); PostgREST refuses to
-- load its schema cache when an exposed schema is missing. Empty here.
CREATE SCHEMA IF NOT EXISTS graphql_public;
GRANT USAGE ON SCHEMA graphql_public TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text;
$$;
`;

function settingsFromRepository() {
  return readApiSettings(
    readFileSync(path.join(repoRoot, "supabase", "config.toml"), "utf8"),
  );
}

function options() {
  const name = process.env.API_CONTRACT_NAME?.trim() || "core-api-contract";
  if (!/^[a-z0-9][a-z0-9_.-]*$/.test(name))
    throw new Error("API_CONTRACT_NAME must be a lowercase container name");
  return {
    name,
    pgPort: Number(process.env.API_CONTRACT_PG_PORT || 54400),
    restPort: Number(process.env.API_CONTRACT_REST_PORT || 54401),
    stateFile:
      process.env.API_CONTRACT_STATE_FILE?.trim() ||
      path.join(
        process.env.RUNNER_TEMP || os.tmpdir(),
        `${name}-api-contract-state.json`,
      ),
  };
}

const secret = () => randomBytes(32).toString("hex");

function readState(file) {
  if (!existsSync(file)) return { containers: [], networks: [] };
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeState(file, state) {
  writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
}

function run(command, args, { env, input, quiet } = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: env ?? process.env,
    encoding: "utf8",
    shell: false,
    ...(input === undefined ? {} : { input }),
    stdio: [
      input === undefined ? "ignore" : "pipe",
      quiet ? "pipe" : "inherit",
      "pipe",
    ],
  });
  if (result.error)
    throw new Error(`${command} failed to start: ${result.error.message}`);
  return result;
}

function docker(args, { env, allowFailure } = {}) {
  const result = run("docker", args, { env, quiet: true });
  if (result.status !== 0 && !allowFailure)
    throw new Error(
      `docker ${args[0]} failed: ${result.stderr.trim().slice(0, 500)}`,
    );
  return result;
}

/**
 * Makes `name` free for this stack (containerAction): removes a container a
 * previous run recorded, refuses one it did not, and records the name in the
 * state file before anything is started under it.
 */
function claimContainer(name, state, stateFile) {
  const exists =
    docker(["container", "inspect", name], { allowFailure: true }).status === 0;
  if (
    containerAction({ name, exists, recorded: state.containers }) === "replace"
  )
    docker(["rm", "-f", name]);
  state.containers = [...new Set([...state.containers, name])];
  writeState(stateFile, state);
}

/** Creates `name` unless a previous run recorded it; refuses anyone else's. */
function claimNetwork(name, state, stateFile) {
  const exists =
    docker(["network", "inspect", name], { allowFailure: true }).status === 0;
  if (containerAction({ name, exists, recorded: state.networks }) === "create")
    docker(["network", "create", name]);
  state.networks = [...new Set([...state.networks, name])];
  writeState(stateFile, state);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withClient(databaseUrl, work) {
  const require = createRequire(import.meta.url);
  const pg = require("pg");
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

async function waitForDatabase(databaseUrl) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await withClient(databaseUrl, (client) => client.query("select 1"));
      return;
    } catch {
      await sleep(1000);
    }
  }
  throw new Error("Postgres did not accept connections within 60 seconds");
}

async function waitForPostgrest(url, containerName, redact) {
  let last = "no response";
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(`${url}/`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) return;
      last = `HTTP ${response.status}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await sleep(1000);
  }
  const logs = docker(["logs", "--tail", "40", containerName], {
    allowFailure: true,
  });
  const text = `${logs.stdout}\n${logs.stderr}`
    .split("\n")
    .map(redact)
    .join("\n");
  throw new Error(
    `PostgREST was not ready within 90 seconds (${last}).\n${text}`,
  );
}

/** `network` "host" runs PostgREST on the host network; otherwise on `network`. */
async function prepare({ databaseUrl, restDbHost, restDbPort, network }) {
  const opts = options();
  const hostNetwork = network === "host";
  const url = assertLoopbackDatabaseUrl(databaseUrl);
  const settings = settingsFromRepository();
  const state = readState(opts.stateFile);
  const authenticatorPassword = secret();
  const jwtSecret = secret();

  await withClient(databaseUrl, async (client) => {
    await client.query(PREPARE_SQL);
    const { rows } = await client.query(
      "select format('ALTER ROLE authenticator WITH LOGIN PASSWORD %L', $1::text) as sql",
      [authenticatorPassword],
    );
    await client.query(rows[0].sql);
  });
  console.log("==> prepared the database for PostgREST (local setup only)");

  const database = url.pathname.replace(/^\//, "");
  const dbUri = `postgres://authenticator:${authenticatorPassword}@${restDbHost}:${restDbPort}/${database}`;
  const restName = `${opts.name}-rest`;
  const binding = postgrestBinding({ hostNetwork, restPort: opts.restPort });
  const environment = postgrestEnvironment({
    settings,
    dbUri,
    jwtSecret,
    serverHost: binding.serverHost,
    serverPort: binding.serverPort,
  });
  claimContainer(restName, state, opts.stateFile);
  const args = ["run", "-d", "--name", restName];
  if (hostNetwork) args.push("--network", "host");
  else args.push("--network", network, "-p", binding.publish);
  // `-e NAME` takes the value from this process's environment, so no secret
  // appears in the docker command line.
  for (const key of Object.keys(environment)) args.push("-e", key);
  args.push(POSTGREST_IMAGE);
  docker(args, { env: { ...process.env, ...environment } });

  const postgrestUrl = `http://127.0.0.1:${opts.restPort}`;
  writeState(opts.stateFile, {
    ...state,
    postgrestUrl,
    jwtSecret,
    databaseUrl,
  });
  await waitForPostgrest(postgrestUrl, restName, (line) =>
    line.split(authenticatorPassword).join("***"),
  );
  console.log(
    `==> PostgREST ${POSTGREST_IMAGE.split("@")[0]} serving ${settings.schemas.join(", ")} (max_rows ${settings.maxRows}) at ${postgrestUrl}`,
  );
}

async function up() {
  const opts = options();
  const state = readState(opts.stateFile);
  const network = `${opts.name}-net`;
  const pgName = `${opts.name}-pg`;
  const password = secret();
  const database = "asymmetrical_test";

  claimNetwork(network, state, opts.stateFile);
  claimContainer(pgName, state, opts.stateFile);
  docker(
    [
      "run",
      "-d",
      "--name",
      pgName,
      "--network",
      network,
      "-p",
      `127.0.0.1:${opts.pgPort}:5432`,
      "-e",
      "POSTGRES_USER=postgres",
      "-e",
      "POSTGRES_PASSWORD",
      "-e",
      `POSTGRES_DB=${database}`,
      POSTGRES_IMAGE,
    ],
    { env: { ...process.env, POSTGRES_PASSWORD: password } },
  );

  const databaseUrl = `postgresql://postgres:${password}@127.0.0.1:${opts.pgPort}/${database}`;
  await waitForDatabase(databaseUrl);
  console.log(`==> Postgres ${pgName} ready on 127.0.0.1:${opts.pgPort}`);

  const env = { ...process.env, DATABASE_URL: databaseUrl };
  const migrate = run(
    process.execPath,
    ["scripts/verify/supabase-migrations.mjs"],
    { env, quiet: true },
  );
  if (migrate.status !== 0)
    throw new Error(
      `migrations failed:\n${migrate.stdout.slice(-3000)}\n${migrate.stderr.slice(-3000)}`,
    );
  console.log("==> applied the compat bootstrap and every forward migration");
  const psql = process.env.PSQL_BIN?.trim() || "psql";
  const seed = run(
    psql,
    [databaseUrl, "-v", "ON_ERROR_STOP=1", "-q", "-f", "supabase/seed.sql"],
    { env, quiet: true },
  );
  if (seed.status !== 0)
    throw new Error(`seed failed: ${seed.stderr.slice(-2000)}`);
  console.log("==> applied supabase/seed.sql");

  await prepare({ databaseUrl, restDbHost: pgName, restDbPort: 5432, network });
}

function down() {
  const opts = options();
  const state = readState(opts.stateFile);
  for (const container of state.containers)
    docker(["rm", "-f", container], { allowFailure: true });
  for (const network of state.networks)
    docker(["network", "rm", network], { allowFailure: true });
  rmSync(opts.stateFile, { force: true });
  console.log(
    `==> removed ${[...state.containers, ...state.networks].join(", ") || "nothing"}`,
  );
}

function test(extraArgs) {
  const opts = options();
  const state = readState(opts.stateFile);
  if (!state.postgrestUrl)
    throw new Error(
      `No running stack recorded in ${opts.stateFile}; run \`up\` or \`prepare\` first`,
    );
  const require = createRequire(import.meta.url);
  const vitest = path.join(
    path.dirname(require.resolve("vitest/package.json")),
    "vitest.mjs",
  );
  const result = spawnSync(
    process.execPath,
    [
      vitest,
      "run",
      "--config",
      "tests/integration/api-contract/vitest.config.mts",
      ...extraArgs,
    ],
    {
      cwd: repoRoot,
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        API_CONTRACT_REQUIRE_STACK: "1",
        API_CONTRACT_POSTGREST_URL: state.postgrestUrl,
        API_CONTRACT_JWT_SECRET: state.jwtSecret,
        API_CONTRACT_DATABASE_URL: state.databaseUrl,
      },
    },
  );
  return result.status ?? 1;
}

async function main(argv) {
  const [command, ...rest] = argv;
  switch (command) {
    case "up":
      await up();
      return 0;
    case "prepare": {
      const databaseUrl = process.env.DATABASE_URL?.trim();
      if (!databaseUrl) throw new Error("Missing DATABASE_URL");
      const url = assertLoopbackDatabaseUrl(databaseUrl);
      await prepare({
        databaseUrl,
        restDbHost: "127.0.0.1",
        restDbPort: Number(url.port || 5432),
        network: "host",
      });
      return 0;
    }
    case "test":
      return test(rest);
    case "down":
      down();
      return 0;
    default:
      console.error(
        "usage: node scripts/api-contract/stack.mjs <up|prepare|test|down>",
      );
      return 2;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(
        `error: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    },
  );
}
