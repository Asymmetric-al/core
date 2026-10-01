import { describe, expect, it } from "vitest";

import {
  resolveCompilation,
  validateCiGate,
} from "../../../scripts/verify/ci-build-policy.mjs";

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
