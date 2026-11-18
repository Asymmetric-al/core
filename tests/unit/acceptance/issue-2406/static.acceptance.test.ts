/** #2406 spec r2 static contract (no database): criterion 1 (version, rollback
 * header), 9 (migration text: GRANT-free, single REVOKE target, policy names,
 * string_to_array, (SELECT auth.uid())), 10 (rollback text), §2.3 bootstrap
 * columns, 19/20 (Builder tests present), 21 (doc), 22 (CI step), 23
 * (append-only init, service-role gate), and text mutants M6, M10, M14-M16 (each with a self-check that the
 * predicate rejects a synthetic mutant). Runtime mutants are mapped in the
 * real-stack and route files.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import { DEMO_TENANT_ID } from "../../../../packages/auth/constants";
import { expectRealstackStep } from "../shared/realstack-step";

const fwd = () => H.code(H.read(H.FORWARD));
const back = () => H.code(H.read(H.ROLLBACK));
const statements = (sql: string, re: RegExp) =>
  sql
    .split(";")
    .map(H.squash)
    .filter((s) => re.test(s));
const STEP = "Verify tenant isolation (real stack)";

/** M16 predicate: one REVOKE ALL on the backup table naming all four roles. */
const revokesBackup = (sql: string) => {
  const revokes = statements(sql, /^REVOKE\b/i);
  return (
    revokes.length > 0 &&
    revokes.every((s) =>
      new RegExp(
        `\\bON\\s+(?:TABLE\\s+)?${H.BACKUP.replace(".", "\\.")}\\s+FROM\\b`,
        "i",
      ).test(s),
    ) &&
    revokes.some((s) => {
      const roles = s
        .split(/\bFROM\b/i)[1]!
        .toLowerCase()
        .split(",")
        .map((r) => r.trim());
      return (
        /^REVOKE\s+ALL\b/i.test(s) &&
        ["public", "anon", "authenticated", "service_role"].every((r) =>
          roles.includes(r),
        )
      );
    })
  );
};
/** M6 predicate: the profiles UPDATE sets exactly 5242880 and the four types. */
const setsLimits = (sql: string) => {
  const [u] = statements(sql, /^UPDATE\s+storage\.buckets\b/i);
  if (
    !u ||
    !/WHERE\s+id\s*=\s*'profiles'\s*$/i.test(u) ||
    /\bpublic\s*=/i.test(u)
  )
    return false;
  const size =
    u.match(/file_size_limit\s*=\s*(\d+(?:\s*\*\s*\d+)*)/i)?.[1] ?? "";
  // Addendum 1: every ARRAY entry must be one of the four quoted image types;
  // any other entry of any kind (e.g. 'application/pdf') fails the predicate.
  const entries = (
    u.match(/allowed_mime_types\s*=\s*ARRAY\s*\[([^\]]*)\]/i)?.[1] ?? ""
  )
    .split(",")
    .map((e) => e.trim().match(/^'(image\/[a-z+.-]+)'$/)?.[1] ?? "<other>");
  return (
    size.split("*").reduce((n, f) => n * Number(f), 1) === H.LIMIT &&
    [...new Set(entries)].sort().join() === H.TYPES.join() &&
    entries.length === 4
  );
};
/** M15 predicate: the record INSERT keeps the first row on re-apply. */
const recordsFirst = (sql: string) => {
  const [ins] = statements(
    sql,
    new RegExp(`^INSERT\\s+INTO\\s+${H.BACKUP.replace(".", "\\.")}\\b`, "i"),
  );
  return Boolean(
    ins &&
    /FROM\s+storage\.buckets/i.test(ins) &&
    /ON\s+CONFLICT[^;]*DO\s+NOTHING/i.test(ins) &&
    !/DO\s+UPDATE/i.test(ins),
  );
};
/** M10 predicate: rollback restores from the backup and never NULLs the limits.
 * Addendum 1: an UPDATE storage.buckets must read both limit columns from the
 * backup table (alias form `col = r.col ... FROM backup AS r`). */
const restoresRecorded = (sql: string) =>
  new RegExp(`\\b${H.BACKUP.replace(".", "\\.")}\\b`).test(sql) &&
  statements(sql, /^UPDATE\s+storage\.buckets\b/i).some((u) => {
    const r = u.match(
      new RegExp(
        `FROM\\s+${H.BACKUP.replace(".", "\\.")}\\s+(?:AS\\s+)?(\\w+)\\b`,
        "i",
      ),
    )?.[1];
    return (
      !!r &&
      ["file_size_limit", "allowed_mime_types"].every((c) =>
        new RegExp(`\\b${c}\\s*=\\s*${r}\\.${c}\\b`, "i").test(u),
      )
    );
  }) &&
  /RAISE\s+EXCEPTION/i.test(sql) &&
  !/(file_size_limit|allowed_mime_types)\s*=\s*NULL\b/i.test(sql) &&
  new RegExp(
    `DROP\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?${H.BACKUP.replace(".", "\\.")}`,
    "i",
  ).test(sql);
/** The three original CREATE POLICY statements, verbatim from init_schema. */
const originals = () =>
  H.OLD_POLICIES.map(
    (name) =>
      statements(
        H.code(H.read(H.INIT)),
        new RegExp(`^CREATE POLICY "${name}"`),
      )[0]!,
  );

describe("#2406 static contract", () => {
  it("#2406 criterion 1: forward migration exists, header names the rollback, rollback exists", () => {
    expect(H.read(H.FORWARD), H.FORWARD).not.toBe("");
    expect(H.read(H.ROLLBACK), H.ROLLBACK).not.toBe("");
    const header = H.read(H.FORWARD)
      .split("\n")
      .filter((l) => l.startsWith("--"))
      .join("\n");
    expect(header).toContain(`rollback_${H.NAME}`);
    expect(H.VERSION > "20261026171000", "above every §10 reservation").toBe(
      true,
    );
  });
  it("#2406 criterion 1: no other forward migration shares the version", () => {
    const local = readdirSync(H.MIG).filter(
      (f) => /^\d{14}_/.test(f) && f.slice(0, 14) === H.VERSION,
    );
    expect(local).toEqual([H.NAME]);
  });
  it("#2406 criterion 9 / §2.1: migration text is GRANT-free and its only REVOKE targets the backup table (M16)", () => {
    expect(fwd(), H.FORWARD).not.toBe("");
    expect(statements(fwd(), /\bGRANT\b/i)).toEqual([]);
    expect(revokesBackup(fwd())).toBe(true);
    expect(
      revokesBackup(
        `REVOKE ALL ON ${H.BACKUP} FROM PUBLIC, anon, service_role;`,
      ),
    ).toBe(false);
    expect(
      revokesBackup(
        `REVOKE ALL ON ${H.BACKUP} FROM PUBLIC, anon, authenticated, service_role; REVOKE ALL ON storage.objects FROM anon;`,
      ),
    ).toBe(false);
  });
  it("#2406 criterion 9 / §2.1: backup table shape, prior limits recorded first-wins before the bucket update (M15)", () => {
    const sql = fwd();
    const [table] = statements(
      sql,
      new RegExp(
        `^CREATE TABLE (IF NOT EXISTS )?${H.BACKUP.replace(".", "\\.")}`,
        "i",
      ),
    );
    expect(table, "CREATE TABLE backup").toBeDefined();
    for (const col of [
      /bucket_id\s+TEXT\s+PRIMARY\s+KEY/i,
      /file_size_limit\s+BIGINT/i,
      /allowed_mime_types\s+TEXT\s*\[\]/i,
      /recorded_at\s+TIMESTAMPTZ\s+NOT\s+NULL\s+DEFAULT\s+now\(\)/i,
    ])
      expect(table).toMatch(col);
    expect(recordsFirst(sql)).toBe(true);
    expect(
      recordsFirst(
        sql.replace(
          /DO\s+NOTHING/gi,
          "DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit",
        ),
      ),
    ).toBe(false);
    expect(
      sql.search(
        new RegExp(`INSERT\\s+INTO\\s+${H.BACKUP.replace(".", "\\.")}`, "i"),
      ),
    ).toBeLessThan(sql.search(/UPDATE\s+storage\.buckets/i));
  });
  it("#2406 criterion 2 / §1.4 text: limits are exactly 5242880 and the four image types, public untouched (M6)", () => {
    expect(setsLimits(fwd())).toBe(true);
    const ok = `UPDATE storage.buckets SET file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'] WHERE id = 'profiles';`;
    expect(setsLimits(ok)).toBe(true);
    expect(setsLimits(ok.replace("5242880", "10485760"))).toBe(false);
    expect(
      setsLimits(ok.replace("'image/gif'", "'image/gif','image/svg+xml'")),
    ).toBe(false);
    // Addendum 1: a non-image entry of any kind must fail, not be ignored.
    expect(
      setsLimits(ok.replace("'image/gif'", "'image/gif','application/pdf'")),
    ).toBe(false);
  });
  it("#2406 criterion 9 / §2.1: drops the three originals, creates the three named policies TO authenticated, leaves delete alone (M14)", () => {
    const sql = fwd();
    for (const name of H.OLD_POLICIES)
      expect(sql).toMatch(
        new RegExp(
          `DROP POLICY (IF EXISTS )?"${name}" ON storage\\.objects`,
          "i",
        ),
      );
    expect(statements(sql, /^CREATE POLICY "Public read profiles"/i)).toEqual(
      [],
    );
    for (const [name, cmd] of [
      [H.NEW_POLICIES[0], "INSERT"],
      [H.NEW_POLICIES[1], "UPDATE"],
      [H.NEW_POLICIES[2], "SELECT"],
    ] as const) {
      const [s] = statements(sql, new RegExp(`^CREATE POLICY "${name}"`, "i"));
      expect(s, name).toMatch(
        new RegExp(
          `ON storage\\.objects (AS PERMISSIVE )?FOR ${cmd} TO authenticated\\b`,
          "i",
        ),
      );
      expect(s).toContain("'profiles'");
    }
    const [select] = statements(sql, /^CREATE POLICY "profiles owner select"/i);
    expect(select).toMatch(
      /owner\s*=\s*\(\s*SELECT\s+auth\.uid\(\)\s*\)|\(\s*SELECT\s+auth\.uid\(\)\s*\)\s*=\s*owner/i,
    );
    expect(sql).not.toContain(H.DELETE_POLICY);
  });
  it("#2406 §2.1: folder check uses string_to_array(name, '/'), never storage.foldername; auth.uid() only as (SELECT auth.uid())", () => {
    const sql = fwd();
    expect(sql).toMatch(/string_to_array\(\s*name\s*,\s*'\/'\s*\)/i);
    expect(sql).not.toMatch(/storage\.foldername/i);
    expect(sql).toMatch(/\(\s*SELECT\s+auth\.uid\(\)\s*\)/i);
    expect(sql.replace(/\(\s*SELECT\s+auth\.uid\(\)\s*\)/gi, "")).not.toMatch(
      /auth\.uid\(\)/i,
    );
    expect(sql).toMatch(/\bprivate\b/);
    expect(sql).toMatch(/CREATE SCHEMA IF NOT EXISTS private/i);
  });
  it("#2406 criterion 10 / §2.2: rollback drops the new policies, recreates the originals verbatim, restores recorded limits or raises (M10)", () => {
    const sql = back();
    expect(sql, H.ROLLBACK).not.toBe("");
    for (const name of H.NEW_POLICIES)
      expect(sql).toMatch(
        new RegExp(
          `DROP POLICY (IF EXISTS )?"${name}" ON storage\\.objects`,
          "i",
        ),
      );
    const recreated = statements(sql, /^CREATE POLICY "/i);
    for (const original of originals()) expect(recreated).toContain(original);
    expect(sql).not.toContain(H.DELETE_POLICY);
    expect(restoresRecorded(sql)).toBe(true);
    expect(
      restoresRecorded(
        `${sql}\nUPDATE storage.buckets SET file_size_limit = NULL WHERE id = 'profiles';`,
      ),
    ).toBe(false);
    // Addendum 1: without the restoring UPDATE the rollback must fail the predicate.
    expect(sql).toMatch(/UPDATE\s+storage\.buckets\b/i);
    expect(
      restoresRecorded(sql.replace(/UPDATE\s+storage\.buckets\b[^;]*;/i, "")),
    ).toBe(false);
    expect(statements(sql, /\bGRANT\b/i)).toEqual([]);
  });
  it("#2406 §2.3: compat bootstrap storage.buckets has file_size_limit BIGINT and allowed_mime_types TEXT[] (CREATE and ADD COLUMN)", () => {
    const sql = H.code(H.read(H.BOOTSTRAP));
    const [create] = statements(
      sql,
      /^CREATE TABLE IF NOT EXISTS storage\.buckets\b/i,
    );
    expect(create).toMatch(/file_size_limit BIGINT/i);
    expect(create).toMatch(/allowed_mime_types TEXT\[\]/i);
    for (const col of [
      "file_size_limit BIGINT",
      "allowed_mime_types TEXT\\[\\]",
    ])
      expect(sql).toMatch(
        new RegExp(
          `ALTER TABLE (IF EXISTS )?storage\\.buckets[^;]*ADD COLUMN IF NOT EXISTS ${col}`,
          "i",
        ),
      );
  });
  it("#2406 criteria 19/20: Builder's validator and handler unit tests exist", () => {
    expect(existsSync("packages/api/src/profile/image-url.ts")).toBe(true);
    expect(
      existsSync("tests/unit/packages/api/profile/image-url.test.ts"),
    ).toBe(true);
    for (const dir of ["profile", "donor-portal"]) {
      const at = `tests/unit/packages/api/${dir}`;
      const tests = readdirSync(at)
        .filter((f) => f !== "image-url.test.ts")
        .map((f) => H.read(`${at}/${f}`));
      expect(
        tests.some((t) => /avatarUrl/.test(t) && /\b400\b/.test(t)),
        `${at} handler test`,
      ).toBe(true);
    }
  });
  it("#2406 criterion 21: contract doc has the four policies, both limits, the backup table, key layout, URL rule and the three sections", () => {
    const doc = H.read(H.DOC);
    expect(doc, H.DOC).not.toBe("");
    for (const term of [
      ...H.NEW_POLICIES,
      H.DELETE_POLICY,
      String(H.LIMIT),
      ...H.TYPES,
      H.BACKUP,
      "/storage/v1/object/public/profiles/",
    ])
      expect(doc).toContain(term);
    expect(doc).toMatch(
      /\{?(avatars\|covers|purpose)\}?\/\{tenantId\}\/\{(userId|uid)\}\//,
    );
    for (const heading of [
      /^#+ .*pre-deploy/im,
      /^#+ (?!.*pre-deploy).*deploy/im,
      /^#+ .*rollback/im,
    ])
      expect(doc).toMatch(heading);
  });
  it("#2406 criterion 22: the tenant isolation migrate step runs the #2406 real-stack file", () => {
    expect(existsSync(H.REALSTACK)).toBe(true);
    expectRealstackStep(STEP, [H.REALSTACK], {
      TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}",
    });
  });
  it("#2406 criterion 23: init_schema stays byte-identical to 2b028084", () => {
    const hash = createHash("sha256")
      .update(readFileSync(H.INIT))
      .digest("hex");
    expect(hash).toBe(
      "c5cc1775d6914b613730822d920f4ec3ba189cdb5e2f98fadb8981238e76635a",
    );
  });
  it("#2406 criterion 23: bun run verify:service-role-clients passes", () => {
    const r = spawnSync(
      "node",
      ["scripts/verify/service-role-client-gate.mjs"],
      { encoding: "utf8", timeout: 120_000 },
    );
    expect(r.status, `${r.stdout}\n${r.stderr}`.slice(-2000)).toBe(0);
  });
  it("#2406 harness: DEMO matches packages/auth/constants DEMO_TENANT_ID", () => {
    expect(H.DEMO).toBe(DEMO_TENANT_ID);
  });
});
