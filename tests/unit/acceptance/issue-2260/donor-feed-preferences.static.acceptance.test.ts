/**
 * #2260 acceptance, no database. Spec r2 (comment 6386169035, edited in place
 * with addendum 6407195511): criteria 17-20, plus opt-in criterion 17 (base
 * version) and 27 (diff scope): set ACCEPTANCE_2260_SCOPE=1 (base: git
 * merge-base origin/develop HEAD) or ACCEPTANCE_2260_BASE=<ref> (#2183 pattern).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import { D, S } from "../issue-2251/harness";

const sha256 = (b: string | Buffer) =>
  createHash("sha256").update(b).digest("hex");
const ver = (f: string) => f.slice(0, 14);
const forward = (fs: string[]) => fs.filter((f) => /^\d{14}_.+\.sql$/.test(f));
const sql = () => {
  expect(existsSync(H.MIGRATION), `${H.MIGRATION} must exist`).toBe(true);
  return H.code(H.read(H.MIGRATION));
};
/** sha256 of the 85 other exceptions entry lines at develop 0727d810, trimmed, "\n"-joined. */
const OTHERS_SHA =
  "9b004012247680c8b1bb83b2f3838752251789e71ea5b2cdb4e2c9d682d4e151";
/** docs/ci.md develop byte prefix (#2250's CI_BASES). */
const CI_BASE = {
  bytes: 40058,
  sha256: "f636ef0f0127f1159db711fb005a212aaf0cb3c9ceb9fe64bb308305c55d4e4b",
};
/** Criterion 20 doc rules, " ~ "-separated regexes. */
const DOC_RULES = String.raw`anon ~ authenticated ~ service_role ~ SELECT, INSERT, UPDATE ~ auth\.uid\(\) ~ authz\.current_tenant_id\(\) ~ cross[- ]tenant ~ default (privileges|grants) ~ DELETE ~ #2251 ~ #668 ~ Down`;

describe("#2260 static (17-20)", () => {
  it(`17: ${H.MIGRATION_NAME} is the only *_donor_feed_preferences_own_rows.sql, version unique and > ${H.DEVELOP_LATEST}`, () => {
    sql();
    const all = forward(readdirSync(H.MIG));
    expect(
      all.filter((f) =>
        /^\d{14}_donor_feed_preferences_own_rows\.sql$/.test(f),
      ),
    ).toEqual([H.MIGRATION_NAME]);
    expect(ver(H.MIGRATION_NAME) > H.DEVELOP_LATEST).toBe(true);
    expect(all.filter((f) => ver(f) === ver(H.MIGRATION_NAME))).toHaveLength(1);
  });
  it("17: -- Down: header, REVOKE ALL, #2251 precondition; no current_tenant_id, publication or DELETE grant", () => {
    sql();
    expect(H.read(H.MIGRATION)).toMatch(/^-- Down:/);
    const body = sql();
    expect(body).toMatch(
      /REVOKE\s+ALL\s+ON\s+(TABLE\s+)?public\.donor_feed_preferences\s+FROM\s+PUBLIC\s*,\s*anon\s*,\s*authenticated\s*;/i,
    );
    expect(body).toMatch(/relforcerowsecurity/i);
    expect(body).toMatch(/RAISE[\s\S]*#2251/i);
    expect(body).not.toMatch(
      /FUNCTION\s+authz\.current_tenant_id\s*\(|ALTER\s+PUBLICATION/i,
    );
    for (const g of body.match(/\bGRANT\b[^;]*;/gi) ?? [])
      expect(g).not.toMatch(/\b(DELETE|ALL|TRUNCATE)\b/i);
  });
  it("18: exceptions JSON drops only donor_feed_preferences: 85 entries (67 S + 18 D), others byte-identical, sorted", () => {
    const raw = H.read(H.EXCEPTIONS);
    const e = (
      JSON.parse(raw) as { entries: { table: string; outcome: string }[] }
    ).entries;
    const n = (o: string) => e.filter((x) => x.outcome === o).length;
    expect([e.length, n("service_role_needed"), n("deny_by_default")]).toEqual([
      85, 67, 18,
    ]);
    const lines = raw
      .split("\n")
      .filter((l) => l.includes('"table"'))
      .map((l) => l.trim().replace(/,$/, ""));
    const tables = lines.map((l) => (JSON.parse(l) as { table: string }).table);
    expect(tables).not.toContain(H.TABLE);
    expect(tables).toEqual([...Object.keys(S), ...D].sort());
    expect(sha256(lines.join("\n")), "other entries changed").toBe(OTHERS_SHA);
  });
  it(`19: ${H.ROUTE}: no default/literal tenant, email lookup or admin client; tenant from app_metadata`, () => {
    const src = H.read(H.ROUTE);
    expect(src).toMatch(/app_metadata\W{1,6}tenant_id/);
    expect(src).not.toMatch(
      /DEFAULT_TENANT_ID|00000000-0000-0000-0000-000000000001|\.eq\(\s*["'`]email["'`]|\b(get|create)AdminClient\s*\(/,
    );
    const imports = src.match(/^import\b[^;]*;/gm) ?? [];
    expect(imports.filter((i) => /admin|service[-_]?role/i.test(i))).toEqual(
      [],
    );
    if (!existsSync(H.ALLOWLIST)) return;
    const a = (
      JSON.parse(H.read(H.ALLOWLIST)) as { entries: { file: string }[] }
    ).entries;
    expect(a.length, "117 entries at develop 0727d810").toBeLessThanOrEqual(
      117,
    );
    expect(a.map((x) => x.file)).not.toContain(H.ROUTE);
  });
  it.each(DOC_RULES.split(" ~ "))(`20: ${H.DOC} matches /%s/i`, (re) =>
    expect(H.read(H.DOC)).toMatch(new RegExp(re, "i")),
  );
  it("20: docs/ci.md keeps develop's bytes as a prefix; nothing #2260 after it", () => {
    const bytes = readFileSync("docs/ci.md");
    expect(sha256(bytes.subarray(0, CI_BASE.bytes)), "docs/ci.md prefix").toBe(
      CI_BASE.sha256,
    );
    expect(bytes.subarray(CI_BASE.bytes).toString("utf8")).not.toMatch(
      /2260|donor_feed_preferences/i,
    );
  });
});

const BASE = process.env.ACCEPTANCE_2260_BASE?.trim() ?? "";
const ON = process.env.ACCEPTANCE_2260_SCOPE?.trim() === "1" || BASE !== "";
const git = (...args: string[]) => {
  const r = spawnSync("git", args, { encoding: "utf8" });
  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
  return r.stdout.trim();
};
/** §6 paths (Builder + Acceptance) plus the #2155/#2201 fingerprint appends the workflow edit forces. */
const DECLARED = [
  H.MIGRATION,
  H.ROUTE,
  H.EXCEPTIONS,
  H.DOC,
  ".github/workflows/ci-integration.yml",
].concat(
  `helpers/workflow-yaml.ts packages/api/feed-preferences.test.ts acceptance/issue-2250/static.acceptance.test.ts
  acceptance/issue-2251/harness.ts acceptance/issue-2251/rls-posture.realstack.acceptance.test.ts
  acceptance/issue-2251/static.acceptance.test.ts acceptance/issue-2253/rls-catalog-gate.realstack.acceptance.test.ts
  scripts/rls-deny-by-default-exceptions.test.ts scripts/supabase-migrations.test.ts
  acceptance/issue-2155/postgres-ecr-gates.acceptance.test.ts acceptance/issue-2201/merge-group.acceptance.test.ts`
    .split(/\s+/)
    .map((p) => `tests/unit/${p}`),
);

describe.skipIf(!ON)(
  "#2260 opt-in (PR base; ACCEPTANCE_2260_SCOPE=1 or ACCEPTANCE_2260_BASE)",
  () => {
    const base = () => BASE || git("merge-base", "origin/develop", "HEAD");
    it("17: the version is greater than every migration on the PR base", () => {
      const onBase = forward(
        git("ls-tree", "--name-only", `${base()}:${H.MIG}`).split("\n"),
      );
      expect(
        onBase.filter((f) => ver(f) >= ver(H.MIGRATION_NAME)),
        `base ${base()}`,
      ).toEqual([]);
    });
    it("27: the PR diff touches only §6 paths and tests/unit/acceptance/issue-2260/", () => {
      const changed = [
        ...git("diff", "--name-only", "--no-renames", base()).split("\n"),
        ...git("ls-files", "--others", "--exclude-standard").split("\n"),
      ].filter(Boolean);
      const outside = changed.filter(
        (f) =>
          !DECLARED.includes(f) &&
          !f.startsWith("tests/unit/acceptance/issue-2260/"),
      );
      expect(outside, `diff against ${base()}`).toEqual([]);
      expect(changed).toContain(H.REALSTACK);
    });
  },
);
