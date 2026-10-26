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
/**
 * Migrations looked up by EXACT file name (never a glob or date prefix), each
 * asserted to exist, so other issues' migrations landing on develop cannot be
 * mistaken for these.
 */
const OWN_MIGRATION = "20261024150000_tenant_guard.sql";
const AUTHZ_FOUNDATION = "20260226113000_authz_memberships_foundation.sql";
/** Returns `name` after asserting supabase/migrations/<name> exists. */
const migration = (name: string) => {
  expect(existsSync(`${MIG}/${name}`), `${MIG}/${name} must exist`).toBe(true);
  return name;
};
const migFile = () => migration(OWN_MIGRATION);
const sql = () => read(`${MIG}/${migFile()}`);
const STEP_RUN = [
  "bun x vitest run",
  "tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2269/donations-embed.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2260/donor-feed-preferences.realstack.acceptance.test.ts",
].join(" ");
const STEP = "Verify tenant isolation (real stack)";
const REALSTACK =
  "tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts";
const DOC = "docs/security/tenant-guard.md";
/** docs/ci.md develop byte prefixes (issue-2180 CI_BASES shape, as #2254). */
const CI_BASES = [
  {
    ref: "c541b84b",
    bytes: 40058,
    sha256: "f636ef0f0127f1159db711fb005a212aaf0cb3c9ceb9fe64bb308305c55d4e4b",
  },
] as const;
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
  it(`2: supabase/migrations/${OWN_MIGRATION} exists after 20261021064500 with a -- Down: header`, () => {
    expect(migFile() > "20261021064500").toBe(true);
    expect(sql()).toMatch(/^-- Down:/m);
  });

  it("15: default EXECUTE is revoked from PUBLIC in schema tenant_guard (catalog cannot show this)", () => {
    expect(sql()).toMatch(
      /ALTER\s+DEFAULT\s+PRIVILEGES\s+IN\s+SCHEMA\s+tenant_guard\s+REVOKE\s+EXECUTE\s+ON\s+FUNCTIONS\s+FROM\s+PUBLIC/i,
    );
  });
  it(`9: authz.current_tenant_id() is still defined only by ${AUTHZ_FOUNDATION}`, () => {
    const def = /FUNCTION\s+authz\.current_tenant_id\s*\(/i;
    migration(OWN_MIGRATION);
    expect(read(`${MIG}/${migration(AUTHZ_FOUNDATION)}`)).toMatch(def);
    // All forward migrations: no later one (including #2250's) may redefine it.
    const defs = readdirSync(MIG)
      .filter((f) => /^\d{14}_.+\.sql$/.test(f))
      .filter((f) => def.test(read(`${MIG}/${f}`)));
    expect(defs).toEqual([AUTHZ_FOUNDATION]);
  });
});

describe("#2250 CI step (criterion 11)", () => {
  const steps = () =>
    workflowJobs(loadWorkflowDocument(".github/workflows/ci-integration.yml"))
      .migrate?.steps ?? [];

  it(`'${STEP}' is migrate step 16, immediately after #2254's step 15 (identity), with exactly this env and run`, () => {
    const all = steps();
    const i = all.findIndex((s) => s.name === STEP);
    // Exact index, not "last step": later spec'd steps (e.g. #2270's step 17)
    // may follow it.
    expect(i).toBe(16);
    expect(
      all.findIndex(
        (s) =>
          s.name ===
          "Verify identity email normalizer and donor keys (real stack)",
      ),
      "#2254's migrate step stays at index 15, immediately before",
    ).toBe(i - 1);
    expect(i).toBeGreaterThan(
      all.findIndex(
        (s) => s.name === "Verify document-cutover reader role (real stack)",
      ),
    );
    expect(all[i]).toEqual({
      name: STEP,
      env: { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" },
      run: STEP_RUN,
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
  it("12 (amended): docs/ci.md keeps develop's bytes as a prefix; anything after is not #2250's", () => {
    const bytes = readFileSync("docs/ci.md");
    const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");
    const base = CI_BASES.find(
      (b) => sha256(bytes.subarray(0, b.bytes)) === b.sha256,
    );
    expect(
      base?.ref,
      `existing docs/ci.md bytes unchanged (prefix of develop ${CI_BASES.map((b) => b.ref).join(" or ")})`,
    ).toBeDefined();
    const later = bytes.subarray(base!.bytes).toString("utf8");
    expect(
      /2250|tenant_guard|tenant[- ]isolation|tenant-guard\.md|withTenant/i.test(
        later,
      ),
      "bytes after the develop prefix (later develop appends only) must not document #2250",
    ).toBe(false);
  });

  it.each(DOC_RULES)(`${DOC} covers %s`, (_label, re) =>
    expect(read(DOC)).toMatch(new RegExp(re, "i")),
  );
});

describe("#2250 routed callers (criterion 10)", () => {
  it("claims.ts imports withTenant, makes no direct client.rpc(...work_claim...) call, and ReleaseWorkClaimInput has tenantId", () => {
    const src = read("packages/api/src/workflows/claims.ts");
    expect(src).toMatch(
      /import\s*\{[^}]*\bwithTenant\b[^}]*\}\s*from\s*["'][./]*identity(\/tenant-guard|\/index)?["']/,
    );
    expect(src).not.toMatch(/\bclient\s*\.\s*rpc\s*\(\s*["'`]\w*work_claim/);
    expect(src).toMatch(
      /interface ReleaseWorkClaimInput\s*\{[^}]*\btenantId\s*:\s*string/,
    );
  });

  it.each([
    "workflows/recovery",
    "workflows/adapters/inbound-email",
    "admin/support-hub/move-service",
  ])(
    "every releaseWorkClaim call in packages/api/src/%s.ts passes tenantId",
    (file) => {
      const calls = [
        ...read(`packages/api/src/${file}.ts`).matchAll(
          /releaseWorkClaim\(\s*[\w.]+\s*,\s*\{([^}]*)\}/g,
        ),
      ];
      expect(calls.length).toBeGreaterThan(0);
      for (const c of calls) expect(c[1]).toMatch(/\btenantId\b/);
    },
  );
});
