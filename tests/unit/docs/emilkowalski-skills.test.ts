import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const packSource = "emilkowalski/skills";
const runtimeRoots = [
  "docs/ai/skills",
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;

const upstreamFiles = {
  "animation-vocabulary": ["SKILL.md"],
  "apple-design": ["SKILL.md"],
  "emil-design-eng": ["SKILL.md"],
  "improve-animations": ["AUDIT.md", "PLAN-TEMPLATE.md", "SKILL.md"],
  "review-animations": ["SKILL.md", "STANDARDS.md"],
} as const;

function listFiles(root: string, relativeRoot = ""): string[] {
  const directory = path.join(root, relativeRoot);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeRoot, entry.name);
    return entry.isDirectory()
      ? listFiles(root, relativePath)
      : [relativePath.replaceAll("\\", "/")];
  });
}

function readSkillFile(
  runtimeRoot: (typeof runtimeRoots)[number],
  skillName: keyof typeof upstreamFiles,
  relativePath: string,
) {
  return readFileSync(
    path.join(repoRoot, runtimeRoot, skillName, relativePath),
    "utf8",
  );
}

describe("emilkowalski skill pack", () => {
  it("keeps every canonical file byte-identical in all three runtime mirrors", () => {
    for (const [skillName, requiredFiles] of Object.entries(upstreamFiles)) {
      const typedSkillName = skillName as keyof typeof upstreamFiles;
      const canonicalRoot = path.join(
        repoRoot,
        "docs/ai/skills",
        typedSkillName,
      );
      const canonicalFiles = listFiles(canonicalRoot).sort();

      expect(canonicalFiles).toEqual(
        expect.arrayContaining([
          ...requiredFiles,
          "references/LICENSE.md",
          "references/upstream.md",
        ]),
      );

      for (const runtimeRoot of runtimeRoots.slice(1)) {
        for (const relativePath of canonicalFiles) {
          expect(
            readSkillFile(runtimeRoot, typedSkillName, relativePath),
            `${runtimeRoot}/${skillName}/${relativePath}`,
          ).toBe(readSkillFile("docs/ai/skills", typedSkillName, relativePath));
        }
      }
    }
  });

  it("keeps discovery metadata, lock provenance, and shared routing valid", () => {
    const lock = JSON.parse(
      readFileSync(path.join(repoRoot, "skills-lock.json"), "utf8"),
    ) as {
      skills: Record<
        string,
        { source?: string; sourceType?: string; skillPath?: string }
      >;
    };
    const agents = readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");

    for (const skillName of Object.keys(upstreamFiles)) {
      const skill = readSkillFile(
        "docs/ai/skills",
        skillName as keyof typeof upstreamFiles,
        "SKILL.md",
      );
      expect(skill).toMatch(/^---\r?\n/);
      expect(skill).toContain(`\nname: ${skillName}\n`);
      expect(skill).toMatch(/\ndescription: .+\n/);
      expect(agents).toContain(`docs/ai/skills/${skillName}/SKILL.md`);
      expect(lock.skills[skillName]).toMatchObject({
        source: packSource,
        sourceType: "github",
        skillPath: expect.stringContaining(`skills/${skillName}/SKILL.md`),
      });
    }

    expect(readFileSync(path.join(repoRoot, "CLAUDE.md"), "utf8")).toBe(
      "@AGENTS.md\n",
    );
    expect(
      readSkillFile("docs/ai/skills", "review-animations", "SKILL.md"),
    ).toContain("disable-model-invocation: true");
  });

  it("keeps Core markdown and duration compatibility adaptations", () => {
    const vocabulary = readSkillFile(
      "docs/ai/skills",
      "animation-vocabulary",
      "SKILL.md",
    );
    const appleDesign = readSkillFile(
      "docs/ai/skills",
      "apple-design",
      "SKILL.md",
    );
    const audit = readSkillFile(
      "docs/ai/skills",
      "improve-animations",
      "AUDIT.md",
    );
    const standards = readSkillFile(
      "docs/ai/skills",
      "review-animations",
      "STANDARDS.md",
    );

    expect(vocabulary.match(/^```text$/gm)).toHaveLength(4);
    expect(appleDesign).toContain(
      "```text\nrelativeVelocity = gestureVelocity /",
    );
    expect(audit).toContain(
      "most UI animations stay under 300ms; modals and drawers may use 200–500ms",
    );
    expect(audit).toContain("modals/drawers above 500ms");
    expect(standards).toContain(
      "Most UI animations stay under 300ms; modals and drawers may use up to 500ms",
    );
  });
});
