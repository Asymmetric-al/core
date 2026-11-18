import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// Repairs from the 2026-11-18 skill-quality pass (AL-2715). Each case pins a
// defect found in a skill Core keeps: a command that does not exist, a branch
// Core does not have, an unpinned install, or guidance that contradicts a Core
// rule. Canonical skills are checked in `docs/ai/skills`; ecosystem skills in
// every runtime tree, where `skills:sync` reapplies their Core adapters.

const repoRoot = process.cwd();
function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function frontmatter(source: string) {
  return /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "";
}

function description(source: string) {
  return /^description: (.*)$/m.exec(frontmatter(source))?.[1] ?? "";
}

function overlay(source: string) {
  const start = source.indexOf("<!-- CORE-OVERLAY-START -->");
  const end = source.indexOf("<!-- CORE-OVERLAY-END -->");
  return start === -1 || end < start ? "" : source.slice(start, end);
}

const packageScripts = (
  JSON.parse(read("package.json")) as { scripts: Record<string, string> }
).scripts;

/**
 * The reviewed post-refresh replacements for one canonical skill, read from
 * the refresh script's source because the script runs on import.
 */
function refreshReplacements(skillName: string) {
  const script = read("scripts/refresh-upstream-skills.mjs");
  const literal = String.raw`"(?:[^"\\]|\\.)*"`;
  const entry = new RegExp(
    String.raw`\{\n {4}skillName: "${skillName}",\n {4}relativePath: "SKILL\.md",\n {4}search:\s*(${literal}),\n {4}replace:\s*(${literal}),\n {4}required: true,\n {2}\}`,
    "g",
  );
  return [...script.matchAll(entry)].map((match) => ({
    search: JSON.parse(match[1]!) as string,
    replace: JSON.parse(match[2]!) as string,
  }));
}

/** Rebuild the upstream text a refresh starts from, then reapply Core's. */
function expectRefreshRestores(skillName: string, upstreamPattern: RegExp) {
  const canonical = read(`docs/ai/skills/${skillName}/SKILL.md`);
  const replacements = refreshReplacements(skillName);
  expect(replacements.length, skillName).toBeGreaterThan(0);

  let upstream = canonical;
  for (const { search, replace } of replacements) {
    expect(canonical.split(replace).length - 1, replace).toBe(1);
    expect(canonical, search).not.toContain(search);
    upstream = upstream.replace(replace, search);
  }
  expect(upstream).toMatch(upstreamPattern);

  let refreshed = upstream;
  for (const { search, replace } of replacements) {
    refreshed = refreshed.replace(search, replace);
  }
  expect(refreshed).toBe(canonical);
}

describe("skill-quality repairs", () => {
  it("runs only smoke scripts that exist in the root package", () => {
    const skill = read("docs/ai/skills/run-smoke-tests/SKILL.md");
    const named = [...skill.matchAll(/\bbun run ([a-z0-9:-]+)/g)].map(
      (match) => match[1]!,
    );

    expect(skill).not.toMatch(/\bnpm run\b/);
    expect(skill).not.toContain("smoketest");
    expect(named).toContain("test:e2e:smoke");
    for (const name of named) {
      expect(packageScripts, name).toHaveProperty([name]);
    }
    expectRefreshRestores("run-smoke-tests", /npm run smoketest/);
  });

  it.each(["deslop", "new-branch-and-pr", "loop-on-ci", "review-and-ship"])(
    "points %s at Core's develop base branch through a refresh",
    (skillName) => {
      const skill = read(`docs/ai/skills/${skillName}/SKILL.md`);

      expect(skill).not.toMatch(/\bmain\b/);
      expect(skill).toContain("develop");
      expectRefreshRestores(skillName, /\bmain\b/);
    },
  );

  it("overrides Supabase Option B with Core's migration workflow", () => {
    const skill = read("docs/ai/skills/supabase/SKILL.md");
    const core = overlay(skill);

    expect(skill.indexOf("<!-- CORE-OVERLAY-END -->")).toBeLessThan(
      skill.indexOf("### Option B"),
    );
    expect(core).toContain("Option B");
    expect(core).toContain("supabase/migrations/");
    expect(core).toContain("bun run supabase -- migration new");
    expect(core).toContain("bun run supabase -- db reset --local");
    expect(core).toContain("execute_sql");
    expect(core).toContain("supabase/AGENTS.md");
    expect(core).not.toMatch(/\bnpx supabase\b/);
  });

  it("points eve and create-agent at Core's installed eve through bun", () => {
    const docs = "packages/eve-runtime/node_modules/eve/docs/README.md";
    const installed = (
      JSON.parse(read("packages/eve-runtime/package.json")) as {
        dependencies: Record<string, string>;
      }
    ).dependencies.eve;

    expect(installed).toMatch(/^\d+\.\d+\.\d+$/);
    for (const skillName of ["eve", "create-agent"]) {
      const skill = read(`docs/ai/skills/${skillName}/SKILL.md`);
      expect(skill, skillName).toContain(docs);
      expect(skill, skillName).toContain("packages/eve-runtime/AGENTS.md");
      expect(skill, skillName).not.toMatch(/\bnpm (?:i|install)\b/);
      expect(skill, skillName).not.toMatch(/\bnpx eve\b/);
      expect(skill, skillName).not.toContain("eve@latest");
      expect(skill, skillName).not.toMatch(/\bpnpm\b/);
    }
  });

  it("installs shoehorn with bun only as a reviewed dependency decision", () => {
    const skill = read("docs/ai/skills/migrate-to-shoehorn/SKILL.md");

    expect(skill).not.toMatch(/\bnpm i\b/);
    expect(skill).toContain("bun add --dev --exact @total-typescript/shoehorn");
    expect(skill).toContain("dependency decision");
  });

  it("describes React 19 refs as props in react-component-dev", () => {
    const text = description(
      read("docs/ai/skills/react-component-dev/SKILL.md"),
    );

    expect(text).not.toContain("ref forwarding");
    expect(text).toContain("refs as props");
  });

  it("describes Next.js 16 proxy.ts in nextjs-supabase-auth", () => {
    const skill = read("docs/ai/skills/nextjs-supabase-auth/SKILL.md");

    expect(description(skill)).toContain("proxy.ts");
    expect(description(skill)).not.toContain("using middleware");
    expect(skill).not.toContain("Protecting routes with middleware");
  });
});
