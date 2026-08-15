import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const tempRoots: string[] = [];
const isolatedGitEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);

function listVerifyTempDirs() {
  return readdirSync(os.tmpdir()).filter((name) =>
    name.startsWith("core-skills-verify-"),
  );
}

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
  await writeFile(targetPath, await readFile(sourcePath));
}

function runNodeScript(
  cwd: string,
  relativePath: string,
  args: string[] = [],
  extraEnv: NodeJS.ProcessEnv = {},
) {
  return execFileSync(process.execPath, [relativePath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...isolatedGitEnv, ...extraEnv },
    stdio: "pipe",
  });
}

function combinedExecError(error: unknown) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const stderr =
    "stderr" in error && typeof error.stderr === "string" ? error.stderr : "";
  const stdout =
    "stdout" in error && typeof error.stdout === "string" ? error.stdout : "";

  return `${error.message}\n${stderr}\n${stdout}`;
}

function gitStatusPorcelain(cwd: string) {
  return execFileSync("git", ["status", "--porcelain"], {
    cwd,
    encoding: "utf8",
    env: isolatedGitEnv,
    stdio: "pipe",
  }).trim();
}

async function createSyncedVerifyRepo() {
  const tempRoot = await createTempRepo("skills-verify-drift");
  await copyScript(tempRoot, "scripts/verify-skills-sync.mjs");
  await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");
  await copyScript(tempRoot, "scripts/verify/inngest-skill-references.mjs");

  const skillDir = path.join(tempRoot, "docs/ai/skills/sample-skill");
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    path.join(skillDir, "SKILL.md"),
    "# Sample skill\n\nCanonical body.\n",
  );

  execFileSync("git", ["init", "-b", "main"], {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execFileSync("git", ["config", "user.email", "test@example.com"], {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execFileSync("git", ["config", "user.name", "Test"], {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });

  runNodeScript(tempRoot, "scripts/sync-agent-skills.mjs");
  execFileSync("git", ["add", "."], {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execFileSync("git", ["commit", "-m", "sync skill mirrors"], {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });

  expect(gitStatusPorcelain(tempRoot)).toBe("");
  return tempRoot;
}

afterEach(async () => {
  for (const tempRoot of tempRoots.splice(0)) {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

describe("verify-skills-sync drift reporting", () => {
  it("prints the drifted relative path and kind, then leaves no verify temp dirs", async () => {
    const tempRoot = await createSyncedVerifyRepo();
    const driftedPath = path.join(
      tempRoot,
      ".agents/skills/sample-skill/SKILL.md",
    );
    await writeFile(driftedPath, "# Drifted skill\n");

    const beforeTemps = new Set(listVerifyTempDirs());

    let failed = false;
    try {
      runNodeScript(tempRoot, "scripts/verify-skills-sync.mjs");
    } catch (error) {
      failed = true;
      const output = combinedExecError(error);
      expect(output).toMatch(/Skill mirror drift detected/);
      expect(output).toMatch(/\.agents\/skills\/sample-skill\/SKILL\.md/);
      expect(output).toMatch(/changed/);
    }

    expect(failed).toBe(true);
    expect(await readFile(driftedPath, "utf8")).toBe("# Drifted skill\n");

    const leftoverTemps = listVerifyTempDirs().filter(
      (name) => !beforeTemps.has(name),
    );
    expect(leftoverTemps).toEqual([]);
  }, 20_000);

  it("fails on an extra live skill file without deleting it, and names the path", async () => {
    const tempRoot = await createSyncedVerifyRepo();
    const orphanPath = path.join(tempRoot, ".cursor/skills/orphan/SKILL.md");
    await mkdir(path.dirname(orphanPath), { recursive: true });
    await writeFile(orphanPath, "# Orphan skill\n");

    const beforeTemps = new Set(listVerifyTempDirs());

    let failed = false;
    try {
      runNodeScript(tempRoot, "scripts/verify-skills-sync.mjs");
    } catch (error) {
      failed = true;
      const output = combinedExecError(error);
      expect(output).toMatch(/Skill mirror drift detected/);
      expect(output).toMatch(/\.cursor\/skills\/orphan\/SKILL\.md/);
      expect(output).toMatch(/extra/);
    }

    expect(failed).toBe(true);
    expect(existsSync(orphanPath)).toBe(true);
    expect(await readFile(orphanPath, "utf8")).toBe("# Orphan skill\n");

    const leftoverTemps = listVerifyTempDirs().filter(
      (name) => !beforeTemps.has(name),
    );
    expect(leftoverTemps).toEqual([]);
  }, 20_000);
});
