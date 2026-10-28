/** #2407 PR (a) static contract [A] (no database): criteria 1, 10 (text), 11
 * (text), 16, 17/18 (Builder files present), 19, 20, 22, §6 declared edits,
 * OQ17 bootstrap columns, and text mutants M6, M7, M18, M19 (each with a
 * self-check that the predicate rejects a synthetic mutant). Runtime mutants
 * are mapped in the real-stack, route and component files.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import { DEMO_TENANT_ID } from "../../../../packages/auth/constants";
import {
  loadWorkflowDocument,
  PINNED_STEP_BODIES,
  workflowJobs,
} from "../../helpers/workflow-yaml";

const fwd = () => H.code(H.read(H.FORWARD));
const back = () => H.code(H.read(H.ROLLBACK));
const re = (s: string) => new RegExp(s, "i");
const statements = (sql: string, pattern: RegExp) =>
  sql
    .split(";")
    .map(H.squash)
    .filter((s) => pattern.test(s));
const policy = (sql: string, name: string) =>
  statements(sql, re(`^CREATE POLICY "${name}"`))[0];
const drops = (sql: string, name: string) =>
  re(`DROP POLICY (IF EXISTS )?"${name}" ON storage\\.objects`).test(sql);
const ALLOWLIST = "docs/security/service-role-client-allowlist.json";
const STEP = "Verify tenant isolation (real stack)";
const BK = H.BACKUP.replace(".", "\\.");
const git = (...args: string[]) => spawnSync("git", args, { encoding: "utf8" });
/** #2406's forward migration, when it is on this tree (criterion 22). */
const MIG_2406 = readdirSync(H.MIG).find((f) =>
  f.startsWith("20261027100000_"),
);
/** Pinned from #2406's final head when builder/2406 carries the migration;
 * null because builder/2406 @1647b739 (Oct 28, 2026) has no 20261027100000
 * migration yet. Re-point when #2406 merges. */
const TENANT_EXPR_2406: string | null = null;

/**
 * PR base for the base-relative checks (criterion 1 order, §6 scope).
 * Branch-agnostic on purpose: ACCEPTANCE_2407A_BASE, else `git merge-base
 * HEAD origin/develop`, never a pinned develop SHA, so files other PRs merge
 * into develop never count as #2407 edits. Skips when the base is unknown,
 * in merge_group (queued PRs ahead), or when the forward migration is already
 * on the base (merged: the scope belonged to its own PR, which CI checked).
 */
function prBase(): { base: string } | { skip: string } {
  if (process.env.GITHUB_EVENT_NAME === "merge_group")
    return { skip: "merge_group commits can include other queued PRs" };
  const pinned = process.env.ACCEPTANCE_2407A_BASE?.trim();
  const r = pinned
    ? git("rev-parse", "--verify", `${pinned}^{commit}`)
    : git("merge-base", "HEAD", "origin/develop");
  if (r.status !== 0)
    return {
      skip: "no origin/develop (or ACCEPTANCE_2407A_BASE) in this checkout",
    };
  const base = r.stdout.trim();
  if (git("cat-file", "-e", `${base}:${H.FORWARD}`).status === 0)
    return {
      skip: `#2407a already merged at base ${base}; scope was its PR's`,
    };
  return { base };
}
const withBase = (ctx: { skip: (note?: string) => void }) => {
  const b = prBase();
  if ("skip" in b) ctx.skip(b.skip);
  return (b as { base: string }).base;
};

/** M19 predicate: exactly one REVOKE, ALL on the backup table from all four roles. */
const revokesBackup = (sql: string) => {
  const revokes = statements(sql, /^REVOKE\b/i);
  if (revokes.length !== 1) return false;
  const [s] = revokes as [string];
  const roles = (s.split(/\bFROM\b/i)[1] ?? "")
    .toLowerCase()
    .split(",")
    .map((r) => r.trim());
  return (
    re(`^REVOKE\\s+ALL\\b.*\\bON\\s+(?:TABLE\\s+)?${BK}\\s+FROM\\b`).test(s) &&
    ["public", "anon", "authenticated", "service_role"].every((r) =>
      roles.includes(r),
    )
  );
};
/** M6 predicate: the bucket UPDATE sets exactly 5242880 and the four types, not public. */
const setsLimits = (sql: string) => {
  const [u] = statements(sql, /^UPDATE\s+storage\.buckets\b/i);
  if (
    !u ||
    !re(`WHERE\\s+id\\s*=\\s*'${H.BUCKET}'\\s*$`).test(u) ||
    /\bpublic\s*=/i.test(u)
  )
    return false;
  const size =
    u.match(/file_size_limit\s*=\s*(\d+(?:\s*\*\s*\d+)*)/i)?.[1] ?? "";
  const list =
    u.match(/allowed_mime_types\s*=\s*(ARRAY\s*\[[^\]]*\]|'[^']*')/i)?.[1] ??
    "";
  const types = [...list.matchAll(/image\/[a-z+.-]+/g)].map((t) => t[0]);
  return (
    size.split("*").reduce((n, f) => n * Number(f), 1) === H.LIMIT &&
    [...new Set(types)].sort().join() === H.TYPES.join() &&
    types.length === 4
  );
};
/** M19 predicate: the record INSERT keeps the first row on re-apply. */
const recordsFirst = (sql: string) => {
  const [ins] = statements(sql, re(`^INSERT\\s+INTO\\s+${BK}\\b`));
  return Boolean(
    ins &&
    /FROM\s+storage\.buckets/i.test(ins) &&
    /ON\s+CONFLICT[^;]*DO\s+NOTHING/i.test(ins) &&
    !/DO\s+UPDATE/i.test(ins),
  );
};
/** M18 predicate: rollback restores from the backup and never NULLs the limits. */
const restoresRecorded = (sql: string) =>
  re(`\\b${BK}\\b`).test(sql) &&
  /RAISE\s+EXCEPTION/i.test(sql) &&
  !/(file_size_limit|allowed_mime_types)\s*=\s*NULL\b/i.test(sql) &&
  re(`DROP\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?${BK}`).test(sql);
/** M7 (Chief a) predicate: P1 and P2 both dropped, N1 and N3 both created, P1 not recreated, in one text. */
const swapsTogether = (sql: string) =>
  [H.OLD_POLICIES[0], H.OLD_POLICIES[2]].every((n) => drops(sql, n!)) &&
  [H.NEW_POLICIES[0], H.NEW_POLICIES[2]].every((n) => policy(sql, n!)) &&
  !policy(sql, H.OLD_POLICIES[2]!);
/** Balanced-paren tenant expression after `split_part(name, '/', 2) =`. */
function tenantExpr(sql: string) {
  const m = /split_part\(\s*name\s*,\s*'\/'\s*,\s*2\s*\)\s*=\s*/i.exec(sql);
  if (!m) return null;
  const start = m.index + m[0].length;
  let i = start;
  let depth = 0;
  do {
    depth += sql[i] === "(" ? 1 : sql[i] === ")" ? -1 : 0;
    i++;
  } while (depth > 0 && i < sql.length);
  return sql.slice(start, i);
}

describe("#2407a static contract [A]", () => {
  it("#2407a criterion 1: forward migration exists with a header naming the rollback, rollback exists, version above every §10 reservation and every forward migration on the PR base", (ctx) => {
    expect(H.read(H.FORWARD), H.FORWARD).not.toBe("");
    expect(H.read(H.ROLLBACK), H.ROLLBACK).not.toBe("");
    const header = H.read(H.FORWARD)
      .split("\n")
      .filter((l) => l.startsWith("--"))
      .join("\n");
    expect(header).toContain(`rollback_${H.NAME}`);
    expect(H.VERSION > "20261027100000").toBe(true);
    expect(
      readdirSync(H.MIG).filter(
        (f) => /^\d{14}_/.test(f) && f.slice(0, 14) === H.VERSION,
      ),
    ).toEqual([H.NAME]);
    const base = withBase(ctx);
    const r = git("ls-tree", "--name-only", `${base}:${H.MIG}`);
    expect(r.status).toBe(0);
    expect(
      r.stdout
        .split("\n")
        .filter((f) => /^\d{14}_/.test(f) && f.slice(0, 14) >= H.VERSION),
      `base ${base}`,
    ).toEqual([]);
  });
  it("#2407a criterion 10: migration text has no GRANT and exactly one REVOKE, on the backup table (M19)", () => {
    expect(fwd(), H.FORWARD).not.toBe("");
    expect(statements(fwd(), /\bGRANT\b/i)).toEqual([]);
    expect(revokesBackup(fwd())).toBe(true);
    expect(
      revokesBackup(
        `REVOKE ALL ON ${H.BACKUP} FROM PUBLIC, anon, authenticated, service_role; REVOKE ALL ON storage.objects FROM anon;`,
      ),
    ).toBe(false);
    expect(
      revokesBackup(
        `GRANT SELECT ON ${H.BACKUP} TO anon; REVOKE ALL ON ${H.BACKUP} FROM PUBLIC, anon, authenticated, service_role;`,
      ),
    ).toBe(true);
  });
  it("#2407a criterion 2 / 10: backup table shape, prior limits recorded first-wins before the bucket update, private schema created if missing (M19)", () => {
    const sql = fwd();
    const [table] = statements(sql, re(`^CREATE TABLE (IF NOT EXISTS )?${BK}`));
    expect(table, "CREATE TABLE backup").toBeDefined();
    for (const col of [
      /bucket_id\s+TEXT\s+PRIMARY\s+KEY/i,
      /file_size_limit\s+BIGINT/i,
      /allowed_mime_types\s+TEXT\s*\[\]/i,
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
    expect(sql.search(re(`INSERT\\s+INTO\\s+${BK}`))).toBeLessThan(
      sql.search(/UPDATE\s+storage\.buckets/i),
    );
    expect(sql).toMatch(/CREATE SCHEMA IF NOT EXISTS private\b/i);
  });
  it("#2407a criterion 2 text: limits are exactly 5242880 and the four image types, public untouched, no bucket inserted (M6)", () => {
    expect(setsLimits(fwd())).toBe(true);
    expect(statements(fwd(), /^INSERT\s+INTO\s+storage\.buckets\b/i)).toEqual(
      [],
    );
    const ok = `UPDATE storage.buckets SET file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'] WHERE id = '${H.BUCKET}';`;
    expect(setsLimits(ok)).toBe(true);
    expect(setsLimits(ok.replace("5242880", "10485760"))).toBe(false);
    expect(
      setsLimits(ok.replace("'image/gif'", "'image/gif','image/svg+xml'")),
    ).toBe(false);
  });
  it("#2407a criterion 10 + Chief (a): drops P1-P3 and creates N1-N3 TO authenticated in the same migration (P2->N1 with P1->N3); N3 checks owner; P4 untouched (M7)", () => {
    const sql = fwd();
    expect(swapsTogether(sql)).toBe(true);
    expect(
      swapsTogether(
        sql.replace(
          re(`DROP POLICY (IF EXISTS )?"${H.OLD_POLICIES[2]}"`),
          "-- kept",
        ),
      ),
    ).toBe(false);
    expect(
      swapsTogether(
        `${sql}\nCREATE POLICY "${H.OLD_POLICIES[2]}" ON storage.objects FOR SELECT USING (bucket_id = '${H.BUCKET}');`,
      ),
    ).toBe(false);
    expect(drops(sql, H.OLD_POLICIES[1]!)).toBe(true);
    for (const [name, cmd] of [
      [H.NEW_POLICIES[0], "INSERT"],
      [H.NEW_POLICIES[1], "UPDATE"],
      [H.NEW_POLICIES[2], "SELECT"],
    ] as const) {
      const s = policy(sql, name!);
      expect(s, name).toMatch(
        re(
          `ON storage\\.objects (AS PERMISSIVE )?FOR ${cmd} TO authenticated\\b`,
        ),
      );
      expect(s).toContain(`'${H.BUCKET}'`);
    }
    expect(policy(sql, H.NEW_POLICIES[2]!)).toMatch(
      /owner\s*=\s*\(\s*SELECT\s+auth\.uid\(\)\s*\)|\(\s*SELECT\s+auth\.uid\(\)\s*\)\s*=\s*owner/i,
    );
    expect(sql).not.toContain(H.DELETE_POLICY);
  });
  it("#2407a criterion 10: folder checks use split_part/string_to_array, auth.uid() only as (SELECT auth.uid()), no ::uuid cast of a name segment, no storage.foldername", () => {
    const sql = fwd();
    expect(sql).toMatch(
      /split_part\(\s*name\s*,\s*'\/'|string_to_array\(\s*name\s*,\s*'\/'\s*\)/i,
    );
    expect(sql).not.toMatch(/storage\.foldername/i);
    expect(sql).toMatch(/\(\s*SELECT\s+auth\.uid\(\)\s*\)/i);
    expect(sql.replace(/\(\s*SELECT\s+auth\.uid\(\)\s*\)/gi, "")).not.toMatch(
      /auth\.uid\(\)/i,
    );
    expect(sql).not.toMatch(
      /(split_part\([^)]*\)|string_to_array\([^)]*\)(\s*\)\s*\[\s*\d+\s*\])?|\bname\b)\s*(::\s*uuid|\)\s*::\s*uuid)/i,
    );
  });
  it("#2407a criterion 11 text: rollback drops N1-N3, recreates P1-P3 verbatim from init_schema.sql, restores recorded limits or raises, drops the backup, no GRANT, P4 untouched (M18)", () => {
    const sql = back();
    expect(sql, H.ROLLBACK).not.toBe("");
    for (const name of H.NEW_POLICIES)
      expect(drops(sql, name), name).toBe(true);
    const recreated = statements(sql, /^CREATE POLICY "/i);
    for (const name of H.OLD_POLICIES)
      expect(recreated).toContain(policy(H.code(H.read(H.INIT)), name));
    expect(sql).not.toContain(H.DELETE_POLICY);
    expect(restoresRecorded(sql)).toBe(true);
    expect(
      restoresRecorded(
        `${sql}\nUPDATE storage.buckets SET file_size_limit = NULL WHERE id = '${H.BUCKET}';`,
      ),
    ).toBe(false);
    expect(statements(sql, /\bGRANT\b/i)).toEqual([]);
  });
  it("#2407a OQ17: compat bootstrap storage.buckets has file_size_limit BIGINT and allowed_mime_types TEXT[] (CREATE or ADD COLUMN IF NOT EXISTS)", () => {
    const sql = H.code(H.read(H.BOOTSTRAP));
    const [create] = statements(
      sql,
      /^CREATE TABLE IF NOT EXISTS storage\.buckets\b/i,
    );
    for (const col of [
      "file_size_limit BIGINT",
      "allowed_mime_types TEXT\\[\\]",
    ])
      expect(
        re(col).test(create ?? "") ||
          re(
            `ALTER TABLE (IF EXISTS )?storage\\.buckets[^;]*ADD COLUMN IF NOT EXISTS ${col}`,
          ).test(sql),
        col,
      ).toBe(true);
  });
  it("#2407a criterion 16: contract doc has N1-N3 and P4, the limits, the recorded-limits table, key layout, pre-deploy listing, deploy and rollback sections; runtime map has both upload-route rows", () => {
    const doc = H.read(H.DOC);
    expect(doc, H.DOC).not.toBe("");
    for (const term of [
      ...H.NEW_POLICIES,
      H.DELETE_POLICY,
      String(H.LIMIT),
      ...H.TYPES,
      H.BACKUP,
      H.BUCKET,
    ])
      expect(doc).toContain(term);
    expect(doc).toMatch(
      /editor\/\{tenantId\}\/\{(userId|uid)\}\/\{uuid\}\.\{ext\}/,
    );
    for (const heading of [
      /^#+ .*pre-deploy/im,
      /^#+ (?!.*pre-deploy).*deploy/im,
      /^#+ .*rollback/im,
    ])
      expect(doc).toMatch(heading);
    const rows = H.read(H.RUNTIME_MAP).split("\n");
    for (const app of ["admin", "missionary"])
      expect(
        rows.filter((row) =>
          re(
            `^\\|\\s*${app}\\s*\\|\\s*\`/api/upload/editor-image\`\\s*\\|`,
          ).test(row),
        ),
        `${app} row`,
      ).toHaveLength(1);
  });
  it("#2407a criteria 17/18 [B]: Builder's key and upload-handler modules, tests and package export exist; handler imports no service-role module", () => {
    for (const f of [
      "packages/api/src/editor-images/key.ts",
      "packages/api/src/upload/editor-image.ts",
      "tests/unit/packages/api/editor-images/key.test.ts",
      "tests/unit/packages/api/upload/editor-image.test.ts",
    ])
      expect(existsSync(f), f).toBe(true);
    expect(
      JSON.parse(H.read("packages/api/package.json")).exports[
        "./upload/editor-image"
      ],
    ).toBe("./src/upload/editor-image.ts");
    expect(H.read("packages/api/src/upload/editor-image.ts")).not.toContain(
      "@asym/database/supabase/admin",
    );
  });
  it("#2407a criterion 19: the real-stack path is appended last to the tenant isolation step and the shared pin matches", () => {
    expect(existsSync(H.REALSTACK)).toBe(true);
    const steps = workflowJobs(
      loadWorkflowDocument(".github/workflows/ci-integration.yml"),
    ).migrate!.steps!;
    const i = steps.findIndex((s) => s.name === STEP);
    expect(String(steps[i]!.run).split(/\s+/).at(-1)).toBe(H.REALSTACK);
    const { index, ...body } = PINNED_STEP_BODIES.migrate![`name:${STEP}`]!;
    expect(index).toBe(i);
    expect(steps[i]).toEqual({ name: STEP, ...body });
  });
  it("#2407a criterion 20: init_schema.sql and the service-role allowlist stay byte-identical to develop 629cb71d (2308 C12 green); verify:service-role-clients passes", () => {
    const sha = (f: string) =>
      createHash("sha256").update(readFileSync(f)).digest("hex");
    expect(sha(H.INIT)).toBe(
      "c5cc1775d6914b613730822d920f4ec3ba189cdb5e2f98fadb8981238e76635a",
    );
    expect(sha(ALLOWLIST)).toBe(
      "9c9875a789cb33d8b1b80d35428773c3cab8599b0ef4805e4e65d0241e060233",
    );
    const r = spawnSync(
      "node",
      ["scripts/verify/service-role-client-gate.mjs"],
      { encoding: "utf8", timeout: 120_000 },
    );
    expect(r.status, `${r.stdout}\n${r.stderr}`.slice(-2000)).toBe(0);
  });
  it("#2407a criterion 22 (Chief b, M21): N1's tenant expression is byte-identical to #2406's migration text", (ctx) => {
    const expected = MIG_2406
      ? tenantExpr(H.code(H.read(`${H.MIG}/${MIG_2406}`)))
      : TENANT_EXPR_2406;
    if (!expected)
      ctx.skip(
        "#2406 tenant expression not on base; re-point when #2406 merges",
      );
    const n1 = policy(H.read(H.FORWARD), H.NEW_POLICIES[0]!) ?? "";
    expect(n1, "N1").not.toBe("");
    expect(n1).toContain(H.squash(expected!));
  });
  it("#2407a §6 (r1.1 a): the PR diff touches only declared edits (branch-agnostic merge-base)", (ctx) => {
    const base = withBase(ctx);
    const r = git("diff", "--name-only", "--no-renames", base, "HEAD");
    expect(r.status).toBe(0);
    const declared = new Set([
      H.FORWARD,
      H.ROLLBACK,
      H.BOOTSTRAP,
      H.DOC,
      H.RUNTIME_MAP,
      ...`packages/api/src/upload/image.ts packages/api/src/upload/editor-image.ts packages/api/src/editor-images/key.ts
        apps/admin/app/api/upload/editor-image/route.ts apps/missionary/app/api/upload/editor-image/route.ts packages/api/package.json
        packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor.tsx
        apps/admin/features/mission-control/care/components/PersonnelProfile.tsx apps/admin/app/(app)/feed/org-updates/page-client.tsx
        apps/missionary/app/feed/worker-feed-page-client.tsx .github/workflows/ci-integration.yml`.split(
        /\s+/,
      ),
    ]);
    // tests/unit/** is allowed wholesale: Builder's unit tests, this folder and the 2250/2155/2201 pins (workflow-yaml.ts included).
    const outside = r.stdout
      .split("\n")
      .filter((p) => p && !declared.has(p) && !p.startsWith("tests/unit/"));
    expect(outside, `diff against ${base}`).toEqual([]);
  });
  it("#2407a harness: DEMO matches packages/auth/constants DEMO_TENANT_ID", () => {
    expect(H.DEMO).toBe(DEMO_TENANT_ID);
  });
});
