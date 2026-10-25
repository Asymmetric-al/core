import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(
    new URL(`../../../supabase/migrations/${name}`, import.meta.url),
    "utf8",
  );
const migrationSql = read("20261025040000_donations_composite_donor_fk.sql");
const rollbackSql = read(
  "rollback_20261025040000_donations_composite_donor_fk.sql",
);
/** Executable SQL only, whitespace-normalized. */
const executable = (sql: string) =>
  sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const between = (sql: string, from: string, to: string) =>
  sql.slice(sql.indexOf(from), sql.indexOf(to));

describe("donations composite donor FK migration (#2252)", () => {
  const forward = executable(migrationSql);

  it("swaps the FK in one transaction, failing fast on a busy table", () => {
    expect(forward).toMatch(/^BEGIN; SET LOCAL lock_timeout = '5s';/);
    expect(forward).toMatch(/COMMIT;$/);
    const swap = between(
      forward,
      "ADD CONSTRAINT donations_donor_same_tenant_fk",
      "COMMIT;",
    );
    expect(swap).toContain(
      "FOREIGN KEY (tenant_id, donor_id) REFERENCES public.donors (tenant_id, id) NOT VALID",
    );
    expect(swap).toContain(
      "VALIDATE CONSTRAINT donations_donor_same_tenant_fk",
    );
    expect(swap).toContain("DROP CONSTRAINT IF EXISTS donations_donor_id_fkey");
  });

  it("closes the MATCH SIMPLE NULL-tenant gap with a CHECK", () => {
    expect(forward).toContain(
      "ADD CONSTRAINT donations_donor_requires_tenant CHECK (donor_id IS NULL OR tenant_id IS NOT NULL) NOT VALID",
    );
    expect(forward).not.toMatch(/MATCH FULL/i);
  });

  it("preflight counts both kinds of bad rows and reports counts only", () => {
    const preflight = between(forward, "DO $$", "ALTER TABLE");
    expect(preflight).toContain(
      "WHERE d.tenant_id IS NOT NULL AND dn.tenant_id IS DISTINCT FROM d.tenant_id",
    );
    expect(preflight).toContain(
      "WHERE d.donor_id IS NOT NULL AND d.tenant_id IS NULL",
    );
    const raise = between(preflight, "RAISE EXCEPTION", "END IF");
    expect(raise).toContain("cross_tenant_rows, null_tenant_rows");
    expect(raise).not.toMatch(/\bd\.|\bdn\.|DETAIL|HINT/);
  });

  it("rolls back in one transaction, re-adding the old FK before dropping the new pair", () => {
    const rollback = executable(rollbackSql);
    expect(rollback).toMatch(/^BEGIN; SET LOCAL lock_timeout = '5s';/);
    expect(rollback).toMatch(/COMMIT;$/);
    const revalidated = rollback.indexOf(
      "VALIDATE CONSTRAINT donations_donor_id_fkey",
    );
    expect(revalidated).toBeGreaterThan(0);
    for (const name of [
      "donations_donor_same_tenant_fk",
      "donations_donor_requires_tenant",
    ])
      expect(
        rollback.indexOf(`DROP CONSTRAINT IF EXISTS ${name}`),
        name,
      ).toBeGreaterThan(revalidated);
    expect(rollbackSql).toMatch(/^-- Rollback for 20261025040000_/);
  });

  it("documents the Down path, the deploy preflight and the lock window", () => {
    const header = migrationSql.split(/^BEGIN;$/m)[0]!;
    expect(header).toMatch(/^-- Down: .*rollback_20261025040000_/m);
    expect(header).toMatch(/quiet window/);
    expect(header).toMatch(/counts only/);
  });
});
