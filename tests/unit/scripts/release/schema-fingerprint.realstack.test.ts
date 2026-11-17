// Two fresh replays of the migration chain must fingerprint identically, and
// a difference planted in one must be reported (WP1 acceptance: "Schema
// fingerprint equality between CI's replay and development"). Needs
// RELEASE_IT_ADMIN_DATABASE_URL; see support/test-database.ts.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCatalogGates } from "../../../../scripts/release/catalog-gates.mjs";
import {
  captureFingerprint,
  diffFingerprints,
  formatFingerprintDiff,
} from "../../../../scripts/release/schema-fingerprint.mjs";
import {
  adminDatabaseUrl,
  createDatabase,
  dropDatabase,
  psql,
} from "./support/test-database";

const created: string[] = [];
let first = "";
let second = "";
const scratch = mkdtempSync(path.join(tmpdir(), "release-fingerprint-"));

function replay(label: string) {
  const db = createDatabase(label);
  created.push(db.name);
  const result = spawnSync(
    process.execPath,
    ["scripts/verify/supabase-migrations.mjs"],
    {
      encoding: "utf8",
      shell: false,
      env: { ...process.env, DATABASE_URL: db.url },
    },
  );
  if (result.status !== 0) {
    throw new Error(`replay failed: ${result.stderr.slice(-2000)}`);
  }
  return db.url;
}

afterAll(() => {
  for (const name of created) dropDatabase(name);
  rmSync(scratch, { recursive: true, force: true });
});

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
       CREATE POLICY fingerprint_planted ON public.tenants FOR SELECT TO anon USING (true);`,
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
