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
  "tests/unit/acceptance/issue-2256/person-anchor.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2260/donor-feed-preferences.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2258/current-user-assignments.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2312/public-reads.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2402/crm-table-preferences.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2364/missionaries-reads.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2406/profiles-storage.realstack.acceptance.test.ts",
  "tests/unit/acceptance/issue-2407/editor-images.realstack.acceptance.test.ts",
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
  {
    // Reviewed hosted-only amendment changes only the CI-doc terminal pointer.
    ref: "AL-2218 hosted CI baseline",
    bytes: 40204,
    sha256: "8a5c648f445c05f600b568a754e9b5caa84c969c8e3747bac4b941d3508a40ed",
  },
  {
    // #2215: only the `test-e2e` bullet's e2e-gate merge_group skip cause changes.
    ref: "#2215 e2e-gate merge_group wording",
    bytes: 40426,
    sha256: "b3522e382167e183488bae59835785bde27aa4f7a1bef28fad6b99b5eecea544",
  },
  {
    // Amended by AL-2674 (WP1 slice 1.3, plan 7.1): docs/ci.md documents the
    // release workflow, the preview database job and the two new migrate
    // steps (an Overview paragraph, the production release guard, the migrate
    // section, a "Release workflow" section and the development checkpoints
    // line), and its field-policy paragraph describes the classification
    // manifest that replaced the AL-491 census. Pinned on that exact reviewed
    // content. The whole file, so nothing follows it.
    ref: "AL-2674 release workflow",
    bytes: 44177,
    sha256: "97278ee9a0648442ac26f152b01acc8c16ae96f9478e5d7f4bdab556dc076118",
  },
  {
    // Amended by AL-2674 (WP1.2 joined): docs/ci.md's Node line follows
    // .node-version to 24.22.3, its migrate real-stack bullet describes the
    // three AL-2674 steps (the program-wide suite glob, the release and CMS
    // role suites, the Payload qualification), its migrate summary names the
    // seed-count check and supabase/seed-expectations.json, and its release
    // section names PAYLOAD_MIGRATION_DATABASE_URI. Pinned on that exact
    // reviewed whole file, so nothing follows it.
    ref: "AL-2674 Node 24.22.3 and program steps",
    bytes: 45088,
    sha256: "6cb39ed32ae6b0a6e7a57bb7b62ad8e6bf179086703cb32f9b4f6bb42d3a4ada",
  },
  {
    // Amended by AL-2673 (council round 2, B4 and its follow-up): docs/ci.md
    // gains one section, "Local Supabase stack workflow", after the release
    // workflow section. It documents `.github/workflows/local-supabase.yml`,
    // which applies the chain and the seed to the real Supabase image and runs
    // the auth email round trips, a workflow of its own so that ci.yml and
    // ci-integration.yml do not change. Nothing else in the file changes.
    // Pinned on that exact reviewed whole file.
    ref: "AL-2673 local Supabase stack workflow",
    bytes: 46788,
    sha256: "b83d66c4b3ccfc91c2ba86c7118eebff6e9e1b5fafcf748ad9996b1a4a3e006b",
  },
  {
    // Amended by AL-2674 (WP1.6, record D-18): docs/ci.md's "Local Supabase
    // stack workflow" section gains one bullet, and its count of what it
    // guards goes from two to three. The workflow now also replays the chain
    // on plain Postgres as the release job does (`--hosted-defaults`) and
    // fails unless that replay fingerprints exactly as the stack does, so a
    // change of Supabase's default privileges fails a pull request rather
    // than a release. Nothing else in the file changes.
    // Pinned on that exact reviewed whole file.
    ref: "AL-2674 WP1.6 release replay against the image",
    bytes: 47141,
    sha256: "a1e298892caec8406bdeef31e41814f9532bf3527e2d77436104d052d1d4ad37",
  },
  {
    // Amended by AL-2674 (WP1.6 review H7, record D-18): the WP1.6 bullet of
    // docs/ci.md's "Local Supabase stack workflow" section no longer says
    // that a change of Supabase's default privileges fails a pull request
    // rather than a release. It says the job compares with the image the
    // pinned CLI starts, not with hosted, and that the release's gates catch
    // a change on hosted. Nothing else in the file changes. Pinned on that exact reviewed whole file.
    ref: "AL-2674 WP1.6 review H7, the drift guard's limits",
    bytes: 47190,
    sha256: "74852f931758754843fbd50e41d432fbd40375f06f002c99f3524417f2b8782e",
  },
  // D-18: WP2H documents the proof dependencies, including its Vitest config and resolver plugins.
  // This pin accepts only the reviewed file bytes, as before.
  {
    ref: "AL-2675 WP2H PostgREST proof paths",
    bytes: 47791,
    sha256: "bac3dc897167173b05ea29aca95ac25f4bd64f675f22780c71aeba1821b6a5b6",
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
