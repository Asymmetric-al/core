/**
 * #2400 static acceptance (spec r1 = issue comment 6452273654, approved
 * 6452289573; OQ3 (a): static only, no new real-stack cases). Criteria 1-6
 * and 9 [A], with mutants M1-M6, M8 and M9 (§9) run in-test on synthetic or
 * mutated copies. M7 mutates Builder's `v3-source-edited` mode in
 * tests/unit/scripts/supabase-migrations.test.ts (criterion 7, OQ8); the
 * Acceptance side of that chain is the census message check here (M8) and the
 * hash chain (criterion 6). Criterion 8 is the existing suites plus the
 * migrate job's census; criterion 10 is the merge gate. Owned by Acceptance;
 * implementers must not edit.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import { loadWorkflowDocument } from "../../helpers/workflow-yaml";
import { body } from "../issue-2256/harness";

const WF = ".github/workflows/ci-integration.yml";
const A = "tests/unit/acceptance";
const CENSUS = "scripts/verify/field-policy-census.mjs";
const F2260 = `${A}/issue-2260/donor-feed-preferences.realstack.acceptance.test.ts`;
/** §0 table: the tenant-isolation files that replay migration or rollback text. */
const REPLAYERS = [
  "issue-2256/person-anchor",
  "issue-2260/donor-feed-preferences",
  "issue-2258/current-user-assignments",
  "issue-2312/public-reads",
  "issue-2402/crm-table-preferences",
].map((f) => `${A}/${f}.realstack.acceptance.test.ts`);
const NON_REPLAYERS = [
  "issue-2250/tenant-guard",
  "issue-2269/donations-embed",
].map((f) => `${A}/${f}.realstack.acceptance.test.ts`);
/** File + sibling harness.ts, as the guard reads them. */
const withHarness = (f: string, own = H.read(f)): string =>
  own && `${own}\n${H.read(path.join(path.dirname(f), "harness.ts"))}`;
const runs = () =>
  (loadWorkflowDocument(WF).jobs?.migrate?.steps ?? [])
    .map((s) => String(s.run ?? ""))
    .filter((r) => H.realstackFiles(r).length > 1);
const TENANT_RUN = () => runs().find((r) => r.includes(F2260)) ?? "";

describe("#2400 criteria 1-2: parallel real-stack isolation", () => {
  it("#2400 criterion 1: every multi-file migrate step replays DDL only on private template0 databases", () => {
    expect(runs().length, "tenant-isolation step found").toBeGreaterThan(0);
    for (const run of runs())
      expect(H.guard(run, withHarness).problems).toEqual([]);
    const g = H.guard(TENANT_RUN(), withHarness);
    const listed = H.realstackFiles(TENANT_RUN());
    expect(listed).toEqual(
      expect.arrayContaining([...REPLAYERS, ...NON_REPLAYERS]),
    );
    expect(
      g.replaying.filter((f) => [...REPLAYERS, ...NON_REPLAYERS].includes(f)),
    ).toEqual(REPLAYERS);
  });

  it("#2400 criterion 1 (M2): a migrationBatch() replay on the shared URL appended to the step fails the guard", () => {
    const extra = `${A}/issue-9999/shared.realstack.acceptance.test.ts`;
    const shared = `const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
      const db = new pg.Client({ connectionString: ADMIN_URL });
      it("re-runs", async () => { await db.query(migrationBatch()); });`;
    const g = H.guard(`${TENANT_RUN()} ${extra}`, (f) =>
      f === extra ? shared : withHarness(f),
    );
    expect(g.replaying).toContain(extra);
    expect(g.problems.some((p) => p.startsWith(extra))).toBe(true);
    expect(g.problems.every((p) => p.startsWith(extra))).toBe(true);
  });

  // prettier-ignore
  it.each([
    ["M1: #2260 back on the shared URL", "connectionString: url.toString() });\n  let created", "connectionString: ADMIN_URL });\n  let created"],
    ["no template0", "TEMPLATE template0`", "`"],
    ["no WITH (FORCE)", "${database} WITH (FORCE)", "${database}"],
  ])("#2400 criterion 1 (%s) fails the guard", (_n, from, to) => {
    const own = H.read(F2260);
    expect(own, "mutation applies").toContain(from);
    const g = H.guard(TENANT_RUN(), (f) => withHarness(f, f === F2260 ? own.replace(from, to) : undefined));
    expect(g.problems.some((p) => p.startsWith(F2260))).toBe(true);
  });

  it("#2400 criterion 2: #2260 runs on acc2260_<uuid> and keeps every case and assertion", () => {
    const t = H.read(F2260);
    expect(t).toContain('`acc2260_${randomUUID().replaceAll("-", "")}`');
    expect(t).toMatch(/"scripts\/sql\/supabase-compat-bootstrap\.sql"/);
    expect(t).toMatch(/"supabase\/seed\.sql"/);
    expect(t).toMatch(/\|\| "psql",\s*\[\s*url\.toString\(\)/);
    const titles = [...t.matchAll(/"(\d{1,2}): [^"\n]+"/g)].map((m) => +m[1]!);
    expect(titles).toEqual([...Array(16).keys()].map((i) => i + 1));
    expect(t.match(/expect\(/g)?.length).toBeGreaterThanOrEqual(38);
    expect(t.match(/await rerun\(\)/g)?.length).toBe(4);
  });
});

const GOOD_HEADER = (sql: string) =>
  sql.replace(
    /^[\s\S]*?(?=^BEGIN;)/m,
    `-- Person anchor. profiles.tenant_id is a hint: not authoritative; see #2267.
-- Locks: ADD COLUMN and the CHECK ... NOT VALID adds take ACCESS EXCLUSIVE on
-- missionaries and profiles; the FK adds take SHARE ROW EXCLUSIVE on the
-- altered table and on persons (first apply: tenants). Every lock is held
-- until COMMIT, through the VALIDATE scans. SET LOCAL lock_timeout = '5s'
-- bounds only the wait to acquire a lock; on 55P03 nothing is applied.

`,
  );

describe("#2400 criteria 3-4: migration and rollback text", () => {
  it("#2400 criterion 3: forward header states the lock facts and OQ6 wording; SQL equals a8fbab2f after comment strip", () =>
    expect(H.forwardProblems(H.read(H.MIGRATION))).toEqual([]));

  it("#2400 criterion 3: a compliant header over the current SQL passes (no vacuous failure)", () =>
    expect(H.forwardProblems(GOOD_HEADER(H.read(H.MIGRATION)))).toEqual([]));

  // prettier-ignore
  it.each([
    ["M3: keeps 'isn't held for a scan'", (s: string) => s.replace("Every lock", "No lock isn't held for a scan. Every lock")],
    ["M3: drops 'until COMMIT'", (s: string) => s.replace("until COMMIT", "briefly")],
    ["M4: '5s' -> '6s'", (s: string) => s.replace("lock_timeout = '5s';", "lock_timeout = '6s';")],
    ["M4: a VALIDATE removed", (s: string) => s.replace(/^ALTER TABLE[^;]*VALIDATE CONSTRAINT[^;]*;$/m, "")],
  ])("#2400 criterion 3 (%s) fails", (_n, mutate) => {
    const good = GOOD_HEADER(H.read(H.MIGRATION));
    expect(mutate(good), "mutation applies").not.toBe(good);
    expect(H.forwardProblems(mutate(good))).not.toEqual([]);
  });

  const GOOD_ROLLBACK = (sql: string) =>
    sql
      .replace(/^BEGIN;$/m, "BEGIN;\nSET LOCAL lock_timeout = '5s';")
      .replace(/^(?=BEGIN;)/m, "-- On 55P03 nothing is rolled back.\n\n");
  const viaBody = (sql: string) => {
    const dir = mkdtempSync(path.join(tmpdir(), "acc2400-"));
    try {
      writeFileSync(path.join(dir, "r.sql"), sql);
      return H.rollbackProblems(sql, body(path.join(dir, "r.sql")));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it("#2400 criterion 4: rollback runs SET LOCAL lock_timeout = '5s' right after BEGIN (also under #2256 body()); rest unchanged; header names 55P03", () =>
    expect(H.rollbackProblems(H.read(H.ROLLBACK), body(H.ROLLBACK))).toEqual(
      [],
    ));

  const lock = "SET LOCAL lock_timeout = '5s';";
  // prettier-ignore
  it.each([
    ["compliant fixture", (s: string) => s, false],
    ["M6: missing", (s: string) => s.replace(`${lock}\n`, ""), true],
    ["M6: another value", (s: string) => s.replace("'5s'", "'30s'"), true],
    ["M6: after the first statement", (s: string) => s.replace(`${lock}\n`, "").replace("IS NULL;", `IS NULL;\n${lock}`), true],
    ["M6: a statement changed", (s: string) => s.replace("public.persons;", "public.persons CASCADE;"), true],
  ])("#2400 criterion 4 (%s)", (_n, mutate, fails) => {
    // Built from the a8fbab2f statements, so the fixture stays valid once Builder edits the file.
    const base = ["BEGIN;", ...H.ROLLBACK_REST.map((s) => `${s};`)].join("\n");
    expect(viaBody(mutate(GOOD_ROLLBACK(base))).length > 0).toBe(fails);
  });
});

const DEPLOY = `ADD COLUMN and the CHECK NOT VALID adds take ACCESS EXCLUSIVE on missionaries and profiles; the FKs take SHARE ROW EXCLUSIVE, including on \`persons\`, and the first apply takes it on \`tenants\`. Every lock is held until COMMIT. \`lock_timeout\` bounds only the wait; on 55P03 nothing is applied. A live re-run can fail with 40P01.`;
const ATTNUM =
  "After rollback then re-apply, person_id lands at ordinals 23 and 15, so the census v3 local_catalog check fails on that database.";
// prettier-ignore
const GOOD_DOC = (md: string) =>
  md
    .replace(/^## Deploy: lock timeout\n[\s\S]*?(?=^## |(?![\s\S]))/m, `## Deploy: lock timeout\n\n${DEPLOY}\n\n`)
    .replace(/^## Rollback and order\n/m, `## Rollback and order\n\n${ATTNUM}\n`);

describe("#2400 criteria 5-6: doc and census chain", () => {
  it("#2400 criterion 5: 'Deploy: lock timeout' and 'Rollback and order' carry the corrected facts", () =>
    expect(H.docProblems(H.read(H.DOC))).toEqual([]));

  // prettier-ignore
  it.each([
    ["compliant fixture", (s: string) => s, false],
    ["M9: no ordinal sentence", (s: string) => s.replace(ATTNUM, ""), true],
    ["M9: keeps 'no lock is held for a full scan'", (s: string) => s.replace(DEPLOY, `${DEPLOY} No lock is held for a full scan.`), true],
    ["M9: no 40P01", (s: string) => s.replace("40P01", "deadlock"), true],
  ])("#2400 criterion 5 (%s)", (_n, mutate, fails) =>
    expect(H.docProblems(mutate(GOOD_DOC(H.read(H.DOC)))).length > 0).toBe(fails));

  const chain = () => ({
    forward: Buffer.from(H.read(H.MIGRATION)),
    v3: Buffer.from(H.read(`${H.FP}/${H.V3}`)),
    census: H.read(`${H.FP}/census-v1.json`),
    foundation: H.read("supabase/tests/field_policies_foundation.sql"),
  });
  it("#2400 criterion 6: forward SHA -> v3 source_sha256 -> v3 SHA -> census-v1, and both SQL literals, agree", () =>
    expect(H.chainProblems(chain())).toEqual([]));

  it("#2400 criterion 6 (M5): an unrehashed comment edit breaks the chain at each link", () => {
    const c = chain();
    const forward = Buffer.concat([c.forward, Buffer.from("-- edited\n")]);
    expect(H.chainProblems({ ...c, forward })).toHaveLength(2);
    const v3 = Buffer.from(
      c.v3.toString().replace(H.sha(c.forward), H.sha(forward)),
    );
    expect(H.chainProblems({ ...c, forward, v3 })).toEqual([
      "census-v1 v3 sha256",
      "foundation SQL literals",
    ]);
  });

  it("#2400 criteria 5/6: the census v3 hash assert carries the §1.5 message; PASS lines equal a8fbab2f", () =>
    expect(H.censusProblems(H.read(CENSUS))).toEqual([]));

  it("#2400 (M8): a census with the message passes; the same census without it fails", () => {
    const mjs = H.read(CENSUS);
    const message =
      /["'`]field-policy census: v3 source_sha256 mismatch for [^"'`]+["'`],?/g;
    const msg = JSON.stringify(`${H.MISMATCH}${H.MIGRATION}`);
    const withMsg = message.test(mjs)
      ? mjs
      : mjs.replace("person.source_sha256,", `person.source_sha256, ${msg},`);
    expect(H.censusProblems(withMsg)).toEqual([]);
    expect(H.censusProblems(withMsg.replace(message, ""))).toEqual([
      "§1.5 message",
    ]);
  });
});

/**
 * Criterion 9, opt-in: ACCEPTANCE_2400_SCOPE=1 (base = `git merge-base HEAD
 * origin/develop`) or ACCEPTANCE_2400_BASE=<ref>. The merge-base keeps it
 * branch-agnostic: it is the PR's fork point whether develop has moved on or
 * not, where a hard-coded develop SHA would count every later develop commit as
 * this PR's diff. Only committed changes (base..HEAD) count, so local scratch
 * files never fail it.
 */
const BASE = process.env.ACCEPTANCE_2400_BASE?.trim() ?? "";
const SCOPE = process.env.ACCEPTANCE_2400_SCOPE?.trim() === "1" || BASE !== "";
const DECLARED = [
  H.MIGRATION,
  H.ROLLBACK,
  H.DOC,
  `${H.FP}/${H.V3}`,
  `${H.FP}/census-v1.json`,
  "supabase/tests/field_policies_foundation.sql",
  "scripts/verify/field-policy-census.mjs",
  "tests/unit/scripts/supabase-migrations.test.ts",
  F2260,
];
describe.skipIf(!SCOPE)("#2400 criterion 9 (opt-in): PR diff scope", () => {
  const git = (...args: string[]) => {
    const r = spawnSync("git", args, { encoding: "utf8" });
    expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
    return r.stdout.split("\n").filter(Boolean);
  };
  const base = () => BASE || git("merge-base", "HEAD", "origin/develop")[0]!;

  it("#2400 criterion 9: only §6 paths change, ci-integration.yml is unchanged, no supabase/migrations/2*.sql is added", () => {
    const changed = git("diff", "--name-only", "--no-renames", base(), "HEAD");
    expect(
      changed.filter(
        (f) => !DECLARED.includes(f) && !f.startsWith(`${A}/issue-2400/`),
      ),
    ).toEqual([]);
    expect(changed).not.toContain(WF);
    const added = git(
      "diff",
      "--name-only",
      "--diff-filter=A",
      base(),
      "HEAD",
      "--",
      "supabase/migrations",
    );
    expect(
      added.filter((f) => /^supabase\/migrations\/2[^/]*\.sql$/.test(f)),
    ).toEqual([]);
  });
});
