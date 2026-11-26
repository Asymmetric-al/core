/**
 * The semantic real-stack step check (#2706) must be at least as hard to get
 * past as the exact `run:` strings it replaced: a required real-database step
 * cannot be skipped, made non-blocking, or made to pass while its tests fail.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  expectRealstackStep,
  ONE_FILE_AT_A_TIME,
  migrateJob,
  migrateSteps,
  realstackStepProblems,
  stepTestPaths,
} from "./realstack-step";

import {
  loadWorkflowJobs,
  type WorkflowStep,
} from "../../helpers/workflow-yaml";

const A = "tests/unit/acceptance";
const F2250 = `${A}/issue-2250/tenant-guard.realstack.acceptance.test.ts`;
const F2260 = `${A}/issue-2260/donor-feed-preferences.realstack.acceptance.test.ts`;
const F2364 = `${A}/issue-2364/missionaries-reads.realstack.acceptance.test.ts`;
const STEP = "Verify tenant isolation (real stack)";
const ENV = { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" };
const RUN = `bun x vitest run ${F2250} ${F2364}`;

/** A `migrate` job's steps with the real-stack step written as `run`. */
const stepsWith = (
  run: string,
  extra: Partial<WorkflowStep> = {},
): WorkflowStep[] => [
  { name: "Reject fork pull requests", run: "exit 1" },
  {
    name: "Apply migrations",
    run: "node scripts/verify/supabase-migrations.mjs",
  },
  { name: STEP, env: { ...ENV }, run, ...extra },
];

const problems = (run: string, extra?: Partial<WorkflowStep>) =>
  realstackStepProblems(stepsWith(run, extra), STEP, [F2364], ENV);

describe("realstackStepProblems (fixtures)", () => {
  it("a sound step has no problems, including a block scalar's newline or Bash line continuation", () => {
    expect(problems(RUN)).toEqual([]);
    expect(problems(`${RUN}\n`)).toEqual([]);
    expect(problems(`bun x vitest run \\\n  ${F2250} \\\n  ${F2364}`)).toEqual(
      [],
    );
    // Bash removes backslash-newline without adding a separator, so adjacent
    // paths become one argument and must be rejected.
    expect(problems(`bun x vitest run ${F2250}\\\n${F2364}`)).toContainEqual(
      expect.stringMatching(/not a plain test path|does not exist/),
    );
  });

  describe("kept from #2706", () => {
    it.each<[string, () => string[]]>([
      [
        "the file is not on the run line",
        () => problems(`bun x vitest run ${F2250}`),
      ],
      ["continue-on-error", () => problems(RUN, { "continue-on-error": true })],
      [
        "continue-on-error: false still counts",
        () => problems(RUN, { "continue-on-error": false }),
      ],
      ["an if", () => problems(RUN, { if: "github.event_name == 'push'" })],
      ["a different command", () => problems(`bunx vitest run ${F2364}`)],
      [
        "a wrong env value",
        () =>
          problems(RUN, {
            env: { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "postgres://elsewhere" },
          }),
      ],
      ["a missing env", () => problems(RUN, { env: {} })],
    ])("rejects %s", (_label, run) => {
      expect(run()).not.toEqual([]);
    });

    it("rejects a step before Apply migrations or a weakened Apply migrations step", () => {
      const [fork, apply, step] = stepsWith(RUN);
      expect(
        realstackStepProblems([fork!, step!, apply!], STEP, [F2364], ENV),
      ).toEqual([expect.stringMatching(/before Apply migrations/)]);
      expect(
        realstackStepProblems(
          [fork!, { ...apply!, run: "echo skipped" }, step!],
          STEP,
          [F2364],
          ENV,
        ),
      ).toEqual([expect.stringMatching(/Apply migrations: does not run/)]);
      expect(
        realstackStepProblems(
          [fork!, { ...apply!, "continue-on-error": true }, step!],
          STEP,
          [F2364],
          ENV,
        ),
      ).toEqual([
        expect.stringMatching(/Apply migrations: sets continue-on-error/),
      ]);
    });

    it("rejects a duplicated or missing step", () => {
      const steps = stepsWith(RUN);
      expect(
        realstackStepProblems([...steps, steps[2]!], STEP, [F2364]),
      ).toEqual([expect.stringMatching(/exactly one/)]);
      expect(realstackStepProblems(steps, "Verify nothing", [F2364])).toEqual([
        expect.stringMatching(/exactly one/),
      ]);
    });
  });

  describe("the run line holds only the command and plain test paths", () => {
    it.each([
      `${RUN} || true`,
      `${RUN} || true # flaky`,
      `(${RUN} || true)`,
      `${RUN} || echo failed`,
      `${RUN} || /bin/true`,
      `${RUN}; true`,
      `${RUN} || true; echo ok`,
      `set +e\n${RUN}`,
      `${RUN}\nexit 0`,
      `${RUN} && echo ok`,
      `${RUN} 2>&1 | tee realstack.log`,
      `${RUN} --passWithNoTests`,
      `${RUN} $EXTRA_FILES`,
      `${RUN} "${A}/issue-2406/profiles-storage.realstack.acceptance.test.ts"`,
    ])("rejects %j", (run) => {
      expect(problems(run)).toContainEqual(
        expect.stringMatching(/not a plain test path/),
      );
    });

    it("rejects a test path that does not exist (vitest would skip it)", () => {
      const missing = `${A}/issue-9999/missing.realstack.acceptance.test.ts`;
      expect(problems(`${RUN} ${missing}`)).toEqual([
        expect.stringMatching(/issue-9999.*does not exist/),
      ]);
    });

    it("rejects a step that names no test file", () => {
      expect(
        realstackStepProblems(stepsWith("bun x vitest run"), STEP, []),
      ).toEqual([expect.stringMatching(/names no test file/)]);
    });

    // #2716 review: Bash runs each line as its own command, so a path on a
    // later line is not a vitest argument.
    it.each([`bun x vitest run\n${F2364}`, `${RUN}\n${F2250}`])(
      "rejects a run spread over lines: %j",
      (run) => {
        expect(problems(run)).toContainEqual(
          expect.stringMatching(/run spans several lines/),
        );
      },
    );
  });

  // #2716 review: keys other than name, env and run change how the run line
  // executes (its shell, its directory) without changing the line itself.
  describe("the step carries nothing but name, env and run", () => {
    it.each<[string, Partial<WorkflowStep>, RegExp]>([
      ["a shell template", { shell: "bash {0} || true" }, /sets 'shell'/],
      [
        "a working directory",
        { "working-directory": "apps/admin" },
        /sets 'working-directory'/,
      ],
      ["a timeout", { "timeout-minutes": 1 }, /sets 'timeout-minutes'/],
    ])("rejects %s", (_label, extra, message) => {
      expect(problems(RUN, extra)).toEqual([expect.stringMatching(message)]);
    });

    it("rejects a step-level DATABASE_URL, which redirects the job's migrated database", () => {
      expect(
        problems(RUN, {
          env: { ...ENV, DATABASE_URL: "postgres://elsewhere" },
        }),
      ).toEqual([expect.stringMatching(/sets DATABASE_URL/)]);
    });

    it("allows DATABASE_URL when the caller expects that exact value", () => {
      const env = { DATABASE_URL: "${{ env.DATABASE_URL }}" };
      expect(
        realstackStepProblems(stepsWith(RUN, { env }), STEP, [F2364], env),
      ).toEqual([]);
    });
  });

  // #2714 runs its program's suites with one Bash glob. Bash expands it to
  // the matching files before vitest starts, so each match is a test path.
  describe("a Bash glob on the run line", () => {
    const GLOB = `${A}/issue-22[56]0/*.realstack.acceptance.test.ts`;
    const globProblems = (run: string, files: readonly string[]) =>
      realstackStepProblems(stepsWith(run), STEP, files, ENV);

    it("counts each file the glob matches as run", () => {
      expect(globProblems(`bun x vitest run ${GLOB}`, [F2250, F2260])).toEqual(
        [],
      );
      expect(
        stepTestPaths({ run: `bun x vitest run ${GLOB} ${F2364}` }),
      ).toEqual([F2250, F2260, F2364]);
    });

    it("rejects a glob that does not match an expected file", () => {
      expect(globProblems(`bun x vitest run ${GLOB}`, [F2364])).toEqual([
        expect.stringMatching(/does not run .*issue-2364/),
      ]);
    });

    it("rejects a glob that matches no file (Bash would pass it on as text)", () => {
      expect(
        globProblems(
          `bun x vitest run ${A}/issue-99[0-9]9/*.realstack.acceptance.test.ts`,
          [],
        ),
      ).toEqual([expect.stringMatching(/matches no file/)]);
    });

    it("rejects a glob that matches a file that is not a test", () => {
      expect(
        globProblems(`bun x vitest run ${A}/shared/realstack-step.*`, []),
      ).toEqual([expect.stringMatching(/realstack-step\.ts, not a test path/)]);
    });

    it.each([
      `bun x vitest run ${A}/issue-{2250,2260}/*.realstack.acceptance.test.ts`,
      `bun x vitest run ${A}/issue-22[56]0/*.realstack.acceptance.test.ts || true`,
      `bun x vitest run ${A}/issue-22[5/*.realstack.acceptance.test.ts`,
      `bun x vitest run "${GLOB}"`,
    ])("rejects %j", (run) => {
      expect(globProblems(run, [])).toContainEqual(
        expect.stringMatching(/not a plain test path/),
      );
    });

    it("finds no test paths in a step that does not run vitest", () => {
      expect(stepTestPaths({ run: `node scripts/x.mjs ${F2250}` })).toEqual([]);
    });
  });

  describe("a step that runs its files one at a time", () => {
    const SERIAL = `bun x vitest run ${ONE_FILE_AT_A_TIME} ${F2250} ${F2364}`;
    const serialProblems = (run: string, extra?: Partial<WorkflowStep>) =>
      realstackStepProblems(stepsWith(run, extra), STEP, [F2364], ENV, {
        oneFileAtATime: true,
      });

    it("accepts the flag right after the command and counts the paths after it", () => {
      expect(serialProblems(SERIAL)).toEqual([]);
      expect(problems(SERIAL)).toEqual([]);
      expect(stepTestPaths({ run: SERIAL })).toEqual([F2250, F2364]);
    });

    it("rejects a step that went back to running its files in parallel", () => {
      expect(serialProblems(RUN)).toEqual([
        expect.stringMatching(
          /does not start with 'bun x vitest run --no-file-parallelism', so its files run in parallel/,
        ),
      ]);
    });

    it.each([
      `${RUN} ${ONE_FILE_AT_A_TIME}`,
      `bun x vitest run ${ONE_FILE_AT_A_TIME} ${ONE_FILE_AT_A_TIME} ${F2364}`,
      `bun x vitest run ${ONE_FILE_AT_A_TIME} --file-parallelism ${F2364}`,
      `bun x vitest run ${ONE_FILE_AT_A_TIME} --maxWorkers=4 ${F2364}`,
      `bun x vitest run --maxWorkers=1 ${F2250} ${F2364}`,
    ])("rejects %j", (run) => {
      expect(serialProblems(run)).toContainEqual(
        expect.stringMatching(/not a plain test path/),
      );
    });

    it("rejects VITEST_MAX_WORKERS on the step, which overrides the flag", () => {
      expect(
        serialProblems(SERIAL, { env: { ...ENV, VITEST_MAX_WORKERS: "4" } }),
      ).toEqual([expect.stringMatching(/sets VITEST_MAX_WORKERS/)]);
    });
  });
});

/**
 * Every real-database test file, by name. Each skips without its database
 * URL, so dropping one from CI would pass silently.
 */
const REAL_DATABASE_FILES = [
  ...[
    "issue-2067/reader-role.integration",
    "issue-2250/tenant-guard.realstack",
    "issue-2251/rls-posture.realstack",
    "issue-2252/donor-spine-fk.realstack",
    "issue-2253/rls-catalog-gate.realstack",
    "issue-2254/identity.realstack",
    "issue-2255/claim-tables.realstack",
    "issue-2256/person-anchor.realstack",
    "issue-2258/current-user-assignments.realstack",
    "issue-2260/donor-feed-preferences.realstack",
    "issue-2269/donations-embed.realstack",
    "issue-2270/authz-execute-grants.realstack",
    "issue-2312/public-reads.realstack",
    "issue-2364/missionaries-reads.realstack",
    "issue-2402/crm-table-preferences.realstack",
    "issue-2406/profiles-storage.realstack",
    "issue-2407/editor-images.realstack",
    // #2714 (AL-2671 stage 1): run by the program step's glob.
    "issue-2672/role-change-command.realstack",
    "issue-2672/staged-gift-allocations.realstack",
    "issue-2674/catalog-gate.realstack",
    "issue-2674/command-lane.realstack",
    "issue-2674/privileges-manifest.realstack",
    "issue-2675/capability-parity.realstack",
    "issue-2675/eve-actor-membership.realstack",
    "issue-2675/membership-core.realstack",
    "issue-2675/membership-role-commands.realstack",
    "issue-2675/missionary-handler-authority.realstack",
    "issue-2675/organization-names.realstack",
    "issue-2675/platform-operator-script.realstack",
    "issue-2675/platform-operators.realstack",
    "issue-2675/post-comment-authors.realstack",
    "issue-2675/request-scope-headers.realstack",
    "issue-2675/request-tenant-order.realstack",
    "issue-2675/tenant-policy-migration.realstack",
    "issue-2675/web-studio-document-locks.realstack",
    "issue-2675/web-studio-selection.realstack",
    "issue-2676/caller-assignment-request-organization.realstack",
    "issue-2676/claimed-names.realstack",
    "issue-2676/command-request-organization.realstack",
    "issue-2676/giving-targets.realstack",
    "issue-2676/home-name.realstack",
    "issue-2676/membership-invitations-commands.realstack",
    "issue-2676/membership-invitations-table.realstack",
    "issue-2676/money-embeds.realstack",
    "issue-2676/role-change-concurrency.realstack",
    "issue-2676/site-commands.realstack",
    "issue-2676/site-settings.realstack",
    "issue-2676/tenant-provisioning.realstack",
    "issue-2676/tenant-status-rollback.realstack",
    "issue-2676/tenant-status.realstack",
    "issue-2677/command-boundaries.realstack",
    "issue-2677/command-log.realstack",
    "issue-2677/crm-directory.realstack",
    "issue-2677/crm-merge-candidates-drop.realstack",
    "issue-2677/crm-note-command.realstack",
    "issue-2677/crm-query-paths.realstack",
    "issue-2677/crm-read-grants.realstack",
    "issue-2677/demo-care-grant.realstack",
    "issue-2677/export-audit.realstack",
    "issue-2677/field-policy-reader.realstack",
    "issue-2678/account-claims.realstack",
    "issue-2678/assignment-keys.realstack",
    "issue-2678/backfill.realstack",
    "issue-2678/external-identifiers.realstack",
    "issue-2678/identity-spine.realstack",
    "issue-2678/own-row-policies.realstack",
    "issue-2678/supporter-redaction.realstack",
    "issue-2678/tenant-keys.realstack",
    "issue-2678/worker-names.realstack",
    "issue-2678/worker-record.realstack",
    "issue-2678/worker-safety.realstack",
    "issue-2677/member-care-commands.realstack",
    "issue-2679/media-custody.realstack",
    "issue-2681/wp8a-part1.realstack",
    "issue-2681/wp8a-p2r1a-intake.realstack",
    "issue-2681/wp8a-p2r1a-legacy.realstack",
    "issue-2681/wp8a-p2r1a-machine-claims.realstack",
    "issue-2681/wp8a-p2r1a-machine-guards.realstack",
    "issue-2681/wp8a-p2r1a-machine-reports.realstack",
    "issue-2681/wp8a-p2r1a-machine-sessions.realstack",
    "issue-2681/wp8a-p2r1a-record-checks.realstack",
    "issue-2681/wp8a-p2r1a-record-fence.realstack",
    "issue-2681/wp8a-p2r1a-record-params.realstack",
    "issue-2681/wp8a-p2r1b-worker.realstack",
    "issue-2681/wp8a-p2r2a-apply-match.realstack",
    "issue-2681/wp8a-p2r2a-apply-order.realstack",
    "issue-2681/wp8a-p2r2a-enqueue.realstack",
    "issue-2681/wp8a-p2r2a-fences.realstack",
    "issue-2681/wp8a-p2r2a-live.realstack",
    "issue-2681/wp8a-p2r2a-schema.realstack",
    "issue-2681/wp8a-p2r2a-sessions.realstack",
    "issue-2681/wp8a-p2r2a-staging.realstack",
  ].map((f) => `${A}/${f}.acceptance.test.ts`),
  // #2714: the release job's database suites and Payload's CMS roles.
  "tests/unit/cms/cms-database-roles.realstack.test.ts",
  "tests/unit/scripts/release/release-database.realstack.test.ts",
  "tests/unit/scripts/release/schema-fingerprint.realstack.test.ts",
];

/** A real-database test by its name: `*.realstack.*` or `*.integration.acceptance.*`. */
const REAL_DATABASE_NAME =
  /\.(?:realstack(?:\.acceptance)?|integration\.acceptance)\.test\.tsx?$/;

/** Real-database test files on disk, so a new one cannot go unwired. */
const discovered = (): string[] =>
  readdirSync("tests/unit", { recursive: true, encoding: "utf8" })
    .map((f) => `tests/unit/${f.split(path.sep).join("/")}`)
    .filter((f) => REAL_DATABASE_NAME.test(f))
    .sort();

/** Read relative test modules, including harness re-exports, once per suite. */
const withLocalImports = (
  file: string,
  seen = new Set<string>(),
): { file: string; text: string }[] => {
  const normalized = path.normalize(file);
  if (seen.has(normalized)) return [];
  seen.add(normalized);
  const text = readFileSync(file, "utf8");
  const local = [...text.matchAll(/\bfrom\s+["'](\.\.?\/[^"']+)["']/g)]
    .map((match) => path.join(path.dirname(file), `${match[1]!}.ts`))
    .filter(
      (target) =>
        target.startsWith(`tests${path.sep}unit${path.sep}`) &&
        existsSync(target),
    );
  return [
    { file, text },
    ...local.flatMap((target) => withLocalImports(target, seen)),
  ];
};

/** The database URL inputs read by one suite or helper module. */
const readDatabaseUrlVariables = (
  text: string,
  file = "fixture.ts",
): string[] => {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);
  const variables: string[] = [];

  const visit = (node: ts.Node): void => {
    ts.forEachChild(node, visit);
    if (
      !ts.isPropertyAccessExpression(node) &&
      !ts.isElementAccessExpression(node)
    ) {
      return;
    }

    const env = node.expression;
    if (
      !ts.isPropertyAccessExpression(env) ||
      env.name.text !== "env" ||
      !ts.isIdentifier(env.expression) ||
      env.expression.text !== "process"
    ) {
      return;
    }

    let name: string | undefined;
    if (ts.isPropertyAccessExpression(node)) name = node.name.text;
    else if (ts.isStringLiteralLike(node.argumentExpression)) {
      name = node.argumentExpression.text;
    }
    if (name && /^[A-Z_]*DATABASE_URL$/.test(name)) variables.push(name);
  };

  visit(source);
  return variables;
};

const databaseUrlVariables = (file: string): string[] => [
  ...new Set(
    withLocalImports(file).flatMap(({ file, text }) =>
      readDatabaseUrlVariables(text, file),
    ),
  ),
];

describe("database URL inputs", () => {
  it.each([
    "process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL",
    'process.env["TENANT_GUARD_IT_ADMIN_DATABASE_URL"]',
    "process.env['TENANT_GUARD_IT_ADMIN_DATABASE_URL']",
  ])("recognizes %s", (source) => {
    expect(readDatabaseUrlVariables(source)).toEqual([
      "TENANT_GUARD_IT_ADMIN_DATABASE_URL",
    ]);
  });

  it.each([
    "// Do not use process.env.LEGACY_DATABASE_URL here.",
    '/* Avoid process.env["LEGACY_DATABASE_URL"]. */',
    'const example = "process.env.LEGACY_DATABASE_URL";',
    `const example = 'process.env["LEGACY_DATABASE_URL"]';`,
    "const example = `process.env.LEGACY_DATABASE_URL`;",
    "process.env[DYNAMIC_DATABASE_URL];",
    "other.process.env.LEGACY_DATABASE_URL;",
  ])("ignores %s", (source) => {
    expect(readDatabaseUrlVariables(source)).toEqual([]);
  });

  it("recognizes a read inside a template substitution", () => {
    expect(readDatabaseUrlVariables("`${process.env.DATABASE_URL}`")).toEqual([
      "DATABASE_URL",
    ]);
  });

  it("ignores unrelated variables and longer names", () => {
    expect(
      readDatabaseUrlVariables(`
        process.env.API_URL;
        process.env.DATABASE_URL_BACKUP;
        process.env["DATABASE_URL_BACKUP"];
      `),
    ).toEqual([]);
  });
});

describe("every real-database test file runs in a blocking migrate step (#2706)", () => {
  it("the named files are exactly the real-database files on disk", () => {
    expect(discovered()).toEqual([...REAL_DATABASE_FILES].sort());
  });

  it.each(REAL_DATABASE_FILES)("%s", (file) => {
    const steps = migrateSteps();
    const running = steps.filter((s) => stepTestPaths(s).includes(file));
    expect(
      running.map((s) => s.name),
      "migrate steps that run it",
    ).toHaveLength(1);
    const variables = databaseUrlVariables(file);
    expect(variables, "the database URL variables it reads").not.toHaveLength(
      0,
    );
    // DATABASE_URL comes from the job. Each other input comes from the step
    // and must point at the same migrated database.
    const env = Object.fromEntries(
      variables
        .filter((variable) => variable !== "DATABASE_URL")
        .map((variable) => [variable, "${{ env.DATABASE_URL }}"]),
    );
    expect(
      realstackStepProblems(steps, running[0]!.name!, [file], env),
    ).toEqual([]);
    const jobEnv = migrateJob()?.env as Record<string, unknown> | undefined;
    expect(jobEnv?.DATABASE_URL, "migrate job sets DATABASE_URL").toEqual(
      expect.stringMatching(/\S/),
    );
  });
});

describe("required PostgREST suites run on the local Supabase stack (#2706)", () => {
  const job = loadWorkflowJobs(".github/workflows/local-supabase.yml")[
    "local-supabase"
  ];
  it.each([
    "issue-2674/app-health",
    "issue-2675/missionary-handler-authority",
    "issue-2676/membership-invitations",
    "issue-2676/sites",
    "issue-2676/tenant-records",
    "issue-2677/crm-reads",
    "issue-2677/demo-care-person",
    "issue-2677/field-policy-reader",
    "issue-2677/member-care",
    "issue-2679/media-storage",
  ])("runs %s in a blocking step", (suite) => {
    const file = `${A}/${suite}.postgrest.acceptance.test.ts`;
    const runs = job?.steps?.filter((step) =>
      step.run
        ?.split("\n")
        .some(
          (line) =>
            line.startsWith("bunx vitest run --maxWorkers=1 ") &&
            line.split(" ").includes(file),
        ),
    );
    expect(runs).toHaveLength(1);
    expect(runs![0]).not.toHaveProperty("if");
    expect(runs![0]).not.toHaveProperty("continue-on-error");
  });
});

describe("#2714's real-stack steps (AL-2671 stage 1)", () => {
  const MIGRATED = "${{ env.DATABASE_URL }}";
  it("the program step runs every issue-2670..2689 real-stack suite, one file at a time", () => {
    expectRealstackStep(
      "Verify AL-2671 program suites, issues 2670-2689 (real stack)",
      REAL_DATABASE_FILES.filter((f) => /\/issue-26[78]\d\//.test(f)),
      { TENANT_GUARD_IT_ADMIN_DATABASE_URL: MIGRATED },
      { oneFileAtATime: true },
    );
  });
  it("the release step runs the release database and CMS role suites", () => {
    expectRealstackStep(
      "Verify release job database steps, schema fingerprint and CMS roles (real stack)",
      REAL_DATABASE_FILES.filter((f) => !f.startsWith(`${A}/`)),
      {
        RELEASE_IT_ADMIN_DATABASE_URL: MIGRATED,
        TENANT_GUARD_IT_ADMIN_DATABASE_URL: MIGRATED,
      },
    );
  });
});
