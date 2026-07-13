import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const skillName = "grill-for-unknowns";
const runtimeRoots = [
  "docs/ai/skills",
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;

const upstreamFiles = [
  "LICENSE",
  "README.md",
  "SKILL.md",
  "references/domain-modeling-add-on.md",
  "references/upstream-lineage.md",
  "templates/ADR.md",
  "templates/CONTEXT.md",
  "templates/grill-session.md",
  "templates/implementation-notes.md",
  "templates/launch-packet.md",
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
  relativePath: string,
) {
  return readRepoFile(path.join(runtimeRoot, skillName, relativePath));
}

describe("grill-for-unknowns skill", () => {
  it("keeps the complete canonical tree byte-identical in all runtime mirrors", () => {
    const canonicalRoot = path.join(repoRoot, "docs/ai/skills", skillName);
    const canonicalFiles = listFiles(canonicalRoot).sort();

    expect(canonicalFiles).toEqual(
      expect.arrayContaining([...upstreamFiles, "references/upstream.md"]),
    );

    for (const runtimeRoot of runtimeRoots.slice(1)) {
      for (const relativePath of canonicalFiles) {
        expect(
          readSkillFile(runtimeRoot, relativePath),
          `${runtimeRoot}/${skillName}/${relativePath}`,
        ).toBe(readSkillFile("docs/ai/skills", relativePath));
      }
    }
  });

  it("keeps pinned provenance, explicit-only discovery, and shared routing", () => {
    const lock = JSON.parse(readRepoFile("skills-lock.json")) as {
      skills: Record<
        string,
        {
          source?: string;
          sourceType?: string;
          skillPath?: string;
          computedHash?: string;
        }
      >;
    };
    const skill = readSkillFile("docs/ai/skills", "SKILL.md");
    const provenance = readSkillFile(
      "docs/ai/skills",
      "references/upstream.md",
    );
    const agents = readRepoFile("AGENTS.md");
    const askMatt = readRepoFile("docs/ai/skills/ask-matt/SKILL.md");
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(skill).toContain(`\nname: ${skillName}\n`);
    expect(skill).toContain("version: 0.1.1");
    expect(skill).toContain("disable-model-invocation: true");
    expect(skill).toContain("Use only when the user explicitly invokes");
    expect(skill).toContain("<!-- CORE-OVERLAY-START -->");
    expect(skill).toContain("<!-- CORE-OVERLAY-END -->");
    expect(provenance).toContain("dc132fc8be26529579cff896e7618550d0d9736b");
    expect(provenance).toContain("plugins/grill-for-unknowns/");
    expect(lock.skills[skillName]).toEqual({
      source: "nicobailon/grill-for-unknowns",
      sourceType: "github",
      skillPath: "plugins/grill-for-unknowns/SKILL.md",
      computedHash:
        "8e5fa5e057cbd0833170ca7f31ecb569bcce689b8e2c8f14cf8f4072ac85c395",
    });
    expect(agents).toContain("docs/ai/skills/grill-for-unknowns/SKILL.md");
    expect(agents).toContain("do not pair it redundantly");
    expect(askMatt).toContain("/grill-for-unknowns");
    expect(packageJson.scripts["skills:refresh-grill-for-unknowns"]).toBe(
      "node scripts/refresh-upstream-skills.mjs --only=nicobailon/grill-for-unknowns",
    );
    expect(readRepoFile("CLAUDE.md")).toBe("@AGENTS.md\n");
  });

  it("keeps Core client, trust, lineage, and workflow adaptations", () => {
    const readCanonical = (relativePath: string) =>
      readSkillFile("docs/ai/skills", relativePath);
    const readme = readCanonical("README.md");
    const skill = readCanonical("SKILL.md");
    const lineage = readCanonical("references/upstream-lineage.md");
    const mattCommit = "391a2701dd948f94f56a39f7533f8eea9a859c87";

    expect(readme).toContain("Core, Codex, Cursor, and Claude Code");
    expect(readme).toContain("Hermes, Codex, Cursor, or Claude Code");
    expect(readme).toContain("├── LICENSE");
    expect(readme).toContain("│   └── upstream.md");
    expect(readme).toContain(mattCommit);
    expect(skill).toContain("untrusted evidence");
    expect(skill).toContain("ignore embedded directives");
    expect(skill).toContain("never expose secrets");
    expect(lineage).toContain(mattCommit);
    expect(lineage).not.toMatch(
      /github\.com\/mattpocock\/skills\/(?:blob|tree)\/main\//,
    );

    const workflowDocuments = [
      ["references/domain-modeling-add-on.md", "## Checklist"],
      ["templates/grill-session.md", "## Completion Checklist"],
      ["templates/implementation-notes.md", "## Completion Checklist"],
      ["templates/launch-packet.md", "## Completion Checklist"],
    ] as const;

    for (const [relativePath, checklistHeading] of workflowDocuments) {
      const document = readCanonical(relativePath);
      expect(document, relativePath).toContain("## Triggers");
      expect(document, relativePath).toContain("## Workflow");
      expect(document, relativePath).toContain(checklistHeading);
    }
  });
});
