/**
 * The semantic real-stack step check (#2706) must be at least as hard to get
 * past as the exact `run:` strings it replaced: a required real-database step
 * cannot be skipped, made non-blocking, or made to pass while its tests fail.
 */
import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  migrateJob,
  migrateSteps,
  realstackStepProblems,
  runWords,
} from "./realstack-step";

import type { WorkflowStep } from "../../helpers/workflow-yaml";

const A = "tests/unit/acceptance";
const F2250 = `${A}/issue-2250/tenant-guard.realstack.acceptance.test.ts`;
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
  it("a sound step has no problems, including a block scalar's newline", () => {
    expect(problems(RUN)).toEqual([]);
    expect(problems(`${RUN}\n`)).toEqual([]);
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

    it("rejects a step before Apply migrations", () => {
      const [fork, apply, step] = stepsWith(RUN);
      expect(
        realstackStepProblems([fork!, step!, apply!], STEP, [F2364], ENV),
      ).toEqual([expect.stringMatching(/before Apply migrations/)]);
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
});

/**
 * Every real-database acceptance file, by name. Each skips without its
 * database URL, so dropping one from CI would pass silently.
 */
const REAL_DATABASE_FILES = [
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
].map((f) => `${A}/${f}.acceptance.test.ts`);

/** Real-database acceptance files on disk, so a new one cannot go unwired. */
const discovered = (): string[] =>
  readdirSync(A, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      readdirSync(`${A}/${d.name}`)
        .filter((f) =>
          /\.(?:realstack|integration)\.acceptance\.test\.tsx?$/.test(f),
        )
        .map((f) => `${A}/${d.name}/${f}`),
    )
    .sort();

/** The `process.env.*DATABASE_URL` a real-database file needs to run at all. */
const databaseUrlVariable = (file: string): string[] => [
  ...new Set(
    [
      ...readFileSync(file, "utf8").matchAll(
        /process\.env\.([A-Z_]*DATABASE_URL)\b/g,
      ),
    ].map((m) => m[1]!),
  ),
];

describe("every real-database acceptance file runs in a blocking migrate step (#2706)", () => {
  it("the named files are exactly the real-database files on disk", () => {
    expect(discovered()).toEqual([...REAL_DATABASE_FILES].sort());
  });

  it.each(REAL_DATABASE_FILES)("%s", (file) => {
    const steps = migrateSteps();
    const running = steps.filter((s) => runWords(s).includes(file));
    expect(
      running.map((s) => s.name),
      "migrate steps that run it",
    ).toHaveLength(1);
    const variables = databaseUrlVariable(file);
    expect(variables, "the database URL variable it reads").toHaveLength(1);
    const [variable] = variables;
    // DATABASE_URL comes from the job; any other variable from the step,
    // pointing at the migrated database.
    const env =
      variable === "DATABASE_URL"
        ? undefined
        : { [variable!]: "${{ env.DATABASE_URL }}" };
    expect(
      realstackStepProblems(steps, running[0]!.name!, [file], env),
    ).toEqual([]);
    const jobEnv = migrateJob()?.env as Record<string, unknown> | undefined;
    expect(jobEnv?.DATABASE_URL, "migrate job sets DATABASE_URL").toEqual(
      expect.stringMatching(/\S/),
    );
  });
});
