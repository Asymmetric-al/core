/**
 * #2250 static acceptance (spec r1 comment 6384739115 + conditions 6384790093,
 * amended: criterion 12 docs live in tenant-guard.md; docs/ci.md is pinned).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  loadWorkflowDocument,
  workflowJobs,
} from "../../helpers/workflow-yaml";

const read = (f: string) => (existsSync(f) ? readFileSync(f, "utf8") : "");
const MIG = "supabase/migrations";
const migFile = () =>
  readdirSync(MIG).find((f) => /^\d{14}_tenant_guard\.sql$/.test(f)) ?? "";
const sql = () => (migFile() ? read(`${MIG}/${migFile()}`) : "");
const STEP = "Verify tenant isolation (real stack)";
const REALSTACK =
  "tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts";
const DOC = "docs/security/tenant-guard.md";
/** docs/ci.md at develop c541b84b: "<bytes> <sha256>" (pinned by issue-2180). */
const CI_MD =
  "40058 f636ef0f0127f1159db711fb005a212aaf0cb3c9ceb9fe64bb308305c55d4e4b";
/** "label :: regex" lines docs/security/tenant-guard.md must match (criteria 7, 11, 12, 14, 15, 17). */
const DOC_RULES = String.raw`
12: route and why: function-call, SECURITY DEFINER, NOLOGIN NOBYPASSRLS, no new credential :: (?=[\s\S]*function-call)(?=[\s\S]*SECURITY DEFINER)(?=[\s\S]*NOLOGIN)(?=[\s\S]*NOBYPASSRLS)(?=[\s\S]*no (new )?credential)
12: threat model with the compromised service-role key non-goal :: (?=[\s\S]*threat model)(?=[\s\S]*compromised service[-_ ]role key)
12: how-to: guard policy, allow-list entry, tenant_id echo :: (?=[\s\S]*tenant_guard_isolation)(?=[\s\S]*allow-list)(?=[\s\S]*echo)
12: Q2 note: app.current_tenant_id vs authz.current_tenant_id() until #668 :: (?=[\s\S]*app\.current_tenant_id)(?=[\s\S]*authz\.current_tenant_id\(\))(?=[\s\S]*#668)
12: future paths P2-P14, #508, Phase-3 resolver, #512 merge, #513 dedupe :: (?=[\s\S]*\bP2\b)(?=[\s\S]*\bP9\b)(?=[\s\S]*\bP14\b)(?=[\s\S]*#508)(?=[\s\S]*Phase[- ]3 resolver)(?=[\s\S]*#512)(?=[\s\S]*#513)
12 (amended): describes the CI migrate step 'Verify tenant isolation (real stack)' :: Verify tenant isolation \(real stack\)
7: the atomicity unit is one guarded call :: atomicity unit is one guarded call
17: hosted ownership grant :: GRANT tenant_guard TO postgres WITH INHERIT FALSE, SET TRUE
14: search_path rule :: search_path = ''
15: grant matrix names all 6 functions :: (?=[\s\S]*public\.acquire_workflow_work_claim)(?=[\s\S]*public\.release_workflow_work_claim)(?=[\s\S]*tenant_guard\.acquire_workflow_work_claim)(?=[\s\S]*tenant_guard\.release_workflow_work_claim)(?=[\s\S]*tenant_guard\.enter)(?=[\s\S]*tenant_guard\.current_tenant_id)
17: tenant_guard grant rule :: SELECT, INSERT, UPDATE
`
  .trim()
  .split("\n")
  .map((line) => line.split(" :: ") as [string, string]);

describe("#2250 migration text (static)", () => {
  it("2: supabase/migrations/<ts>_tenant_guard.sql exists after 20261021064500 with a -- Down: header", () => {
    expect(migFile() > "20261021064500").toBe(true);
    expect(sql()).toMatch(/^-- Down:/m);
  });

  it("15: default EXECUTE is revoked from PUBLIC in schema tenant_guard (catalog cannot show this)", () => {
    expect(sql()).toMatch(
      /ALTER\s+DEFAULT\s+PRIVILEGES\s+IN\s+SCHEMA\s+tenant_guard\s+REVOKE\s+EXECUTE\s+ON\s+FUNCTIONS\s+FROM\s+PUBLIC/i,
    );
  });
});

describe("#2250 CI step (criterion 11)", () => {
  const steps = () =>
    workflowJobs(loadWorkflowDocument(".github/workflows/ci-integration.yml"))
      .migrate?.steps ?? [];

  it(`'${STEP}' is the LAST migrate step (by name, after the reader-role step) with exactly this env and run`, () => {
    const all = steps();
    const i = all.findIndex((s) => s.name === STEP);
    expect(i).toBe(all.length - 1);
    expect(i).toBeGreaterThan(
      all.findIndex(
        (s) => s.name === "Verify document-cutover reader role (real stack)",
      ),
    );
    expect(all[i]).toEqual({
      name: STEP,
      env: { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" },
      run: "bun x vitest run realstack.acceptance",
    });
  });

  it("the filter cannot pass vacuously (no passWithNoTests)", () => {
    expect(JSON.stringify(steps()) + read("vitest.config.mts")).not.toMatch(
      /passWithNoTests/i,
    );
  });

  it("the real-stack suite fails (not skips) in the migrate job when the URL is empty", () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_JOB: "migrate",
    };
    env.TENANT_GUARD_IT_ADMIN_DATABASE_URL = env.VITEST = "";
    const r = spawnSync(
      process.execPath,
      ["node_modules/vitest/vitest.mjs", "run", REALSTACK],
      { env, encoding: "utf8" },
    );
    expect(r.status).toBe(1);
    expect(r.stdout + r.stderr).toContain("TENANT_GUARD_IT_ADMIN_DATABASE_URL");
  }, 120_000);
});

describe("#2250 docs (criteria 7, 11, 12, 14, 15, 17)", () => {
  it("12 (amended): docs/ci.md is byte-identical to develop c541b84b", () => {
    const bytes = readFileSync("docs/ci.md");
    const hash = createHash("sha256").update(bytes).digest("hex");
    expect(`${bytes.length} ${hash}`).toBe(CI_MD);
  });

  it.each(DOC_RULES)(`${DOC} covers %s`, (_label, re) =>
    expect(read(DOC)).toMatch(new RegExp(re, "i")),
  );
});
