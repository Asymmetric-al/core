#!/usr/bin/env node
/**
 * API contract stack (#2708): PostgREST in front of the migrate job's plain
 * Postgres, so tests/integration/api-contract can send real application reads
 * through the Data API.
 *
 *   node scripts/api-contract/stack.mjs up       Local: start Postgres 17, apply
 *                                                 the migrate job's chain and the
 *                                                 seed, then `prepare`.
 *   node scripts/api-contract/stack.mjs seed     Apply the demo seed to a migrated
 *                                                 disposable DATABASE_URL (CI).
 *   node scripts/api-contract/stack.mjs prepare  DATABASE_URL is already migrated
 *                                                 and seeded (CI): prepare it and
 *                                                 start PostgREST on the host
 *                                                 network (Linux runners).
 *   node scripts/api-contract/stack.mjs test [vitest args]
 *                                                 Run the api-contract tests
 *                                                 against the running stack.
 *   node scripts/api-contract/stack.mjs down     Remove what this script started.
 *
 * Environment (all optional except DATABASE_URL for `seed` and `prepare`):
 *   API_CONTRACT_NAME            container prefix (default core-api-contract)
 *   API_CONTRACT_PG_PORT         `up` Postgres port on 127.0.0.1 (default 54400)
 *   API_CONTRACT_REST_PORT       PostgREST port on 127.0.0.1 (default 54401)
 *   API_CONTRACT_STATE_FILE      where the run's state is kept (default: a file
 *                                in the temp dir named after the prefix and a
 *                                hash of this checkout's path)
 *
 * The state file records each container and network by the id Docker returned
 * when this script created it. `up` and `prepare` replace only a resource whose
 * name and id the state file records and refuse any other of the same name;
 * `down` removes, by id, only recorded resources under the configured prefix
 * that still hold their recorded id.
 *
 * The database preparation is local test setup, never a migration: it gives
 * `authenticator` a login with a random password and defines auth.uid() and
 * auth.role() as Supabase Auth does. It grants nothing and changes no policy.
 * The JWT secret and passwords are random per run, kept in a 0600 state file
 * and never printed.
 */
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DATABASE_URL_ROUTING_KEYS } from "../../packages/env/src/database-url.mjs";
import { requireDisposableDatabase } from "../lib/environment-marker.mjs";
import { isLoopbackDatabaseUrl, spawnPsql } from "../lib/psql.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** The image the repository's pinned Supabase CLI runs for its REST service. */
export const POSTGREST_IMAGE =
  "ghcr.io/asymmetric-al/core-ci-postgrest:v16.4@sha256:d155c6718ed9a9f990d159a2ab7c0a3f16944dbb6d0a0344557421042acfe0df";
/** The migrate job's Postgres service image (.github/workflows/ci-integration.yml). */
export const POSTGRES_IMAGE =
  "ghcr.io/asymmetric-al/core-ci-postgres:17.11-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24";

export function assertLoopbackDatabaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL is not a valid Postgres URL");
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:")
    throw new Error("DATABASE_URL is not a Postgres URL");

  // Preserve the harness's case-insensitive refusal. Query passwords would
  // remain in the connection argument after the shared runner strips the URL password.
  const rejectedKeys = [...url.searchParams.keys()]
    .map((key) => key.toLowerCase())
    .filter(
      (key) =>
        DATABASE_URL_ROUTING_KEYS.includes(key) ||
        key === "password" ||
        key === "sslpassword",
    );
  if (rejectedKeys.length > 0)
    throw new Error(
      `Refusing DATABASE_URL: remove the ${rejectedKeys.join(", ")} query parameters and specify the target and credentials in the URL itself`,
    );
  if (!isLoopbackDatabaseUrl(url) || !url.username || url.pathname.length < 2)
    throw new Error(
      "Refusing DATABASE_URL: the API contract stack requires a loopback host, login, and database name",
    );
  return url;
}

function runDisposablePsql(url, { action, args, input }) {
  const databaseUrl = url.href;
  const psqlBin = process.env.PSQL_BIN?.trim() || "psql";
  requireDisposableDatabase({ databaseUrl, action, psqlBin });
  const result = spawnPsql({
    databaseUrl,
    psqlBin,
    cwd: repoRoot,
    args: ["-X", "-w", "-q", "-v", "ON_ERROR_STOP=1", ...args],
    input,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `could not ${action} the API contract database: psql exited ${result.status ?? result.signal}`,
    );
}

function seedDatabase(databaseUrl) {
  const url = assertLoopbackDatabaseUrl(databaseUrl);
  runDisposablePsql(url, {
    action: "apply the API contract demo seed to",
    args: ["-f", "supabase/seed.sql"],
  });
  console.log("==> applied supabase/seed.sql");
}

/**
 * The state file records each container and network this stack started as
 * `{ name, id }`, the id Docker returned when it created it. Older state files
 * recorded bare names; those carry no id and are never trusted.
 */
const recordedEntry = (entry) =>
  typeof entry === "string"
    ? { name: entry, id: null }
    : { name: entry?.name ?? "", id: entry?.id || null };

/**
 * What to do with a container or network name before creating it: create it
 * when absent; replace (a container) or reuse (a network) it only when the
 * state file records that name with the id it has now, so a previous run of
 * this script started it; refuse otherwise. A same-named resource that another
 * session started, even under a name this state file once recorded, is never
 * removed.
 */
export function containerAction({ name, existingId, recorded }) {
  if (!existingId) return "create";
  const ours = recorded
    .map(recordedEntry)
    .some((entry) => entry.name === name && entry.id === existingId);
  if (ours) return "replace";
  throw new Error(
    `A container or network named ${name} exists, but this stack did not start it (its state file does not record that name with its id). Remove it yourself or set API_CONTRACT_NAME to another prefix.`,
  );
}

/**
 * What `down` removes: each recorded resource under the configured prefix
 * whose name still resolves to the id recorded when this stack created it,
 * removed by that id. A name outside the prefix, an entry without an id, or a
 * name that now belongs to another resource is left alone and reported; a
 * resource that is already gone needs nothing.
 *
 * @param {{ prefix: string, recorded: unknown[], currentId: (name: string) => string | null }} options
 * @returns {{ remove: { name: string, id: string }[], skipped: { name: string, reason: string }[] }}
 */
export function planRemoval({ prefix, recorded, currentId }) {
  /** @type {{ remove: { name: string, id: string }[], skipped: { name: string, reason: string }[] }} */
  const plan = { remove: [], skipped: [] };
  for (const { name, id } of recorded.map(recordedEntry)) {
    if (!name.startsWith(`${prefix}-`)) {
      plan.skipped.push({
        name,
        reason: `outside the configured prefix ${prefix}-`,
      });
      continue;
    }
    if (!id) {
      plan.skipped.push({
        name,
        reason: "no recorded id (an older state file); remove it yourself",
      });
      continue;
    }
    const now = currentId(name);
    if (!now) continue;
    if (now === id) plan.remove.push({ name, id });
    else
      plan.skipped.push({
        name,
        reason: "now another resource, not the one this stack started",
      });
  }
  return plan;
}

/**
 * The default state file: one per checkout (keyed by a hash of the repository
 * root) and prefix, so two worktrees running the default prefix never read or
 * remove each other's recorded resources.
 */
export function defaultStateFile({ name, repoRoot: root, tempDir }) {
  const checkout = createHash("sha256")
    .update(path.resolve(root))
    .digest("hex")
    .slice(0, 12);
  return path.join(tempDir, `${name}-${checkout}-api-contract-state.json`);
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
      defaultStateFile({
        name,
        repoRoot,
        tempDir: process.env.RUNNER_TEMP || os.tmpdir(),
      }),
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

function requireLocalImage(image) {
  const result = docker(["image", "inspect", image], { allowFailure: true });
  if (result.status !== 0)
    throw new Error(
      `${image} is not on this machine, and this script never pulls. Run docker pull ${image} first (after docker login ghcr.io while the package is private). docker image inspect said: ${result.stderr.trim().slice(0, 500)}`,
    );
}

/** The id of the container or network called `name`, or null when none exists. */
function currentId(kind, name) {
  const result = docker([kind, "inspect", "--format", "{{.Id}}", name], {
    allowFailure: true,
  });
  return result.status === 0 ? result.stdout.trim() || null : null;
}

/** Records `{ name, id }` under `key` in the state file, replacing that name. */
function record(state, stateFile, key, name, id) {
  state[key] = [
    ...state[key].filter((entry) => recordedEntry(entry).name !== name),
    { name, id },
  ];
  writeState(stateFile, state);
}

/**
 * Makes `name` free for this stack (containerAction): removes, by id, the
 * container a previous run recorded, refuses one it did not, and forgets the
 * removed entry. Call `startContainer` next.
 */
function claimContainer(name, state, stateFile) {
  const existingId = currentId("container", name);
  if (
    containerAction({ name, existingId, recorded: state.containers }) ===
    "replace"
  ) {
    docker(["rm", "-f", existingId]);
    state.containers = state.containers.filter(
      (entry) => recordedEntry(entry).name !== name,
    );
    writeState(stateFile, state);
  }
}

/** `docker run -d` with `args`, recording the id Docker returns for `name`. */
function startContainer(name, args, env, state, stateFile) {
  const id = docker(args, { env }).stdout.trim();
  if (!/^[0-9a-f]{12,64}$/.test(id))
    throw new Error(`docker run did not return a container id for ${name}`);
  record(state, stateFile, "containers", name, id);
}

/** Creates `name` unless a previous run recorded it with its id; refuses anyone else's. */
function claimNetwork(name, state, stateFile) {
  const existingId = currentId("network", name);
  if (
    containerAction({ name, existingId, recorded: state.networks }) !== "create"
  )
    return;
  const id = docker(["network", "create", name]).stdout.trim();
  if (!/^[0-9a-f]{12,64}$/.test(id))
    throw new Error(`docker network create did not return an id for ${name}`);
  record(state, stateFile, "networks", name, id);
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

  requireLocalImage(POSTGREST_IMAGE);
  // The generated password contains only hexadecimal digits. Pass it over
  // stdin and commit the setup together with the role change.
  runDisposablePsql(url, {
    action: "prepare PostgREST on",
    args: ["-1", "-f", "-"],
    input: `${PREPARE_SQL}\nALTER ROLE authenticator WITH LOGIN PASSWORD '${authenticatorPassword}';\n`,
  });
  console.log("==> prepared the database for PostgREST (local setup only)");

  const dbHost = restDbHost ?? url.hostname;
  const dbPort = restDbPort ?? (url.port || 5432);
  const dbUri = `postgres://authenticator:${authenticatorPassword}@${dbHost}:${dbPort}${url.pathname}`;
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
  const args = ["run", "-d", "--pull", "never", "--name", restName];
  if (hostNetwork) args.push("--network", "host");
  else args.push("--network", network, "-p", binding.publish);
  // `-e NAME` takes the value from this process's environment, so no secret
  // appears in the docker command line.
  for (const key of Object.keys(environment)) args.push("-e", key);
  args.push(POSTGREST_IMAGE);
  startContainer(
    restName,
    args,
    { ...process.env, ...environment },
    state,
    opts.stateFile,
  );

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

  requireLocalImage(POSTGRES_IMAGE);
  requireLocalImage(POSTGREST_IMAGE);
  claimNetwork(network, state, opts.stateFile);
  claimContainer(pgName, state, opts.stateFile);
  startContainer(
    pgName,
    [
      "run",
      "-d",
      "--pull",
      "never",
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
    { ...process.env, POSTGRES_PASSWORD: password },
    state,
    opts.stateFile,
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
  seedDatabase(databaseUrl);

  await prepare({ databaseUrl, restDbHost: pgName, restDbPort: 5432, network });
}

/**
 * Removes, by id, what this stack recorded under the configured prefix and
 * still holds its recorded id (planRemoval); reports anything it leaves.
 */
function down() {
  const opts = options();
  const state = readState(opts.stateFile);
  const removed = [];
  const skipped = [];
  const failed = [];
  for (const [kind, key, remove] of [
    ["container", "containers", ["rm", "-f"]],
    ["network", "networks", ["network", "rm"]],
  ]) {
    const plan = planRemoval({
      prefix: opts.name,
      recorded: state[key],
      currentId: (name) => currentId(kind, name),
    });
    skipped.push(...plan.skipped);
    for (const { name, id } of plan.remove) {
      if (docker([...remove, id], { allowFailure: true }).status === 0)
        removed.push(name);
      else failed.push(name);
    }
  }
  if (failed.length === 0) rmSync(opts.stateFile, { force: true });
  console.log(`==> removed ${removed.join(", ") || "nothing"}`);
  for (const { name, reason } of skipped)
    console.log(`==> left ${name}: ${reason}`);
  if (failed.length > 0)
    throw new Error(
      `could not remove ${failed.join(", ")}; the state file ${opts.stateFile} is kept`,
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
    case "seed":
    case "prepare": {
      const databaseUrl = process.env.DATABASE_URL?.trim();
      if (!databaseUrl) throw new Error("Missing DATABASE_URL");
      if (command === "seed") seedDatabase(databaseUrl);
      else await prepare({ databaseUrl, network: "host" });
      return 0;
    }
    case "test":
      return test(rest);
    case "down":
      down();
      return 0;
    default:
      console.error(
        "usage: node scripts/api-contract/stack.mjs <up|seed|prepare|test|down>",
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
