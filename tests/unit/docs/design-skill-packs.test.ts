import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const runtimeRoots = [
  "docs/ai/skills",
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;

const jakubKrehelSkills = {
  "better-ui": [
    "SKILL.md",
    "animations.md",
    "enter-exit.md",
    "icon-transitions.md",
    "icons.md",
    "performance.md",
    "surfaces.md",
    "agents/openai.yaml",
  ],
  "better-typography": [
    "SKILL.md",
    "choosing-fonts.md",
    "css-cheat-sheet.md",
    "details-and-accessibility.md",
    "spacing-and-sizing.md",
    "variable-fonts-and-opentype.md",
    "wrapping-and-punctuation.md",
    "agents/openai.yaml",
  ],
  "better-colors": [
    "SKILL.md",
    "color-formats.md",
    "color-usage.md",
    "contrast.md",
    "palette-generation.md",
    "palette-structure.md",
    "token-naming.md",
    "agents/openai.yaml",
  ],
  "better-layout": [
    "SKILL.md",
    "grouping-and-alignment.md",
    "spacing-and-adaptivity.md",
    "agents/openai.yaml",
  ],
  "better-interface": ["SKILL.md", "review-format.md", "agents/openai.yaml"],
  "better-accessibility": [
    "SKILL.md",
    "focus-and-keyboard.md",
    "forms.md",
    "hit-areas.md",
    "motion-and-zoom.md",
    "screen-readers.md",
    "semantics-and-aria.md",
    "agents/openai.yaml",
  ],
  "better-writing": ["SKILL.md", "agents/openai.yaml"],
  "interface-review": [
    "SKILL.md",
    "removed-signals.md",
    "scope-resolution.md",
    "agents/openai.yaml",
  ],
} as const;

const otherDesignSkills = {
  "frontend-design": {
    source: "anthropics/skills",
    skillPath: "skills/frontend-design/SKILL.md",
    files: ["SKILL.md", "LICENSE.txt"],
  },
  "design-taste-frontend": {
    source: "leonxlnx/taste-skill",
    skillPath: "skills/taste-skill/SKILL.md",
    files: ["SKILL.md"],
  },
  "redesign-existing-projects": {
    source: "leonxlnx/taste-skill",
    skillPath: "skills/redesign-skill/SKILL.md",
    files: ["SKILL.md"],
  },
  "test-driven-development": {
    source: "obra/superpowers",
    skillPath: "skills/test-driven-development/SKILL.md",
    files: ["SKILL.md", "writing-good-tests.md"],
  },
} as const;

const explicitOnlySkills = [
  "interface-review",
  "frontend-design",
  "design-taste-frontend",
  "redesign-existing-projects",
  "test-driven-development",
] as const;

function listFiles(root: string, relativeRoot = ""): string[] {
  const directory = path.join(root, relativeRoot);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeRoot, entry.name);
    return entry.isDirectory()
      ? listFiles(root, relativePath)
      : [relativePath.replaceAll("\\", "/")];
  });
}

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readSkillFile(
  runtimeRoot: (typeof runtimeRoots)[number],
  skillName: string,
  relativePath: string,
) {
  return readRepoFile(path.join(runtimeRoot, skillName, relativePath));
}

function expectCanonicalOverlayAndMirrors(
  skillName: string,
  requiredFiles: readonly string[],
) {
  const canonicalRoot = path.join(repoRoot, "docs/ai/skills", skillName);
  const canonicalFiles = listFiles(canonicalRoot).sort();
  const skill = readSkillFile("docs/ai/skills", skillName, "SKILL.md");

  expect(canonicalFiles).toEqual(
    expect.arrayContaining([
      ...requiredFiles,
      "references/LICENSE.md",
      "references/upstream.md",
    ]),
  );
  expect(skill).toMatch(/^---\r?\n/);
  expect(skill).toContain(`\nname: ${skillName}\n`);
  expect(skill).toContain("<!-- CORE-OVERLAY-START -->");
  expect(skill).toContain("<!-- CORE-OVERLAY-END -->");
  expect(skill).toContain("## This repository (Asymmetric-al/core)");
  expect(skill).toContain("### Triggers");
  expect(skill).toContain("### Workflow");
  expect(skill).toContain("### Checklist");
  expect(skill).toContain("base-maia");
  expect(skill).toContain("before running `bun run skills:sync`");

  for (const runtimeRoot of runtimeRoots.slice(1)) {
    for (const relativePath of canonicalFiles) {
      expect(
        readSkillFile(runtimeRoot, skillName, relativePath),
        `${runtimeRoot}/${skillName}/${relativePath}`,
      ).toBe(readSkillFile("docs/ai/skills", skillName, relativePath));
    }
  }
}

describe("jakubkrehel, anthropic, taste, and obra skill packs", () => {
  it("vendors each requested design skill with Core overlays and identical mirrors", () => {
    for (const [skillName, requiredFiles] of Object.entries(
      jakubKrehelSkills,
    )) {
      expectCanonicalOverlayAndMirrors(skillName, requiredFiles);
    }

    for (const [skillName, meta] of Object.entries(otherDesignSkills)) {
      expectCanonicalOverlayAndMirrors(skillName, meta.files);
    }
  });

  it("keeps lock provenance, explicit-only discovery, and routing collisions intact", () => {
    const lock = JSON.parse(readRepoFile("skills-lock.json")) as {
      skills: Record<
        string,
        { source?: string; sourceType?: string; skillPath?: string }
      >;
    };
    const skillRouting = readRepoFile("docs/ai/rules/agent-skill-routing.md");
    const findSkills = readRepoFile("docs/ai/skills/find-skills/SKILL.md");
    const refreshScript = readRepoFile("scripts/refresh-upstream-skills.mjs");

    for (const skillName of Object.keys(jakubKrehelSkills)) {
      expect(lock.skills[skillName]).toMatchObject({
        source: "jakubkrehel/skills",
        sourceType: "github",
        skillPath: `skills/${skillName}/SKILL.md`,
      });
      expect(skillRouting).toContain(`docs/ai/skills/${skillName}/SKILL.md`);
      expect(refreshScript).toContain(`"${skillName}"`);
    }

    for (const [skillName, meta] of Object.entries(otherDesignSkills)) {
      expect(lock.skills[skillName]).toMatchObject({
        source: meta.source,
        sourceType: "github",
        skillPath: meta.skillPath,
      });
      expect(skillRouting).toContain(`docs/ai/skills/${skillName}/SKILL.md`);
      expect(refreshScript).toContain(`"${skillName}"`);
    }

    for (const skillName of explicitOnlySkills) {
      expect(readSkillFile("docs/ai/skills", skillName, "SKILL.md")).toContain(
        "disable-model-invocation: true",
      );
    }

    expect(
      readSkillFile("docs/ai/skills", "better-accessibility", "SKILL.md"),
    ).toContain("pragma: allowlist secret");
    expect(
      readSkillFile("docs/ai/skills", "better-accessibility", "forms.md"),
    ).toContain("pragma: allowlist secret");
    expect(
      readSkillFile("docs/ai/skills", "better-writing", "SKILL.md"),
    ).toContain("pragma: allowlist secret");
    const betterWritingRow = readSkillFile(
      "docs/ai/skills",
      "better-writing",
      "SKILL.md",
    )
      .split("\n")
      .find((line) => line.includes("too short"));
    expect(betterWritingRow?.match(/\|/g)?.length).toBe(3);
    const accessibilityLoginRow = readSkillFile(
      "docs/ai/skills",
      "better-accessibility",
      "forms.md",
    )
      .split("\n")
      .find((line) => line.includes("username"));
    expect(accessibilityLoginRow?.match(/\|/g)?.length).toBe(3);
    expect(
      readSkillFile(
        "docs/ai/skills",
        "emil-design-engineering",
        "component-design.md",
      ),
    ).not.toContain("asChild");
    expect(
      readSkillFile(
        "docs/ai/skills",
        "emil-design-engineering",
        "component-design.md",
      ),
    ).toContain("buttonVariants");
    expect(
      readSkillFile(
        "docs/ai/skills",
        "better-accessibility",
        "references/upstream.md",
      ),
    ).toContain("bun run skills:refresh-jakubkrehel");
    expect(
      readSkillFile("docs/ai/skills", "better-interface", "SKILL.md"),
    ).toContain("better-writing");
    expect(
      readSkillFile("docs/ai/skills", "test-driven-development", "SKILL.md"),
    ).toContain("docs/ai/skills/tdd/SKILL.md");
    expect(
      readSkillFile("docs/ai/skills", "better-accessibility", "SKILL.md"),
    ).toContain("docs/ai/skills/accessibility-review/SKILL.md");
    expect(
      readSkillFile("docs/ai/skills", "frontend-design", "SKILL.md"),
    ).toContain("do not restyle Core product apps");

    expect(lock.skills.prototype).toMatchObject({
      source: "mattpocock/skills",
      skillPath: "skills/engineering/prototype/SKILL.md",
    });
    expect(lock.skills.tdd).toMatchObject({
      source: "mattpocock/skills",
      skillPath: "skills/engineering/tdd/SKILL.md",
    });
    expect(skillRouting).toContain("`docs/ai/skills/tdd/SKILL.md`");
    expect(skillRouting).toContain(
      "`docs/ai/skills/accessibility-review/SKILL.md`",
    );
    expect(findSkills).toContain("jakubkrehel/skills");
    expect(findSkills).toContain("design-taste-frontend");
    expect(findSkills).toContain("test-driven-development");
    expect(readRepoFile("docs/ai/skills/tdd/SKILL.md")).toContain("name: tdd");
    expect(
      readRepoFile("docs/ai/skills/accessibility-review/SKILL.md"),
    ).toContain("name: accessibility-review");
    expect(
      readRepoFile("docs/ai/skills/find-animation-opportunities/SKILL.md"),
    ).toContain("RouteMainViewTransitionBoundary");
    expect(readRepoFile("CLAUDE.md")).toBe("@AGENTS.md\n");
  });
});
