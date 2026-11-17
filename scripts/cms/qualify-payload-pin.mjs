// Qualifies the pinned Payload release against Core's database roles on a
// new, disposable, loopback database (plan 6.7 and 15.2; WP1, AL-2674):
//
//   1. Supabase migrations from empty, with the catalog and field-policy gates.
//   2. Payload migrations from empty, as the cms_owner login.
//   3. Ownership and grants: cms_owner owns all of cms; cms_runtime holds only
//      row privileges in it.
//   4. Confinement: as cms_runtime, reading public.donors, creating a table
//      and dropping a column all fail.
//   5. Start-up as cms_runtime with schema push off, with every statement the
//      adapter sends recorded: no schema change, and the catalog unchanged.
//   6. Local API access defaults and version-read access on the pin.
//   7. Start-up with schema push left on: it must fail and change nothing.
//
// Usage:
//   PAYLOAD_QUALIFICATION_ADMIN_URL=postgresql://postgres:<pw>@127.0.0.1:<port>/postgres \
//     node scripts/cms/qualify-payload-pin.mjs --database=<new_name> [--keep] [--report=<file>]
//
// The admin URL must be a superuser on a loopback server. The database must
// not exist yet; it is dropped afterwards unless --keep is given. Both CMS
// roles get a random password for the run and lose it afterwards.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import pg from "pg";

import { adminAppDir, cmsScriptsDir, repoRoot } from "./lib/paths.mjs";

const RESULT_PREFIX = "PAYLOAD_QUALIFICATION_RESULT ";
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
const DATABASE_NAME = /^[a-z][a-z0-9_]{0,62}$/;
const PUSH_PROBE_COLUMN = { table: "pages", column: "summary" };

function parseArgs(argv) {
  const options = { keep: false, database: null, report: null };
  for (const arg of argv) {
    if (arg === "--keep") options.keep = true;
    else if (arg.startsWith("--database=")) options.database = arg.slice(11);
    else if (arg.startsWith("--report=")) options.report = arg.slice(9);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.database || !DATABASE_NAME.test(options.database)) {
    throw new Error("--database=<name> must be a plain lower-case name.");
  }
  return options;
}

function adminServerUrl() {
  const raw = process.env.PAYLOAD_QUALIFICATION_ADMIN_URL?.trim();
  if (!raw) {
    throw new Error(
      "Set PAYLOAD_QUALIFICATION_ADMIN_URL to a loopback superuser URL.",
    );
  }
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("PAYLOAD_QUALIFICATION_ADMIN_URL is not a valid URL.");
  }
  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error(
      "Payload qualification runs only against a loopback database server.",
    );
  }
  return url;
}

function databaseUrl(server, database, login) {
  const url = new URL(server.toString());
  url.pathname = `/${database}`;
  if (login) {
    url.username = login.role;
    url.password = login.password;
  }
  url.search = "";
  return url.toString();
}

const results = [];
function record(name, pass, detail = {}) {
  results.push({ name, pass: Boolean(pass), detail });
  process.stdout.write(`${pass ? "PASS" : "FAIL"}  ${name}\n`);
}

function childEnv(overrides) {
  const env = { ...process.env };
  for (const key of [
    "SUPABASE_DB_URL",
    "DATABASE_URL",
    "PAYLOAD_DATABASE_URI",
    "PAYLOAD_MIGRATION_DATABASE_URI",
    "PAYLOAD_DISABLE_SCHEMA_PUSH",
    "PAYLOAD_DATABASE_POOL_MAX",
    "PAYLOAD_DATABASE_SSL_CA",
    "VERCEL",
    "VERCEL_ENV",
    "VERCEL_TARGET_ENV",
    "BLOB_READ_WRITE_TOKEN",
    "RESEND_API_KEY",
    "CMS_HOSTED_MIGRATION_REF",
    "CMS_HOSTED_MIGRATION_ROLE",
  ]) {
    delete env[key];
  }
  return {
    ...env,
    SKIP_ENV_VALIDATION: "1",
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "example-anon-key",
    PAYLOAD_SECRET: randomBytes(24).toString("hex"),
    ...overrides,
  };
}

function runSync(label, command, args, options) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  return {
    label,
    status: result.status,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
    error: result.error?.message ?? null,
  };
}

function runAsync(command, args, options, onTick) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { shell: false, ...options });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    const timer = onTick ? setInterval(onTick, 100) : null;
    child.on("close", (status) => {
      if (timer) clearInterval(timer);
      resolve({ status, output });
    });
  });
}

function parseChildResult(output) {
  const line = output
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(RESULT_PREFIX));
  return line ? JSON.parse(line.slice(RESULT_PREFIX.length)) : null;
}

function tail(text, lines = 25) {
  return text.split(/\r?\n/).slice(-lines).join("\n");
}

const FINGERPRINT_SQL = `
  SELECT md5(string_agg(item, '|' ORDER BY item)) AS fingerprint,
         count(*)::int AS items
  FROM (
    SELECT 'rel:' || c.relname || ':' || c.relkind::text || ':' || pg_get_userbyid(c.relowner)
           || ':' || coalesce(c.relacl::text, '') AS item
    FROM pg_class c WHERE c.relnamespace = 'cms'::regnamespace
    UNION ALL
    SELECT 'col:' || c.relname || '.' || a.attname || ':'
           || format_type(a.atttypid, a.atttypmod) || ':' || a.attnotnull
    FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relnamespace = 'cms'::regnamespace AND a.attnum > 0 AND NOT a.attisdropped
    UNION ALL
    SELECT 'con:' || conname || ':' || pg_get_constraintdef(oid)
    FROM pg_constraint WHERE connamespace = 'cms'::regnamespace
    UNION ALL
    SELECT 'type:' || typname || ':' || pg_get_userbyid(typowner)
    FROM pg_type WHERE typnamespace = 'cms'::regnamespace
  ) items`;

async function errorCode(run) {
  try {
    await run();
    return "succeeded";
  } catch (error) {
    return error?.code ?? "no-code";
  }
}

function forbidden(check) {
  return check?.ok === false && check.status === 403;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const server = adminServerUrl();
  const maintenance = new pg.Client({ connectionString: server.toString() });
  const ownerLogin = {
    role: "cms_owner",
    password: randomBytes(24).toString("hex"),
  };
  const runtimeLogin = {
    role: "cms_runtime",
    password: randomBytes(24).toString("hex"),
  };
  const adminUrl = databaseUrl(server, options.database);
  const ownerUrl = databaseUrl(server, options.database, ownerLogin);
  const runtimeUrl = databaseUrl(server, options.database, runtimeLogin);
  let admin;
  let rolesTouched = false;

  await maintenance.connect();
  try {
    await maintenance.query(`CREATE DATABASE "${options.database}"`);
    process.stdout.write(`==> created ${options.database}\n`);

    // 1. Supabase migrations from empty.
    const supabase = runSync(
      "supabase migrations",
      process.execPath,
      [path.join(repoRoot, "scripts", "verify", "supabase-migrations.mjs")],
      { cwd: repoRoot, env: { ...process.env, DATABASE_URL: adminUrl } },
    );
    record(
      "Supabase migrations from empty, with catalog gates",
      supabase.status === 0,
      {
        tail: tail(supabase.output, 4),
      },
    );
    if (supabase.status !== 0) return;

    admin = new pg.Client({ connectionString: adminUrl });
    await admin.connect();
    rolesTouched = true;
    await admin.query(
      `ALTER ROLE cms_owner PASSWORD ${admin.escapeLiteral(ownerLogin.password)}`,
    );
    await admin.query(
      `ALTER ROLE cms_runtime PASSWORD ${admin.escapeLiteral(runtimeLogin.password)}`,
    );

    // 2. Payload migrations from empty, as the cms_owner login.
    let ownerConnectionsMax = 0;
    const sample = async () => {
      const { rows } = await admin.query(
        "SELECT count(*)::int AS n FROM pg_stat_activity WHERE usename = 'cms_owner' AND datname = $1",
        [options.database],
      );
      ownerConnectionsMax = Math.max(ownerConnectionsMax, rows[0].n);
    };
    const migrate = await runAsync(
      process.execPath,
      [path.join(cmsScriptsDir, "run-payload-command.mjs"), "migrate"],
      {
        cwd: repoRoot,
        env: childEnv({
          PAYLOAD_DATABASE_URI: runtimeUrl,
          PAYLOAD_MIGRATION_DATABASE_URI: ownerUrl,
        }),
      },
      () => void sample().catch(() => {}),
    );
    const migrationFiles = readdirSync(
      path.join(adminAppDir, "src", "migrations"),
    )
      .filter((name) => /^\d{8}_\d{6}_.+\.ts$/.test(name))
      .map((name) => name.replace(/\.ts$/, ""))
      .sort();
    const ledger = await admin
      .query("SELECT name, batch FROM cms.payload_migrations ORDER BY name")
      .catch(() => ({ rows: [] }));
    record(
      "Payload migrations from empty as cms_owner",
      migrate.status === 0 &&
        JSON.stringify(ledger.rows.map((row) => row.name)) ===
          JSON.stringify(migrationFiles),
      {
        exit: migrate.status,
        applied: ledger.rows,
        expected: migrationFiles,
        ownerConnectionsMax,
        tail: migrate.status === 0 ? undefined : tail(migrate.output),
      },
    );
    record(
      "cms_owner stayed within its connection limit while migrating",
      ownerConnectionsMax <= 2,
      {
        ownerConnectionsMax,
      },
    );

    const status = runSync(
      "status",
      process.execPath,
      [path.join(cmsScriptsDir, "run-payload-command.mjs"), "migrate:status"],
      {
        cwd: repoRoot,
        env: childEnv({
          PAYLOAD_DATABASE_URI: runtimeUrl,
          PAYLOAD_MIGRATION_DATABASE_URI: ownerUrl,
        }),
      },
    );
    record("Payload migration status after migrating", status.status === 0, {
      tail: tail(status.output, migrationFiles.length + 6),
    });

    // 3. Ownership and grants.
    const ownership = await admin.query(`
      SELECT
        (SELECT pg_get_userbyid(nspowner) FROM pg_namespace WHERE nspname = 'cms') AS schema_owner,
        (SELECT count(*)::int FROM pg_class WHERE relnamespace = 'cms'::regnamespace
           AND relowner <> 'cms_owner'::regrole) AS foreign_relations,
        (SELECT count(*)::int FROM pg_type WHERE typnamespace = 'cms'::regnamespace
           AND typowner <> 'cms_owner'::regrole) AS foreign_types,
        (SELECT count(*)::int FROM pg_class WHERE relnamespace = 'cms'::regnamespace
           AND relkind IN ('r', 'p')) AS tables,
        (SELECT count(*)::int FROM pg_class WHERE relnamespace = 'cms'::regnamespace
           AND relkind IN ('r', 'p')
           AND has_table_privilege('cms_runtime', oid, 'SELECT, INSERT, UPDATE, DELETE')) AS runtime_rw_tables,
        (SELECT count(*)::int FROM pg_class WHERE relnamespace = 'cms'::regnamespace
           AND relkind IN ('r', 'p')
           AND has_table_privilege('cms_runtime', oid, 'TRUNCATE, REFERENCES, TRIGGER')) AS runtime_extra_tables,
        has_schema_privilege('cms_runtime', 'cms', 'CREATE') AS runtime_create,
        has_database_privilege('cms_runtime', current_database(), 'CREATE') AS runtime_create_schema,
        has_database_privilege('cms_owner', current_database(), 'CREATE') AS owner_create_schema
    `);
    const own = ownership.rows[0];
    record(
      "cms_owner owns schema cms and every object in it",
      own.schema_owner === "cms_owner" &&
        own.foreign_relations === 0 &&
        own.foreign_types === 0,
      own,
    );
    record(
      "cms_runtime holds row privileges on every cms table and nothing more",
      own.tables > 0 &&
        own.runtime_rw_tables === own.tables &&
        own.runtime_extra_tables === 0 &&
        !own.runtime_create &&
        !own.runtime_create_schema &&
        !own.owner_create_schema,
      own,
    );

    // 4. Confinement (plan section 13, "Payload confinement").
    const runtime = new pg.Client({ connectionString: runtimeUrl });
    await runtime.connect();
    const confinement = {
      currentUser: (await runtime.query("SELECT current_user AS u")).rows[0].u,
      selectDonors: await errorCode(() =>
        runtime.query("SELECT 1 FROM public.donors LIMIT 1"),
      ),
      createTableCms: await errorCode(() =>
        runtime.query("CREATE TABLE cms.qualification_probe (id int)"),
      ),
      createTablePublic: await errorCode(() =>
        runtime.query("CREATE TABLE public.qualification_probe (id int)"),
      ),
      dropColumn: await errorCode(() =>
        runtime.query("ALTER TABLE cms.pages DROP COLUMN title"),
      ),
    };
    await runtime.end();
    record(
      "As cms_runtime: select from public.donors, create a table and drop a column all fail",
      confinement.currentUser === "cms_runtime" &&
        [
          "selectDonors",
          "createTableCms",
          "createTablePublic",
          "dropColumn",
        ].every((key) => confinement[key] === "42501"),
      confinement,
    );

    // 5 and 6. Start-up as cms_runtime with push off, then the Local API.
    const before = (await admin.query(FINGERPRINT_SQL)).rows[0];
    const startup = await runAsync(
      process.execPath,
      [
        path.join(cmsScriptsDir, "lib", "payload-qualification-runtime.mjs"),
        "startup",
      ],
      {
        cwd: adminAppDir,
        env: childEnv({
          NODE_ENV: "production",
          PAYLOAD_DATABASE_URI: runtimeUrl,
          PAYLOAD_DISABLE_SCHEMA_PUSH: "1",
          VERCEL_ENV: "production",
          VERCEL_TARGET_ENV: "production",
        }),
      },
    );
    const proof = parseChildResult(startup.output);
    const after = (await admin.query(FINGERPRINT_SQL)).rows[0];
    const devMarkers = (
      await admin.query(
        "SELECT count(*)::int AS n FROM cms.payload_migrations WHERE batch = -1",
      )
    ).rows[0].n;
    if (!proof) {
      record("Payload starts as cms_runtime with schema push off", false, {
        exit: startup.status,
        tail: tail(startup.output, 40),
      });
    } else {
      record(
        "Payload starts as cms_runtime with schema push off; its statement log has no schema change",
        // The sentinel shows the recorder sees the adapter's statements; the
        // pinned release may issue none at all while starting.
        proof.identity?.current_user === "cms_runtime" &&
          proof.sentinelRecorded &&
          proof.schemaChangesAtStartup.length === 0 &&
          proof.schemaChanges.length === 0 &&
          before.fingerprint === after.fingerprint &&
          devMarkers === 0,
        {
          identity: proof.identity,
          startupStatementCount: proof.startupStatementCount,
          statementCount: proof.statementCount,
          sentinelRecorded: proof.sentinelRecorded,
          schemaChanges: proof.schemaChanges,
          catalogBefore: before,
          catalogAfter: after,
          devMarkers,
        },
      );
      const checks = proof.checks;
      record(
        "Local API enforces access by default (anonymous find, findByID, count, create refused; overrideAccess reads)",
        [
          "anonymousFind",
          "anonymousFindByID",
          "anonymousCount",
          "anonymousCreate",
        ].every((key) => forbidden(checks[key])) &&
          checks.overrideFind.ok &&
          checks.overrideFind.totalDocs === 1,
        checks,
      );
      const publishedIds = new Set(proof.versions.publishedVersionIds);
      const publicIds = checks.publicReadFindVersions.ids ?? [];
      record(
        "Version reads: anonymous refused; the public reader sees no draft version; another tenant's staff see none",
        forbidden(checks.anonymousFindVersions) &&
          forbidden(checks.anonymousFindVersionByID) &&
          proof.versions.draftVersionId !== null &&
          checks.publicReadFindVersions.ok &&
          !publicIds.includes(proof.versions.draftVersionId) &&
          publicIds.every((id) => publishedIds.has(id)) &&
          checks.otherTenantStaffFindVersions.ok &&
          checks.otherTenantStaffFindVersions.totalDocs === 0 &&
          checks.sameTenantStaffFindVersions.ok &&
          checks.sameTenantStaffFindVersions.totalDocs === proof.versions.total,
        { versions: proof.versions, checks },
      );
    }

    // 7. Start-up with schema push left on, against a schema that differs.
    const owner = new pg.Client({ connectionString: ownerUrl });
    await owner.connect();
    await owner.query(
      `ALTER TABLE cms.${PUSH_PROBE_COLUMN.table} DROP COLUMN ${PUSH_PROBE_COLUMN.column}`,
    );
    await owner.end();
    const drifted = (await admin.query(FINGERPRINT_SQL)).rows[0];
    const push = await runAsync(
      process.execPath,
      [
        path.join(cmsScriptsDir, "lib", "payload-qualification-runtime.mjs"),
        "push",
      ],
      {
        cwd: adminAppDir,
        env: childEnv({
          NODE_ENV: "development",
          PAYLOAD_DATABASE_URI: runtimeUrl,
        }),
      },
    );
    const pushResult = parseChildResult(push.output);
    const afterPush = (await admin.query(FINGERPRINT_SQL)).rows[0];
    const pushMarkers = (
      await admin.query(
        "SELECT count(*)::int AS n FROM cms.payload_migrations WHERE batch = -1",
      )
    ).rows[0].n;
    record(
      "With schema push on, Payload as cms_runtime fails to start and changes nothing",
      pushResult !== null &&
        !pushResult.started &&
        drifted.fingerprint === afterPush.fingerprint &&
        pushMarkers === 0,
      {
        exit: push.status,
        result: pushResult,
        attemptedSchemaChanges: pushResult?.schemaChanges,
        catalogBefore: drifted,
        catalogAfter: afterPush,
        devMarkers: pushMarkers,
        tail: pushResult ? undefined : tail(push.output, 40),
      },
    );
  } finally {
    if (rolesTouched) {
      await admin?.query("ALTER ROLE cms_owner PASSWORD NULL").catch(() => {});
      await admin
        ?.query("ALTER ROLE cms_runtime PASSWORD NULL")
        .catch(() => {});
    }
    await admin?.end().catch(() => {});
    if (!options.keep) {
      await maintenance
        .query(`DROP DATABASE IF EXISTS "${options.database}" WITH (FORCE)`)
        .catch((error) =>
          process.stderr.write(
            `warning: could not drop ${options.database}: ${error.message}\n`,
          ),
        );
    }
    await maintenance.end();
  }

  if (options.report) {
    writeFileSync(
      options.report,
      `${JSON.stringify({ database: options.database, results }, null, 2)}\n`,
    );
  }
  const failed = results.filter((result) => !result.pass);
  process.stdout.write(
    `\n${results.length - failed.length} passed, ${failed.length} failed\n`,
  );
  process.exitCode = failed.length === 0 && results.length > 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
