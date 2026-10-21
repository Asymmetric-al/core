import { describe, expect, it } from "vitest";

import {
  resolveCompilation,
  validateCiGate,
} from "../../../scripts/verify/ci-build-policy.mjs";
import {
  buildNeedResultsForGateJob,
  executeGateShellScript,
  findPrimaryShellGateStep,
  ifExpression,
  loadWorkflowJobs,
  needsList,
  substituteNeedsExpressions,
} from "../acceptance/issue-2158/workflow-yaml";

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
    ).toEqual(["admin", "donor", "missionary"]);
  });

  it("compiles all apps when their shared environment loader changes", () => {
    expect(
      resolveCompilation({
        ...development,
        changedFiles: ["scripts/load-workspace-env.mjs"],
      }),
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
      ).toEqual(["admin", "donor", "missionary"]);
    },
  );

  it("does not repeat compilation after development merges", () => {
    expect(
      resolveCompilation({
        event: "push",
        branch: "develop",
        changedFiles: ["bun.lock"],
      }),
    ).toEqual([]);
  });

  it.each([
    { event: "pull_request", baseBranch: "production" },
    { event: "push", branch: "production" },
    { event: "workflow_dispatch" },
    { ...development, full: true },
    { ...development, changedFiles: null },
  ])(
    "requires full compilation for release, explicit QA, or missing diff: %j",
    (context) => {
      expect(
        resolveCompilation({ changedFiles: ["docs/ci.md"], ...context }),
      ).toEqual(["admin", "donor", "missionary"]);
    },
  );
});

describe("required CI gate", () => {
  const results = {
    plan: "success",
    format: "success",
    integrity: "success",
    lint: "success",
    typecheck: "success",
    unit: "success",
  };

  it("accepts an intentional no-build result while keeping the gate present", () => {
    expect(
      validateCiGate({
        results: { ...results, build: "skipped" },
        buildRequested: false,
      }),
    ).toBe(true);
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
    "e2e-smoke-gate": ["test-e2e-smoke"],
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
      const run = (overrides: Record<string, string>): number => {
        const results = buildNeedResultsForGateJob(job, overrides);
        // Every expression must be rendered, so a bash "bad substitution"
        // can never masquerade as the gate rejecting a result.
        expect(substituteNeedsExpressions(script(), results)).not.toContain(
          "${{",
        );
        return executeGateShellScript(script(), results);
      };

      it("runs under if: always() and needs exactly its heavy jobs", () => {
        expect(job, `missing job ${gateId}`).toBeDefined();
        expect(ifExpression(job)).toContain("always()");
        expect([...needsList(job)].sort()).toEqual([...heavyNeeds].sort());
      });

      it("passes when every need succeeded", () => {
        expect(run({})).toBe(0);
      });

      for (const need of heavyNeeds) {
        it.each(NON_SUCCESS_RESULTS)(`rejects ${need} %s`, (result) => {
          expect(run({ [need]: result })).not.toBe(0);
        });
      }

      it("rejects when every heavy need was skipped (fork-PR shape)", () => {
        expect(
          run(Object.fromEntries(heavyNeeds.map((need) => [need, "skipped"]))),
        ).not.toBe(0);
      });
    });
  }
});
