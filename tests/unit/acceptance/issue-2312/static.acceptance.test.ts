/**
 * #2312 static acceptance, no database. Spec r2 (comment 6390700741) plus pins
 * addendum 1 (6419302687, approved 6419379494): criteria 4, 5, 6 (acceptance
 * view of the Builder's smoke change), 7 and 8, plus opt-in criterion 8 (base
 * version, diff scope, the one workflow run: line): set ACCEPTANCE_2312_SCOPE=1
 * (base: git merge-base origin/develop HEAD) or ACCEPTANCE_2312_BASE=<ref>.
 * Criteria 1-3 are in public-reads.realstack.acceptance.test.ts.
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import {
  loadWorkflowDocument,
  workflowJobs,
} from "../../helpers/workflow-yaml";

const sha256 = (b: string | Buffer) =>
  createHash("sha256").update(b).digest("hex");
const ver = (f: string) => f.slice(0, 14);
const forward = (fs: string[]) => fs.filter((f) => /^\d{14}_.+\.sql$/.test(f));
const sql = () => {
  expect(existsSync(H.MIGRATION), `${H.MIGRATION} must exist`).toBe(true);
  return H.code(H.read(H.MIGRATION));
};
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
const DOLLAR = /\$(\w*)\$[\s\S]*?\$\1\$/g;
/** Executable SQL outside DO-block bodies. */
const topLevel = () => sql().replace(DOLLAR, "$$$$");
/** DO-block bodies (pre/post-asserts and the catalog-driven drop). */
const doBodies = () => sql().match(DOLLAR) ?? [];
const T5 = H.TABLES.join("|");
/** docs/ci.md develop byte prefix (#2250's CI_BASES). */
const CI_BASE = {
  bytes: 40058,
  sha256: "f636ef0f0127f1159db711fb005a212aaf0cb3c9ceb9fe64bb308305c55d4e4b",
};
const STEP = "Verify tenant isolation (real stack)";
const CII = ".github/workflows/ci-integration.yml";

/**
 * Criterion 5: forward-guard findings in one migration's SQL. A CREATE POLICY
 * on one of the five tables TO anon / TO public / USING (true), or a GRANT on
 * one of them to anon.
 */
function forwardViolations(text: string): string[] {
  const body = H.code(text);
  const out: string[] = [];
  const policy = new RegExp(
    String.raw`CREATE\s+POLICY\s+(?:"[^"]*"|\w+)\s+ON\s+(?:public\.)?"?(${T5})"?\b([^;]*)`,
    "gi",
  );
  for (const m of body.matchAll(policy)) {
    const rest = m[2] ?? "";
    const roles = /\bTO\s+([\w\s,"]+?)(?=\s+USING\b|\s+WITH\b|\s*$)/i.exec(
      rest,
    );
    if (roles && /(^|[\s,"])(anon|public)("|\b)/i.test(roles[1]!))
      out.push(`policy on ${m[1]} TO ${roles[1]!.trim()}`);
    if (/USING\s*\(\s*\(?\s*true\s*\)?\s*\)/i.test(rest))
      out.push(`policy on ${m[1]} USING (true)`);
  }
  const grant = new RegExp(
    String.raw`\bGRANT\b[^;]*?\bON\s+(?:TABLE\s+)?(?:public\.)?"?(${T5})"?\b[^;]*?\bTO\b([^;]*)`,
    "gi",
  );
  for (const m of body.matchAll(grant))
    if (/\banon\b/i.test(m[2] ?? "")) out.push(`grant on ${m[1]} to anon`);
  return out;
}

describe("#2312 migration text (criterion 4)", () => {
  it(`4/8: ${H.MIGRATION_NAME} is the only *_close_public_reads_tenant_scope.sql; version unique and > develop ${H.DEVELOP_LATEST}`, () => {
    sql();
    const all = forward(readdirSync(H.MIG));
    expect(
      all.filter((f) =>
        /^\d{14}_close_public_reads_tenant_scope\.sql$/.test(f),
      ),
    ).toEqual([H.MIGRATION_NAME]);
    expect(ver(H.MIGRATION_NAME) > H.DEVELOP_LATEST).toBe(true);
    expect(all.filter((f) => ver(f) === ver(H.MIGRATION_NAME))).toHaveLength(1);
  });

  it("4: has a -- Down: header that names the five policies and Blake's explicit call", () => {
    const raw = H.read(H.MIGRATION);
    expect(raw).toMatch(/^-- Down:/m);
    const header = raw.slice(raw.search(/^-- Down:/m)).split(/\n(?!--)/)[0]!;
    expect(header).toMatch(/drop/i);
    expect(header).toMatch(/Blake/);
    expect(header).toMatch(/after[\s\S]*backlog|backlog[\s\S]*after/i);
    expect(header).toMatch(/re-?opens the exposure/i);
  });

  it.each(H.TABLES)(
    "4: public.%s gets exactly one REVOKE ALL ... FROM PUBLIC, anon, authenticated and one GRANT SELECT ... TO authenticated",
    (t) => {
      const body = sql();
      expect(
        count(
          body,
          new RegExp(
            String.raw`REVOKE\s+ALL\s+ON\s+TABLE\s+public\.${t}\s+FROM\s+PUBLIC\s*,\s*anon\s*,\s*authenticated\s*;`,
            "gi",
          ),
        ),
      ).toBe(1);
      expect(
        count(
          body,
          new RegExp(
            String.raw`GRANT\s+SELECT\s+ON\s+TABLE\s+public\.${t}\s+TO\s+authenticated\s*;`,
            "gi",
          ),
        ),
      ).toBe(1);
    },
  );

  it("4: exactly five REVOKE and five GRANT statements in total", () => {
    const body = topLevel();
    expect(count(body, /\bREVOKE\b/gi)).toBe(5);
    expect(count(body, /\bGRANT\b/gi)).toBe(5);
  });

  it.each(H.TABLES)(
    "4: one static CREATE POLICY on public.%s with the §1.1 name, AS PERMISSIVE FOR SELECT TO authenticated",
    (t) => {
      const body = sql();
      const re = new RegExp(
        String.raw`CREATE\s+POLICY\s+"${H.policyName(t)}"\s+ON\s+public\.${t}\s+AS\s+PERMISSIVE\s+FOR\s+SELECT\s+TO\s+authenticated\s+USING\s*\(`,
        "gi",
      );
      expect(count(body, re)).toBe(1);
    },
  );

  it("4: exactly five CREATE POLICY statements, none built with format()", () => {
    const body = sql();
    expect(count(topLevel(), /CREATE\s+POLICY/gi)).toBe(5);
    expect(body).not.toMatch(/format\s*\(\s*'[^']*CREATE\s+POLICY/i);
  });

  it("4: the follows policy carries the own (donors JOIN profiles, same tenant) and staff terms", () => {
    const body = sql();
    const m = new RegExp(
      String.raw`CREATE\s+POLICY\s+"${H.FOLLOWS_POLICY}"[^;]*;`,
      "i",
    ).exec(body);
    expect(m, "follows policy").not.toBeNull();
    const p = m![0].replace(/\s+/g, " ");
    for (const s of [
      /tenant_id IS NOT NULL AND tenant_id = \( ?SELECT authz\.current_tenant_id\(\) ?\)/i,
      /public\.donors d JOIN public\.profiles p ON p\.id = d\.profile_id/i,
      /d\.id = follows\.donor_id/i,
      /d\.tenant_id = follows\.tenant_id/i,
      /p\.user_id = \( ?SELECT auth\.uid\(\) ?\) OR p\.id = \( ?SELECT auth\.uid\(\) ?\)/i,
      /authz\.has_staff_membership\( ?follows\.tenant_id, NULL::authz\.staff_role\[\] ?\)/i,
    ])
      expect(p).toMatch(s);
    expect(p, "OQ2a: the followed missionary is not an owner").not.toMatch(
      /follows\.missionary_id/i,
    );
  });

  it.each([
    ["TO anon", /\bTO\s+anon\b/i],
    ["USING (true)", /USING\s*\(\s*true\s*\)/i],
    ["DROP POLICY IF EXISTS", /DROP\s+POLICY\s+IF\s+EXISTS/i],
    ["GRANT ... TO anon", /\bGRANT\b[^;]*\bTO\b[^;]*\banon\b/i],
    ["is_super_admin", /is_super_admin/i],
    [
      "a definition of authz.current_tenant_id()",
      /FUNCTION\s+authz\.current_tenant_id\s*\(/i,
    ],
    ["NO FORCE (addendum 1 item 2)", /\bNO\s+FORCE\b/i],
    ["FORCE ROW LEVEL (addendum 1 item 2)", /\bFORCE\s+ROW\s+LEVEL\b/i],
    ["DISABLE ROW LEVEL (addendum 1 item 2)", /\bDISABLE\s+ROW\s+LEVEL\b/i],
  ])("4: the executable SQL has no %s", (_n, re) =>
    expect(sql()).not.toMatch(re),
  );

  it("4 (In 1.1-1.2, 1.5): catalog-driven pre-assert and drop, post-assert incl. FORCE", () => {
    const body = sql();
    expect(body).toMatch(/pg_policies/i);
    expect(body).toMatch(/'public read'/);
    expect(body).toMatch(/'tanstack browser read'/);
    expect(body).toMatch(/RAISE\s+EXCEPTION/i);
    expect(body).toMatch(/DROP\s+POLICY\s+%I\s+ON\s+public\.%I/i);
    expect(body).toMatch(/has_table_privilege/i);
    const post = doBodies().filter((b) => /relforcerowsecurity/i.test(b));
    expect(
      post,
      "addendum 1 item 2: a post-assert DO block reads FORCE",
    ).not.toEqual([]);
    expect(
      post.some((b) => /has_staff_membership/.test(b) && /auth\.uid/.test(b)),
      "In 1.5: the follows post-assert checks has_staff_membership and auth.uid",
    ).toBe(true);
  });

  it("4 (In 1.6): nothing but BEGIN/COMMIT, DO blocks, REVOKE, GRANT and CREATE POLICY", () => {
    const top = topLevel()
      .split(";")
      .map((s) => s.trim().replace(/\s+/g, " "))
      .filter(Boolean);
    expect(
      top.filter(
        (s) => !/^(BEGIN|COMMIT|DO\b|REVOKE |GRANT |CREATE POLICY )/i.test(s),
      ),
    ).toEqual([]);
    expect(sql()).not.toMatch(
      /ALTER\s+PUBLICATION|CREATE\s+(OR\s+REPLACE\s+)?FUNCTION|ALTER\s+TABLE|\b(INSERT|UPDATE|DELETE)\s+(INTO|public\.|FROM)/i,
    );
  });
});

describe("#2312 forward guard (criterion 5)", () => {
  const POISON = {
    "policy TO anon": `CREATE POLICY "x" ON public.funds FOR SELECT TO anon USING (tenant_id IS NOT NULL);`,
    "policy TO public": `CREATE POLICY x ON public.campaigns AS PERMISSIVE FOR SELECT TO authenticated, public USING (false);`,
    "policy USING (true)": `create policy "y" on public.follows for select to authenticated using (true);`,
    "grant to anon": `GRANT SELECT ON TABLE public.assets TO authenticated, anon;`,
    "grant to anon, no TABLE keyword": `grant all on public.missionaries to anon;`,
  };
  it.each(Object.entries(POISON))(
    "5: the guard catches the poison fixture '%s'",
    (_n, poison) => expect(forwardViolations(poison)).not.toEqual([]),
  );
  it("5: the guard passes the spec's own statements (no false positive)", () => {
    const clean = H.TABLES.map(
      (t) =>
        `REVOKE ALL ON TABLE public.${t} FROM PUBLIC, anon, authenticated; GRANT SELECT ON TABLE public.${t} TO authenticated;
         CREATE POLICY "${H.policyName(t)}" ON public.${t} AS PERMISSIVE FOR SELECT TO authenticated USING (${H.qualFor(t)});`,
    ).join("\n");
    expect(forwardViolations(clean)).toEqual([]);
  });
  it(`5: no forward migration above ${ver(H.MIGRATION_NAME)} re-opens anon, public or USING (true) on the five tables`, () => {
    const later = forward(readdirSync(H.MIG)).filter(
      (f) => ver(f) > ver(H.MIGRATION_NAME),
    );
    expect(
      later.flatMap((f) =>
        forwardViolations(H.read(`${H.MIG}/${f}`)).map((v) => `${f}: ${v}`),
      ),
    ).toEqual([]);
  });
});

describe("#2312 smoke script (criterion 6, Builder unit; acceptance view)", () => {
  it(`6: ${H.SMOKE}'s anon branch expects denial and flags returned rows; ${H.SMOKE_TEST} exists`, () => {
    const src = H.read(H.SMOKE);
    expect(src).toContain("anon is denied campaigns (expected after #2312)");
    expect(src).toMatch(/anon can read campaigns: public exposure/);
    expect(src).toMatch(/42501|permission denied/i);
    expect(existsSync(H.SMOKE_TEST), H.SMOKE_TEST).toBe(true);
  });
});

/** Criterion 7 doc rules, "label :: regex". */
const DOC_RULES = String.raw`
names missionaries :: \bmissionaries\b
names funds :: \bfunds\b
names follows :: \bfollows\b
names assets :: \bassets\b
names campaigns :: \bcampaigns\b
new policy tenant scoped read :: tenant scoped read
new policy tenant scoped own or staff read :: tenant scoped own or staff read
legacy name public read :: public read
legacy name tanstack browser read :: tanstack browser read
Blake's ruling :: Blake[\s\S]{0,400}(rul|public)|(rul|public)[\s\S]{0,400}Blake
Samson's follows ruling :: (?=[\s\S]*Samson)(?=[\s\S]*(own[- ]or[- ]staff|follower))
assets flag :: \bassets\b[\s\S]{0,400}(flag|every tenant member)|(flag|every tenant member)[\s\S]{0,400}\bassets\b
forward rule :: forward
deploy-order rule: the backlog first, as its own deploy :: backlog[\s\S]{0,400}(first|before|own deploy)|(first|before)[\s\S]{0,400}backlog
`
  .trim()
  .split("\n")
  .map((l) => l.split(" :: ") as [string, string]);

describe("#2312 doc (criterion 7)", () => {
  it.each(DOC_RULES)(`7: ${H.DOC} covers %s`, (_l, re) => {
    expect(existsSync(H.DOC), `${H.DOC} must exist`).toBe(true);
    expect(H.read(H.DOC)).toMatch(new RegExp(re, "i"));
  });
});

describe("#2312 unchanged (criterion 8)", () => {
  it("8: docs/ci.md keeps develop's bytes as a prefix; nothing #2312 after it", () => {
    const bytes = readFileSync("docs/ci.md");
    expect(sha256(bytes.subarray(0, CI_BASE.bytes)), "docs/ci.md prefix").toBe(
      CI_BASE.sha256,
    );
    expect(bytes.subarray(CI_BASE.bytes).toString("utf8")).not.toMatch(
      /2312|tenant[- ]read[- ]floor|close_public_reads/i,
    );
  });
  it.each(Object.entries(H.LEGACY_MIGRATIONS))(
    "8: legacy migration %s is byte-unchanged",
    (f, hash) => expect(sha256(readFileSync(`${H.MIG}/${f}`))).toBe(hash),
  );
  it("8: no missionaries.person_id read or write in the migration", () =>
    expect(sql()).not.toMatch(/person_id/i));
  it("8: #2253's service-role allowlist is not grown (117 entries at develop 88eefbd9)", () => {
    const a = (
      JSON.parse(H.read(H.ALLOWLIST)) as { entries: { file: string }[] }
    ).entries;
    expect(a.length).toBeLessThanOrEqual(117);
  });
  it(`8 (addendum 1 item 4): '${STEP}' runs ${H.REALSTACK}`, () => {
    const step = (
      workflowJobs(loadWorkflowDocument(CII)).migrate?.steps ?? []
    ).find((s) => s.name === STEP);
    expect(step, STEP).toBeDefined();
    expect(String(step!.run).split(/\s+/)).toContain(H.REALSTACK);
  });
  it.todo(
    "8: the PR body contains `Closes #2312` (review check; not visible in the tree)",
  );
  it.todo(
    "9 (Handback): read-only development-project catalog check (pg_policies, has_table_privilege, schema_migrations); reviewed in the handback, not testable here",
  );
});

const BASE = process.env.ACCEPTANCE_2312_BASE?.trim() ?? "";
const ON = process.env.ACCEPTANCE_2312_SCOPE?.trim() === "1" || BASE !== "";
const git = (...args: string[]) => {
  const r = spawnSync("git", args, { encoding: "utf8" });
  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
  return r.stdout.trim();
};
/** §6 paths (Builder + Acceptance) plus addendum 1 item 4's CI edits and fingerprint appends. */
const DECLARED = [H.MIGRATION, H.SMOKE, H.SMOKE_TEST, H.DOC, CII].concat(
  `helpers/workflow-yaml.ts acceptance/issue-2250/static.acceptance.test.ts
  acceptance/issue-2155/postgres-ecr-gates.acceptance.test.ts acceptance/issue-2201/merge-group.acceptance.test.ts`
    .split(/\s+/)
    .map((p) => `tests/unit/${p}`),
);

describe.skipIf(!ON)(
  "#2312 opt-in (PR base; ACCEPTANCE_2312_SCOPE=1 or ACCEPTANCE_2312_BASE)",
  () => {
    const base = () => BASE || git("merge-base", "origin/develop", "HEAD");
    it("8 (OQ5): the version is greater than every migration on the PR base", () => {
      const onBase = forward(
        git("ls-tree", "--name-only", `${base()}:${H.MIG}`).split("\n"),
      );
      expect(
        onBase.filter((f) => ver(f) >= ver(H.MIGRATION_NAME)),
        `base ${base()}`,
      ).toEqual([]);
    });
    it("8: the PR diff touches only §6 paths, addendum 1 item 4's files and tests/unit/acceptance/issue-2312/; one migration added", () => {
      const changed = [
        ...git("diff", "--name-only", "--no-renames", base()).split("\n"),
        ...git("ls-files", "--others", "--exclude-standard").split("\n"),
      ].filter(Boolean);
      const outside = changed.filter(
        (f) =>
          !DECLARED.includes(f) &&
          !f.startsWith("tests/unit/acceptance/issue-2312/"),
      );
      expect(outside, `diff against ${base()}`).toEqual([]);
      expect(changed.filter((f) => f.startsWith(`${H.MIG}/`))).toEqual([
        H.MIGRATION,
      ]);
      expect(changed).toContain(H.REALSTACK);
    });
    it(`8 (addendum 1 item 4): in ${CII} only the '${STEP}' run: line changes, by appending ${H.REALSTACK}`, () => {
      const diff = git("diff", "-U0", "--no-color", base(), "--", CII)
        .split("\n")
        .filter((l) => /^[-+](?![-+]{2} )/.test(l));
      if (diff.length === 0) return;
      const [minus, plus] = [
        diff.filter((l) => l.startsWith("-")),
        diff.filter((l) => l.startsWith("+")),
      ];
      expect([minus.length, plus.length]).toEqual([1, 1]);
      const words = (l: string) => l.slice(1).trim().split(/\s+/);
      expect(words(minus[0]!).slice(0, 4)).toEqual([
        "run:",
        "bun",
        "x",
        "vitest",
      ]);
      expect(words(plus[0]!)).toEqual([...words(minus[0]!), H.REALSTACK]);
    });
  },
);
