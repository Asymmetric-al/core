import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const PREFLIGHT_PATH = "scripts/verify/ci-preflight.mjs";

const EXPECTED_STAGES: Array<{ id: string; script: string }> = [
  { id: "verify-git-attribution", script: "verify:git-attribution" },
  { id: "format", script: "format:check" },
  { id: "skills-verify", script: "skills:verify" },
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

describe("ci-preflight contract", () => {
  const source = readFileSync(PREFLIGHT_PATH, "utf8");
  const stages = parsePreflightStages(source);

  it("mirrors blocking ci.yml stage order documented in docs/ci.md", () => {
    expect(stages).toEqual(EXPECTED_STAGES);
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
