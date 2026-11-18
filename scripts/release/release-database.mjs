#!/usr/bin/env node
// The database half of the release job (plan 7.4, 7.5; WP1). One environment
// per run. In fixed order: preflight (target identity, environment marker, no
// login with a published password, migration order), migrate (Supabase, then
// Payload), gates (catalog gates and the schema fingerprint against CI's fresh
// replay), record-heads. A dispatched run can instead set the marker, rebuild
// a database, set the CMS role passwords, or replace the published password of
// seeded logins.
//
//   node scripts/release/release-database.mjs <step>
//
// Inputs are environment variables (names only; values never print):
//   RELEASE_ENVIRONMENT            production | preview
//   RELEASE_SUPABASE_PROJECT_REF   the project this environment migrates
//   RELEASE_DATABASE_URL           postgres login, session pooler, sslmode=require
//   RELEASE_CMS_OWNER_PASSWORD     cms_owner password (Payload migrations log in
//                                  as cms_owner on the same host)
//   RELEASE_CMS_RUNTIME_PASSWORD   cms_runtime password (the password step only)
//   RELEASE_DATABASE_SSL_CA        the project's CA certificate (PEM); Payload
//                                  verifies the pooler against it
//   RELEASE_SEED_LOGIN_PASSWORD    the password every seeded login gets on a
//                                  hosted rebuild, in place of the seed's
//   RELEASE_REPLAY_FINGERPRINT     fingerprint file of CI's fresh replay (gates)
//
// Neither the Supabase CLI nor Payload's migrations inherit a RELEASE_*
// variable, and the Supabase CLI gets the password in PGPASSWORD, never on its
// command line. The job's own psql queries (lib/postgres.mjs) take the
// connection from PG* variables and the values they need from named variables.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ENVIRONMENT_MARKERS,
  RELEASE_DATABASE_CONTRACT,
  isForwardMarkerChange,
  parseReleaseHealth,
} from "../../packages/api/src/health/release-contract.mjs";
import { publishedLoginPasswords } from "../lib/published-passwords.mjs";
import { runCatalogGates } from "./catalog-gates.mjs";
import {
  KNOWN_PROJECT_REFS,
  assertDatabaseTarget,
} from "./lib/database-target.mjs";
import { readAppliedMigrations } from "./lib/ledgers.mjs";
import {
  argon2idVerifier,
  assertLoginPassword,
} from "./lib/login-password.mjs";
import { queryJson, runPsql } from "./lib/postgres.mjs";
import { assertRolePassword, scramSha256Verifier } from "./lib/scram.mjs";
import {
  checkMigrationOrder,
  listSourceMigrations,
} from "./migration-heads.mjs";
import {
  captureFingerprint,
  diffFingerprints,
  formatFingerprintDiff,
  readFingerprint,
} from "./schema-fingerprint.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/**
 * What each release environment may touch. Until WP11 the production-target
 * deployments use the development database (plan 12, "The production-named
 * project until WP11"), so the production job refuses the preview project,
 * the production-named project that serves as the disposable preview
 * database; WP11 changes that line. The preview environment refuses
 * development, the shared database, whatever its configuration says.
 */
export const RELEASE_ENVIRONMENTS = Object.freeze({
  production: Object.freeze({
    markers: ENVIRONMENT_MARKERS,
    forbiddenRefs: Object.freeze([KNOWN_PROJECT_REFS.preview]),
    rebuild: "first-only",
  }),
  preview: Object.freeze({
    markers: Object.freeze(["disposable"]),
    forbiddenRefs: Object.freeze([KNOWN_PROJECT_REFS.development]),
    rebuild: "disposable",
  }),
});

export const CMS_ROLES = Object.freeze({
  cms_owner: "RELEASE_CMS_OWNER_PASSWORD",
  cms_runtime: "RELEASE_CMS_RUNTIME_PASSWORD",
});

export class ReleaseStop extends Error {}

/**
 * WP1.1's reset rule (scripts/lib/environment-marker.mjs, on its branch until
 * the coordinator joins the two). Loaded when used: without it a rebuild fails
 * closed rather than resetting unchecked.
 */
async function requireDisposableDatabaseShared(options) {
  const { requireDisposableDatabase } =
    await import("../lib/environment-marker.mjs");
  return requireDisposableDatabase(options);
}

function stop(message) {
  throw new ReleaseStop(message);
}

/**
 * The same connection with another login: on the session pooler the user is
 * `<role>.<project ref>`, on the direct host it is the role itself.
 */
export function roleDatabaseUrl(databaseUrl, role, password) {
  const url = new URL(databaseUrl);
  const user = decodeURIComponent(url.username);
  const suffix = user.includes(".") ? user.slice(user.indexOf(".")) : "";
  url.username = encodeURIComponent(`${role}${suffix}`);
  url.password = encodeURIComponent(password);
  return url.toString();
}

/**
 * Payload's cms_owner connection. node-postgres reads `sslmode=require` as
 * full verification against Node's own CA store, which does not hold
 * Supabase's CA, so an encrypted connection is verified against the project's
 * CA instead: `sslmode=verify-full`, with the CA in PAYLOAD_DATABASE_SSL_CA.
 */
export function payloadMigrationUrl(databaseUrl, ownerPassword) {
  const url = new URL(roleDatabaseUrl(databaseUrl, "cms_owner", ownerPassword));
  if (url.searchParams.has("sslmode"))
    url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

export function readReleaseSettings(env = process.env) {
  const environment = env.RELEASE_ENVIRONMENT?.trim();
  const policy = RELEASE_ENVIRONMENTS[environment];
  if (!policy) stop("RELEASE_ENVIRONMENT must be production or preview.");
  const databaseUrl = env.RELEASE_DATABASE_URL?.trim();
  if (!databaseUrl) stop("RELEASE_DATABASE_URL is not set.");
  const ownerPassword = env.RELEASE_CMS_OWNER_PASSWORD;
  return {
    environment,
    policy,
    projectRef: env.RELEASE_SUPABASE_PROJECT_REF?.trim(),
    databaseUrl,
    // Payload migrates as cms_owner on the same host (plan 7.2), so the job
    // holds one connection string and the two CMS role passwords.
    cmsOwnerDatabaseUrl: ownerPassword
      ? payloadMigrationUrl(databaseUrl, ownerPassword)
      : undefined,
    databaseCa: env.RELEASE_DATABASE_SSL_CA?.trim() || undefined,
    // Tests run the scripts against a loopback database; a hosted target is
    // never loopback, so this cannot widen what a release touches.
    allowLoopback: env.RELEASE_ALLOW_LOOPBACK_DATABASE === "1",
  };
}

/**
 * The environment a child process gets: this process's, without any
 * RELEASE_* variable (the job's connection string and passwords) and without
 * any ambient PG* setting, then `extra`.
 */
export function childEnvironment(extra = {}, base = process.env) {
  return {
    ...Object.fromEntries(
      Object.entries(base).filter(
        ([key]) => !key.startsWith("RELEASE_") && !key.startsWith("PG"),
      ),
    ),
    ...extra,
  };
}

/** A connection string without its password, and the password. */
export function splitPassword(databaseUrl) {
  const url = new URL(databaseUrl);
  const password = decodeURIComponent(url.password);
  url.password = "";
  return { url: url.toString(), password };
}

export function assertTarget(
  settings,
  role = "postgres",
  databaseUrl = settings.databaseUrl,
) {
  try {
    assertDatabaseTarget({
      databaseUrl,
      projectRef: settings.projectRef,
      role,
      forbiddenRefs: settings.policy.forbiddenRefs,
      allowLoopback: settings.allowLoopback,
    });
  } catch (error) {
    stop(error.message);
  }
}

const HEALTH_EXISTS_SQL = `SELECT json_build_object('exists',
  to_regprocedure('${RELEASE_DATABASE_CONTRACT.healthFunction}()') IS NOT NULL)::text;`;
const HEALTH_SQL = `SELECT ${RELEASE_DATABASE_CONTRACT.healthFunction}()::text;`;

/** The marker and recorded heads, or null when the database predates WP1. */
export function readReleaseHealth({ databaseUrl, query = queryJson }) {
  const { exists } = query({
    databaseUrl,
    sql: HEALTH_EXISTS_SQL,
    label: "find release health",
  });
  if (!exists) return null;
  return parseReleaseHealth(
    query({ databaseUrl, sql: HEALTH_SQL, label: "read release health" }),
  );
}

/** Checks both ledgers against source. Stops on any out-of-order migration. */
export function checkLedgers({
  databaseUrl,
  root = repoRoot,
  query = queryJson,
}) {
  const applied = readAppliedMigrations({ databaseUrl, query });
  if (applied.payloadDevMarker) {
    stop(
      "cms.payload_migrations holds a schema-push marker (batch -1, 'dev'); the CMS schema was changed outside migrations.",
    );
  }
  const source = listSourceMigrations({ root });
  const checks = ["supabase", "payload"].map((ledger) =>
    checkMigrationOrder({
      ledger,
      source: source[ledger],
      applied: applied[ledger],
    }),
  );
  const failed = checks.filter((check) => !check.ok);
  if (failed.length > 0) {
    stop(
      `Migration order check failed; nothing was migrated or deployed. ${failed.map((check) => check.reason).join("; ")}`,
    );
  }
  return { applied, checks };
}

export function preflight({
  settings,
  root = repoRoot,
  query = queryJson,
  log = console.log,
}) {
  assertTarget(settings);
  const health = readReleaseHealth({
    databaseUrl: settings.databaseUrl,
    query,
  });
  if (!health) {
    stop(
      "The database has no release health function: it predates WP1. Its first rebuild is the dispatched first-rebuild step.",
    );
  }
  if (health.environment === null) {
    stop(
      "The database has no environment marker, which counts as not disposable. Its first rebuild is the dispatched first-rebuild step.",
    );
  }
  if (!settings.policy.markers.includes(health.environment)) {
    stop(
      `The ${settings.environment} release refuses a database marked ${health.environment}.`,
    );
  }
  // A rebuild that stopped between its seed and the replacement of the seed's
  // password leaves that published password live (record D-24).
  const published = countPublishedLogins({ settings, root, query });
  if (published > 0) {
    stop(
      `${published} login(s) carry a password published in the repository: a rebuild stopped between its seed and the replacement of that password. Nothing was migrated or deployed. ${PUBLISHED_PASSWORD_REPAIR}, then release again.`,
    );
  }
  const { checks } = checkLedgers({
    databaseUrl: settings.databaseUrl,
    root,
    query,
  });
  for (const check of checks) {
    log(
      `${check.ledger}: ${check.pending.length} pending, database head ${check.databaseHead ?? "none"}, source head ${check.sourceHead ?? "none"}${check.ahead.length ? `, database ahead by ${check.ahead.length}` : ""}`,
    );
  }
  log(`Target ${settings.projectRef} is marked ${health.environment}.`);
  return { marker: health.environment, checks };
}

function runChecked(runCommand, label, command, args, env) {
  const result = runCommand(command, args, {
    cwd: repoRoot,
    env,
    stdio: "inherit",
    shell: false,
  });
  if (result.error || result.status !== 0) {
    stop(
      `${label} failed (exit ${result.status ?? result.error?.code ?? "unknown"}).`,
    );
  }
}

/**
 * The pinned Supabase CLI reads the password of a `--db-url` that carries
 * none from PGPASSWORD (checked on 2.121.0), so it stays off the command line.
 * The repository wrapper's reset guard reads the marker the same way
 * (scripts/lib/psql.mjs keeps an ambient PGPASSWORD). SUPABASE_CLI_FORCE_PINNED
 * makes the wrapper run only the CLI the workflow installed, which must report
 * the pinned version; it never fetches one.
 */
function supabaseCli(runCommand, label, args, settings) {
  const { url, password } = splitPassword(settings.databaseUrl);
  runChecked(
    runCommand,
    label,
    process.execPath,
    ["scripts/supabase-cli.mjs", ...args, "--db-url", url, "--yes"],
    childEnvironment({ SUPABASE_CLI_FORCE_PINNED: "1", PGPASSWORD: password }),
  );
}

/** The Supabase CLI version scripts/supabase-cli.mjs pins: one pin for the repository. */
export function pinnedSupabaseCliVersion(root = repoRoot) {
  const wrapper = readFileSync(
    path.join(root, "scripts", "supabase-cli.mjs"),
    "utf8",
  );
  const version = /PINNED_SUPABASE_CLI_VERSION\s*=\s*"(\d+\.\d+\.\d+)"/.exec(
    wrapper,
  )?.[1];
  if (!version) stop("scripts/supabase-cli.mjs pins no Supabase CLI version.");
  return version;
}

/**
 * Stops, before anything is reset, unless the CLI on the PATH reports the
 * version scripts/supabase-cli.mjs pins.
 */
function requirePinnedSupabaseCli(runCommand) {
  const pinned = pinnedSupabaseCliVersion();
  const probe = runCommand("supabase", ["--version"], {
    env: childEnvironment(),
    encoding: "utf8",
    shell: false,
  });
  const found =
    !probe.error && probe.status === 0 ? String(probe.stdout ?? "").trim() : "";
  if (found !== pinned)
    stop(
      `The first rebuild needs the Supabase CLI ${pinned} on the PATH (found ${found || "none"}); the release workflow installs it with supabase/setup-cli. Nothing was reset.`,
    );
}

/**
 * The one reset that does not go through `bun run supabase`. That wrapper
 * refuses to reset a database not marked disposable (WP1.1), and the first
 * rebuild of a hosted database has no marker by definition: it is the named
 * exception of plan 7.5. It runs only here, in the release job's dispatched
 * first-rebuild step, after the checks in rebuild(): the target project, a
 * database with no marker, the owner's census sign-off (or a provably empty
 * new project) and the typed confirmation. It uses the same pinned CLI: the
 * one the release workflow installs with supabase/setup-cli, never one fetched
 * at run time (npx inside the repository stops on the root package.json's
 * overrides). requirePinnedSupabaseCli checks it before anything is reset.
 */
function firstRebuildReset(runCommand, settings) {
  const { url, password } = splitPassword(settings.databaseUrl);
  runChecked(
    runCommand,
    "Supabase reset (first rebuild)",
    "supabase",
    ["db", "reset", "--db-url", url, "--yes"],
    childEnvironment({ PGPASSWORD: password }),
  );
}

/**
 * Payload migrations as cms_owner, through the repository's guarded wrapper.
 * WP1.2's runner migrates a hosted CMS schema only from
 * PAYLOAD_MIGRATION_DATABASE_URI (scripts/cms/lib/migration-connection.mjs);
 * the run-time variable is left empty, so no other login is in reach. Over
 * TLS the connection is verified against the project's CA: Payload reads it
 * from PAYLOAD_DATABASE_SSL_CA, and the runner's own psql check from the file
 * PGSSLROOTCERT names.
 */
export function payloadMigrate({ settings, runCommand = spawnSync }) {
  if (!settings.cmsOwnerDatabaseUrl)
    stop("RELEASE_CMS_OWNER_PASSWORD is not set.");
  assertTarget(settings, "cms_owner", settings.cmsOwnerDatabaseUrl);
  const verified =
    new URL(settings.cmsOwnerDatabaseUrl).searchParams.get("sslmode") ===
    "verify-full";
  if (verified && !settings.databaseCa)
    stop(
      "RELEASE_DATABASE_SSL_CA is not set: Payload verifies the pooler's certificate against the project's CA.",
    );
  const dir = verified
    ? mkdtempSync(path.join(process.env.RUNNER_TEMP || os.tmpdir(), "ca-"))
    : null;
  try {
    const tls = {};
    if (dir) {
      const caFile = path.join(dir, "root.crt");
      writeFileSync(caFile, settings.databaseCa, { mode: 0o600 });
      tls.PAYLOAD_DATABASE_SSL_CA = settings.databaseCa;
      tls.PGSSLROOTCERT = caFile;
    }
    runChecked(
      runCommand,
      "Payload migrations",
      "bun",
      ["run", "cms:migrate"],
      childEnvironment({
        ...tls,
        PAYLOAD_MIGRATION_DATABASE_URI: settings.cmsOwnerDatabaseUrl,
        PAYLOAD_DATABASE_URI: "",
        PAYLOAD_DISABLE_SCHEMA_PUSH: "1",
        CMS_HOSTED_MIGRATION_REF: settings.projectRef,
        CMS_HOSTED_MIGRATION_ROLE: "cms_owner",
        NEXT_PUBLIC_SUPABASE_URL: `https://${settings.projectRef}.supabase.co`,
        SKIP_ENV_VALIDATION: "1",
        SUPABASE_DB_URL: "",
      }),
    );
  } finally {
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * A login of auth.users (alias u) whose bcrypt hash matches one of the
 * published passwords in the psql variable :'published' (a JSON array). Only
 * the server compares; the published passwords are public anyway.
 */
const PUBLISHED_LOGIN = `u.encrypted_password LIKE '$2%'
    AND EXISTS (SELECT 1 FROM pg_catalog.jsonb_array_elements_text(:'published'::jsonb) AS p(value)
                 WHERE extensions.crypt(p.value, u.encrypted_password) = u.encrypted_password)`;

/** What to do about a database whose logins carry a published password. */
export const PUBLISHED_PASSWORD_REPAIR =
  'Dispatch Release with operation replace-seeded-login-passwords for this environment (docs/ops/release-job.md, "If seeded logins keep a published password")';

/**
 * How many logins carry a password the repository publishes. A database with
 * no auth.users table has no login, so none.
 */
export function countPublishedLogins({
  settings,
  root = repoRoot,
  query = queryJson,
}) {
  const { published_logins: count } = query({
    databaseUrl: settings.databaseUrl,
    label: "find logins with a published password",
    variables: {
      RELEASE_PUBLISHED_PASSWORDS: JSON.stringify(
        publishedLoginPasswords(root),
      ),
    },
    sql: `\\getenv published RELEASE_PUBLISHED_PASSWORDS
SELECT to_regclass('auth.users') IS NOT NULL AS has_logins \\gset
\\if :has_logins
SELECT json_build_object('published_logins',
  (SELECT count(*) FROM auth.users AS u WHERE ${PUBLISHED_LOGIN}))::text;
\\else
SELECT json_build_object('published_logins', 0)::text;
\\endif`,
  });
  return count;
}

/**
 * The dispatched operation replace-seeded-login-passwords: repairs a database
 * whose seeded logins still carry a password the repository publishes, which
 * a rebuild that stopped between its seed and the replacement leaves behind.
 * It gives those logins RELEASE_SEED_LOGIN_PASSWORD, as the rebuild would
 * have, resets nothing and touches no other login.
 */
export function repairSeededLoginPasswords({
  settings,
  env = process.env,
  root = repoRoot,
  query = queryJson,
  log = console.log,
}) {
  assertTarget(settings);
  const password = env.RELEASE_SEED_LOGIN_PASSWORD;
  try {
    assertLoginPassword(password, "RELEASE_SEED_LOGIN_PASSWORD");
  } catch (error) {
    stop(error.message);
  }
  return replaceSeededLoginPasswords({ settings, password, root, query, log });
}

/**
 * Gives every login the seed created with a password published in the
 * repository (scripts/lib/published-passwords.mjs) the password of
 * RELEASE_SEED_LOGIN_PASSWORD instead (record D-24). Only an Argon2id
 * verifier computed on the runner reaches the server; a published password
 * is matched against each bcrypt hash on the server. Stops if any login
 * still carries a published password afterwards.
 */
export function replaceSeededLoginPasswords({
  settings,
  password,
  root = repoRoot,
  query = queryJson,
  log = console.log,
}) {
  const published = publishedLoginPasswords(root);
  const matches = PUBLISHED_LOGIN;
  const result = query({
    databaseUrl: settings.databaseUrl,
    label: "replace the seeded login passwords",
    variables: {
      RELEASE_LOGIN_VERIFIER: argon2idVerifier(password),
      RELEASE_PUBLISHED_PASSWORDS: JSON.stringify(published),
    },
    sql: `\\getenv verifier RELEASE_LOGIN_VERIFIER
\\getenv published RELEASE_PUBLISHED_PASSWORDS
UPDATE auth.users AS u SET encrypted_password = :'verifier', updated_at = pg_catalog.now()
 WHERE ${matches};
SELECT json_build_object(
  'seeded_logins', (SELECT count(*) FROM auth.users WHERE encrypted_password = :'verifier'),
  'published', (SELECT count(*) FROM auth.users AS u WHERE ${matches})
)::text;`,
  });
  if (result.published !== 0)
    stop(
      `${result.published} login(s) still carry a password published in the repository; the rebuilt database must not be used.`,
    );
  log(
    `Replaced the published password of ${result.seeded_logins} seeded login(s) with RELEASE_SEED_LOGIN_PASSWORD.`,
  );
  return result;
}

export function migrate({
  settings,
  env = process.env,
  root = repoRoot,
  query = queryJson,
  run = runPsql,
  runCommand = spawnSync,
  log = console.log,
  sleep,
  now,
}) {
  preflight({ settings, root, query, log });
  supabaseCli(runCommand, "Supabase migrations", ["db", "push"], settings);
  // Plan 7.5: after the role migration, before Payload logs in as cms_owner.
  // Every release makes the secrets log in, so a restore (whose backup drops
  // custom role passwords, plan 8.5) is repaired by the next release too.
  // Default privileges stay as the chain left them: only a rebuild, which
  // resets, puts the platform's back.
  setCmsRolePasswords({
    settings,
    env,
    query,
    run,
    log,
    sleep,
    now,
    next: "This release stopped before Payload's migrations, the gates, the heads and the deployment, so nothing was deployed. Wait two minutes, then re-run the release; a password that then logs in is left alone.",
  });
  payloadMigrate({ settings, runCommand });
  const { checks } = checkLedgers({
    databaseUrl: settings.databaseUrl,
    root,
    query,
  });
  const pending = checks.filter((check) => check.pending.length > 0);
  if (pending.length > 0) {
    stop(
      `Migrations still pending after the migrate step: ${pending.map((check) => `${check.ledger} ${check.pending.join(", ")}`).join("; ")}`,
    );
  }
  log("Both ledgers hold every source migration.");
}

export function gates({
  settings,
  replayFingerprintFile,
  query = queryJson,
  catalogGates = runCatalogGates,
  log = console.log,
}) {
  assertTarget(settings);
  if (!replayFingerprintFile)
    stop("RELEASE_REPLAY_FINGERPRINT names no fingerprint of CI's replay.");
  const catalog = catalogGates({ databaseUrl: settings.databaseUrl });
  log(catalog.report);
  const replay = readFingerprint(replayFingerprintFile);
  const target = captureFingerprint({
    databaseUrl: settings.databaseUrl,
    query,
  });
  const diff = diffFingerprints(replay, target);
  log(
    formatFingerprintDiff(diff, {
      expectedLabel: "CI replay",
      actualLabel: settings.projectRef,
    }),
  );
  if (!catalog.ok || !diff.equal)
    stop(
      "Catalog gates failed; the expected heads were not recorded and nothing was deployed.",
    );
  return { digest: target.digest };
}

/**
 * Records the heads the database now holds. The heads are read from the
 * ledgers, not from source, so a production release from an older commit never
 * lowers what an earlier release recorded.
 */
export function recordHeads({
  settings,
  query = queryJson,
  run = runPsql,
  log = console.log,
}) {
  assertTarget(settings);
  const applied = readAppliedMigrations({
    databaseUrl: settings.databaseUrl,
    query,
  });
  const heads = {
    supabase: [...applied.supabase].sort().at(-1) ?? null,
    payload: [...applied.payload].sort().at(-1) ?? null,
  };
  for (const [ledger, head] of Object.entries(heads)) {
    // An empty ledger has no head to record.
    if (head === null) continue;
    run({
      databaseUrl: settings.databaseUrl,
      label: `record the ${ledger} migration head`,
      variables: { RELEASE_LEDGER: ledger, RELEASE_HEAD: head },
      sql: `\\getenv ledger RELEASE_LEDGER
\\getenv head RELEASE_HEAD
SELECT ${RELEASE_DATABASE_CONTRACT.recordHeadFunction}(:'ledger', :'head');`,
    });
  }
  const health = readReleaseHealth({
    databaseUrl: settings.databaseUrl,
    query,
  });
  if (
    !health ||
    health.heads.supabase !== heads.supabase ||
    health.heads.payload !== heads.payload
  ) {
    stop("The recorded heads did not read back as written.");
  }
  log(
    `Recorded expected heads: supabase ${heads.supabase ?? "none"}, payload ${heads.payload ?? "none"}.`,
  );
  return heads;
}

/** The dispatched marker step (plan 7.5): forward only, on a typed confirmation. */
export function setEnvironmentMarker({
  settings,
  marker,
  confirmation,
  query = queryJson,
  run = runPsql,
  log = console.log,
}) {
  assertTarget(settings);
  if (confirmation !== `${settings.projectRef}:${marker}`) {
    stop(`Type ${settings.projectRef}:${marker} to confirm the marker change.`);
  }
  const health = readReleaseHealth({
    databaseUrl: settings.databaseUrl,
    query,
  });
  const current = health?.environment ?? null;
  if (!isForwardMarkerChange(current, marker)) {
    stop(
      `The marker moves forward only; ${current ?? "no marker"} cannot become ${marker}.`,
    );
  }
  run({
    databaseUrl: settings.databaseUrl,
    label: "set environment marker",
    variables: { RELEASE_MARKER: marker },
    sql: `\\getenv marker RELEASE_MARKER
SELECT ${RELEASE_DATABASE_CONTRACT.advanceMarkerFunction}(:'marker');`,
  });
  const after = readReleaseHealth({ databaseUrl: settings.databaseUrl, query });
  if (after?.environment !== marker)
    stop("The marker did not read back as set.");
  log(`Environment marker of ${settings.projectRef}: ${current} -> ${marker}.`);
}

/**
 * The platform's default privileges for `postgres` in `public`: the one file
 * the replay applies before the chain (scripts/verify/supabase-migrations.mjs
 * --hosted-defaults) and a rebuild applies before its reset.
 */
export const HOSTED_DEFAULT_PRIVILEGES =
  "scripts/sql/hosted-default-privileges.sql";

/**
 * Puts the platform's default privileges back before a rebuild resets the
 * database. A hosted reset (the pinned CLI's `db reset`) drops the schemas the
 * chain made and every object in `public`, but not `public` itself, so it
 * keeps the default privileges `postgres` holds there as the chain left them,
 * and the chain changes them (stage 1 closes them for anon and authenticated).
 * Without this, a rebuild of a rebuilt project starts from the chain's end
 * state rather than where a fresh project starts: the functions made before
 * that change lack the grants a fresh project gives them, and the fingerprint
 * gate stops the release (WP1.6, the second rebuild of the preview project).
 * Every statement of the file runs as the release login, `postgres`: the
 * defaults are its own, and as the database's owner it may grant on `public`.
 * Only the two rebuilds call this; `migrate` never resets, so it keeps the
 * chain's own defaults.
 */
export function restoreHostedDefaultPrivileges({
  settings,
  root = repoRoot,
  run = runPsql,
  log = console.log,
}) {
  try {
    run({
      databaseUrl: settings.databaseUrl,
      sql: readFileSync(path.join(root, HOSTED_DEFAULT_PRIVILEGES), "utf8"),
      label: "put back the platform's default privileges",
    });
  } catch (error) {
    stop(
      `The platform's default privileges could not be put back (${error.message}); nothing was reset.`,
    );
  }
  log(
    `Put back the platform's default privileges in public (${HOSTED_DEFAULT_PRIVILEGES}).`,
  );
}

const CENSUS_SIGNOFF =
  /^https:\/\/github\.com\/Asymmetric-al\/core\/(issues|pull)\/\d+(#issuecomment-\d+)?$/;
const EMPTY_SQL = `SELECT json_build_object(
  'relations', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm')),
  'ledger', CASE WHEN to_regclass('supabase_migrations.schema_migrations') IS NULL THEN 0 ELSE 1 END
)::text;`;

/**
 * Rebuilds a database from source: put the platform's default privileges
 * back, drop what migrations made, apply every migration, seed, give the
 * seeded logins the release environment's password, then Payload migrations. The gates and the heads follow as the release's
 * next steps.
 *
 * - mode "first": the one-off first rebuild of a database with no marker
 *   (plan 7.5). It takes the owner's census sign-off as its input, or, for a
 *   newly created project, proof that the database is empty.
 * - mode "disposable": the preview rebuild, only where the marker says
 *   disposable. That rule is the shared reset rule of WP1.1
 *   (scripts/lib/environment-marker.mjs), which this calls rather than
 *   repeating; the one-off first rebuild is the plan's named exception to it.
 */
export async function rebuild({
  settings,
  mode,
  signoff,
  confirmation,
  env = process.env,
  query = queryJson,
  run = runPsql,
  runCommand = spawnSync,
  requireDisposable = requireDisposableDatabaseShared,
  log = console.log,
  sleep,
  now,
}) {
  assertTarget(settings);
  if (confirmation !== `rebuild ${settings.projectRef}`) {
    stop(`Type "rebuild ${settings.projectRef}" to confirm the rebuild.`);
  }
  if (mode === "first") {
    const health = readReleaseHealth({
      databaseUrl: settings.databaseUrl,
      query,
    });
    const marker = health?.environment ?? null;
    if (marker !== null) {
      stop(
        `The database is already marked ${marker}; the first rebuild runs once, on a database with no marker.`,
      );
    }
    if (signoff === "empty-project") {
      const state = query({
        databaseUrl: settings.databaseUrl,
        sql: EMPTY_SQL,
        label: "check the project is empty",
      });
      if (state.relations !== 0 || state.ledger !== 0) {
        stop(
          "The project is not empty; its first rebuild needs the owner's census sign-off.",
        );
      }
    } else if (!CENSUS_SIGNOFF.test(signoff ?? "")) {
      stop(
        "The first rebuild needs the owner's census sign-off: a link to the sign-off issue or comment in Asymmetric-al/core.",
      );
    }
  } else if (mode === "disposable") {
    if (settings.policy.rebuild !== "disposable") {
      stop(`The ${settings.environment} release never resets its database.`);
    }
    try {
      await requireDisposable({
        databaseUrl: settings.databaseUrl,
        action: "rebuild the preview database",
      });
    } catch (error) {
      stop(error.message);
    }
  } else {
    stop("The rebuild mode must be first or disposable.");
  }
  // The reset seeds logins with a password published in the repository, and
  // a hosted database never keeps one (record D-24): without the replacement
  // nothing is reset.
  const seedLoginPassword = env.RELEASE_SEED_LOGIN_PASSWORD;
  try {
    assertLoginPassword(seedLoginPassword, "RELEASE_SEED_LOGIN_PASSWORD");
  } catch (error) {
    stop(
      `${error.message} A hosted rebuild gives every seeded login that password in place of the one published in the repository; nothing was reset.`,
    );
  }
  if (mode === "first") requirePinnedSupabaseCli(runCommand);
  log(
    `Rebuilding ${settings.projectRef} from source (${mode}${mode === "first" ? `, sign-off ${signoff}` : ""}).`,
  );
  // Before the reset, which keeps them: the rebuild starts where a fresh
  // project starts, as CI's replay does.
  restoreHostedDefaultPrivileges({ settings, run, log });
  let resetFailure = null;
  try {
    if (mode === "first") {
      firstRebuildReset(runCommand, settings);
    } else {
      // The wrapper applies WP1.1's reset rule again on its own.
      supabaseCli(runCommand, "Supabase reset", ["db", "reset"], settings);
    }
  } catch (error) {
    resetFailure = error;
  }
  // At once, before anything else reads or uses the database, and after any
  // reset that was attempted, whatever its outcome: a reset that failed after
  // its seed has left the published password live.
  try {
    replaceSeededLoginPasswords({
      settings,
      password: seedLoginPassword,
      query,
      log,
    });
  } catch (error) {
    stop(
      `${resetFailure ? `The reset failed (${resetFailure.message}), and the` : "The"} replacement of the seeded logins' password failed: ${error.message} Seeded logins may still carry the password published in the repository, and anyone who knows it could sign in: do not use the database. Fix the cause, then ${PUBLISHED_PASSWORD_REPAIR.replace(/^D/, "d")}; until then every release of this database stops at its preflight.`,
    );
  }
  if (resetFailure) throw resetFailure;
  // The marker migration writes `disposable` when public.profiles,
  // public.donors and public.donations are empty, as they are right after the
  // reset drops and recreates them. Anything else is a failed rebuild.
  const after = readReleaseHealth({ databaseUrl: settings.databaseUrl, query });
  if (after?.environment !== "disposable") {
    stop(
      `The database is not marked disposable after the migrations (it reads ${after?.environment ?? "no marker"}). The rebuild stopped before the CMS role passwords and Payload's migrations; nothing was deployed.`,
    );
  }
  setCmsRolePasswords({
    settings,
    env,
    query,
    run,
    log,
    sleep,
    now,
    next:
      mode === "first"
        ? "This first rebuild stopped after the reset and the seed, before Payload's migrations, the gates and the heads, and the migrations have already marked the database disposable, so first-rebuild cannot run again. Wait two minutes, dispatch set-cms-role-passwords, then the release: its migrate step runs Payload's migrations, and the gates and the heads follow (docs/ops/release-job.md, \"If the CMS role passwords stop a run\")."
        : "This rebuild stopped after the reset and the seed, before Payload's migrations, the gates and the heads. Wait two minutes, then rebuild again; a password that then logs in is left alone.",
  });
  payloadMigrate({ settings, runCommand });
  checkLedgers({ databaseUrl: settings.databaseUrl, query });
  log("Rebuild complete; the database is marked disposable.");
}

/**
 * When the step tries each login after it has set a password, in seconds
 * after the change. The shared pooler (Supavisor) caches a role's credentials
 * for a while, so a login right after `ALTER ROLE ... PASSWORD` can be refused
 * although the new password is right; a new login attempt is what makes the
 * pooler fetch the new one (Supabase, "Supavisor error: password
 * authentication failed after rotating database password"). On the preview
 * project the pooler refused the first login after a change and accepted one
 * about 80 seconds later (WP1.6 report). So the last attempt comes after 90
 * seconds. Supavisor v2.10.1 (commit 83ca93e1f463f37ff7882aaa87f810a0de5ef9cc,
 * its newest tag on 18 November 2026) blocks a project's client address for
 * 120 seconds after 10 refused logins in 150 seconds
 * (`lib/supavisor/circuit_breaker.ex`, `:auth_error`). Supabase does not
 * publish which version its pooler runs, so for hosted these figures are an
 * estimate. With the first login before the change, one role costs at most
 * four refusals and the two roles of one run at most eight.
 */
export const ROLE_LOGIN_VERIFICATION = Object.freeze({
  attemptsAtSeconds: Object.freeze([0, 30, 90]),
});

/**
 * Whether a refused login of `role` means its secret is not a usable password
 * of that role ("password") or something else ("other"). Two forms only, as
 * Supavisor v2.10.1 (commit 83ca93e1f463f37ff7882aaa87f810a0de5ef9cc) words
 * them:
 *
 * - `password authentication failed for user "<role>"` (SQLSTATE 28P01): a
 *   wrong password (`lib/supavisor/errors/wrong_password_error.ex`), or one
 *   changed since the pooler cached the role's salt
 *   (`lib/supavisor/errors/password_changed_error.ex`, which keeps Postgres's
 *   own wording). Postgres says the same. Seen on the preview project at
 *   11:08 UTC on 18 November 2026.
 * - `(EAUTHQUERY) unsupported or invalid secret format`: the stored secret is
 *   neither a SCRAM verifier nor MD5, as for a role made without a password
 *   (`lib/supavisor/auth_query.ex`, `parse_secret/2`).
 *
 * Every other refusal is "other", other EAUTHQUERY reasons included: a failed
 * or timed-out auth query, an unknown user, an MD5 secret. So is a refusal
 * naming another user, and so are no route, TLS, the role's connection limit
 * and the pooler's circuit breaker.
 */
export function classifyLoginRefusal(message, role) {
  const text = String(message ?? "");
  if (text.includes(`password authentication failed for user "${role}"`))
    return "password";
  if (text.includes("(EAUTHQUERY) unsupported or invalid secret format"))
    return "password";
  return "other";
}

function sleepSync(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

/** One login as `role` with `password`; refusals come back, never thrown. */
function tryRoleLogin({ settings, role, password, query }) {
  let who;
  try {
    who = query({
      databaseUrl: roleDatabaseUrl(settings.databaseUrl, role, password),
      label: `log in as ${role}`,
      sql: "SELECT json_build_object('user', current_user)::text;",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, kind: classifyLoginRefusal(message, role), message };
  }
  if (who?.user !== role)
    stop(`Logging in as ${role} did not yield that role.`);
  return { ok: true };
}

/**
 * Makes the two CMS login roles' passwords those of the job's secrets (plan
 * 7.5, 8.5). Each role first logs in with its secret: when that works the
 * password is already right and nothing changes, so the pooler has nothing
 * stale to hold. Only a login refused for the password (a rotation, a restore
 * from backup, a role just made) sets it, from a SCRAM verifier computed here,
 * and then the step logs in again within ROLE_LOGIN_VERIFICATION's bound. A
 * login refused for any other reason stops the step and changes nothing. No
 * password or verifier reaches an argument list, a log line or an error.
 */
export function setCmsRolePasswords({
  settings,
  env = process.env,
  roles: roleVariables = CMS_ROLES,
  query = queryJson,
  run = runPsql,
  log = console.log,
  sleep = sleepSync,
  now = Date.now,
  // What the run skipped, and what to run next, when a password was set but
  // never verified (review H4). The default suits the dispatched
  // set-cms-role-passwords operation; migrate and the rebuilds say their own.
  next = "Wait two minutes, then dispatch set-cms-role-passwords again; a password that then logs in is left alone.",
}) {
  assertTarget(settings);
  const names = Object.keys(roleVariables);
  if (
    names.length !== 2 ||
    names.some((name) => !/^[a-z_][a-z0-9_]{0,62}$/.test(name))
  ) {
    stop("The CMS roles must be two plain role names.");
  }
  const passwords = Object.entries(roleVariables).map(([role, variable]) => {
    try {
      assertRolePassword(env[variable], variable);
    } catch (error) {
      stop(error.message);
    }
    return { role, password: env[variable] };
  });
  if (passwords[0].password === passwords[1].password) {
    stop(`${names.join(" and ")} must have different passwords.`);
  }
  const roles = query({
    databaseUrl: settings.databaseUrl,
    label: "find CMS roles",
    sql: `SELECT coalesce(json_agg(rolname ORDER BY rolname), '[]'::json)::text
          FROM pg_roles WHERE rolname IN (${names.map((name) => `'${name}'`).join(", ")}) AND rolcanlogin;`,
  });
  for (const { role } of passwords) {
    if (!roles.includes(role))
      stop(
        `Login role ${role} does not exist; the CMS role migration has not run.`,
      );
  }
  const { attemptsAtSeconds } = ROLE_LOGIN_VERIFICATION;
  const boundSeconds = attemptsAtSeconds.at(-1);
  const outcomes = [];
  for (const { role, password } of passwords) {
    const first = tryRoleLogin({ settings, role, password, query });
    if (first.ok) {
      log(`The ${role} password already logs in; nothing changed.`);
      outcomes.push({ role, changed: false });
      continue;
    }
    if (first.kind !== "password") {
      stop(
        `Logging in as ${role} was refused for a reason other than its password, so its password was not changed: ${first.message}`,
      );
    }
    run({
      databaseUrl: settings.databaseUrl,
      label: `set ${role} password`,
      variables: { RELEASE_ROLE_VERIFIER: scramSha256Verifier(password) },
      sql: `\\getenv verifier RELEASE_ROLE_VERIFIER
ALTER ROLE ${role} WITH PASSWORD :'verifier';`,
    });
    const changedAt = now();
    let attempts = 0;
    let last = first;
    for (const seconds of attemptsAtSeconds) {
      const wait = changedAt + seconds * 1000 - now();
      if (wait > 0) sleep(wait);
      attempts += 1;
      last = tryRoleLogin({ settings, role, password, query });
      if (last.ok) break;
      if (last.kind !== "password") {
        stop(
          `The ${role} password was set, but logging in as ${role} was then refused for another reason: ${last.message} ${next}`,
        );
      }
    }
    if (!last.ok) {
      stop(
        `The ${role} password was set, but logging in as ${role} was still refused after ${attempts} attempts over ${boundSeconds} seconds; the pooler may hold the old credentials longer. ${next}`,
      );
    }
    const waited = Math.round((now() - changedAt) / 1000);
    log(
      `Set the ${role} password; it logged in on attempt ${attempts}, ${waited} s after the change.`,
    );
    outcomes.push({ role, changed: true, attempts, waitedSeconds: waited });
  }
  return outcomes;
}

const STEPS = {
  preflight: ({ settings }) => preflight({ settings }),
  migrate: ({ settings, env }) => migrate({ settings, env }),
  gates: ({ settings, env }) =>
    gates({ settings, replayFingerprintFile: env.RELEASE_REPLAY_FINGERPRINT }),
  "record-heads": ({ settings }) => recordHeads({ settings }),
  "set-marker": ({ settings, env }) =>
    setEnvironmentMarker({
      settings,
      marker: env.RELEASE_MARKER,
      confirmation: env.RELEASE_CONFIRMATION,
    }),
  "first-rebuild": ({ settings, env }) =>
    rebuild({
      settings,
      mode: "first",
      signoff: env.RELEASE_CENSUS_SIGNOFF,
      confirmation: env.RELEASE_CONFIRMATION,
      env,
    }),
  "preview-rebuild": ({ settings, env }) =>
    rebuild({
      settings,
      mode: "disposable",
      confirmation: `rebuild ${settings.projectRef}`,
      env,
    }),
  "cms-role-passwords": ({ settings, env }) =>
    setCmsRolePasswords({ settings, env }),
  "replace-seeded-login-passwords": ({ settings, env }) =>
    repairSeededLoginPasswords({ settings, env }),
};

export async function runStep(step, env = process.env) {
  const handler = STEPS[step];
  if (!handler)
    stop(`Unknown step ${step}. Steps: ${Object.keys(STEPS).join(", ")}.`);
  return await handler({ settings: readReleaseSettings(env), env });
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  runStep(process.argv[2]).catch((error) => {
    console.error(`release-database: ${error.message}`);
    process.exitCode = 1;
  });
}
