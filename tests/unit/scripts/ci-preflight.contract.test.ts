import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { getPreflightStages } from "../../../scripts/verify/ci-preflight.mjs";

const PREFLIGHT_PATH = "scripts/verify/ci-preflight.mjs";

const EXPECTED_STAGES: Array<{ id: string; script: string }> = [
  { id: "format", script: "format:check" },
  { id: "skills-verify", script: "skills:verify" },
  { id: "verify-phase25-spec", script: "verify:phase25-spec" },
  { id: "openspec-validate", script: "openspec:validate" },
  { id: "verify-openspec-deltas", script: "verify:openspec-deltas" },
  { id: "lint", script: "lint" },
  { id: "verify-data-boundary", script: "verify:data-boundary" },
  {
    id: "verify-cms-public-sole-entry",
    script: "verify:cms-public-sole-entry",
  },
  { id: "verify-workspace-contract", script: "verify:workspace-contract" },
  { id: "verify-bun-lock-drift", script: "verify:bun-lock-drift" },
  { id: "verify-eslint", script: "verify:eslint" },
  { id: "verify-shadcn-config", script: "verify:shadcn-config" },
  { id: "verify-shadcn-diff", script: "verify:shadcn-diff" },
  { id: "verify-shadscan", script: "verify:shadscan" },
  { id: "typecheck", script: "typecheck" },
  { id: "build", script: "build" },
  { id: "test-unit", script: "test:unit" },
];

function parsePreflightStages(
  source: string,
): Array<{ id: string; script: string }> {
  const stages: Array<{ id: string; script: string }> = [];

  for (const match of source.matchAll(
    /\{\s*id:\s*"([^"]+)",\s*script:\s*"([^"]+)"/g,
  )) {
    stages.push({ id: match[1], script: match[2] });
  }

  return stages;
}

function integritySteps() {
  const lines = readFileSync(".github/workflows/ci.yml", "utf8").split(/\r?\n/);
  const start = lines.indexOf("  integrity:");
  expect(start).toBeGreaterThanOrEqual(0);
  const end = lines.findIndex(
    (line, index) => index > start && /^  \S[^:]*:\s*$/.test(line),
  );
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join("\n")
    .split(/^      - /m)
    .slice(1);
}

describe("ci-preflight contract", () => {
  const source = readFileSync(PREFLIGHT_PATH, "utf8");
  const stages = parsePreflightStages(source);

  it("omits compilation for routine development feedback while retaining correctness stages", () => {
    const selected = getPreflightStages({
      branch: "feature/example",
      changedFiles: ["apps/donor/app/page.tsx"],
    });
    expect(selected.map((stage) => stage.script)).toEqual(
      EXPECTED_STAGES.filter((stage) => stage.id !== "build").map(
        (stage) => stage.script,
      ),
    );
  });

  it("requests full compilation for explicit QA and production", () => {
    for (const options of [{ full: true }, { branch: "production" }]) {
      expect(
        getPreflightStages({ changedFiles: ["docs/ci.md"], ...options }).map(
          (stage) => stage.script,
        ),
      ).toContain("build");
    }
  });

  it("mirrors blocking ci.yml stage order documented in docs/ci.md", () => {
    expect(stages).toEqual(EXPECTED_STAGES);
  });

  it("audits the primary workspace before any auxiliary checkout can duplicate its projects", () => {
    const steps = integritySteps();
    const audit = steps.findIndex((step) =>
      step.includes("run: bun run verify:shadscan -- --output"),
    );
    const retainedEvidence = steps.findIndex((step) =>
      step.includes("name: shadscan-audit"),
    );
    const auxiliaryCheckouts = steps.flatMap((step, index) =>
      /(?:^|\n)\s*uses: actions\/checkout@/.test(step) &&
      /(?:^|\n)\s*path:\s*\S/.test(step)
        ? [index]
        : [],
    );
    expect(audit).toBeGreaterThanOrEqual(0);
    expect(retainedEvidence).toBe(audit + 1);
    expect(auxiliaryCheckouts.length).toBeGreaterThan(0);
    expect(auxiliaryCheckouts.every((index) => index > retainedEvidence)).toBe(
      true,
    );
  });

  it("does not run deployment-discipline inside preflight", () => {
    expect(source).not.toContain("verify:deployment-discipline");
    expect(stages.map((stage) => stage.script)).not.toContain(
      "verify:deployment-discipline",
    );
  });

  it("applies CI Supabase placeholders to build and unit tests", () => {
    expect(source).toContain("const ciSupabasePublicEnv = {");
    expect(source).toContain("NEXT_PUBLIC_SUPABASE_URL:");
    expect(source).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY:");

    const buildStage = source.slice(
      source.indexOf('id: "build"'),
      source.indexOf('id: "test-unit"'),
    );
    const testUnitStage = source.slice(source.indexOf('id: "test-unit"'));

    expect(buildStage).toContain("SKIP_ENV_VALIDATION");
    expect(buildStage).toContain("...ciSupabasePublicEnv");
    expect(testUnitStage).toContain("env: ciSupabasePublicEnv");
  });
});
