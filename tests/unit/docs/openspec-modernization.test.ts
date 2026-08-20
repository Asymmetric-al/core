import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

const PINNED_OPENSPEC_VERSION = "1.9.0";
const PINNED_OPENSPEC_COMMIT = "2826b8889e5223a9a8095d4428b60b56597e1020";
const PINNED_OPENSPEC_TAG = "v1.9.0";

const SELECTED_OPENSPEC_SKILLS = [
  "openspec-explore",
  "openspec-propose",
  "openspec-update-change",
  "openspec-apply-change",
  "openspec-verify-change",
  "openspec-sync-specs",
  "openspec-archive-change",
] as const;

const FORBIDDEN_OPENSPEC_SKILLS = [
  "openspec-new-change",
  "openspec-continue-change",
  "openspec-ff-change",
  "openspec-bulk-archive-change",
  "openspec-onboard",
] as const;

const GENERATED_SKILL_ROOTS = [
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;

const LIVE_INSTRUCTION_GLOBS = [
  "AGENTS.md",
  "CLAUDE.md",
  "apps/admin/AGENTS.md",
  "apps/donor/AGENTS.md",
  "apps/missionary/AGENTS.md",
  "packages/api/AGENTS.md",
  "packages/auth/AGENTS.md",
  "packages/database/AGENTS.md",
  "packages/ui/AGENTS.md",
  "packages/eve-runtime/AGENTS.md",
  "scripts/AGENTS.md",
  "supabase/AGENTS.md",
  "docs/ai/rules/openspec.md",
  "docs/ai/rules/general.md",
  "docs/ai/rules/backend.md",
  "docs/ai/rules/testing.md",
  "docs/ai/rules/agent-skill-routing.md",
  "docs/AI_AGENT_PLAYBOOK.md",
  "docs/ci.md",
  "openspec/project.md",
  "openspec/config.yaml",
  ".cursor/commands/1-start-project.md",
  ".cursor/commands/2-implement-project.md",
  ".cursor/commands/3-commit-project.md",
  ".cursor/commands/4-close-project.md",
  ".cursor/agents/openspec-guardian.md",
] as const;

function readRepoFile(relativePath: string): string {
  return readFileSync(join(REPO_ROOT, relativePath), "utf8");
}

function walkMarkdownFiles(relativeDir: string): string[] {
  const absoluteDir = join(REPO_ROOT, relativeDir);
  if (!existsSync(absoluteDir)) {
    return [];
  }

  const files: string[] = [];
  const visit = (current: string, relative: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const nextAbsolute = join(current, entry.name);
      const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        visit(nextAbsolute, nextRelative);
        continue;
      }
      if (entry.name.endsWith(".md") || entry.name.endsWith(".yaml")) {
        files.push(`${relativeDir}/${nextRelative}`);
      }
    }
  };
  visit(absoluteDir, "");
  return files.sort();
}

describe("OpenSpec pin and local CLI", () => {
  it("pins @fission-ai/openspec exactly at the reviewed stable version", () => {
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.devDependencies["@fission-ai/openspec"]).toBe(
      PINNED_OPENSPEC_VERSION,
    );
    expect(packageJson.scripts.openspec).toBe(
      "bunx --no-install --package @fission-ai/openspec openspec",
    );
    expect(packageJson.scripts["openspec:version"]).toBe(
      "bun run openspec -- --version",
    );
    expect(packageJson.scripts["openspec:validate"]).toBe(
      "bun run openspec -- validate --all --strict",
    );
    expect(packageJson.scripts["openspec:audit-archive"]).toBe(
      "bun run openspec -- validate --archived",
    );
  });

  it("records the exact official tag and commit in the refresh group", () => {
    const refreshScript = readRepoFile("scripts/refresh-upstream-skills.mjs");
    expect(refreshScript).toContain('source: "Fission-AI/OpenSpec"');
    expect(refreshScript).toContain(`ref: "${PINNED_OPENSPEC_TAG}"`);
    expect(refreshScript).toContain("openspec-explore");
    expect(refreshScript).toContain("openspec-archive-change");
    expect(refreshScript).not.toContain("openspec-new-change");
    expect(refreshScript).not.toContain("openspec-onboard");
  });
});

describe("OpenSpec current-instruction hygiene", () => {
  it("does not use @fission-ai/openspec@latest in live instructions or active workflow commands", () => {
    const livePaths = [
      ...LIVE_INSTRUCTION_GLOBS,
      ...walkMarkdownFiles("docs/ai/skills").filter((path) =>
        path.includes("openspec-"),
      ),
      ...walkMarkdownFiles("openspec/changes").filter(
        (path) => !path.includes("/archive/"),
      ),
    ];

    const offenders: string[] = [];
    for (const relativePath of livePaths) {
      if (!existsSync(join(REPO_ROOT, relativePath))) {
        continue;
      }
      const source = readRepoFile(relativePath);
      if (source.includes("@fission-ai/openspec@latest")) {
        offenders.push(relativePath);
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe("OpenSpec skill provenance", () => {
  it("keeps the seven selected skills canonical, pinned, overlayed, and mirrored", () => {
    for (const skillName of SELECTED_OPENSPEC_SKILLS) {
      const canonicalRoot = `docs/ai/skills/${skillName}`;
      const skill = readRepoFile(`${canonicalRoot}/SKILL.md`);
      const provenance = readRepoFile(
        `${canonicalRoot}/references/upstream.md`,
      );

      expect(skill).toContain("## This repository (Asymmetric-al/core)");
      expect(skill).toContain("### Triggers");
      expect(skill).toContain("### Workflow");
      expect(skill).toContain("### Checklist");
      expect(skill).toContain("before running `bun run skills:sync`");
      expect(skill).toContain("bun run openspec --");
      expect(skill).not.toContain("openspec Stores");
      expect(provenance).toContain(`**Ref:** \`${PINNED_OPENSPEC_TAG}\``);
      expect(provenance).toContain(
        `**Commit reviewed:** \`${PINNED_OPENSPEC_COMMIT}\``,
      );

      for (const generatedRoot of GENERATED_SKILL_ROOTS) {
        expect(readRepoFile(`${generatedRoot}/${skillName}/SKILL.md`)).toBe(
          skill,
        );
        expect(
          readRepoFile(`${generatedRoot}/${skillName}/references/upstream.md`),
        ).toBe(provenance);
      }
    }
  });

  it("does not import the rejected OpenSpec workflows", () => {
    for (const skillName of FORBIDDEN_OPENSPEC_SKILLS) {
      expect(existsSync(join(REPO_ROOT, `docs/ai/skills/${skillName}`))).toBe(
        false,
      );
      for (const generatedRoot of GENERATED_SKILL_ROOTS) {
        expect(existsSync(join(REPO_ROOT, generatedRoot, skillName))).toBe(
          false,
        );
      }
    }
  });
});

describe("OpenSpec injected context", () => {
  it("keeps spec-driven schema and retired Twenty CRM authority in config.yaml", () => {
    const config = readRepoFile("openspec/config.yaml");
    expect(config).toMatch(/^schema:\s*spec-driven/m);
    expect(config).toContain("Asym Postgres owns application and CRM truth");
    expect(config).toContain("Twenty CRM is retired");
    expect(config).toContain("githubCopilot:");
    expect(config).toContain("cloudAgent: false");
    expect(config).toContain("operations:");
    expect(config).toContain("apply:");
    expect(config).toContain("archive:");
    expect(config).not.toContain("Twenty (CRM");
    expect(config).not.toContain("store:");
    expect(config).not.toContain("stores:");
  });

  it("keeps project.md as a concise index without @latest or Twenty backing", () => {
    const project = readRepoFile("openspec/project.md");
    expect(project).toContain("openspec/config.yaml");
    expect(project).toContain("bun run openspec");
    expect(project).not.toContain("@fission-ai/openspec@latest");
    expect(project.toLowerCase()).not.toContain("twenty is the crm");
    expect(project.toLowerCase()).not.toContain("twenty (crm backing");
  });
});
