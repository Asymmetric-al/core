import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const skillName = "nextjs-app-architecture";
const runtimeRoots = [
  "docs/ai/skills",
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
] as const;
const ecosystemExtraFiles = ["LICENSE", "README.md"] as const;
const sharedSkillFiles = [
  "SKILL.md",
  "references/upstream.md",
  "references/cache-components.md",
  "references/components.md",
  "references/example.md",
  "references/feature-folders.md",
  "references/pages-suspense.md",
  "references/queries-actions.md",
  "references/single-page-applications.md",
  "references/ux-patterns.md",
] as const;

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

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
  relativePath: string,
) {
  return readRepoFile(path.join(runtimeRoot, skillName, relativePath));
}

describe("nextjs-app-architecture skill", () => {
  it("pins the Skills CLI source and reviewed hash", () => {
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

    expect(lock.skills[skillName]).toEqual({
      source: "aurorascharff/nextjs-app-architecture-skill",
      sourceType: "github",
      skillPath: "SKILL.md",
      computedHash:
        "94f700fb57aef401e135ddbb0d13a2986d6416820ee4e1b2bf1fd8e17fae0d66",
    });
  });

  it("keeps the Core overlay, provenance, and data-access boundary", () => {
    const skill = readSkillFile("docs/ai/skills", "SKILL.md");
    const provenance = readSkillFile(
      "docs/ai/skills",
      "references/upstream.md",
    );

    expect(skill).toContain("\nname: nextjs-app-architecture\n");
    expect(skill).toContain('version: "1.3.9"');
    expect(skill).toContain("## This repository (Asymmetric-al/core)");
    expect(skill).toContain("docs/guides/architecture/data-access-boundary.md");
    expect(skill).toContain("packages/api");
    expect(skill).toContain("Do not add Zustand");
    expect(skill).toContain('Do not "enable Cache Components."');
    expect(skill).toContain("not `preview.nextjs.org`");
    expect(skill).toContain(
      "Existing `apps/*/features/` directories are UI composition",
    );
    expect(skill).toContain("**Core remaps**");
    expect(skill).toContain("**Feature-owned means UI composition only.**");
    expect(skill).toContain(
      "Do **not** create `features/<domain>/<domain>-queries.ts` or `features/<domain>/<domain>-actions.ts` at all.",
    );
    expect(skill).not.toContain("for business or privileged data");
    expect(skill).toContain("CORE: skip file creation");
    expect(skill).toContain(
      "Do not regenerate or expand the managed root `AGENTS.md`.",
    );
    expect(skill).toContain(
      "Do not create or refresh root `AGENTS.md` from `preview.nextjs.org`.",
    );

    const invariant7 = skill.slice(
      skill.indexOf("7. **Queries live in `<domain>-queries.ts`**"),
    );
    expect(invariant7).toMatch(/CORE: skip file creation/);

    const step3 = skill.slice(
      skill.indexOf(
        "3. **Write the query and, when a client cache shares its data",
      ),
    );
    expect(step3).toMatch(/CORE: skip file creation/);

    const step4 = skill.slice(
      skill.indexOf("4. **Write the action** (if there's a mutation)"),
    );
    expect(step4).toMatch(/CORE: skip file creation/);

    const architectureTarget = skill.slice(
      skill.indexOf("Queries and actions live in the feature folder."),
    );
    expect(architectureTarget).toMatch(/CORE: skip file creation/);

    const verifyQueries = skill.slice(
      skill.indexOf("Every `*-queries.ts` starts with `import 'server-only'`"),
    );
    expect(verifyQueries).toMatch(/CORE: skip file creation/);

    const queriesActions = readSkillFile(
      "docs/ai/skills",
      "references/queries-actions.md",
    );
    const featureFolders = readSkillFile(
      "docs/ai/skills",
      "references/feature-folders.md",
    );

    expect(queriesActions).toContain("> **Core:**");
    expect(queriesActions).toContain(
      "do not copy `db.*` into `features/<domain>/*-queries.ts`",
    );
    expect(queriesActions).toContain(
      "must not be copied into `apps/*/features/`",
    );
    expect(featureFolders).toContain("> **Core:**");
    expect(featureFolders).toContain("UI composition only");
    expect(featureFolders).toContain(
      "Do not add `*-queries.ts` or `*-actions.ts` at all",
    );
    expect(provenance).toContain("f2902b8538b25610da694394ecf88e69adf5f96a");
    expect(provenance).toContain(
      "94f700fb57aef401e135ddbb0d13a2986d6416820ee4e1b2bf1fd8e17fae0d66",
    );
    expect(provenance).toContain(
      "not** updated by `bun run skills:refresh-upstream`",
    );
    expect(provenance).toContain(
      "npx skills add aurorascharff/nextjs-app-architecture-skill -y",
    );
  });

  it("routes the skill without bloating root AGENTS.md", () => {
    const skillRouting = readRepoFile("docs/ai/rules/agent-skill-routing.md");
    const findSkills = readRepoFile("docs/ai/skills/find-skills/SKILL.md");
    const frontend = readRepoFile("docs/ai/rules/frontend.md");
    const agents = readRepoFile("AGENTS.md");
    const qualityGate = readRepoFile("scripts/sync-agent-skills.mjs");

    expect(skillRouting).toContain(
      "docs/ai/skills/nextjs-app-architecture/SKILL.md",
    );
    expect(skillRouting).toContain(
      "npx skills add aurorascharff/nextjs-app-architecture-skill -y",
    );
    expect(skillRouting).toContain(
      "do not move business queries or privileged mutations",
    );
    expect(findSkills).toContain("**Example — Next.js app architecture:**");
    expect(findSkills).toContain(
      "docs/ai/skills/nextjs-app-architecture/SKILL.md",
    );
    expect(frontend).toContain("skills/nextjs-app-architecture/SKILL.md");
    expect(frontend).toContain(
      "Keep business queries and privileged mutations in `packages/api`.",
    );
    expect(agents).not.toContain(
      "docs/ai/skills/nextjs-app-architecture/SKILL.md",
    );
    expect(qualityGate).toContain(
      "const fullyManagedCanonicalSkills = new Set([",
    );
    expect(qualityGate).not.toMatch(
      /fullyManagedCanonicalSkills = new Set\(\[[^\]]*nextjs-app-architecture/,
    );
  });

  it("keeps shared skill files byte-identical across runtime mirrors", () => {
    const canonicalFiles = listFiles(
      path.join(repoRoot, "docs/ai/skills", skillName),
    ).sort();

    expect(canonicalFiles).toEqual([...sharedSkillFiles].sort());

    for (const extra of ecosystemExtraFiles) {
      expect(
        existsSync(path.join(repoRoot, "docs/ai/skills", skillName, extra)),
      ).toBe(false);
    }

    for (const runtimeRoot of runtimeRoots.slice(1)) {
      for (const relativePath of sharedSkillFiles) {
        expect(
          readSkillFile(runtimeRoot, relativePath),
          `${runtimeRoot}/${skillName}/${relativePath}`,
        ).toBe(readSkillFile("docs/ai/skills", relativePath));
      }

      for (const extra of ecosystemExtraFiles) {
        expect(
          existsSync(path.join(repoRoot, runtimeRoot, skillName, extra)),
          `${runtimeRoot}/${skillName}/${extra}`,
        ).toBe(true);
      }
    }
  });
});
