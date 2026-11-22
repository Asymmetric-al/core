import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import * as W from "../helpers/workflow-yaml";

const WORKFLOW_PATH = ".github/workflows/ci-integration.yml";
const PACKAGE_JSON_PATH = "package.json";
const PLAYWRIGHT_CLI = path.join(
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);

function readWorkflow(): string {
  return readFileSync(WORKFLOW_PATH, "utf8");
}

function readPackageScripts(): Record<string, string> {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8")) as {
    scripts?: Record<string, string>;
  };

  return packageJson.scripts ?? {};
}

function jobBlock(workflow: string, jobId: string): string {
  const jobsStart = workflow.indexOf("jobs:\n");
  expect(jobsStart).toBeGreaterThanOrEqual(0);

  const jobsYaml = workflow.slice(jobsStart);
  const headers = [...jobsYaml.matchAll(/^  ([a-z0-9][a-z0-9-]*):/gm)];
  const index = headers.findIndex((match) => match[1] === jobId);
  expect(index).toBeGreaterThanOrEqual(0);

  const blockStart = headers[index].index!;
  const blockEnd =
    index + 1 < headers.length ? headers[index + 1].index! : jobsYaml.length;

  return jobsYaml.slice(blockStart, blockEnd);
}

function stepNames(jobYaml: string): string[] {
  return [...jobYaml.matchAll(/^      - name: (.+)$/gm)].map(
    (match) => match[1],
  );
}

function listPlaywrightTests(args: string[]): string {
  const result = spawnSync(
    process.execPath,
    [PLAYWRIGHT_CLI, "test", ...args, "--reporter=list"],
    {
      encoding: "utf8",
    },
  );
  const output = `${result.stdout}\n${result.stderr}`;

  expect(output).not.toContain("Error:");
  expect(result.status).toBe(0);

  return output;
}

// Check of the fix lists, JR12: a step that needs a server runs after an
// earlier failure only when that server answered its health check.
const ADMIN_READY =
  "if: ${{ !cancelled() && steps.admin-ready.outcome == 'success' }}";
const MISSIONARY_READY =
  "if: ${{ !cancelled() && steps.missionary-ready.outcome == 'success' }}";
const DONOR_READY =
  "if: ${{ !cancelled() && steps.donor-ready.outcome == 'success' }}";
const BOTH_READY =
  "if: ${{ !cancelled() && steps.donor-ready.outcome == 'success' && steps.admin-ready.outcome == 'success' }}";

describe("ci-integration workflow contract", () => {
  const workflow = readWorkflow();
  const scripts = readPackageScripts();

  it("runs the donation fee replay SQL proof after seeding in the required migration job", () => {
    const migrate = jobBlock(workflow, "migrate");
    expect(migrate).toContain(
      "tests/integration/supabase/donation-fee-replay-verification.sql",
    );
    expect(migrate.indexOf("Apply demo seed")).toBeLessThan(
      migrate.indexOf("Verify donation fee replay"),
    );
  });

  it("keeps develop merges gated by smoke while full E2E is continue-on-error on develop", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const testE2eSmoke = jobBlock(workflow, "test-e2e-smoke");
    const integrationGate = jobBlock(workflow, "integration-gate");
    const e2eSmokeGate = jobBlock(workflow, "e2e-smoke-gate");
    const e2eGate = jobBlock(workflow, "e2e-gate");

    // The required browser smoke applies its own migrations and seed and
    // starts its own servers, so it starts beside migrate (#2711); the gate
    // still needs and reads all three jobs.
    expect(testE2eSmoke).not.toMatch(/^\s+needs:/m);
    expect(testE2e).toContain("needs: [smoke, test-e2e-smoke]");
    expect(testE2e).toContain("fetch-depth: 0");
    expect(testE2eSmoke).toContain('E2E_AUTH_BYPASS: "true"');
    expect(testE2eSmoke).toContain('PLAYWRIGHT_REUSE_EXISTING_SERVER: "1"');
    expect(testE2eSmoke).toContain("run: bun run test:e2e:smoke");
    expect(testE2eSmoke).toContain('PLAYWRIGHT_INCLUDE_ADMIN: "1"');
    expect(testE2eSmoke).toContain("playwright-smoke-report");
    expect(testE2eSmoke).toContain("e2e-dev-server.sh");
    expect(testE2e).toContain("e2e-dev-server.sh");

    const smokeSteps = stepNames(testE2eSmoke);
    expect(smokeSteps).toContain("Start donor app");
    expect(smokeSteps).toContain("Start admin app");
    expect(smokeSteps).not.toContain("Build donor app (production)");

    const e2eSteps = stepNames(testE2e);
    expect(e2eSteps).toContain("Start donor app");
    expect(e2eSteps).toContain("Start admin app");
    expect(e2eSteps).toContain("Start missionary app");
    expect(e2eSteps).not.toContain(
      "Build production apps for e2e (sequential)",
    );
    expect(e2eSteps).not.toContain("Build donor app (production)");

    expect(testE2e).not.toContain("e2e-production-server.sh");
    expect(testE2e).not.toContain("build-all");
    expect(testE2e).not.toContain("ASYM_E2E_SERVER_MODE");
    expect(testE2e).not.toContain("next start");

    expect(testE2e).toContain(
      "continue-on-error: ${{ (github.event_name == 'pull_request' && github.base_ref == 'develop') || (github.event_name == 'push' && github.ref == 'refs/heads/develop') }}",
    );
    expect(testE2e).toContain(
      "NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co",
    );
    expect(testE2e).toContain(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY: example-anon-key",
    );
    expect(testE2e).toContain('ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1"');
    expect(testE2eSmoke).toContain('ASYM_E2E_REQUIRE_HERMETIC_SUPABASE: "1"');

    expect(integrationGate).toContain(
      "needs: [migrate, smoke, e2e-smoke-gate]",
    );
    expect(integrationGate).not.toContain("test-e2e");

    expect(e2eSmokeGate).toContain("needs: [migrate, smoke, test-e2e-smoke]");
    expect(e2eSmokeGate).toContain('!= "success"');

    expect(e2eGate).toContain("needs: [test-e2e, instant-nav]");
    expect(e2eGate).toContain("needs['instant-nav'].result");
    expect(e2eGate).toContain("github.base_ref == 'production'");
    expect(e2eGate).toContain("refs/heads/production");
    expect(e2eGate).not.toContain("develop");
  });

  it("runs test-e2e hermetically on placeholder Supabase with no hosted secrets for every event, including production PRs and pushes", () => {
    const jobs = W.workflowJobs(
      W.loadWorkflowDocument(WORKFLOW_PATH),
      WORKFLOW_PATH,
    );
    const job = jobs["test-e2e"]!;
    const okNeeds = Object.fromEntries(
      W.needsList(job).map((name) => [
        name,
        { result: "success", outputs: {} },
      ]),
    );
    const runningScenarios = W.EVENT_SCENARIOS.filter((scenario) =>
      W.evaluateIfCondition(
        W.ifExpression(job),
        W.scenarioContext(scenario, okNeeds),
      ),
    );
    const labels = runningScenarios.map((scenario) => scenario.label);
    expect(labels).toContain("pull_request same-repo -> production");
    expect(labels).toContain("push production");
    expect(labels).toContain("pull_request same-repo -> develop");
    expect(labels).toContain("push develop");
    expect(labels).toContain("workflow_dispatch production");

    const env = (job.env ?? {}) as Record<string, unknown>;
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("example-anon-key");
    expect(env.ASYM_E2E_REQUIRE_HERMETIC_SUPABASE).toBe("1");
    expect(env.E2E_AUTH_BYPASS).toBe("true");

    // No hosted Supabase or demo-credential secret reaches the job or any step.
    expect(W.jobLevelReferencesSecrets(job)).toBe(false);
    expect(W.firstSecretStepIndex(job)).toBe(-1);

    const hostedOnlyKeys = [
      "E2E_AUTH_SECRET",
      "E2E_AUTH_ALLOWED_SUPABASE_REFS",
      "DEMO_PASSWORD",
      "DEMO_ADMIN_EMAIL",
      "DEMO_MISSIONARY_EMAIL",
      "DEMO_DONOR_EMAIL",
    ];
    for (const key of hostedOnlyKeys) {
      expect(env).not.toHaveProperty(key);
    }

    // No conditional step mutates Supabase env by branch or event.
    for (const step of W.allSteps(job)) {
      expect(step.name).not.toBe(
        "Use placeholder Supabase for non-production E2E",
      );
      const stepEnv = (step.env ?? {}) as Record<string, unknown>;
      for (const key of [
        ...hostedOnlyKeys,
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "ASYM_E2E_REQUIRE_HERMETIC_SUPABASE",
      ]) {
        expect(stepEnv).not.toHaveProperty(key);
      }
      if (typeof step.run === "string") {
        expect(step.run).not.toMatch(
          /(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|ASYM_E2E_REQUIRE_HERMETIC_SUPABASE)=.*GITHUB_ENV/,
        );
      }
    }
  });

  // Council round 1, A14 (record D-18): the tenant-address specs carry every
  // acceptance line's end-to-end proof of the tenant in the page address, and
  // D-19's first condition; no workflow ran them. They run in the end-to-end
  // job, each after its app's dev server is ready. This workflow change was
  // allowed for this item only.
  it("runs both tenant-address specs in the end-to-end job, after their apps start", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const steps = stepNames(testE2e);
    for (const [app, wait] of [
      ["admin", "Wait for admin health endpoint"],
      ["missionary", "Wait for missionary health endpoint"],
    ] as const) {
      const step = `Tenant address (${app} app)`;
      expect(steps).toContain(step);
      expect(steps.indexOf(step)).toBeGreaterThan(steps.indexOf(wait));
      expect(testE2e).toContain(`run: bun run test:e2e:tenant-address:${app}`);
    }
    const scripts = (
      JSON.parse(readFileSync("package.json", "utf8")) as {
        scripts: Record<string, string>;
      }
    ).scripts;
    expect(scripts["test:e2e:tenant-address:admin"]).toContain(
      "-c playwright.admin.config.ts tests/e2e/admin-tenant-address.spec.ts --project=admin-boneyard",
    );
    expect(scripts["test:e2e:tenant-address:missionary"]).toContain(
      "-c playwright.missionary.config.ts tests/e2e/missionary-tenant-address.spec.ts --project=missionary-boneyard",
    );
    // Council round 2, AR9: no retries. Under CI the boneyard config retries
    // twice, and a race these specs exist to catch would pass as flaky.
    for (const app of ["admin", "missionary"]) {
      expect(scripts[`test:e2e:tenant-address:${app}`]).toMatch(
        /\s--retries=0(\s|$)/,
      );
    }
  });

  // Council round 1 on slice B, SB1 (record D-18): the request-scope specs
  // carry the end-to-end proof that every request a page makes names its
  // tenant and assignment. They run in the end-to-end job, as the
  // tenant-address specs do, on the servers the job already started: admin
  // and missionary right after their tenant-address step, donor right after
  // its boneyard smoke. This workflow change was allowed for that item only.
  it("runs the three request-scope specs in the end-to-end job, after their apps' own steps", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const steps = stepNames(testE2e);
    for (const [app, before] of [
      ["admin", "Tenant address (admin app)"],
      ["missionary", "Tenant address (missionary app)"],
      ["donor", "Boneyard smoke (donor app)"],
    ] as const) {
      const step = `Request scope (${app} app)`;
      expect(steps).toContain(step);
      expect(steps.indexOf(step)).toBe(steps.indexOf(before) + 1);
      expect(testE2e).toContain(`run: bun run test:e2e:request-scope:${app}`);
    }
    // One server start for each app: the specs use the job's servers.
    for (const app of ["donor", "admin", "missionary"]) {
      expect(steps.filter((name) => name === `Start ${app} app`)).toHaveLength(
        1,
      );
    }
    const scripts = (
      JSON.parse(readFileSync("package.json", "utf8")) as {
        scripts: Record<string, string>;
      }
    ).scripts;
    expect(scripts["test:e2e:request-scope:admin"]).toContain(
      "-c playwright.admin.config.ts tests/e2e/admin-request-scope.spec.ts --project=admin-boneyard",
    );
    expect(scripts["test:e2e:request-scope:missionary"]).toContain(
      "-c playwright.missionary.config.ts tests/e2e/missionary-request-scope.spec.ts --project=missionary-boneyard",
    );
    expect(scripts["test:e2e:request-scope:donor"]).toContain(
      "tests/e2e/donor-request-scope.spec.ts --project=chromium",
    );
    // No retries (council round 2, the coordinator's note on slice B): under
    // `CI` Playwright retries twice, so a race that fails once and then
    // passes would be reported as flaky and the step would pass, hiding the
    // races these specs exist to catch.
    for (const app of ["admin", "missionary", "donor"]) {
      expect(scripts[`test:e2e:request-scope:${app}`]).toMatch(
        / --retries=0(?: |$)/,
      );
    }
  });

  // Council round 2 (the coordinator's note on the joined tree, point 2): the
  // five steps AL-2675 adds are bounded by what they were measured to take,
  // and the job keeps its limit. Measured on 2026-11-19 by replaying the job
  // locally as CI runs it (dev servers, `CI=1`, the placeholder Supabase),
  // at load 4 to 15. The slowest of two runs for each step: tenant address
  // (admin) 305 s, request scope (admin) 112 s, tenant address (missionary)
  // 65 s, request scope (missionary) 10 s, request scope (donor) 60 s. The
  // same replay took 1.35 to 2.1 times as long as recent hosted runs for
  // the job's existing steps (production gate 426 s here against 248 to
  // 316 s hosted). So each limit is about twice the slowest local run or
  // more: 600 s against 305 s for the admin tenant-address step (1.97 times),
  // and 2.7 times or more for the other four. The five should add 5.5 to 7
  // minutes to a hosted job that took 8.5 to 11. The whole job took 21.3
  // minutes here, inside its 30.
  //
  // Council on the joined release, JB4 and JB5: measured again, on
  // 2026-11-19, by a replay of the whole job from a clean start on the joined
  // tree with this list's changes (a fresh database migrated and seeded, no
  // build caches, dev servers, `CI=1`, the placeholder Supabase), at load 18
  // to 26: database 61 s; production gate 919 s; tenant address (admin)
  // 211 s, request scope (admin, with two new cases) 151 s, tenant address
  // (missionary) 51 s, request scope (missionary) 9 s, request scope (donor)
  // 37 s; the CMS step 192 s without the Web Studio spec; the Web Studio
  // spec's own step 536 s (one case failing at 126 s; alone, on freshly
  // started servers, at load 13 to 21, it passed in 382 s). The test steps
  // took 2,367 s, 39.5 minutes, at that load. Limits: the Web Studio step
  // 18 minutes (twice its slowest run, which leaves room for a first case
  // hung to its own 360 s limit), the others as before (request scope
  // (admin) now 1.99 times its slowest run). The job keeps its 30, which
  // issue #2158's acceptance (spec rev 3) and the deployment-discipline test
  // pin: by the production gate's ratio here (919 s against 248 to 316 s
  // hosted), the test steps take about 14 minutes hosted, about 19 with the
  // setup steps, inside 30; a job that reaches its limit now still uploads
  // its evidence (the upload runs on cancellation).
  it("points donor CMS reads at the admin server started by test-e2e", () => {
    const job = jobBlock(workflow, "test-e2e");
    const port = job.match(/e2e-dev-server\.sh admin start (\d+)/)?.[1];
    expect(port).toBeDefined();
    expect(job.split("    steps:\n")[0]).toContain(
      `      CMS_BASE_URL: "http://127.0.0.1:${port}"\n`,
    );
  });

  it("bounds the AL-2675 steps by their measured times, inside the job's limit", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    // D-18: #2734 took 23m16s on GitHub; leave headroom without extending any step.
    expect(testE2e).toMatch(/^ {4}timeout-minutes: 35$/m);
    const stepBlock = (name: string) => {
      const start = testE2e.indexOf(`      - name: ${name}\n`);
      expect(start).toBeGreaterThanOrEqual(0);
      const next = testE2e.indexOf("      - name: ", start + 1);
      return testE2e.slice(start, next === -1 ? undefined : next);
    };
    for (const [step, minutes] of [
      ["Tenant address (admin app)", 10],
      ["Request scope (admin app)", 5],
      ["Tenant address (missionary app)", 5],
      ["Request scope (missionary app)", 5],
      ["Request scope (donor app)", 5],
      ["Web Studio tenant (admin app)", 20],
    ] as const) {
      expect(stepBlock(step), step).toMatch(
        new RegExp(`^ {8}timeout-minutes: ${minutes}$`, "m"),
      );
    }
  });

  // Council round 2 on slice B, BR3 and BR4. Each of this program's five
  // steps runs whatever an earlier step did (only a cancelled run skips it),
  // so the job always reports on them; a spec whose server never started
  // still fails. And each writes its evidence to folders of its own: the
  // admin and missionary specs pass `--output` (their surface configs write
  // a list report only, to one folder per project, which each run empties),
  // and the donor step runs the default config with its own report folder
  // (whose HTML report and output folder would otherwise be all of
  // `playwright-report/` and `test-results/`) and without the admin server.
  it("runs the AL-2675 steps after an earlier failure, each writing to folders of its own", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const stepBlock = (name: string) => {
      const start = testE2e.indexOf(`      - name: ${name}\n`);
      expect(start, name).toBeGreaterThanOrEqual(0);
      const next = testE2e.indexOf("      - name: ", start + 1);
      return testE2e.slice(start, next === -1 ? undefined : next);
    };
    const folders = new Map<string, string>();
    for (const [step, script, output, condition] of [
      [
        "Tenant address (admin app)",
        "test:e2e:tenant-address:admin",
        "test-results/tenant-address-admin",
        ADMIN_READY,
      ],
      [
        "Request scope (admin app)",
        "test:e2e:request-scope:admin",
        "test-results/request-scope-admin",
        ADMIN_READY,
      ],
      [
        "Tenant address (missionary app)",
        "test:e2e:tenant-address:missionary",
        "test-results/tenant-address-missionary",
        MISSIONARY_READY,
      ],
      [
        "Request scope (missionary app)",
        "test:e2e:request-scope:missionary",
        "test-results/request-scope-missionary",
        MISSIONARY_READY,
      ],
    ] as const) {
      expect(stepBlock(step), step).toContain(condition);
      expect(scripts[script], script).toContain(` --output=${output}`);
      folders.set(output, step);
    }

    // Council on the joined release, JB4: Web Studio's spec is a step of its
    // own with the same rules; it runs the default config, so its report
    // folder names its output folder too, and its script says so.
    const webStudio = stepBlock("Web Studio tenant (admin app)");
    expect(webStudio).toContain(BOTH_READY);
    expect(webStudio).toContain(
      'PLAYWRIGHT_REPORT_DIR: "playwright-report/web-studio-tenant"',
    );
    expect(scripts["test:e2e:web-studio-tenant"]).toContain(
      " --output=test-results/web-studio-tenant",
    );
    folders.set(
      "test-results/web-studio-tenant",
      "Web Studio tenant (admin app)",
    );

    const donor = stepBlock("Request scope (donor app)");
    expect(donor).toContain(DONOR_READY);
    expect(donor).toContain(
      'PLAYWRIGHT_REPORT_DIR: "playwright-report/request-scope-donor"',
    );
    expect(donor).toContain('PLAYWRIGHT_INCLUDE_ADMIN: "0"');
    // The default config's output folder follows the report folder's name.
    folders.set(
      "test-results/request-scope-donor",
      "Request scope (donor app)",
    );

    // No two steps of the job share an output or report folder.
    const reportDirs = [
      ...testE2e.matchAll(/PLAYWRIGHT_REPORT_DIR: "([^"]+)"/g),
    ].map((match) => match[1]!);
    expect(new Set(reportDirs).size).toBe(reportDirs.length);
    for (const reportDir of reportDirs) {
      const output = `test-results/${reportDir.split("/").pop()}`;
      // The two default-config steps own the output folder their report
      // folder names.
      if (
        output === "test-results/request-scope-donor" ||
        output === "test-results/web-studio-tenant"
      ) {
        continue;
      }
      expect(folders.has(output), output).toBe(false);
    }
    for (const project of ["admin-boneyard", "missionary-boneyard"]) {
      expect(folders.has(`test-results/${project}`)).toBe(false);
    }
  });

  it("keeps auth, production, and CMS run artifacts distinct with retry diagnostics", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    expect(testE2e).toContain(
      'PLAYWRIGHT_REPORT_DIR: "playwright-report/auth-preflight"',
    );
    expect(testE2e).toContain(
      'PLAYWRIGHT_REPORT_DIR: "playwright-report/production-gate"',
    );
    expect(testE2e).toContain('PLAYWRIGHT_REPORT_DIR: "playwright-report/cms"');
    const upload = testE2e.slice(
      testE2e.indexOf("name: Upload artifact on failure"),
    );
    expect(upload).toContain("playwright-report/");
    expect(upload).toContain("test-results/");
    // Council on the joined release, JB5: also on cancellation. GitHub
    // cancels a job that reaches its timeout-minutes ("The maximum number of
    // minutes to let a job run before GitHub automatically cancels it",
    // workflow syntax), and failure() is true only "when any previous step of
    // a job fails" (expressions, status check functions), so a job cut off
    // at its limit would otherwise lose its evidence.
    expect(upload).toContain("if: ${{ failure() || cancelled() }}");
    expect(testE2e).toContain("timeout-minutes: 10");
  });

  // Council on the joined release, JB4: Web Studio's browser spec holds four
  // acceptance lines and race cases, so it runs as the program's other specs
  // do: a step of its own, after the CMS step (which has compiled Web
  // Studio's views), with no retries, and the CMS step no longer runs it.
  it("runs the Web Studio tenant spec as a step of its own, with no retries", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const steps = stepNames(testE2e);
    const step = "Web Studio tenant (admin app)";
    expect(steps.indexOf(step)).toBe(
      steps.indexOf("Run Playwright CMS E2E") + 1,
    );
    expect(testE2e).toContain("run: bun run test:e2e:web-studio-tenant");
    const own = scripts["test:e2e:web-studio-tenant"]!;
    expect(own).toContain(" tests/e2e/cms-web-studio-tenant.spec.ts ");
    expect(own).toMatch(/ --retries=0(?: |$)/);
    expect(own).toContain(' --grep "@cms" --grep-invert "@manual|@cms-local"');
    // Playwright matches --grep against the file name too, so the CMS step's
    // own selection leaves this file out.
    expect(scripts["test:e2e:cms"]).toContain(
      '--grep-invert "@manual|@cms-local|cms-web-studio-tenant\\.spec"',
    );
  });

  // Check of the fix lists, JR12. The Web Studio step counts on the CMS step
  // to have compiled Web Studio's views, so the two run on one condition: an
  // earlier failure skips neither, and the Web Studio step never runs cold.
  // Each server's health check is the step every later step of that server
  // waits on.
  it("guards each step that needs a server on that server's health check, and runs the CMS and Web Studio steps on one condition", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    const stepBlock = (name: string) => {
      const start = testE2e.indexOf(`      - name: ${name}
`);
      expect(start, name).toBeGreaterThanOrEqual(0);
      const next = testE2e.indexOf("      - name: ", start + 1);
      return testE2e.slice(start, next === -1 ? undefined : next);
    };
    for (const [step, id] of [
      ["Wait for donor health endpoint", "donor-ready"],
      ["Wait for admin health endpoint", "admin-ready"],
      ["Wait for missionary health endpoint", "missionary-ready"],
    ] as const) {
      expect(stepBlock(step), step).toContain(`id: ${id}
`);
    }
    expect(stepBlock("Run Playwright CMS E2E")).toContain(BOTH_READY);
    expect(stepBlock("Web Studio tenant (admin app)")).toContain(BOTH_READY);
  });

  // JR12: the CMS step's selection leaves the Web Studio spec out, shown by
  // listing what it runs, not by reading its pattern; the Web Studio step's
  // own selection lists it.
  it("leaves the Web Studio tenant spec out of the CMS step, by listing", () => {
    const cms = listPlaywrightTests([
      "--grep",
      "@cms",
      "--grep-invert",
      "@manual|@cms-local|cms-web-studio-tenant\.spec",
      "--project=chromium",
      "--list",
    ]);
    expect(cms).toContain("@cms");
    expect(cms).not.toContain("cms-web-studio-tenant.spec.ts");
    const own = listPlaywrightTests([
      "tests/e2e/cms-web-studio-tenant.spec.ts",
      "--project=chromium",
      "--grep",
      "@cms",
      "--grep-invert",
      "@manual|@cms-local",
      "--list",
    ]);
    expect(own).toContain("cms-web-studio-tenant.spec.ts");
  }, 60_000);

  // Council on the joined release, JB5: the missionary steps run after an
  // earlier failure, so the server they use must be started then too, or
  // they would fail for its absence and not for their behaviour.
  it("starts the missionary app after an earlier failure, for the steps that use it", () => {
    const testE2e = jobBlock(workflow, "test-e2e");
    for (const name of [
      "Start missionary app",
      "Wait for missionary health endpoint",
    ]) {
      const start = testE2e.indexOf(`      - name: ${name}\n`);
      expect(start, name).toBeGreaterThanOrEqual(0);
      const next = testE2e.indexOf("      - name: ", start + 1);
      expect(testE2e.slice(start, next), name).toContain(
        "if: ${{ !cancelled() }}",
      );
    }
  });

  it("keeps instant navigation deterministic and production-gated", () => {
    const instantNav = jobBlock(workflow, "instant-nav");
    const e2eGate = jobBlock(workflow, "e2e-gate");

    expect(instantNav).toContain("--retries=0");
    expect(instantNav).toContain("bun run build:donor");
    expect(instantNav).toContain("apps/donor start");
    expect(e2eGate).toContain("needs: [test-e2e, instant-nav]");
    expect(e2eGate).toContain("needs['instant-nav'].result");
  });

  it("does not require the broad chromium inventory in CI integration", () => {
    expect(workflow).not.toContain("run: bun run test:e2e --project=chromium");
  });

  it("installs Playwright before dev smoke servers and proves demo auth", () => {
    const testE2eSmoke = jobBlock(workflow, "test-e2e-smoke");
    const installAt = testE2eSmoke.indexOf("name: Install Playwright Chromium");
    const startDonorAt = testE2eSmoke.indexOf("name: Start donor app");
    const waitDonorAt = testE2eSmoke.indexOf(
      "name: Wait for donor health endpoint",
    );
    const startAdminAt = testE2eSmoke.indexOf("name: Start admin app");

    expect(installAt).toBeGreaterThanOrEqual(0);
    expect(startDonorAt).toBeGreaterThan(installAt);
    expect(waitDonorAt).toBeGreaterThan(startDonorAt);
    expect(startAdminAt).toBeGreaterThan(waitDonorAt);
    expect(testE2eSmoke).toContain("/api/auth/demo-account");
  });

  it("keeps the blocking smoke job on the shared Bun install contract", () => {
    const smoke = jobBlock(workflow, "smoke");
    const testE2eSmoke = jobBlock(workflow, "test-e2e-smoke");

    expect(smoke).toContain("e2e-dev-server.sh donor start 3005");
    expect(smoke).not.toContain("Build donor app (production)");
    expect(testE2eSmoke).toContain("bun-version: ${{ env.BUN_VERSION }}");
    expect(testE2eSmoke).toContain("run: bun ci --no-cache --backend=copyfile");
    expect(testE2eSmoke).not.toContain('bun-version: "1.3.4"');
    expect(testE2eSmoke).not.toContain("bun install --frozen-lockfile");
  });

  it("runs the resolved smoke inventory under projects that include each file", () => {
    expect(scripts["test:e2e:smoke"]).toContain("--project=chromium");
    expect(scripts["test:e2e:smoke"]).toContain("--project=chromium-donor");

    const chromiumSmoke = listPlaywrightTests([
      "tests/e2e/demo-auth-preflight.spec.ts",
      "tests/e2e/usability-smoke.spec.ts",
      "tests/e2e/donate.spec.ts",
      "tests/e2e/support-hub.smoke.spec.ts",
      "--project=chromium",
      "--workers=1",
      "--list",
    ]);
    expect(chromiumSmoke).toContain("support-hub.smoke.spec.ts");
    expect(chromiumSmoke).not.toContain("upload-crop.spec.ts");

    const donorSmoke = listPlaywrightTests([
      "tests/e2e/upload-crop.spec.ts",
      "--project=chromium-donor",
      "--workers=1",
      "--list",
    ]);
    expect(donorSmoke).toContain("[chromium-donor]");
    expect(donorSmoke).toContain("upload-crop.spec.ts");
  }, 60_000);

  it("can collect the admin table pages smoke spec for CMS E2E", () => {
    const listed = listPlaywrightTests([
      "tests/e2e/admin-table-pages-smoke.spec.ts",
      "--project=chromium",
      "--workers=1",
      "--list",
    ]);
    expect(listed).toContain("admin-table-pages-smoke.spec.ts");
    expect(listed).toContain("CRM Notes");
    expect(listed).not.toContain("CRM Projections");
    expect(listed).not.toContain("Cannot find module");
  }, 60_000);
});
