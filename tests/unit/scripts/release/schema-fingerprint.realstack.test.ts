// Two fresh replays of the migration chain must fingerprint identically, and
// a difference planted in one must be reported (WP1 acceptance: "Schema
// fingerprint equality between CI's replay and development"). Needs
// RELEASE_IT_ADMIN_DATABASE_URL; see support/test-database.ts.
import { spawnSync } from "node:child_process";
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
  readReleaseSettings,
  restoreHostedDefaultPrivileges,
} from "../../../../scripts/release/release-database.mjs";
import {
  captureFingerprint,
  diffFingerprints,
  formatFingerprintDiff,
} from "../../../../scripts/release/schema-fingerprint.mjs";
import { Replay } from "../../acceptance/issue-2674/privileges-harness";

const created: string[] = [];
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

    it("passes the catalog gates on a fresh replay, and fails a new cross-schema name collision", () => {
      // Payload's migrations create cms.tenants, the one recorded exception;
      // this replay ran the Supabase chain only, so stand in for it.
      psql(first, "CREATE TABLE cms.tenants (id integer);");
      const clean = runCatalogGates({ databaseUrl: first });
      expect(clean.report).toContain("PASS: name-collision gate");
      expect(clean.ok).toBe(true);
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
// platform does, stands in for the platform here; the Local Supabase Stack
// workflow compares the same replay with Supabase's own image.
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
      platform = await new Replay(harnessAdminUrl, true).build();
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

// What the pinned Supabase CLI's `db reset` does to a hosted database (its
// drop script, pkg/migration/queries/drop.sql): it drops the extensions and
// schemas the chain made and every object in `public`, but not `public`
// itself, so the default privileges held there survive. The platform's own
// schemas survive too; here the compatibility bootstrap makes them again, as
// it does for a fresh replay.
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
  },
);
