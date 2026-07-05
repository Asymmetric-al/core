#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const gitSafeEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);
const dotGitPath = path.join(repoRoot, ".git");

function resolveGitDir() {
  let resolvedGitDir = dotGitPath;

  try {
    if (statSync(dotGitPath).isDirectory()) {
      return dotGitPath;
    }

    resolvedGitDir = path.resolve(
      repoRoot,
      readFileSync(dotGitPath, "utf8")
        .trim()
        .replace(/^gitdir:\s*/i, ""),
    );

    return resolvedGitDir;
  } catch (error) {
    console.error(`repoRoot: ${repoRoot}`);
    console.error(`resolvedGitDir: ${resolvedGitDir}`);
    console.error(
      "hint: ensure .git points to a readable gitdir and run the verifier from the repo root.",
    );
    throw error;
  }
}

const gitDir = resolveGitDir();
const gitArgs = [`--git-dir=${gitDir}`, `--work-tree=${repoRoot}`];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: gitSafeEnv,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(process.execPath, ["scripts/sync-agent-skills.mjs"]);
run(process.execPath, ["scripts/verify/inngest-skill-references.mjs"]);

const diffResult = spawnSync(
  "git",
  [
    ...gitArgs,
    "diff",
    "--exit-code",
    "--ignore-cr-at-eol",
    "--",
    ".agents/skills",
    ".cursor/skills",
    ".claude/skills",
    ".claude/commands",
    ".claude/agents",
  ],
  { cwd: repoRoot, env: gitSafeEnv, stdio: "inherit" },
);

if (diffResult.error) {
  throw diffResult.error;
}

if (diffResult.status !== 0) {
  console.error(
    "Skill mirror drift detected. Run `bun run skills:sync` and commit mirror updates.",
  );
  process.exit(diffResult.status ?? 1);
}

const untrackedResult = spawnSync(
  "git",
  [
    ...gitArgs,
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    ".agents/skills",
    ".cursor/skills",
    ".claude/skills",
    ".claude/commands",
    ".claude/agents",
  ],
  {
    cwd: repoRoot,
    encoding: "utf8",
    env: gitSafeEnv,
    stdio: ["inherit", "pipe", "inherit"],
  },
);

if (untrackedResult.error) {
  throw untrackedResult.error;
}

if (untrackedResult.stdout.trim()) {
  console.error(untrackedResult.stdout.trim());
  console.error(
    "Skill mirror drift detected. Run `bun run skills:sync` and commit mirror updates.",
  );
  process.exit(1);
}
