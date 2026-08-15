import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const tempRoots: string[] = [];
const isolatedGitEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);

async function createTempRepo(prefix: string) {
  const testRoot = path.join(repoRoot, ".tmp");
  await mkdir(testRoot, { recursive: true });
  const tempRoot = await mkdtemp(path.join(testRoot, `${prefix}-`));
  tempRoots.push(tempRoot);
  return tempRoot;
}

async function copyScript(tempRoot: string, relativePath: string) {
  const sourcePath = path.join(repoRoot, relativePath);
  const targetPath = path.join(tempRoot, relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath);
}

function runSync(tempRoot: string, environment: Record<string, string> = {}) {
  return execFileSync(process.execPath, ["scripts/sync-agent-skills.mjs"], {
    cwd: tempRoot,
    encoding: "utf8",
    env: { ...isolatedGitEnv, ...environment },
    stdio: "pipe",
  });
}

function leftoverSwapDirectories(root: string) {
  const leftovers: string[] = [];

  for (const relative of [
    ".agents",
    ".agents/skills",
    ".cursor",
    ".cursor/skills",
    ".claude",
    ".claude/skills",
  ]) {
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) {
      continue;
    }

    for (const name of readdirSync(absolute)) {
      if (name.includes(".backup-") || name.includes(".staging-")) {
        leftovers.push(path.join(relative, name));
      }
    }
  }

  return leftovers;
}

afterEach(async () => {
  for (const tempRoot of tempRoots.splice(0)) {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

describe("sync-agent-skills EXDEV fallback", () => {
  it("replaces existing skill mirrors when rename throws EXDEV", async () => {
    const tempRoot = await createTempRepo("sync-exdev-replace");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    // `vitest` is fully managed, so sync uses replaceDirectory (rename swap)
    // rather than overlayDirectory (copy). Overlayfs EXDEV only appears there.
    const canonicalDir = path.join(tempRoot, "docs/ai/skills/vitest");
    await mkdir(canonicalDir, { recursive: true });
    await writeFile(
      path.join(canonicalDir, "SKILL.md"),
      "---\nname: vitest\ndescription: First\n---\n",
    );

    expect(runSync(tempRoot)).toContain("agent skill sync complete");

    await writeFile(
      path.join(canonicalDir, "SKILL.md"),
      "---\nname: sample-skill\ndescription: After EXDEV\n---\n",
    );

    expect(
      runSync(tempRoot, { CORE_SKILLS_SIMULATE_RENAME_EXDEV: "1" }),
    ).toContain("agent skill sync complete");

    for (const runtimeRoot of [
      ".agents/skills",
      ".cursor/skills",
      ".claude/skills",
    ]) {
      await expect(
        readFile(path.join(tempRoot, runtimeRoot, "vitest/SKILL.md"), "utf8"),
      ).resolves.toContain("description: After EXDEV");
    }

    expect(leftoverSwapDirectories(tempRoot)).toEqual([]);
  });

  it("creates first-time mirrors when rename throws EXDEV", async () => {
    const tempRoot = await createTempRepo("sync-exdev-create");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    await mkdir(path.join(tempRoot, "docs/ai/skills/vitest"), {
      recursive: true,
    });
    await writeFile(
      path.join(tempRoot, "docs/ai/skills/vitest/SKILL.md"),
      "---\nname: vitest\ndescription: Fresh\n---\n",
    );

    expect(
      runSync(tempRoot, { CORE_SKILLS_SIMULATE_RENAME_EXDEV: "1" }),
    ).toContain("agent skill sync complete");

    await expect(
      readFile(path.join(tempRoot, ".agents/skills/vitest/SKILL.md"), "utf8"),
    ).resolves.toContain("description: Fresh");
    expect(leftoverSwapDirectories(tempRoot)).toEqual([]);
  });

  it("detects swap leftovers next to skill roots, not only inside them", async () => {
    const tempRoot = await createTempRepo("sync-exdev-leftover-scan");
    await mkdir(path.join(tempRoot, ".agents/.skills.backup-dead"), {
      recursive: true,
    });

    expect(leftoverSwapDirectories(tempRoot)).toEqual([
      ".agents/.skills.backup-dead",
    ]);
  });

  it("removes extra dest files when EXDEV replace copies over an existing mirror", async () => {
    const tempRoot = await createTempRepo("sync-exdev-stale");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    const canonicalDir = path.join(tempRoot, "docs/ai/skills/vitest");
    await mkdir(canonicalDir, { recursive: true });
    await writeFile(
      path.join(canonicalDir, "SKILL.md"),
      "---\nname: vitest\ndescription: First\n---\n",
    );

    expect(runSync(tempRoot)).toContain("agent skill sync complete");

    const stalePath = path.join(tempRoot, ".agents/skills/vitest/stale.txt");
    await writeFile(stalePath, "should not survive replace\n");

    await writeFile(
      path.join(canonicalDir, "SKILL.md"),
      "---\nname: vitest\ndescription: After EXDEV\n---\n",
    );

    expect(
      runSync(tempRoot, { CORE_SKILLS_SIMULATE_RENAME_EXDEV: "1" }),
    ).toContain("agent skill sync complete");

    expect(existsSync(stalePath)).toBe(false);
    await expect(
      readFile(path.join(tempRoot, ".agents/skills/vitest/SKILL.md"), "utf8"),
    ).resolves.toContain("description: After EXDEV");
    expect(leftoverSwapDirectories(tempRoot)).toEqual([]);
  });
});
