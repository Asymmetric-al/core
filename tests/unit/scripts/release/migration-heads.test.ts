import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  checkMigrationOrder,
  listSourceMigrations,
  migrationHeadsBuildEnv,
  readSourceMigrationHeads,
} from "../../../../scripts/release/migration-heads.mjs";

const roots: string[] = [];

function fixture(files: { supabase?: string[]; payload?: string[] }) {
  const root = mkdtempSync(path.join(tmpdir(), "release-heads-"));
  roots.push(root);
  const sql = path.join(root, "supabase", "migrations");
  const cms = path.join(root, "apps", "admin", "src", "migrations");
  mkdirSync(sql, { recursive: true });
  mkdirSync(cms, { recursive: true });
  for (const name of files.supabase ?? [])
    writeFileSync(path.join(sql, name), "");
  for (const name of files.payload ?? [])
    writeFileSync(path.join(cms, name), "");
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("source migration heads", () => {
  it("lists forward migrations only, in order, and ignores rollback and sidecar files", () => {
    const root = fixture({
      supabase: [
        "20260301000000_b.sql",
        "20260214090000_a.sql",
        "rollback_20260301000000_b.sql",
        "README.md",
      ],
      payload: [
        "20261022_002409_second.ts",
        "20260515_173042_first.ts",
        "20260515_173042_first.json",
        "index.ts",
      ],
    });
    expect(listSourceMigrations({ root })).toEqual({
      supabase: ["20260214090000", "20260301000000"],
      payload: ["20260515_173042_first", "20261022_002409_second"],
    });
    expect(readSourceMigrationHeads({ root })).toEqual({
      supabase: "20260301000000",
      payload: "20261022_002409_second",
    });
  });

  it("refuses two migrations with the same version", () => {
    const root = fixture({
      supabase: ["20260214090000_a.sql", "20260214090000_b.sql"],
    });
    expect(() => listSourceMigrations({ root })).toThrow(/duplicate/i);
  });

  it("reads the repository's real heads and exposes them as one build variable", () => {
    const heads = readSourceMigrationHeads({ root: process.cwd() });
    expect(heads.supabase).toMatch(/^\d{14}$/);
    expect(heads.payload).toMatch(/^\d{8}_\d{6}_[a-z0-9_]+$/);
    expect(migrationHeadsBuildEnv(process.cwd())).toEqual({
      CORE_BUILD_MIGRATION_HEADS: JSON.stringify(heads),
    });
  });
});

describe("migration order check", () => {
  const source = ["20260101000000", "20260201000000", "20260301000000"];

  it("passes when every pending migration follows the database head", () => {
    const result = checkMigrationOrder({
      ledger: "supabase",
      source,
      applied: ["20260101000000"],
    });
    expect(result.ok).toBe(true);
    expect(result.pending).toEqual(["20260201000000", "20260301000000"]);
  });

  it("stops a release that carries a migration older than the database head", () => {
    const result = checkMigrationOrder({
      ledger: "supabase",
      source: [...source, "20260115000000"].sort(),
      applied: ["20260101000000", "20260201000000"],
    });
    expect(result.ok).toBe(false);
    expect(result.outOfOrder).toEqual(["20260115000000"]);
    expect(result.reason).toMatch(/out of order/);
  });

  it("stops when the database holds a migration the source interleaves but does not have", () => {
    const result = checkMigrationOrder({
      ledger: "supabase",
      source,
      applied: ["20260101000000", "20260115000000", "20260201000000"],
    });
    expect(result.ok).toBe(false);
    expect(result.unknown).toEqual(["20260115000000"]);
  });

  it("passes a database that is ahead of the source with newer migrations only", () => {
    const result = checkMigrationOrder({
      ledger: "supabase",
      source,
      applied: [...source, "20260401000000"],
    });
    expect(result).toMatchObject({
      ok: true,
      pending: [],
      ahead: ["20260401000000"],
    });
  });

  it("passes an empty database and an up-to-date one", () => {
    expect(
      checkMigrationOrder({ ledger: "payload", source, applied: [] }).ok,
    ).toBe(true);
    expect(
      checkMigrationOrder({ ledger: "payload", source, applied: source }),
    ).toMatchObject({ ok: true, pending: [] });
  });
});
