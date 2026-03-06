import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tempDirs: string[] = [];

async function createTempRepo() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "skill-sync-"));
  tempDirs.push(repoRoot);
  return repoRoot;
}

async function writeTextFile(filePath: string, contents: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
}

async function readTextFile(filePath: string) {
  return readFile(filePath, "utf8");
}

async function loadSkillSyncModule() {
  return import("../../scripts/sync-agent-skills.mjs");
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("scripts/sync-agent-skills", () => {
  it("includes every Unlayer skill family in the canonical sync list", async () => {
    const { skillsToSync } = await loadSkillSyncModule();

    expect(skillsToSync).toEqual(
      expect.arrayContaining([
        "unlayer",
        "unlayer-integration",
        "unlayer-custom-tools",
        "unlayer-export",
        "unlayer-config",
      ]),
    );
  });

  it("syncs canonical Unlayer skills into both runtime roots and preserves runtime-only mirror files", async () => {
    const repoRoot = await createTempRepo();
    const { runSkillSync } = await loadSkillSyncModule();

    await writeTextFile(
      path.join(repoRoot, "docs", "ai", "skills", "unlayer", "SKILL.md"),
      "# Canonical Unlayer skill\n",
    );
    await writeTextFile(
      path.join(
        repoRoot,
        "docs",
        "ai",
        "skills",
        "unlayer",
        "references",
        "upstream.md",
      ),
      "canonical reference\n",
    );
    await writeTextFile(
      path.join(repoRoot, ".agents", "skills", "unlayer", "runtime-only.txt"),
      "agent runtime asset\n",
    );
    await writeTextFile(
      path.join(repoRoot, ".cursor", "skills", "unlayer", "cursor-only.txt"),
      "cursor runtime asset\n",
    );

    await runSkillSync({ repoRoot, skillsToSync: ["unlayer"] });

    await expect(
      readTextFile(
        path.join(repoRoot, ".agents", "skills", "unlayer", "SKILL.md"),
      ),
    ).resolves.toBe("# Canonical Unlayer skill\n");
    await expect(
      readTextFile(
        path.join(
          repoRoot,
          ".agents",
          "skills",
          "unlayer",
          "references",
          "upstream.md",
        ),
      ),
    ).resolves.toBe("canonical reference\n");
    await expect(
      readTextFile(
        path.join(repoRoot, ".cursor", "skills", "unlayer", "SKILL.md"),
      ),
    ).resolves.toBe("# Canonical Unlayer skill\n");
    await expect(
      readTextFile(
        path.join(repoRoot, ".cursor", "skills", "unlayer", "runtime-only.txt"),
      ),
    ).resolves.toBe("agent runtime asset\n");
    await expect(
      readTextFile(
        path.join(repoRoot, ".cursor", "skills", "unlayer", "cursor-only.txt"),
      ),
    ).resolves.toBe("cursor runtime asset\n");
  });

  it("mirrors only valid agent skills that contain SKILL.md", async () => {
    const repoRoot = await createTempRepo();
    const { listAgentSkillsForMirror } = await loadSkillSyncModule();

    await writeTextFile(
      path.join(repoRoot, ".agents", "skills", "z-skill", "SKILL.md"),
      "z\n",
    );
    await writeTextFile(
      path.join(repoRoot, ".agents", "skills", "a-skill", "SKILL.md"),
      "a\n",
    );
    await writeTextFile(
      path.join(repoRoot, ".agents", "skills", "not-a-skill", "notes.md"),
      "missing entrypoint\n",
    );

    await expect(listAgentSkillsForMirror({ repoRoot })).resolves.toEqual([
      "a-skill",
      "z-skill",
    ]);
  });
});
