import { execFileSync, execSync } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
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

function runNodeScript(
  tempRoot: string,
  relativePath: string,
  arguments_: string[] = [],
) {
  return execFileSync(process.execPath, [relativePath, ...arguments_], {
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

  await mkdir(path.join(tempRoot, "docs/guides/architecture"), {
    recursive: true,
  });
  await writeFile(
    path.join(tempRoot, "docs/guides/architecture/runtime-map.md"),
    [
      "# API Runtime Map",
      "",
      "## Route Inventory",
      "",
      "| App | Route family | Runtime policy | Reason |",
      "| --- | --- | --- | --- |",
      "| demo | `/api/example` | Node.js (no `runtime` segment export) | Fixture |",
    ].join("\n"),
  );

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
  await copyScript(tempRoot, "scripts/verify/inngest-skill-references.mjs");

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
  await copyScript(mainRoot, "scripts/verify/inngest-skill-references.mjs");

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
  it("allows the explicitly vendored native PDF package directories", async () => {
    const tempRoot = await createWorkspaceContractRepo();
    await writeJson(path.join(tempRoot, "apps/demo/package.json"), {
      name: "@asym/demo",
      dependencies: {
        "@asym/pdf-editor":
          "file:../../vendor/react-pdf-packages/asym-pdf-editor",
        "@asym/ui": "workspace:*",
      },
    });
    await writeJson(path.join(tempRoot, "packages/lib/package.json"), {
      name: "@asym/lib",
      dependencies: {
        "@asym/docraptor-client":
          "file:../../vendor/react-pdf-packages/asym-docraptor-client",
      },
    });

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-workspace-contract.mjs"),
    ).not.toThrow();
  });

  it("rejects unapproved internal file dependencies", async () => {
    const tempRoot = await createWorkspaceContractRepo();
    await writeJson(path.join(tempRoot, "apps/demo/package.json"), {
      name: "@asym/demo",
      dependencies: {
        "@asym/ui": "file:../../packages/ui",
      },
    });

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-workspace-contract.mjs"),
    ).toThrow(/approved vendored package directory/);
  });

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

  it("fails when boneyard capture pages are placed in private route folders", async () => {
    const tempRoot = await createWorkspaceContractRepo();
    const pagePath = path.join(
      tempRoot,
      "apps/demo/app/__boneyard__/example/page.tsx",
    );
    await mkdir(path.dirname(pagePath), { recursive: true });
    await writeFile(
      pagePath,
      [
        "export default function Page() {",
        "  return <div>Boneyard fixture</div>;",
        "}",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-workspace-contract.mjs"),
    ).toThrow(/private capture routes are not routable/);
  });

  it("fails when runtime-map route inventory drifts from app api routes", async () => {
    const tempRoot = await createWorkspaceContractRepo();
    await mkdir(path.join(tempRoot, "docs/guides/architecture"), {
      recursive: true,
    });
    await writeFile(
      path.join(tempRoot, "docs/guides/architecture/runtime-map.md"),
      [
        "# API Runtime Map",
        "",
        "## Route Inventory",
        "",
        "| App | Route family | Runtime policy | Reason |",
        "| --- | --- | --- | --- |",
        "| demo | `/api/other` | Node.js (no `runtime` segment export) | Fixture |",
      ].join("\n"),
    );

    const routePath = path.join(tempRoot, "apps/demo/app/api/example/route.ts");
    await mkdir(path.dirname(routePath), { recursive: true });
    await writeFile(
      routePath,
      [
        "export async function GET() {",
        "  return Response.json({ ok: true });",
        "}",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-workspace-contract.mjs"),
    ).toThrow(/missing runtime map route entry/);
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
    await copyScript(tempRoot, "scripts/verify/inngest-skill-references.mjs");

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify-skills-sync.mjs"),
    ).toThrow(/repoRoot:/);
  }, 20_000);
});

describe("sync-agent-skills", () => {
  it("prunes removed canonical files while preserving runtime-only assets", async () => {
    const tempRoot = await createTempRepo("sync-skills-stale-files");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    const canonicalSkillRoot = path.join(
      tempRoot,
      "docs/ai/skills/sample-skill",
    );
    await mkdir(canonicalSkillRoot, { recursive: true });
    await writeFile(
      path.join(canonicalSkillRoot, "SKILL.md"),
      "---\nname: sample-skill\ndescription: Sample\n---\n",
    );
    await writeFile(
      path.join(canonicalSkillRoot, "CURRENT.md"),
      "current companion\n",
    );

    const runtimeRoots = [".agents/skills", ".cursor/skills", ".claude/skills"];
    for (const runtimeRoot of runtimeRoots) {
      const runtimeSkillRoot = path.join(tempRoot, runtimeRoot, "sample-skill");
      await mkdir(runtimeSkillRoot, { recursive: true });
      await writeFile(path.join(runtimeSkillRoot, "STALE.md"), "stale\n");
      await writeFile(
        path.join(runtimeSkillRoot, "RUNTIME-ONLY.md"),
        "runtime only\n",
      );
      await writeJson(
        path.join(tempRoot, runtimeRoot, ".repo-canonical-skills.json"),
        {
          version: 2,
          canonicalSkills: ["sample-skill"],
          canonicalSkillFiles: {
            "sample-skill": ["SKILL.md", "STALE.md"],
          },
        },
      );
    }

    runNodeScript(tempRoot, "scripts/sync-agent-skills.mjs");

    for (const runtimeRoot of runtimeRoots) {
      const runtimeSkillRoot = path.join(tempRoot, runtimeRoot, "sample-skill");
      await expect(
        access(path.join(runtimeSkillRoot, "STALE.md")),
      ).rejects.toThrow();
      await expect(
        readFile(path.join(runtimeSkillRoot, "CURRENT.md"), "utf8"),
      ).resolves.toBe("current companion\n");
      await expect(
        readFile(path.join(runtimeSkillRoot, "RUNTIME-ONLY.md"), "utf8"),
      ).resolves.toBe("runtime only\n");
    }
  });

  it("removes stale ecosystem files from Cursor and Claude Code mirrors", async () => {
    const tempRoot = await createTempRepo("sync-skills-ecosystem-stale-files");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    await mkdir(path.join(tempRoot, "docs/ai/skills/canonical-skill"), {
      recursive: true,
    });
    await writeFile(
      path.join(tempRoot, "docs/ai/skills/canonical-skill/SKILL.md"),
      "---\nname: canonical-skill\ndescription: Canonical\n---\n",
    );

    const ecosystemSkillRoot = path.join(
      tempRoot,
      ".agents/skills/ecosystem-skill",
    );
    await mkdir(ecosystemSkillRoot, { recursive: true });
    await writeFile(
      path.join(ecosystemSkillRoot, "SKILL.md"),
      "---\nname: ecosystem-skill\ndescription: Ecosystem\n---\n",
    );

    for (const runtimeRoot of [".cursor/skills", ".claude/skills"]) {
      const mirrorSkillRoot = path.join(
        tempRoot,
        runtimeRoot,
        "ecosystem-skill",
      );
      await mkdir(mirrorSkillRoot, { recursive: true });
      await writeFile(path.join(mirrorSkillRoot, "STALE.md"), "stale\n");
    }

    runNodeScript(tempRoot, "scripts/sync-agent-skills.mjs");

    for (const runtimeRoot of [".cursor/skills", ".claude/skills"]) {
      const mirrorSkillRoot = path.join(
        tempRoot,
        runtimeRoot,
        "ecosystem-skill",
      );
      await expect(
        access(path.join(mirrorSkillRoot, "STALE.md")),
      ).rejects.toThrow();
      await expect(
        readFile(path.join(mirrorSkillRoot, "SKILL.md"), "utf8"),
      ).resolves.toBe(
        "---\nname: ecosystem-skill\ndescription: Ecosystem\n---\n",
      );
    }
  });

  it("prunes only owned files when an entire canonical skill is removed", async () => {
    const tempRoot = await createTempRepo("sync-skills-stale-skill");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    await mkdir(path.join(tempRoot, "docs/ai/skills/active-skill"), {
      recursive: true,
    });
    await writeFile(
      path.join(tempRoot, "docs/ai/skills/active-skill/SKILL.md"),
      "---\nname: active-skill\ndescription: Active\n---\n",
    );

    const runtimeRoots = [".agents/skills", ".cursor/skills", ".claude/skills"];
    for (const runtimeRoot of runtimeRoots) {
      const retiredSkillRoot = path.join(
        tempRoot,
        runtimeRoot,
        "retired-skill",
      );
      await mkdir(retiredSkillRoot, { recursive: true });
      await writeFile(path.join(retiredSkillRoot, "SKILL.md"), "retired\n");
      await writeFile(
        path.join(retiredSkillRoot, "RUNTIME-ONLY.md"),
        "runtime only\n",
      );
      await writeJson(
        path.join(tempRoot, runtimeRoot, ".repo-canonical-skills.json"),
        {
          version: 2,
          canonicalSkills: ["retired-skill"],
          canonicalSkillFiles: {
            "retired-skill": ["SKILL.md"],
          },
        },
      );
    }

    runNodeScript(tempRoot, "scripts/sync-agent-skills.mjs");

    for (const runtimeRoot of runtimeRoots) {
      const retiredSkillRoot = path.join(
        tempRoot,
        runtimeRoot,
        "retired-skill",
      );
      await expect(
        access(path.join(retiredSkillRoot, "SKILL.md")),
      ).rejects.toThrow();
      await expect(
        readFile(path.join(retiredSkillRoot, "RUNTIME-ONLY.md"), "utf8"),
      ).resolves.toBe("runtime only\n");
    }
  });

  it("fails safely when a v1 manifest cannot distinguish stale canonical files", async () => {
    const tempRoot = await createTempRepo("sync-skills-v1-migration");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    await mkdir(path.join(tempRoot, "docs/ai/skills/active-skill"), {
      recursive: true,
    });
    await writeFile(
      path.join(tempRoot, "docs/ai/skills/active-skill/SKILL.md"),
      "---\nname: active-skill\ndescription: Active\n---\n",
    );

    const runtimeRoots = [".agents/skills", ".cursor/skills", ".claude/skills"];
    for (const runtimeRoot of runtimeRoots) {
      const retiredSkillRoot = path.join(
        tempRoot,
        runtimeRoot,
        "retired-skill",
      );
      await mkdir(retiredSkillRoot, { recursive: true });
      await writeFile(path.join(retiredSkillRoot, "SKILL.md"), "retired\n");
      await writeFile(
        path.join(retiredSkillRoot, "RUNTIME-ONLY.md"),
        "runtime only\n",
      );
      await writeJson(
        path.join(tempRoot, runtimeRoot, ".repo-canonical-skills.json"),
        {
          version: 1,
          canonicalSkills: ["retired-skill"],
        },
      );
    }

    expect(() =>
      runNodeScript(tempRoot, "scripts/sync-agent-skills.mjs"),
    ).toThrow(/Cannot safely prune stale canonical skill/);

    for (const runtimeRoot of runtimeRoots) {
      const retiredSkillRoot = path.join(
        tempRoot,
        runtimeRoot,
        "retired-skill",
      );
      await expect(
        readFile(path.join(retiredSkillRoot, "SKILL.md"), "utf8"),
      ).resolves.toBe("retired\n");
      await expect(
        readFile(path.join(retiredSkillRoot, "RUNTIME-ONLY.md"), "utf8"),
      ).resolves.toBe("runtime only\n");
    }
  });

  it("refuses traversal-like entries in the canonical skills manifest", async () => {
    const tempRoot = await createTempRepo("sync-skills-manifest-unsafe");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    await mkdir(path.join(tempRoot, "docs", "ai", "skills", "anim"), {
      recursive: true,
    });
    await writeFile(
      path.join(tempRoot, "docs", "ai", "skills", "anim", "SKILL.md"),
      "---\nname: anim\n---\n",
    );

    await mkdir(path.join(tempRoot, ".agents", "skills"), { recursive: true });
    await writeJson(
      path.join(tempRoot, ".agents", "skills", ".repo-canonical-skills.json"),
      { version: 1, canonicalSkills: [".."] },
    );
    await mkdir(path.join(tempRoot, ".cursor", "skills"), { recursive: true });
    await writeJson(
      path.join(tempRoot, ".cursor", "skills", ".repo-canonical-skills.json"),
      { version: 1, canonicalSkills: [".."] },
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/sync-agent-skills.mjs"),
    ).toThrow(/Refusing unsafe canonical skill directory name/);
  });

  it("refuses traversal-like canonical file ownership entries", async () => {
    const tempRoot = await createTempRepo("sync-skills-file-manifest-unsafe");
    await copyScript(tempRoot, "scripts/sync-agent-skills.mjs");

    await mkdir(path.join(tempRoot, "docs/ai/skills/anim"), {
      recursive: true,
    });
    await writeFile(
      path.join(tempRoot, "docs/ai/skills/anim/SKILL.md"),
      "---\nname: anim\n---\n",
    );
    await writeJson(
      path.join(tempRoot, ".agents/skills/.repo-canonical-skills.json"),
      {
        version: 2,
        canonicalSkills: ["anim"],
        canonicalSkillFiles: { anim: ["../outside.md"] },
      },
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/sync-agent-skills.mjs"),
    ).toThrow(/Refusing unsafe canonical skill file/);
  });
});

describe("refresh-upstream-skills", () => {
  it("rejects an empty focused-refresh filter instead of refreshing every source", async () => {
    const tempRoot = await createTempRepo("refresh-empty-only");
    await copyScript(tempRoot, "scripts/refresh-upstream-skills.mjs");

    expect(() =>
      runNodeScript(tempRoot, "scripts/refresh-upstream-skills.mjs", [
        "--only=",
      ]),
    ).toThrow(/non-empty source group/);
  });

  it("fails a focused Emil Kowalski refresh before mutation when a source is missing", async () => {
    const tempRoot = await createTempRepo("refresh-emil-missing-source");
    await copyScript(tempRoot, "scripts/refresh-upstream-skills.mjs");

    const canonicalSkillPath = path.join(
      tempRoot,
      "docs/ai/skills/animation-vocabulary/SKILL.md",
    );
    await mkdir(path.dirname(canonicalSkillPath), { recursive: true });
    await writeFile(canonicalSkillPath, "canonical stays intact\n");

    expect(() =>
      runNodeScript(tempRoot, "scripts/refresh-upstream-skills.mjs", [
        "--only=emilkowalski/skills",
      ]),
    ).toThrow(/Focused upstream refresh/);
    await expect(readFile(canonicalSkillPath, "utf8")).resolves.toBe(
      "canonical stays intact\n",
    );
  });

  it("keeps Emil discovery replacements idempotent across repeated focused refreshes", async () => {
    const tempRoot = await createTempRepo("refresh-emil-idempotent");
    await copyScript(tempRoot, "scripts/refresh-upstream-skills.mjs");

    const fixtures = {
      "animation-vocabulary": { "SKILL.md": "# Animation vocabulary\n" },
      "apple-design": { "SKILL.md": "# Apple design\n" },
      "emil-design-eng": {
        "SKILL.md": [
          "---",
          "name: emil-design-eng",
          "description: This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great.",
          "---",
          "",
          "# Emil design engineering",
          "",
          'import { useSpring } from "motion/react";',
          "`transform-origin: var(--transform-origin)`",
          "/* Base UI (this repo) */",
          "Use Base UI's `var(--transform-origin)`",
          "",
        ].join("\n"),
      },
      "improve-animations": {
        "AUDIT.md":
          "# Audit\n  .popover {\n    transform-origin: var(--transform-origin);\n  } /* Base UI */\n  .popover { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */\n  .popover { transform-origin: var(--transform-origin); }                       /* Base UI */\n",
        "PLAN-TEMPLATE.md": [
          "# Plan",
          "",
          "```markdown",
          "\u200B```css",
          "  transition:",
          "    transform var(--duration-standard) var(--ease-out-soft),",
          "    opacity var(--duration-standard) var(--ease-out-soft);",
          "  transform-origin: var(--transform-origin);",
          "\u200B```",
          "\u200B```css",
          "/* second example */",
          "\u200B```",
          "```",
          "",
          "## Notes for the plan author",
          "",
        ].join("\n"),
        "SKILL.md": "# Improve animations\n",
      },
      "review-animations": {
        "SKILL.md": "# Review animations\n`var(--transform-origin)`\n",
        "STANDARDS.md":
          "# Standards\n  .popover {\n    transform-origin: var(--transform-origin);\n  } /* Base UI */\n",
      },
    } as const;

    for (const [skillName, files] of Object.entries(fixtures)) {
      const skillRoot = path.join(tempRoot, ".agents/skills", skillName);
      await mkdir(skillRoot, { recursive: true });
      for (const [fileName, content] of Object.entries(files)) {
        await writeFile(path.join(skillRoot, fileName), content);
      }
    }

    const refreshArguments = ["--only=emilkowalski/skills"];
    runNodeScript(
      tempRoot,
      "scripts/refresh-upstream-skills.mjs",
      refreshArguments,
    );

    const canonicalSkillPath = path.join(
      tempRoot,
      "docs/ai/skills/emil-design-eng/SKILL.md",
    );
    const sourceSkillPath = path.join(
      tempRoot,
      ".agents/skills/emil-design-eng/SKILL.md",
    );
    await cp(canonicalSkillPath, sourceSkillPath, { force: true });
    await cp(
      path.join(tempRoot, "docs/ai/skills/improve-animations/PLAN-TEMPLATE.md"),
      path.join(tempRoot, ".agents/skills/improve-animations/PLAN-TEMPLATE.md"),
      { force: true },
    );

    runNodeScript(
      tempRoot,
      "scripts/refresh-upstream-skills.mjs",
      refreshArguments,
    );

    const refreshedContent = await readFile(canonicalSkillPath, "utf8");
    const companionSuffix =
      "Use as a craft companion after Core's frontend, emil-design-engineering, and anim guidance.";
    expect(refreshedContent.split(companionSuffix)).toHaveLength(2);
    await expect(
      readFile(
        path.join(tempRoot, "docs/ai/skills/improve-animations/AUDIT.md"),
        "utf8",
      ),
    ).resolves.not.toContain("/* Radix */");

    const firstCanonicalPath = path.join(
      tempRoot,
      "docs/ai/skills/animation-vocabulary/SKILL.md",
    );
    const reviewCanonicalPath = path.join(
      tempRoot,
      "docs/ai/skills/review-animations/STANDARDS.md",
    );
    const stableFirstCanonical = await readFile(firstCanonicalPath, "utf8");
    const stableReviewCanonical = await readFile(reviewCanonicalPath, "utf8");
    await writeFile(
      path.join(tempRoot, ".agents/skills/review-animations/STANDARDS.md"),
      "# Upstream drift removed the reviewed compatibility target\n",
    );

    expect(() =>
      runNodeScript(
        tempRoot,
        "scripts/refresh-upstream-skills.mjs",
        refreshArguments,
      ),
    ).toThrow(/failed without changing canonical skills/);
    await expect(readFile(firstCanonicalPath, "utf8")).resolves.toBe(
      stableFirstCanonical,
    );
    await expect(readFile(reviewCanonicalPath, "utf8")).resolves.toBe(
      stableReviewCanonical,
    );
  });

  it("rejects drifted Grill frontmatter before replacing the canonical skill", async () => {
    const tempRoot = await createTempRepo("refresh-grill-frontmatter-drift");
    await copyScript(tempRoot, "scripts/refresh-upstream-skills.mjs");

    const sourceSkillPath = path.join(
      tempRoot,
      ".agents/skills/grill-for-unknowns/SKILL.md",
    );
    await mkdir(path.dirname(sourceSkillPath), { recursive: true });
    await writeFile(
      sourceSkillPath,
      [
        "---",
        "name: grill-for-unknowns",
        "description: Upstream changed this discovery contract.",
        "version: 0.2.0",
        "license: MIT",
        "metadata:",
        "  version: 0.2.0",
        "# description: Use only when the user explicitly invokes grill-for-unknowns or asks for a map-vs-territory unknowns pass, blindspot discovery, unknown-known prototypes, or a subagent launch packet before implementation.",
        "# disable-model-invocation: true",
        "---",
        "",
        "# Docs + Unknowns Grill",
        "",
        "An example must not spoof the discovery metadata checks:",
        "description: Use only when the user explicitly invokes grill-for-unknowns or asks for a map-vs-territory unknowns pass, blindspot discovery, unknown-known prototypes, or a subagent launch packet before implementation.",
        "disable-model-invocation: true",
        "",
      ].join("\n"),
    );

    const canonicalSkillPath = path.join(
      tempRoot,
      "docs/ai/skills/grill-for-unknowns/SKILL.md",
    );
    await mkdir(path.dirname(canonicalSkillPath), { recursive: true });
    await writeFile(canonicalSkillPath, "canonical stays intact\n");

    expect(() =>
      runNodeScript(tempRoot, "scripts/refresh-upstream-skills.mjs", [
        "--only=nicobailon/grill-for-unknowns",
      ]),
    ).toThrow(/Incompatible grill-for-unknowns frontmatter/);
    await expect(readFile(canonicalSkillPath, "utf8")).resolves.toBe(
      "canonical stays intact\n",
    );
  });
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

  it("fails when app source imports raw Twenty clients or server-only credentials", async () => {
    const tempRoot = await createDataBoundaryRepo();
    const pagePath = path.join(tempRoot, "apps/demo/app/crm/page.tsx");
    await mkdir(path.dirname(pagePath), { recursive: true });
    await writeFile(
      pagePath,
      [
        'import { TwentyCoreClient } from "@asym/api/crm/client/core";',
        "",
        "export default function Page() {",
        "  return process.env.TWENTY_API_KEY;",
        "}",
      ].join("\n"),
    );

    expect(() =>
      runNodeScript(tempRoot, "scripts/verify/data-boundary-check.mjs"),
    ).toThrow(/Twenty CRM boundary violations detected/);
  });
});
