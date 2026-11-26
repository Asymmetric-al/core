// Two fresh replays of the migration chain must fingerprint identically, and
// a difference planted in one must be reported (WP1 acceptance: "Schema
// fingerprint equality between CI's replay and development"). Needs
// RELEASE_IT_ADMIN_DATABASE_URL; see support/test-database.ts.
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  IN_MIGRATE_JOB,
  adminDatabaseUrl,
  createDatabase,
  dropDatabase,
  psql,
} from "./support/test-database";
import { runCatalogGates } from "../../../../scripts/release/catalog-gates.mjs";
import {
  HOSTED_DEFAULT_PRIVILEGES,
  pinnedSupabaseCliVersion,
  gates,
  preflight,
  rebuild,
  recordHeads,
  readReleaseHealth,
  readReleaseSettings,
  restoreHostedDefaultPrivileges,
} from "../../../../scripts/release/release-database.mjs";
import {
  captureFingerprint,
  diffFingerprints,
  formatFingerprintDiff,
} from "../../../../scripts/release/schema-fingerprint.mjs";
import { readSeedExpectations } from "../../../../scripts/verify/seed-counts.mjs";
import { Replay } from "../../acceptance/issue-2674/privileges-harness";
import { queryJson } from "../../../../scripts/release/lib/postgres.mjs";
import { listSourceMigrations } from "../../../../scripts/release/migration-heads.mjs";

const created: string[] = [];
/** A throwaway role of review L4's cases; dropped once its databases are. */
const FP_ROLE = "wp13r_fp_owner";
let first = "";
let second = "";
const scratch = mkdtempSync(path.join(tmpdir(), "release-fingerprint-"));
const harnessAdminUrl =
  process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL?.trim() ?? "";

/** The compatibility bootstrap, then every migration, on `url`. */
function applyChain(url: string, args: string[] = []) {
  const result = spawnSync(
    process.execPath,
    ["scripts/verify/supabase-migrations.mjs", ...args],
    {
      encoding: "utf8",
      shell: false,
      env: { ...process.env, DATABASE_URL: url },
    },
  );
  if (result.status !== 0) {
    throw new Error(`replay failed: ${result.stderr.slice(-2000)}`);
  }
}

function replay(label: string, args: string[] = []) {
  const db = createDatabase(label);
  created.push(db.name);
  applyChain(db.url, args);
  return db.url;
}

// One fresh replay with the hosted defaults, as the release job makes it,
// shared by the suites below.
let flagged = "";
function flaggedReplay() {
  if (!flagged) flagged = replay("fp_hosted", ["--hosted-defaults"]);
  return flagged;
}

afterAll(() => {
  for (const name of created) dropDatabase(name);
  // The throwaway role of review L4's cases, once its databases are gone.
  if (adminDatabaseUrl)
    psql(adminDatabaseUrl, `DROP ROLE IF EXISTS ${FP_ROLE};`);
  rmSync(scratch, { recursive: true, force: true });
});

it.runIf(IN_MIGRATE_JOB && !adminDatabaseUrl)(
  "the migrate job sets RELEASE_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(adminDatabaseUrl).not.toBe(""),
);

describe.skipIf(!adminDatabaseUrl)(
  "schema fingerprint (real stack)",
  { timeout: 180_000 },
  () => {
    beforeAll(() => {
      first = replay("fp_first");
      second = replay("fp_second");
    }, 300_000);

    it("gives two fresh replays of the migration chain the same fingerprint", () => {
      const a = captureFingerprint({ databaseUrl: first });
      const b = captureFingerprint({ databaseUrl: second });
      expect(a.count).toBeGreaterThan(1000);
      expect(diffFingerprints(a, b)).toMatchObject({ equal: true });
      expect(a.digest).toBe(b.digest);
    });

    it("refuses DELETE and TRUNCATE of recorded heads even in replica mode", () => {
      const db = replay("protected_heads");
      psql(
        db,
        "SELECT platform.record_migration_head('supabase', '20260101000000')",
      );
      for (const statement of [
        "DELETE FROM platform.migration_heads",
        "TRUNCATE platform.migration_heads",
      ]) {
        expect(() =>
          psql(db, `SET session_replication_role=replica; ${statement}`),
        ).toThrow(/migration heads cannot be removed/i);
      }
      expect(psql(db, "SELECT count(*) FROM platform.migration_heads")).toBe(
        "1",
      );
    });

    it("reports a planted difference by object, and the compare command exits non-zero", () => {
      psql(
        second,
        `ALTER TABLE public.tenants ADD COLUMN fingerprint_planted integer;
       ALTER TABLE public.tenants ALTER COLUMN name DROP NOT NULL;
       CREATE POLICY fingerprint_planted ON public.tenants FOR SELECT TO anon USING (true);
       ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE ON TYPES TO anon;`,
      );
      const a = captureFingerprint({ databaseUrl: first });
      const b = captureFingerprint({ databaseUrl: second });
      const diff = diffFingerprints(a, b);
      expect(diff.equal).toBe(false);
      expect(diff.unexpected).toEqual(
        expect.arrayContaining([
          "column public.tenants.fingerprint_planted",
          "policy public.tenants.fingerprint_planted",
        ]),
      );
      expect(diff.changed).toContain("column public.tenants.name");
      // Review H1.4: the gate sees the default privileges of postgres, which
      // decide the access lists of what a later migration creates.
      expect([...diff.unexpected, ...diff.changed]).toContain(
        "default privileges postgres in public on types",
      );
      expect(
        formatFingerprintDiff(diff, {
          expectedLabel: "replay",
          actualLabel: "target",
        }),
      ).toContain("policy public.tenants.fingerprint_planted");

      const fileA = path.join(scratch, "a.json");
      const fileB = path.join(scratch, "b.json");
      writeFileSync(fileA, JSON.stringify(a));
      writeFileSync(fileB, JSON.stringify(b));
      const compare = spawnSync(
        process.execPath,
        ["scripts/release/schema-fingerprint.mjs", "compare", fileA, fileB],
        { encoding: "utf8", shell: false },
      );
      expect(compare.status).toBe(1);
      expect(compare.stdout).toContain(
        "column public.tenants.fingerprint_planted",
      );
    });

    // Review K2: a default privilege of postgres for every schema
    // (defaclnamespace 0) decides the access list of everything it creates
    // anywhere, so the fingerprint holds it too.
    // Review L4: the chain writes defaults for cms_owner in cms, and Payload
    // creates cms objects as cms_owner, so the fingerprint holds every role's
    // default privileges, not only those of postgres. A throwaway role stands
    // in for cms_owner, in a schema the fingerprint covers.
    it.each([
      [
        "in a schema the fingerprint covers",
        `CREATE SCHEMA IF NOT EXISTS fpcase;
         ALTER DEFAULT PRIVILEGES FOR ROLE ${FP_ROLE} IN SCHEMA fpcase GRANT SELECT ON TABLES TO anon;`,
        `default privileges ${FP_ROLE} in fpcase on tables`,
      ],
      [
        "for every schema",
        `ALTER DEFAULT PRIVILEGES FOR ROLE ${FP_ROLE} GRANT SELECT ON TABLES TO anon;`,
        `default privileges ${FP_ROLE} in every schema on tables`,
      ],
    ])(
      "tells apart two databases that differ only in another role's default privilege %s",
      (_case, plant, key) => {
        psql(
          adminDatabaseUrl,
          `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${FP_ROLE}') THEN CREATE ROLE ${FP_ROLE} NOLOGIN; END IF; END $$;`,
        );
        const pair = ["fp_role_a", "fp_role_b"].map((label) => {
          const db = createDatabase(label);
          created.push(db.name);
          psql(
            db.url,
            `${readFileSync("scripts/sql/supabase-compat-bootstrap.sql", "utf8")}
             CREATE SCHEMA IF NOT EXISTS fpcase;`,
          );
          return db;
        });
        psql(pair[1]!.url, plant);
        const diff = diffFingerprints(
          captureFingerprint({ databaseUrl: pair[0]!.url }),
          captureFingerprint({ databaseUrl: pair[1]!.url }),
        );
        expect([...diff.missing, ...diff.unexpected, ...diff.changed]).toEqual([
          key,
        ]);
      },
    );

    it("tells apart two databases that differ only in a default privilege for every schema", () => {
      const pair = ["fp_global_a", "fp_global_b"].map((label) => {
        const db = createDatabase(label);
        created.push(db.name);
        psql(
          db.url,
          readFileSync("scripts/sql/supabase-compat-bootstrap.sql", "utf8"),
        );
        return db;
      });
      psql(
        pair[1]!.url,
        "ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT SELECT ON TABLES TO anon;",
      );
      const diff = diffFingerprints(
        captureFingerprint({ databaseUrl: pair[0]!.url }),
        captureFingerprint({ databaseUrl: pair[1]!.url }),
      );
      expect(diff.equal).toBe(false);
      expect([...diff.missing, ...diff.unexpected, ...diff.changed]).toEqual([
        "default privileges postgres in every schema on tables",
      ]);
    });

    it("passes the catalog gates on a fresh replay, and fails a cross-schema name collision, cms.tenants included (D-18: WP6 part 2b drops cms.tenants and empties the exception list)", () => {
      const clean = runCatalogGates({ databaseUrl: first });
      expect(clean.report).toContain("PASS: name-collision gate");
      expect(clean.ok).toBe(true);
      psql(first, "CREATE TABLE cms.tenants (id integer);");
      const tenants = runCatalogGates({ databaseUrl: first });
      expect(tenants.ok).toBe(false);
      expect(tenants.report).toContain("tenants exists in cms, public");
      psql(first, "DROP TABLE cms.tenants;");
      psql(first, "CREATE TABLE cms.donors (id integer);");
      const collided = runCatalogGates({ databaseUrl: first });
      expect(collided.ok).toBe(false);
      expect(collided.report).toContain("donors exists in cms, public");
    });
  },
);

// WP1.6's first hosted run (docs/audits/core-crm-cms-database-proofs/
// wp16-hosted-proofs.md, section 5): hosted Supabase gives `postgres` default
// privileges in `public` before any migration runs, so the access lists of a
// plain replay never equal a hosted database's, and every hosted release
// stopped at its fingerprint. The release job's replay now applies the same
// defaults first, from scripts/sql/hosted-default-privileges.sql. The
// privileges harness, which applies that file before the chain as the
// platform does, stands in for the platform here. That stand-in is itself a
// replay that applies the same file (privileges-harness.ts), so this suite
// proves the file is applied at the same point, not that the file equals the
// platform (review H7). What proves the file right is the comparison with
// Supabase's image on a local stack and the hosted gates of 18 November 2026
// (report, sections 5 and 10).
it.runIf(IN_MIGRATE_JOB && !harnessAdminUrl)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL for the release suite (fails, never skips)",
  () => expect(harnessAdminUrl).not.toBe(""),
);

/** The keys of `changed` whose definitions differ in anything but the ACL. */
function beyondAcl(
  a: { entries: [string, string][] },
  b: { entries: [string, string][] },
  changed: string[],
) {
  const ma = new Map(a.entries);
  const mb = new Map(b.entries);
  const strip = (def: string | undefined) => {
    try {
      const parsed = JSON.parse(def ?? "") as Record<string, unknown>;
      delete parsed.acl;
      return JSON.stringify(parsed);
    } catch {
      return def;
    }
  };
  return changed.filter((key) => strip(ma.get(key)) !== strip(mb.get(key)));
}

describe.skipIf(!adminDatabaseUrl || !harnessAdminUrl)(
  "schema fingerprint against a database with the platform's default privileges (real stack)",
  { timeout: 240_000 },
  () => {
    let platform: Replay | undefined;
    let plain = "";
    let withDefaults = "";

    beforeAll(async () => {
      platform = new Replay(harnessAdminUrl, true);
      await platform.build();
      plain = replay("fp_plain");
      withDefaults = flaggedReplay();
    }, 600_000);

    afterAll(async () => {
      await platform?.close();
    });

    it("differs from a plain replay in access lists only, and equals a replay made with the hosted defaults", () => {
      const target = captureFingerprint({ databaseUrl: platform!.url });
      const oldWay = captureFingerprint({ databaseUrl: plain });
      const before = diffFingerprints(oldWay, target);
      expect(before.equal).toBe(false);
      // Since review H1.4 the fingerprint holds postgres's default privileges,
      // which the plain replay lacks; everything else differs in access only.
      const objects = (keys: string[]) =>
        keys.filter((key) => !key.startsWith("default privileges "));
      expect(objects(before.missing)).toEqual([]);
      expect(objects(before.unexpected)).toEqual([]);
      expect(before.changed.length).toBeGreaterThan(0);
      expect(beyondAcl(oldWay, target, before.changed)).toEqual([]);

      const newWay = captureFingerprint({ databaseUrl: withDefaults });
      expect(diffFingerprints(newWay, target)).toMatchObject({ equal: true });
      expect(newWay.digest).toBe(target.digest);
    });

    it("refuses an argument it does not know, rather than replaying without the defaults", () => {
      const db = createDatabase("fp_badarg");
      created.push(db.name);
      const result = spawnSync(
        process.execPath,
        ["scripts/verify/supabase-migrations.mjs", "--hosted-default"],
        {
          encoding: "utf8",
          shell: false,
          env: { ...process.env, DATABASE_URL: db.url },
        },
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("--hosted-default");
    });
  },
);

// WP1.6, the second rebuild of the preview project (docs/audits/
// core-crm-cms-database-proofs/wp16-hosted-proofs.md): the reset of a hosted
// database keeps the default privileges `postgres` holds in `public`, and the
// chain changes them (stage 1 closes them for anon and authenticated). So a
// rebuild of a rebuilt project started from the chain's end state, not where
// a fresh project starts, and the functions made before that change lost the
// grants a fresh project gives them: the fingerprint gate stopped the
// recovery. The rebuild now puts the platform's defaults back before it
// resets, from the one file the replay applies.

// A model of what the pinned Supabase CLI's `db reset` does to a hosted
// database: a hand copy of its drop script (pkg/migration/queries/drop.sql)
// as CLI 2.121.0 ships it. It drops the extensions and schemas the chain made
// and every object in `public`, but not `public` itself, so the default
// privileges held there survive. The platform's own schemas survive too; here
// the compatibility bootstrap makes them again, as it does for a fresh replay.
//
// It is a model, and it cannot show (review H6):
// - a drop.sql that recreates `public`, which would drop the defaults held
//   there with it;
// - default privileges in the schemas hosted keeps (`extensions`, `vault`,
//   `auth`, `storage`): the model drops those schemas and the bootstrap makes
//   them again without any;
// - objects the real drop leaves in `public`: it drops routines, views,
//   materialized views, tables, sequences and types there, and the model
//   assumes nothing else is left;
// - a role that is not a superuser: the model runs as the container's
//   superuser `postgres`, and hosted's `postgres` is not one.
//
// The copy is tied to the pin: when scripts/supabase-cli.mjs pins another
// CLI, the case below fails until someone has read that CLI's drop.sql and
// brought the model and RESET_MODEL_CLI up to it.
const RESET_MODEL_CLI = "2.121.0";

it("models the reset of the pinned Supabase CLI, and fails when the pin moves", () => {
  expect(pinnedSupabaseCliVersion()).toBe(RESET_MODEL_CLI);
});

const HOSTED_RESET_SQL = String.raw`
DO $reset$
DECLARE
  statement text;
BEGIN
  FOREACH statement IN ARRAY ARRAY(
    SELECT format('DROP EXTENSION IF EXISTS %I CASCADE', extname)
    FROM pg_extension WHERE extname <> 'plpgsql'
  ) LOOP EXECUTE statement; END LOOP;
  FOREACH statement IN ARRAY ARRAY(
    SELECT format('DROP SCHEMA IF EXISTS %I CASCADE', nspname)
    FROM pg_namespace
    WHERE nspname NOT LIKE 'pg\_%'
      AND nspname NOT IN ('information_schema', 'public')
  ) LOOP EXECUTE statement; END LOOP;
  FOREACH statement IN ARRAY ARRAY(
    SELECT format('DROP ROUTINE IF EXISTS public.%I(%s) CASCADE', proname,
                  pg_get_function_identity_arguments(oid))
    FROM pg_proc WHERE pronamespace = 'public'::regnamespace
  ) LOOP EXECUTE statement; END LOOP;
  FOREACH statement IN ARRAY ARRAY(
    SELECT format(CASE relkind WHEN 'v' THEN 'DROP VIEW IF EXISTS public.%I CASCADE'
                               WHEN 'm' THEN 'DROP MATERIALIZED VIEW IF EXISTS public.%I CASCADE'
                               WHEN 'S' THEN 'DROP SEQUENCE IF EXISTS public.%I CASCADE'
                               ELSE 'DROP TABLE IF EXISTS public.%I CASCADE' END, relname)
    FROM pg_class
    WHERE relnamespace = 'public'::regnamespace AND relkind IN ('r', 'p', 'f', 'v', 'm', 'S')
    ORDER BY relkind = 'S', relkind DESC
  ) LOOP EXECUTE statement; END LOOP;
  FOREACH statement IN ARRAY ARRAY(
    SELECT format('DROP TYPE IF EXISTS public.%I CASCADE', typname)
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace AND typtype <> 'b'
  ) LOOP EXECUTE statement; END LOOP;
END
$reset$;`;

function loopbackSettings(url: string) {
  return readReleaseSettings({
    RELEASE_ENVIRONMENT: "preview",
    RELEASE_SUPABASE_PROJECT_REF: "wp16rebuildtestrefxx",
    RELEASE_DATABASE_URL: url,
    RELEASE_ALLOW_LOOPBACK_DATABASE: "1",
  });
}

const PUBLIC_DEFAULTS_SQL = `SELECT coalesce(string_agg(defaclobjtype::text || '=' || defaclacl::text, ';' ORDER BY defaclobjtype), '')
FROM pg_default_acl
WHERE defaclrole = 'postgres'::regrole AND defaclnamespace = 'public'::regnamespace;`;

describe.skipIf(!adminDatabaseUrl)(
  "a rebuild of a rebuilt database (real stack)",
  { timeout: 900_000 },
  () => {
    it("starts where a fresh project starts, so it fingerprints equal to a fresh replay with the hosted defaults", () => {
      const fresh = captureFingerprint({ databaseUrl: flaggedReplay() });
      // A project after its first rebuild: it carries the chain's end state,
      // default privileges included.
      const rebuilt = replay("fp_rebuilt", ["--hosted-defaults"]);
      // The rebuild, as the release job runs it: the platform's defaults
      // back first...
      restoreHostedDefaultPrivileges({
        settings: loopbackSettings(rebuilt),
        log: () => {},
      });
      // ...then the reset, which keeps them...
      const restored = psql(rebuilt, PUBLIC_DEFAULTS_SQL);
      psql(rebuilt, HOSTED_RESET_SQL);
      expect(psql(rebuilt, PUBLIC_DEFAULTS_SQL)).toBe(restored);
      // ...and applies the chain without the platform's defaults.
      applyChain(rebuilt);
      const diff = diffFingerprints(
        fresh,
        captureFingerprint({ databaseUrl: rebuilt }),
      );
      expect(
        diff.equal,
        formatFingerprintDiff(diff, {
          expectedLabel: "fresh replay",
          actualLabel: "rebuild",
        }),
      ).toBe(true);
    });
  },
);

// Review H1.2: the restore runs in one transaction, so a defaults file that
// fails part way changes nothing.
describe.skipIf(!adminDatabaseUrl)(
  "putting the platform's default privileges back (real stack)",
  { timeout: 300_000 },
  () => {
    it("applies nothing when the defaults file fails part way", () => {
      const db = createDatabase("defaults_tx");
      created.push(db.name);
      psql(
        db.url,
        readFileSync("scripts/sql/supabase-compat-bootstrap.sql", "utf8"),
      );
      const before = psql(db.url, PUBLIC_DEFAULTS_SQL);
      const root = mkdtempSync(path.join(tmpdir(), "defaults-root-"));
      try {
        mkdirSync(path.join(root, "scripts", "sql"), { recursive: true });
        writeFileSync(
          path.join(root, HOSTED_DEFAULT_PRIVILEGES),
          `${readFileSync(HOSTED_DEFAULT_PRIVILEGES, "utf8")}\nSELECT 1 / 0;\n`,
        );
        expect(() =>
          restoreHostedDefaultPrivileges({
            settings: loopbackSettings(db.url),
            root,
            log: () => {},
          }),
        ).toThrow(
          /could not be put back.*division by zero.*nothing was reset/s,
        );
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
      expect(psql(db.url, PUBLIC_DEFAULTS_SQL)).toBe(before);
    });

    // Review H5: the restore only grants, so any other default privilege of
    // postgres in public, or one in every schema, would survive it and the
    // reset, and the gates would fail only after the reset. The rebuild stops
    // before the reset instead, naming each entry, and changes nothing.
    it.each([
      [
        "a grant to another role in public",
        "ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON TABLES TO pg_monitor;",
        /unexpected in public tables:pg_monitor=r\/postgres/,
      ],
      [
        "an empty global tables ACL",
        "ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE ALL ON TABLES FROM postgres;",
        /in every schema tables:<empty>/,
      ],
      [
        "a revoke from PUBLIC in every schema",
        "ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;",
        /in every schema functions:postgres=X\/postgres/,
      ],
    ])(
      "stops before the reset, naming it, when postgres holds %s",
      (_case, plant, named) => {
        const db = createDatabase("defaults_extra");
        created.push(db.name);
        psql(
          db.url,
          readFileSync("scripts/sql/supabase-compat-bootstrap.sql", "utf8"),
        );
        psql(db.url, plant);
        const before = psql(db.url, POSTGRES_DEFAULTS_SQL);
        if (_case === "an empty global tables ACL")
          expect(before).toContain("/r={}");
        expect(() =>
          restoreHostedDefaultPrivileges({
            settings: loopbackSettings(db.url),
            log: () => {},
          }),
        ).toThrow(named);
        expect(psql(db.url, POSTGRES_DEFAULTS_SQL)).toBe(before);
      },
    );

    it("passes, and leaves exactly the platform's defaults, on a database that holds only the bootstrap's", () => {
      const db = createDatabase("defaults_plain");
      created.push(db.name);
      psql(
        db.url,
        readFileSync("scripts/sql/supabase-compat-bootstrap.sql", "utf8"),
      );
      restoreHostedDefaultPrivileges({
        settings: loopbackSettings(db.url),
        log: () => {},
      });
      expect(psql(db.url, POSTGRES_DEFAULTS_SQL)).toMatch(
        /^public\/S=\{.*\};public\/f=\{.*\};public\/r=\{.*\}$/,
      );
    });
  },
);

describe.skipIf(!adminDatabaseUrl)(
  "first rebuild recovery (real stack)",
  { timeout: 900_000 },
  () => {
    const source = listSourceMigrations({ root: process.cwd() });
    const silent = () => {};
    const fixtures = (url: string) =>
      psql(
        url,
        "SELECT (SELECT count(*) FROM public.profiles), (SELECT count(*) FROM public.tenants), (SELECT count(*) FROM authz.memberships)",
      );
    const installLedger = (url: string) =>
      psql(
        url,
        `INSERT INTO supabase_migrations.schema_migrations(version) VALUES ${source.supabase.map((version) => `('${version}')`).join(",")} ON CONFLICT DO NOTHING`,
      );
    const migratePayload = (url: string) => {
      const result = spawnSync("bun", ["run", "cms:migrate"], {
        encoding: "utf8",
        env: {
          ...process.env,
          PAYLOAD_MIGRATION_DATABASE_URI: "",
          PAYLOAD_DATABASE_URI: url,
          PAYLOAD_SECRET: "local-recovery-test",
          SKIP_ENV_VALIDATION: "1",
          NEXT_PUBLIC_SUPABASE_URL: "http://localhost",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture",
        },
      });
      expect(result.status, "local Payload replay").toBe(0);
    };
    let expected = "";
    beforeAll(() => {
      const url = replay("recovery_reference", ["--hosted-defaults"]);
      installLedger(url);
      migratePayload(url);
      expected = path.join(scratch, "recovery-reference.json");
      writeFileSync(
        expected,
        JSON.stringify(captureFingerprint({ databaseUrl: url })),
      );
    }, 300_000);

    it.each([false, true])(
      "recovers 0/1/0 fixtures with open defaults=%s and records both heads (D-18, AL-2678: the seed adds the fixture worker Sam Ortiz, one profile and a missionary membership in each organization, so with WP4b's Member Care worker 5 profiles, 2 tenants, 9 memberships; AL-2679: the rebuild's Site presentation sweep is stood in for by writing what it is handed, since this replay's CMS roles have no password; its own process runs in the issue-2679 suite)",
      async (open) => {
        const url = replay("first_recovery", ["--hosted-defaults"]);
        installLedger(url);
        const password = () => randomBytes(32).toString("base64url");
        const env = {
          RELEASE_ENVIRONMENT: "production",
          RELEASE_ALLOW_LOOPBACK_DATABASE: "1",
          RELEASE_SUPABASE_PROJECT_REF: "wp16rebuildtestrefxx",
          RELEASE_DATABASE_URL: url,
          RELEASE_CMS_OWNER_PASSWORD: password(),
          RELEASE_CMS_RUNTIME_PASSWORD: password(),
          RELEASE_SEED_LOGIN_PASSWORD: password(),
        };
        const settings = readReleaseSettings(env);
        if (open) restoreHostedDefaultPrivileges({ settings, log: silent });
        expect(fixtures(url)).toBe("0|1|0");
        expect(readReleaseHealth({ databaseUrl: url })).toEqual({
          environment: "disposable",
          heads: { supabase: null, payload: null },
        });
        const queryWithLocalRole = (request: {
          databaseUrl: string;
          sql: string;
          label?: string;
        }) => {
          const target = new URL(request.databaseUrl);
          if (
            target.username !== "cms_owner" &&
            target.username !== "cms_runtime"
          )
            return queryJson(request);
          return queryJson({
            ...request,
            databaseUrl: url,
            sql: `BEGIN;\nSET LOCAL ROLE ${target.username};\n${request.sql}\nCOMMIT;`,
          });
        };
        let seedEnabled = open;
        let ranPayload = false;
        const swept: string[] = [];
        const runCommand = (
          command: string,
          args: string[],
          options: Parameters<typeof spawnSync>[2] & { input?: string },
        ) => {
          if (command === "supabase" && args[0] === "--version")
            return { status: 0, stdout: pinnedSupabaseCliVersion() };
          if (
            command === "bun" &&
            args[0] === "scripts/cms/sweep-site-presentations.mjs"
          ) {
            const sites = JSON.parse(options?.input ?? "[]") as Array<{
              id: string;
              tenantId: string;
            }>;
            for (const site of sites) {
              psql(
                url,
                `INSERT INTO cms.site_presentations (id, tenant) VALUES ('${site.id}', '${site.tenantId}')`,
              );
              swept.push(site.id);
            }
            return { status: 0 };
          }
          if (
            command === "supabase" &&
            args[0] === "db" &&
            args[1] === "reset"
          ) {
            psql(url, HOSTED_RESET_SQL);
            applyChain(url);
            installLedger(url);
            if (seedEnabled)
              psql(url, readFileSync("supabase/seed.sql", "utf8"));
            return { status: 0 };
          }
          expect(command).toBe("bun");
          ranPayload = true;
          return spawnSync(command, args, {
            ...options,
            env: {
              ...options?.env,
              PAYLOAD_MIGRATION_DATABASE_URI: "",
              PAYLOAD_DATABASE_URI: url,
              PAYLOAD_SECRET: "local-recovery-test",
              NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture",
            },
          });
        };
        const retry = () =>
          rebuild({
            settings,
            env,
            mode: "first",
            signoff: "https://github.com/Asymmetric-al/core/issues/2671",
            confirmation: `rebuild ${settings.projectRef}`,
            query: queryWithLocalRole,
            runCommand,
            log: silent,
          });
        if (!seedEnabled) {
          await expect(retry()).rejects.toThrow(/seed.*before Payload/i);
          expect(ranPayload).toBe(false);
          seedEnabled = true;
        }
        await retry();
        const e = readSeedExpectations();
        expect(fixtures(url)).toBe(
          `${e["public.profiles"]}|${e["public.tenants"]}|${e["authz.memberships"]}`,
        );
        expect(swept.length).toBeGreaterThan(0);
        expect(
          psql(
            url,
            "SELECT count(*) FROM public.sites AS s LEFT JOIN cms.site_presentations AS p ON p.id = s.id AND p.tenant = s.tenant_id::text WHERE p.id IS NULL",
          ),
        ).toBe("0");
        expect(() => preflight({ settings, log: silent })).toThrow(
          /no recorded head.*first-rebuild/s,
        );
        if (open) {
          psql(url, "CREATE TABLE public.leftover_for_gate(id integer)");
          expect(() =>
            gates({ settings, replayFingerprintFile: expected, log: silent }),
          ).toThrow(/Catalog gates failed/);
          psql(url, "DROP TABLE public.leftover_for_gate");
          await retry();
        }
        gates({ settings, replayFingerprintFile: expected, log: console.log });
        recordHeads({ settings, log: silent });
        expect(readReleaseHealth({ databaseUrl: url })?.heads).toEqual({
          supabase: source.supabase.at(-1),
          payload: source.payload.at(-1),
        });
        expect(() => preflight({ settings, log: silent })).not.toThrow();
        await expect(retry()).rejects.toThrow(/recorded head/i);
      },
    );
  },
);

/** Every default privilege postgres holds, in one schema or in all of them. */
const POSTGRES_DEFAULTS_SQL = `SELECT coalesce(string_agg(entry, ';' ORDER BY entry), '') FROM (
  SELECT CASE WHEN defaclnamespace = 0 THEN '*' ELSE defaclnamespace::regnamespace::text END
         || '/' || defaclobjtype::text || '=' || defaclacl::text AS entry
  FROM pg_default_acl WHERE defaclrole = 'postgres'::regrole) AS entries;`;
