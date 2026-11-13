import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  BUILD_APPS,
  COMPILATION_APPS,
  OPERATOR_BUILD_APPS,
  parseBuildSelection,
  readWorkspaceDependencyDirs,
  resolveCompilation,
  validateCiGate,
} from "../../../scripts/verify/ci-build-policy.mjs";
import { NEXT_APPS } from "../../../scripts/verify/ci-build.mjs";
import {
  EVENT_SCENARIOS,
  buildNeedResultsForGateJob,
  evaluateIfCondition,
  executeGateJob,
  findPrimaryShellGateStep,
  ifExpression,
  isAlwaysExpression,
  loadWorkflowJobs,
  needsList,
  renderStepText,
  scenarioContext,
  type EventScenario,
  type WorkflowJob,
} from "../helpers/workflow-yaml";

describe("development compilation policy", () => {
  const development = { event: "pull_request", baseBranch: "develop" };

  it("keeps routine code and documentation PRs off full compilation", () => {
    expect(
      resolveCompilation({
        ...development,
        changedFiles: [
          "apps/donor/app/page.tsx",
          "docs/ci.md",
          "tooling/typescript-config/README.md",
        ],
      }),
    ).toEqual([]);
  });

  it("compiles the affected app for app build configuration changes", () => {
    expect(
      resolveCompilation({
        ...development,
        changedFiles: ["apps/donor/next.config.ts"],
      }),
    ).toEqual(["donor"]);
  });

  it("compiles all apps for workspace dependency changes", () => {
    expect(
      resolveCompilation({ ...development, changedFiles: ["bun.lock"] }),
    ).toEqual(["admin", "donor", "missionary", "factory-console"]);
  });

  it("requests every app, including the operator Console, when the compiling workflow ci.yml changes", () => {
    expect(
      resolveCompilation({
        ...development,
        changedFiles: [".github/workflows/ci.yml"],
      }),
    ).toEqual(["admin", "donor", "missionary", "factory-console"]);
  });

  it.each(["ci-integration.yml", "qa-smoke-preview-deploy.yml"])(
    "requests the three product apps when product workflow %s changes",
    (workflow) => {
      expect(
        resolveCompilation({
          ...development,
          changedFiles: [`.github/workflows/${workflow}`],
        }),
      ).toEqual(["admin", "donor", "missionary"]);
    },
  );

  it("compiles all apps when their shared environment loader changes", () => {
    expect(
      resolveCompilation({
        ...development,
        changedFiles: ["scripts/load-workspace-env.mjs"],
      }),
    ).toEqual(["admin", "donor", "missionary"]);
  });

  it.each([
    "scripts/repair-workspace-links.mjs",
    "scripts/verify/ci-build.mjs",
    "scripts/verify/ci-build-policy.mjs",
  ])("compiles all apps when the compilation dispatch %s changes", (file) => {
    expect(
      resolveCompilation({ ...development, changedFiles: [file] }),
    ).toEqual(["admin", "donor", "missionary", "factory-console"]);
  });

  it.each([
    ".vercelignore",
    "scripts/vercel/should-ignore-build.mjs",
    // Imported only by the product apps' next.config.ts.
    "scripts/resolve-monorepo-root.mjs",
  ])("keeps the operator Console out of product-only input %s", (file) => {
    expect(
      resolveCompilation({ ...development, changedFiles: [file] }),
    ).toEqual(["admin", "donor", "missionary"]);
  });

  it.each([
    "vendor/react-pdf-packages/asym-pdf-editor-0.1.0.tgz",
    "vendor/react-pdf-packages/asym-pdf-editor/dist/index.mjs",
  ])("compiles all apps when a consumed PDF artifact changes: %s", (file) => {
    expect(
      resolveCompilation({ ...development, changedFiles: [file] }),
    ).toEqual(["admin", "donor", "missionary"]);
  });

  it.each(["base.json", "nextjs.json", "react.json"])(
    "compiles all apps for shared TypeScript configuration: %s",
    (file) => {
      expect(
        resolveCompilation({
          ...development,
          changedFiles: [`tooling/typescript-config/${file}`],
        }),
      ).toEqual(["admin", "donor", "missionary", "factory-console"]);
    },
  );

  it("does not repeat compilation after development merges", () => {
    expect(
      resolveCompilation({
        event: "push",
        branch: "develop",
        changedFiles: ["bun.lock", "apps/factory-console/src/app/page.tsx"],
      }),
    ).toEqual([]);
  });

  it.each([
    { event: "pull_request", baseBranch: "production" },
    { event: "push", branch: "production" },
    { event: "workflow_dispatch" },
    { event: "merge_group" },
    { ...development, full: true },
  ])(
    "requires full product compilation for release, merge queue or explicit QA: %j",
    (context) => {
      expect(
        resolveCompilation({ changedFiles: ["docs/ci.md"], ...context }),
      ).toEqual(["admin", "donor", "missionary"]);
    },
  );

  it("compiles every app, including the operator Console, when a development diff is missing", () => {
    expect(resolveCompilation({ ...development, changedFiles: null })).toEqual([
      "admin",
      "donor",
      "missionary",
      "factory-console",
    ]);
  });
});

describe("operator Console compilation policy", () => {
  const development = { event: "pull_request", baseBranch: "develop" };

  it("is a compilation target outside the product release set", () => {
    expect(BUILD_APPS).toEqual(["admin", "donor", "missionary"]);
    expect(OPERATOR_BUILD_APPS).toEqual(["factory-console"]);
    expect(COMPILATION_APPS).toEqual([...BUILD_APPS, ...OPERATOR_BUILD_APPS]);
  });

  it.each([
    "apps/factory-console/src/app/page.tsx",
    "apps/factory-console/src/server/control.ts",
    "apps/factory-console/next.config.ts",
    "apps/factory-console/package.json",
  ])(
    "compiles the Console, unlike a product app, for an ordinary change to its own file %s",
    (file) => {
      expect(
        resolveCompilation({ ...development, changedFiles: [file] }),
      ).toEqual(["factory-console"]);
    },
  );

  it.each([
    "packages/ui/components/shadcn/button-component.tsx",
    "packages/lib/src/index.ts",
    "packages/env/src/index.ts",
    "packages/database/src/index.ts",
    "packages/auth/src/index.ts",
  ])(
    "compiles only the Console when %s, in its workspace dependency graph, changes",
    (file) => {
      expect(
        resolveCompilation({ ...development, changedFiles: [file] }),
      ).toEqual(["factory-console"]);
    },
  );

  it("adds the Console to product compilation for a shared package's build configuration", () => {
    expect(
      resolveCompilation({
        ...development,
        changedFiles: ["packages/ui/package.json"],
      }),
    ).toEqual(["admin", "donor", "missionary", "factory-console"]);
  });

  it.each([
    // `next build` no longer runs ESLint (Next.js 16), so lint rules cannot
    // change the Console's compiled output.
    "tooling/eslint-config/design-system.mjs",
    "packages/api/src/index.ts",
    "packages/missionary/src/index.ts",
    "packages/eve-runtime/src/index.ts",
    "apps/admin/app/page.tsx",
    "apps/missionary/next.config.ts",
    "docs/guides/architecture/runtime-map.md",
    "scripts/load-workspace-env.mjs",
    "vendor/react-pdf-packages/asym-pdf-editor-0.1.0.tgz",
  ])("does not compile the Console for unrelated input %s", (file) => {
    expect(
      resolveCompilation({ ...development, changedFiles: [file] }),
    ).not.toContain("factory-console");
  });

  it("keeps product selection unchanged alongside a Console change", () => {
    expect(
      resolveCompilation({
        ...development,
        changedFiles: [
          "apps/donor/next.config.ts",
          "apps/factory-console/src/app/page.tsx",
        ],
      }),
    ).toEqual(["donor", "factory-console"]);
  });

  it("adds a changed Console to an explicit full local preflight", () => {
    expect(
      resolveCompilation({
        ...development,
        full: true,
        changedFiles: ["apps/factory-console/src/app/page.tsx"],
      }),
    ).toEqual(["admin", "donor", "missionary", "factory-console"]);
  });

  it.each([
    { event: "pull_request", baseBranch: "production" },
    { event: "push", branch: "production" },
    { event: "workflow_dispatch" },
    { event: "merge_group" },
  ])(
    "keeps the Console out of product release and merge-queue compilation: %j",
    (context) => {
      expect(
        resolveCompilation({
          changedFiles: ["apps/factory-console/src/app/page.tsx"],
          ...context,
        }),
      ).toEqual(["admin", "donor", "missionary"]);
    },
  );

  it("derives the Console's inputs from the workspace packages it depends on", () => {
    expect(readWorkspaceDependencyDirs("apps/factory-console")).toEqual([
      "packages/auth",
      "packages/database",
      "packages/env",
      "packages/lib",
      "packages/ui",
    ]);
  });

  it("accepts only known compilation targets for the CI build step", () => {
    expect(parseBuildSelection('["factory-console"]')).toEqual([
      "factory-console",
    ]);
    expect(parseBuildSelection('["admin","factory-console"]')).toEqual([
      "admin",
      "factory-console",
    ]);
    for (const invalid of ["[]", '["unknown"]', '"admin"', "{}", "not json"])
      expect(() => parseBuildSelection(invalid)).toThrow(
        "Invalid compilation app selection",
      );
  });

  it("gives every compilation target a root build script and a ci-build entry", () => {
    const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
    expect(NEXT_APPS.map((app: { id: string }) => app.id)).toEqual(
      COMPILATION_APPS,
    );
    for (const app of COMPILATION_APPS)
      expect(scripts[`build:${app}`]).toBe(
        `node scripts/verify/ci-build.mjs --app ${app}`,
      );
  });
});

describe("required CI gate", () => {
  const results = {
    plan: "success",
    format: "success",
    integrity: "success",
    lint: "success",
    typecheck: "success",
    unit: "success",
    acceptance: "success",
  };

  it("accepts an intentional no-build result while keeping the gate present", () => {
    expect(
      validateCiGate({
        results: { ...results, build: "skipped" },
        buildRequested: false,
      }),
    ).toBe(true);
  });

  it.each([undefined, null, "", "true", "false", "invalid"])(
    "rejects missing or invalid compilation planning data %j even after a successful build",
    (buildRequested) => {
      expect(
        validateCiGate({
          results: { ...results, build: "success" },
          buildRequested,
        }),
      ).toBe(false);
    },
  );

  it.each(["", "invalid", "TRUE", "FALSE"])(
    "the executed gate rejects invalid requested output %j with otherwise successful needs",
    (requested) => {
      const job = loadWorkflowJobs(".github/workflows/ci.yml")["ci-gate"]!;
      const execution = executeGateJob(
        job,
        {
          results: buildNeedResultsForGateJob(job),
          outputs: { "compilation-plan": { requested } },
        },
        EVENT_SCENARIOS.find((scenario) => !scenario.fork)!,
      );
      expect(execution.jobRan).toBe(true);
      expect(execution.status).not.toBe(0);
    },
  );

  it("the policy CLI rejects an absent requested output after otherwise successful needs", () => {
    const execution = spawnSync(
      process.execPath,
      ["scripts/verify/ci-build-policy.mjs", "--gate"],
      {
        env: {
          PATH: process.env.PATH,
          CI_RESULTS: JSON.stringify({ ...results, build: "success" }),
        },
      },
    );
    expect(execution.status).toBe(1);
  });

  it.each(["failure", "cancelled", "skipped"])(
    "rejects a %s requested build",
    (build) => {
      expect(
        validateCiGate({
          results: { ...results, build },
          buildRequested: true,
        }),
      ).toBe(false);
    },
  );

  it("rejects a failed plan or correctness check even when compilation is optional", () => {
    for (const key of Object.keys(results)) {
      expect(
        validateCiGate({
          results: { ...results, [key]: "failure", build: "skipped" },
          buildRequested: false,
        }),
      ).toBe(false);
    }
  });

  it.each(["skipped", "failure", "cancelled", "neutral", ""])(
    "rejects acceptance %j with or without a build (#2153)",
    (acceptance) => {
      for (const [build, buildRequested] of [
        ["success", true],
        ["skipped", false],
      ] as const) {
        expect(
          validateCiGate({
            results: { ...results, acceptance, build },
            buildRequested,
          }),
        ).toBe(false);
      }
    },
  );

  it("rejects results without an acceptance key (#2153)", () => {
    const { acceptance: _acceptance, ...withoutAcceptance } = results;
    expect(
      validateCiGate({
        results: { ...withoutAcceptance, build: "success" },
        buildRequested: true,
      }),
    ).toBe(false);
  });
});

const NON_SUCCESS_RESULTS = ["skipped", "cancelled", "failure"] as const;

describe("required CI gate rejects a non-success unit result (#2158 criterion 12)", () => {
  const results = {
    plan: "success",
    format: "success",
    integrity: "success",
    lint: "success",
    typecheck: "success",
    unit: "success",
    build: "success",
    acceptance: "success",
  };

  it("accepts all-success results as the control case", () => {
    expect(validateCiGate({ results, buildRequested: true })).toBe(true);
  });

  it.each(NON_SUCCESS_RESULTS)(
    "rejects unit %s when compilation was requested",
    (unit) => {
      expect(
        validateCiGate({ results: { ...results, unit }, buildRequested: true }),
      ).toBe(false);
    },
  );

  it.each(NON_SUCCESS_RESULTS)(
    "rejects unit %s even when compilation was not requested",
    (unit) => {
      expect(
        validateCiGate({
          results: { ...results, unit, build: "skipped" },
          buildRequested: false,
        }),
      ).toBe(false);
    },
  );

  it("rejects the fork-PR shape where guard G skipped both unit and build", () => {
    for (const buildRequested of [true, false]) {
      expect(
        validateCiGate({
          results: { ...results, unit: "skipped", build: "skipped" },
          buildRequested,
        }),
      ).toBe(false);
    }
  });
});

describe("ci-integration hosted gates require success from each heavy need (#2158 criterion 12)", () => {
  const jobs = loadWorkflowJobs(".github/workflows/ci-integration.yml");
  const GATES = {
    "e2e-smoke-gate": ["migrate", "smoke", "test-e2e-smoke"],
    "integration-gate": ["migrate", "smoke", "e2e-smoke-gate"],
  } as const;

  for (const [gateId, heavyNeeds] of Object.entries(GATES)) {
    describe(gateId, () => {
      const job = jobs[gateId];
      const script = (): string => {
        const step = findPrimaryShellGateStep(job);
        expect(step?.run, `${gateId} gate step`).toBeTruthy();
        return step!.run!;
      };
      const run = (overrides: Record<string, string>) =>
        runGate(job, script(), overrides, EVENT_SCENARIOS);

      it("runs under if: always() and needs exactly its heavy jobs", () => {
        expect(job, `missing job ${gateId}`).toBeDefined();
        expect(isAlwaysExpression(ifExpression(job))).toBe(true);
        expect([...needsList(job)].sort()).toEqual([...heavyNeeds].sort());
      });

      it("passes when every need succeeded, for every modeled event", () => {
        expect(run({})).toEqual(EVENT_SCENARIOS.map(() => 0));
      });

      for (const need of heavyNeeds) {
        it.each(NON_SUCCESS_RESULTS)(
          `rejects ${need} %s for every modeled event`,
          (result) => {
            expect(run({ [need]: result })).not.toContain(0);
          },
        );
      }

      it("rejects when every heavy need was skipped (fork-PR shape)", () => {
        expect(
          run(Object.fromEntries(heavyNeeds.map((need) => [need, "skipped"]))),
        ).not.toContain(0);
      });
    });
  }
});

describe("ci-integration e2e-gate requires success from test-e2e and instant-nav on production", () => {
  const jobs = loadWorkflowJobs(".github/workflows/ci-integration.yml");
  const job = jobs["e2e-gate"]!;
  const heavyNeeds = ["test-e2e", "instant-nav"] as const;
  const productionEvents = EVENT_SCENARIOS.filter((scenario) =>
    evaluateIfCondition(
      ifExpression(job),
      scenarioContext(scenario, {
        "test-e2e": { result: "failure", outputs: {} },
        "instant-nav": { result: "failure", outputs: {} },
      }),
    ),
  );
  const run = (overrides: Record<string, string>) => {
    const step = findPrimaryShellGateStep(job);
    expect(step?.run, "e2e-gate gate step").toBeTruthy();
    return runGate(job, step!.run!, overrides, productionEvents);
  };

  it("runs under always() for exactly the production pull_request and push events", () => {
    expect(productionEvents.map((scenario) => scenario.label)).toEqual([
      "pull_request fork -> production",
      "pull_request same-repo -> production",
      "push production",
      "pull_request fork -> production [values B]",
      "pull_request same-repo -> production [values B]",
    ]);
    expect([...needsList(job)].sort()).toEqual([...heavyNeeds].sort());
  });

  it("passes when every need succeeded", () => {
    expect(run({})).toEqual(productionEvents.map(() => 0));
  });

  for (const need of heavyNeeds) {
    it.each(NON_SUCCESS_RESULTS)(`rejects ${need} %s`, (result) => {
      expect(run({ [need]: result })).not.toContain(0);
    });
  }
});

/**
 * Model the whole gate job (job if, step if, continue-on-error, real shell)
 * for each event and return the job's workflow-level status per event.
 */
function runGate(
  job: WorkflowJob,
  script: string,
  overrides: Record<string, string>,
  scenarios: readonly EventScenario[],
): number[] {
  const results = buildNeedResultsForGateJob(job, overrides);
  // Every expression must be rendered, so a bash "bad substitution"
  // can never masquerade as the gate rejecting a result.
  expect(renderStepText(script, { results })).not.toContain("${{");
  return scenarios.map((scenario) => {
    const execution = executeGateJob(job, { results }, scenario);
    expect(execution.jobRan, `${scenario.label}: gate job ran`).toBe(true);
    return execution.status;
  });
}
