import { execFileSync, execSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const tempRoots: string[] = [];

async function createTempRepo(prefix: string) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
  tempRoots.push(tempRoot);
  return tempRoot;
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2));
}

async function copyScript(tempRoot: string, relativePath: string) {
  const sourcePath = path.join(repoRoot, relativePath);
  const targetPath = path.join(tempRoot, relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath);
}

function runNodeScript(tempRoot: string, relativePath: string) {
  return execFileSync(process.execPath, [relativePath], {
    cwd: tempRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
}

async function createWorkspaceContractRepo() {
  const tempRoot = await createTempRepo("workspace-contract");
  await copyScript(tempRoot, "scripts/verify-workspace-contract.mjs");

  await writeJson(path.join(tempRoot, "package.json"), {
    name: "@asym/root",
    private: true,
    workspaces: ["apps/*", "packages/*", "packages/env", "tooling/*"],
    dependencies: {
      "@asym/ui": "workspace:*",
    },
  });

  await writeJson(path.join(tempRoot, "apps/demo/package.json"), {
    name: "@asym/demo",
    dependencies: {
      "@asym/ui": "workspace:*",
    },
  });
  await writeJson(path.join(tempRoot, "packages/lib/package.json"), {
    name: "@asym/lib",
  });
  await writeJson(path.join(tempRoot, "packages/env/package.json"), {
    name: "@asym/env",
  });
  await writeJson(path.join(tempRoot, "tooling/config/package.json"), {
    name: "@asym/tooling-config",
  });

  return tempRoot;
}

async function createSkillsVerifyRepo() {
  const tempRoot = await createTempRepo("skills-verify");
  await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");
  await copyScript(tempRoot, "scripts/verify-skills-sync.mjs");

  await mkdir(path.join(tempRoot, "docs/ai/skills/sample-skill"), {
    recursive: true,
  });
  await writeFile(
    path.join(tempRoot, "docs/ai/skills/sample-skill/SKILL.md"),
    "# Sample skill\n",
  );

  execSync("git init -b main", { cwd: tempRoot, stdio: "pipe" });
  execSync('git config user.email "codex@example.com"', {
    cwd: tempRoot,
    stdio: "pipe",
  });
  execSync('git config user.name "Codex"', { cwd: tempRoot, stdio: "pipe" });
  execSync("git add .", { cwd: tempRoot, stdio: "pipe" });
  execSync('git commit -m "init"', { cwd: tempRoot, stdio: "pipe" });

  return tempRoot;
}

afterEach(async () => {
  for (const tempRoot of tempRoots.splice(0)) {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

describe("verify-workspace-contract", () => {
  it("ignores commented route segment config exports", async () => {
    const tempRoot = await createWorkspaceContractRepo();
    const pagePath = path.join(tempRoot, "apps/demo/app/example/page.tsx");
    await mkdir(path.dirname(pagePath), { recursive: true });
    await writeFile(
      pagePath,
      [
        "export default function Page() {",
        "  return <div>Hello</div>;",
        "}",
        "// export const revalidate = 60;",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-workspace-contract.mjs"),
    ).not.toThrow();
  });

  it("fails on real route segment config exports", async () => {
    const tempRoot = await createWorkspaceContractRepo();
    const pagePath = path.join(tempRoot, "apps/demo/app/example/page.tsx");
    await mkdir(path.dirname(pagePath), { recursive: true });
    await writeFile(
      pagePath,
      [
        "export const revalidate = 60;",
        "export default function Page() {",
        "  return <div>Hello</div>;",
        "}",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-workspace-contract.mjs"),
    ).toThrow(/disallowed route segment config export "revalidate"/);
  });
});

describe("verify-skills-sync", () => {
  it("fails when sync would generate untracked mirror files", async () => {
    const tempRoot = await createSkillsVerifyRepo();

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-skills-sync.mjs"),
    ).toThrow(/Skill mirror drift detected/);
  });
});
