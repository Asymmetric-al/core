import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

function listRepoFiles(path: string, relativePath = ""): string[] {
  const directoryPath = relativePath ? `${path}/${relativePath}` : path;
  const entries = readdirSync(new URL(directoryPath, root), {
    withFileTypes: true,
  });

  return entries
    .flatMap((entry) => {
      const entryPath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;
      return entry.isDirectory() ? listRepoFiles(path, entryPath) : [entryPath];
    })
    .sort();
}

const vendoredSkillPaths = [
  "docs/ai/skills/supabase/SKILL.md",
  "docs/ai/skills/components-build/SKILL.md",
  "docs/ai/skills/emil-design-eng/SKILL.md",
  "docs/ai/skills/grill-for-unknowns/SKILL.md",
  "docs/ai/skills/resend-cli/SKILL.md",
  ".agents/skills/supabase/SKILL.md",
  ".agents/skills/components-build/SKILL.md",
  ".agents/skills/emil-design-eng/SKILL.md",
  ".agents/skills/grill-for-unknowns/SKILL.md",
  ".agents/skills/resend-cli/SKILL.md",
  ".cursor/skills/supabase/SKILL.md",
  ".cursor/skills/components-build/SKILL.md",
  ".cursor/skills/emil-design-eng/SKILL.md",
  ".cursor/skills/grill-for-unknowns/SKILL.md",
  ".cursor/skills/resend-cli/SKILL.md",
  ".claude/skills/supabase/SKILL.md",
  ".claude/skills/components-build/SKILL.md",
  ".claude/skills/emil-design-eng/SKILL.md",
  ".claude/skills/grill-for-unknowns/SKILL.md",
  ".claude/skills/resend-cli/SKILL.md",
] as const;

const curatedSkillNames = [
  "accessibility-review",
  "find-animation-opportunities",
  "playwright-cli",
  "vitest",
] as const;

const generatedSkillRoots = [
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;

describe("skill quality gate overlays", () => {
  it("keeps vendored canonical skills and mirrors covered by repo triggers, workflow, and checklist sections", () => {
    for (const path of vendoredSkillPaths) {
      const source = readRepoFile(path);

      expect(source, path).toContain("## This repository (Asymmetric-al/core)");
      expect(source, path).toContain("### Triggers");
      expect(source, path).toContain("### Workflow");
      expect(source, path).toContain("### Checklist");
      expect(source, path).toContain("before running `bun run skills:sync`");
    }
  });

  it("keeps ecosystem refresh guidance split by source and concern", () => {
    const agents = readRepoFile("AGENTS.md");
    const findSkills = readRepoFile("docs/ai/skills/find-skills/SKILL.md");

    expect(agents).toContain("To **restore** those installs");
    expect(agents).toContain("To **pull newer upstream** content for Supabase");
    expect(agents).toContain("**Resend CLI** (`docs/ai/skills/resend-cli/`)");
    expect(findSkills).toContain("**Example — Resend CLI:**");
    expect(findSkills).toContain("**Example — Resend platform skills:**");
    expect(findSkills).toContain("**Example — Resend app integration:**");
    expect(findSkills).not.toContain("**Example — Resend:** **CLI** work");
  });

  it("keeps curated skills routed, attributed, and identical across generated mirrors", () => {
    const agents = readRepoFile("AGENTS.md");

    for (const skillName of curatedSkillNames) {
      const canonicalPath = `docs/ai/skills/${skillName}`;
      const canonicalSkill = readRepoFile(`${canonicalPath}/SKILL.md`);
      const canonicalProvenance = readRepoFile(
        `${canonicalPath}/references/upstream.md`,
      );

      expect(canonicalSkill, skillName).toContain("## Workflow");
      expect(canonicalSkill, skillName).toContain("## Checklist");
      expect(canonicalSkill, skillName).toContain("## Provenance");
      expect(canonicalProvenance, skillName).toContain("reviewed_commit:");
      expect(canonicalProvenance, skillName).toContain("license:");
      expect(canonicalProvenance, skillName).toContain("## Refresh workflow");
      expect(agents, skillName).toContain(
        `docs/ai/skills/${skillName}/SKILL.md`,
      );

      for (const generatedRoot of generatedSkillRoots) {
        expect(
          listRepoFiles(`${generatedRoot}/${skillName}`),
          `${generatedRoot}/${skillName}`,
        ).toEqual(listRepoFiles(canonicalPath));
        expect(
          readRepoFile(`${generatedRoot}/${skillName}/SKILL.md`),
          `${generatedRoot}/${skillName}/SKILL.md`,
        ).toBe(canonicalSkill);
        expect(
          readRepoFile(`${generatedRoot}/${skillName}/references/upstream.md`),
          `${generatedRoot}/${skillName}/references/upstream.md`,
        ).toBe(canonicalProvenance);
      }
    }
  });
});
