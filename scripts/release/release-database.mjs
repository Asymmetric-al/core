#!/usr/bin/env node
// The database half of the release job (plan 7.4, 7.5; WP1). One environment
// per run. In fixed order: preflight (target identity, environment marker,
// migration order), migrate (Supabase, then Payload), gates (catalog gates and
// the schema fingerprint against CI's fresh replay), record-heads. A
// dispatched run can instead set the marker, rebuild a database, or set the
// CMS role passwords.
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
import { runCatalogGates } from "./catalog-gates.mjs";
import {
  KNOWN_PROJECT_REFS,
  assertDatabaseTarget,
} from "./lib/database-target.mjs";
import { readAppliedMigrations } from "./lib/ledgers.mjs";
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
 * project until WP11"), so the production job refuses the frozen
 * production-named project; WP11 changes that line. The preview environment
 * refuses both shared projects whatever its configuration says.
 */
export const RELEASE_ENVIRONMENTS = Object.freeze({
  production: Object.freeze({
    markers: ENVIRONMENT_MARKERS,
    forbiddenRefs: Object.freeze([KNOWN_PROJECT_REFS.productionNamed]),
    rebuild: "first-only",
  }),
  preview: Object.freeze({
    markers: Object.freeze(["disposable"]),
    forbiddenRefs: Object.freeze([
      KNOWN_PROJECT_REFS.development,
      KNOWN_PROJECT_REFS.productionNamed,
    ]),
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
 * (scripts/lib/psql.mjs keeps an ambient PGPASSWORD).
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
 * The one reset that does not go through `bun run supabase`. That wrapper
 * refuses to reset a database not marked disposable (WP1.1), and the first
 * rebuild of a hosted database has no marker by definition: it is the named
 * exception of plan 7.5. It runs only here, in the release job's dispatched
 * first-rebuild step, after the checks in rebuild(): the target project, a
 * database with no marker, the owner's census sign-off (or a provably empty
 * new project) and the typed confirmation. It uses the same pinned CLI.
 */
function firstRebuildReset(runCommand, settings) {
  const { url, password } = splitPassword(settings.databaseUrl);
  runChecked(
    runCommand,
    "Supabase reset (first rebuild)",
    "npx",
    [
      "-y",
      `supabase@${pinnedSupabaseCliVersion()}`,
      "db",
      "reset",
      "--db-url",
      url,
      "--yes",
    ],
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

export function migrate({
  settings,
  env = process.env,
  root = repoRoot,
  query = queryJson,
  run = runPsql,
  runCommand = spawnSync,
  log = console.log,
}) {
  preflight({ settings, root, query, log });
  supabaseCli(runCommand, "Supabase migrations", ["db", "push"], settings);
  // Plan 7.5: after the role migration, before Payload logs in as cms_owner.
  // Every release sets them, so a restore (whose backup drops custom role
  // passwords, plan 8.5) is repaired by the next release too.
  setCmsRolePasswords({ settings, env, query, run, log });
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

const CENSUS_SIGNOFF =
  /^https:\/\/github\.com\/Asymmetric-al\/core\/(issues|pull)\/\d+(#issuecomment-\d+)?$/;
const EMPTY_SQL = `SELECT json_build_object(
  'relations', (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm')),
  'ledger', CASE WHEN to_regclass('supabase_migrations.schema_migrations') IS NULL THEN 0 ELSE 1 END
)::text;`;

/**
 * Rebuilds a database from source: drop what migrations made, apply every
 * migration, seed, then Payload migrations. The gates and the heads follow as
 * the release's next steps.
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
  log(
    `Rebuilding ${settings.projectRef} from source (${mode}${mode === "first" ? `, sign-off ${signoff}` : ""}).`,
  );
  if (mode === "first") {
    firstRebuildReset(runCommand, settings);
  } else {
    // The wrapper applies WP1.1's reset rule again on its own.
    supabaseCli(runCommand, "Supabase reset", ["db", "reset"], settings);
  }
  // The marker migration writes `disposable` when public.profiles,
  // public.donors and public.donations are empty, as they are right after the
  // reset drops and recreates them. Anything else is a failed rebuild.
  const after = readReleaseHealth({ databaseUrl: settings.databaseUrl, query });
  if (after?.environment !== "disposable") {
    stop(
      `The database is not marked disposable after the migrations (it reads ${after?.environment ?? "no marker"}). The rebuild stopped before the CMS role passwords and Payload's migrations; nothing was deployed.`,
    );
  }
  setCmsRolePasswords({ settings, env, query, run, log });
  payloadMigrate({ settings, runCommand });
  checkLedgers({ databaseUrl: settings.databaseUrl, query });
  log("Rebuild complete; the database is marked disposable.");
}

/**
 * Sets the two CMS login roles' passwords from the job's secrets (plan 7.5,
 * 8.5). Only SCRAM verifiers reach the server, then each role logs in with its
 * new password to prove it.
 */
export function setCmsRolePasswords({
  settings,
  env = process.env,
  roles: roleVariables = CMS_ROLES,
  query = queryJson,
  run = runPsql,
  log = console.log,
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
  for (const { role, password } of passwords) {
    run({
      databaseUrl: settings.databaseUrl,
      label: `set ${role} password`,
      variables: { RELEASE_ROLE_VERIFIER: scramSha256Verifier(password) },
      sql: `\\getenv verifier RELEASE_ROLE_VERIFIER
ALTER ROLE ${role} WITH PASSWORD :'verifier';`,
    });
    const who = query({
      databaseUrl: roleDatabaseUrl(settings.databaseUrl, role, password),
      label: `log in as ${role}`,
      sql: "SELECT json_build_object('user', current_user)::text;",
    });
    if (who.user !== role)
      stop(`Logging in as ${role} did not yield that role.`);
    log(`Set and verified the ${role} password.`);
  }
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
