import { execFileSync, execSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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
    env: isolatedGitEnv,
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

async function createDataBoundaryRepo() {
  const tempRoot = await createTempRepo("data-boundary");
  await copyScript(tempRoot, "scripts/verify/data-boundary-check.mjs");
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

  execSync("git init -b main", {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execSync('git config user.email "codex@example.com"', {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execSync('git config user.name "Codex"', {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execSync("git add .", { cwd: tempRoot, env: isolatedGitEnv, stdio: "pipe" });
  execSync('git commit -m "init"', {
    cwd: tempRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });

  return tempRoot;
}

async function createEslintVerifyRepo() {
  const tempRoot = await createTempRepo("eslint-verify");
  await copyScript(tempRoot, "scripts/verify-eslint-config.mjs");

  await mkdir(path.join(tempRoot, "apps", "admin"), { recursive: true });
  await mkdir(path.join(tempRoot, "packages"), { recursive: true });
  await mkdir(path.join(tempRoot, "tooling", "eslint-config"), {
    recursive: true,
  });

  await writeJson(path.join(tempRoot, "apps/admin/package.json"), {
    name: "@asym/admin",
  });
  await writeFile(
    path.join(tempRoot, "apps/admin/eslint.config.mjs"),
    "export default [];\n",
  );
  await writeFile(
    path.join(tempRoot, "tooling/eslint-config/base.mjs"),
    [
      "export default {",
      '  markers: ["no-restricted-imports", "../../apps/*", "**/apps/admin/**", "**/apps/donor/**", "**/apps/missionary/**"],',
      "};",
    ].join("\n"),
  );

  return tempRoot;
}

async function createSkillsVerifyRelativeWorktreeRepo() {
  const tempRoot = await createTempRepo("skills-verify-worktree");
  const mainRoot = path.join(tempRoot, "main");
  const worktreeRoot = path.join(tempRoot, "worktree");

  await mkdir(mainRoot, { recursive: true });
  await copyScript(mainRoot, "scripts/sync-agent-skills.mjs");
  await copyScript(mainRoot, "scripts/verify-skills-sync.mjs");

  await mkdir(path.join(mainRoot, "docs/ai/skills/sample-skill"), {
    recursive: true,
  });
  await writeFile(
    path.join(mainRoot, "docs/ai/skills/sample-skill/SKILL.md"),
    "# Sample skill\n",
  );

  execSync("git init -b main", {
    cwd: mainRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execSync('git config user.email "codex@example.com"', {
    cwd: mainRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execSync('git config user.name "Codex"', {
    cwd: mainRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });
  execSync("git add .", { cwd: mainRoot, env: isolatedGitEnv, stdio: "pipe" });
  execSync('git commit -m "init"', {
    cwd: mainRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });

  runNodeScript(mainRoot, "scripts/sync-agent-skills.mjs");

  execSync("git add .", { cwd: mainRoot, env: isolatedGitEnv, stdio: "pipe" });
  execSync('git commit -m "sync skill mirrors"', {
    cwd: mainRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });

  execSync(`git worktree add --detach "${worktreeRoot}" HEAD`, {
    cwd: mainRoot,
    env: isolatedGitEnv,
    stdio: "pipe",
  });

  const worktreeGitDir = path.join(
    mainRoot,
    ".git",
    "worktrees",
    path.basename(worktreeRoot),
  );
  const relativeGitDir = path
    .relative(worktreeRoot, worktreeGitDir)
    .replaceAll("\\", "/");

  await rm(path.join(worktreeRoot, ".git"), { force: true });
  await writeFile(
    path.join(worktreeRoot, ".git"),
    `gitdir: ${relativeGitDir}\n`,
  );

  return worktreeRoot;
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
  }, 20_000);

  it("supports worktree-style relative gitdir files", async () => {
    const tempRoot = await createSkillsVerifyRelativeWorktreeRepo();

    expect(runNodeScript(tempRoot, "scripts/verify-skills-sync.mjs")).toContain(
      "agent skill sync complete",
    );
  }, 20_000);

  it("prints repo context when .git discovery fails", async () => {
    const tempRoot = await createTempRepo("skills-verify-missing-git");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");
    await copyScript(tempRoot, "scripts/verify-skills-sync.mjs");

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-skills-sync.mjs"),
    ).toThrow(/repoRoot:/);
  }, 20_000);
});

describe("verify-eslint-config", () => {
  it("allows Payload-generated files to keep their bare eslint-disable banner", async () => {
    const tempRoot = await createEslintVerifyRepo();

    await writeFile(
      path.join(tempRoot, "apps/admin/payload-types.ts"),
      [
        "/* tslint:disable */",
        "/* eslint-disable */",
        "/**",
        " * This file was automatically generated by Payload.",
        " * DO NOT MODIFY IT BY HAND.",
        " */",
        "export type PayloadGenerated = string;",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-eslint-config.mjs"),
    ).not.toThrow();
  });

  it("still rejects bare eslint-disable comments in non-generated source files", async () => {
    const tempRoot = await createEslintVerifyRepo();

    await writeFile(
      path.join(tempRoot, "apps/admin/not-generated.ts"),
      ["/* eslint-disable */", "export const value = 1;"].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-eslint-config.mjs"),
    ).toThrow(
      /Invalid eslint-disable format: apps\/admin\/not-generated\.ts:1/,
    );
  });

  it("ignores eslint-disable text inside ordinary string literals", async () => {
    const tempRoot = await createEslintVerifyRepo();

    await writeFile(
      path.join(tempRoot, "apps/admin/contains-string.ts"),
      ['const example = "/* eslint-disable */";', "export { example };"].join(
        "\n",
      ),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-eslint-config.mjs"),
    ).not.toThrow();
  });
});

describe("data-boundary-check", () => {
  it("ignores the approved health route exception", async () => {
    const tempRoot = await createDataBoundaryRepo();
    const routePath = path.join(tempRoot, "apps/demo/app/api/health/route.ts");
    await mkdir(path.dirname(routePath), { recursive: true });
    await writeFile(
      routePath,
      [
        'import { createClient } from "@asym/database/supabase/server";',
        "",
        "export async function GET() {",
        "  return Response.json({ ok: true });",
        "}",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify/data-boundary-check.mjs"),
    ).not.toThrow();
  });

  it("fails on direct Supabase imports in app route handlers", async () => {
    const tempRoot = await createDataBoundaryRepo();
    const routePath = path.join(tempRoot, "apps/demo/app/api/users/route.ts");
    await mkdir(path.dirname(routePath), { recursive: true });
    await writeFile(
      routePath,
      [
        'import { createClient } from "@asym/database/supabase/server";',
        "",
        "export async function GET() {",
        "  return Response.json({ ok: true });",
        "}",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify/data-boundary-check.mjs"),
    ).toThrow(/Data access boundary violations detected/);
  });

  it("also scans TSX API route handlers for direct Supabase imports", async () => {
    const tempRoot = await createDataBoundaryRepo();
    const routePath = path.join(tempRoot, "apps/demo/app/api/users/route.tsx");
    await mkdir(path.dirname(routePath), { recursive: true });
    await writeFile(
      routePath,
      [
        'import { createClient } from "@asym/database/supabase/server";',
        "",
        "export async function GET() {",
        "  return Response.json({ ok: true });",
        "}",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify/data-boundary-check.mjs"),
    ).toThrow(/Data access boundary violations detected/);
  });
});
