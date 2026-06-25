#!/usr/bin/env node
/**
 * Vendor selected ecosystem skills from their upstream sources into
 * `docs/ai/skills/` so they remain the canonical source mirrored by
 * `skills:sync`.
 *
 * Workflow:
 * 1. Refresh upstream sources where needed (Skills CLI, vendor installer, or
 *    the GitHub temp-clone groups below)
 * 2. `bun run skills:refresh-upstream`
 * 3. Re-apply any repo-specific notes if a refresh overwrote them
 * 4. `bun run skills:sync` && `bun run skills:verify`
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const canonicalRoot = path.join(repoRoot, "docs", "ai", "skills");
const skillsLockPath = path.join(repoRoot, "skills-lock.json");
const lastReviewed =
  process.env.SKILLS_REFRESH_DATE?.trim() ||
  new Date().toISOString().slice(0, 10);
const SAFE_CANONICAL_SKILL_DIR_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const cursorTeamKitSkillNames = [
  "check-compiler-errors",
  "control-cli",
  "control-ui",
  "deslop",
  "fix-ci",
  "fix-merge-conflicts",
  "get-pr-comments",
  "loop-on-ci",
  "make-pr-easy-to-review",
  "new-branch-and-pr",
  "pr-review-canvas",
  "review-and-ship",
  "run-smoke-tests",
  "thermo-nuclear-code-quality-review",
  "verify-this",
  "weekly-review",
  "what-did-i-get-done",
  "workflow-from-chats",
];

const localUpstreamSources = [
  {
    skillName: "supabase",
    from: path.join(repoRoot, ".agents", "skills", "supabase"),
    preserve: ["references/upstream.md"],
  },
  {
    skillName: "supabase-postgres-best-practices",
    from: path.join(
      repoRoot,
      ".agents",
      "skills",
      "supabase-postgres-best-practices",
    ),
    preserve: ["references/upstream.md"],
  },
  {
    skillName: "emil-design-engineering",
    from: path.join(
      process.env.HOME ?? "",
      ".cursor",
      "skills",
      "emil-design-engineering",
    ),
    preserve: ["references/upstream.md"],
  },
  {
    skillName: "npm-deps-cleanup",
    from: path.join(repoRoot, ".agents", "skills", "npm-deps-cleanup"),
    preserve: ["references/upstream.md"],
  },
];

const githubUpstreamGroups = [
  {
    name: "Cursor Team Kit",
    repo: "https://github.com/cursor/plugins.git",
    source: "cursor/plugins",
    sourceUrl: "https://github.com/cursor/plugins",
    ref: "main",
    sourceRoot: "cursor-team-kit/skills",
    skillNames: cursorTeamKitSkillNames,
    lockSkillPath(skillName) {
      return `cursor-team-kit/skills/${skillName}/SKILL.md`;
    },
    upstreamPath(skillName) {
      return `cursor-team-kit/skills/${skillName}/`;
    },
    sourceUrlForSkill(skillName) {
      return `https://github.com/cursor/plugins/tree/main/cursor-team-kit/skills/${skillName}`;
    },
    extraCopies: [
      {
        from: "cursor-team-kit/agents/ci-watcher.md",
        to: ".cursor/agents/ci-watcher.md",
      },
      {
        from: "cursor-team-kit/agents/thermo-nuclear-code-quality-review.md",
        to: ".cursor/agents/thermo-nuclear-code-quality-review.md",
      },
    ],
  },
  {
    name: "Babysitter Cursor",
    repo: "https://github.com/a5c-ai/babysitter-cursor.git",
    source: "a5c-ai/babysitter-cursor",
    sourceUrl: "https://github.com/a5c-ai/babysitter-cursor",
    ref: "develop",
    sourceRoot: "skills",
    skillNames: ["babysit"],
    lockSkillPath() {
      return "skills/babysit/SKILL.md";
    },
    upstreamPath(skillName) {
      return `skills/${skillName}/`;
    },
    sourceUrlForSkill(skillName) {
      return `https://github.com/a5c-ai/babysitter-cursor/tree/develop/skills/${skillName}`;
    },
    skillExtraCopies: {
      babysit: [
        {
          from: "versions.json",
          to: "versions.json",
        },
      ],
    },
  },
];

const POST_REFRESH_REPLACEMENTS = [
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search: '<input data-lpignore="true" data-1p-ignore />',
    replace:
      '<input data-lpignore="true" data-1p-ignore /> // pragma: allowlist secret',
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search: "### 1Password Integration", // pragma: allowlist secret
    replace: "### 1Password Integration // pragma: allowlist secret", // pragma: allowlist secret
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search: "Disable 1Password autocomplete when not needed:", // pragma: allowlist secret
    replace:
      "Disable 1Password autocomplete when not needed: // pragma: allowlist secret",
  },
];

function assertSafeCanonicalSkillDirName(skillName, context) {
  if (
    typeof skillName !== "string" ||
    !SAFE_CANONICAL_SKILL_DIR_RE.test(skillName)
  ) {
    throw new Error(
      `Refusing unsafe canonical skill directory name${context ? ` (${context})` : ""}: ${JSON.stringify(skillName)}`,
    );
  }
}

function assertSafeRelativePath(relativePath, context) {
  if (
    typeof relativePath !== "string" ||
    path.isAbsolute(relativePath) ||
    relativePath.split(/[\\/]/).includes("..")
  ) {
    throw new Error(
      `Refusing unsafe relative path${context ? ` (${context})` : ""}: ${JSON.stringify(relativePath)}`,
    );
  }
}

function assertPathInside(parent, child, context) {
  const parentResolved = path.resolve(parent);
  const childResolved = path.resolve(child);
  const prefix = parentResolved.endsWith(path.sep)
    ? parentResolved
    : `${parentResolved}${path.sep}`;

  if (childResolved !== parentResolved && !childResolved.startsWith(prefix)) {
    throw new Error(
      `Refusing path outside expected root${context ? ` (${context})` : ""}: ${childResolved}`,
    );
  }
}

async function readPreservedFiles(targetRoot, preserve) {
  const entries = await Promise.all(
    preserve.map(async (relativePath) => {
      assertSafeRelativePath(relativePath, "preserve");
      try {
        const content = await readFile(
          path.join(targetRoot, relativePath),
          "utf8",
        );
        return [relativePath, content];
      } catch (error) {
        const errorCode =
          typeof error === "object" && error !== null && "code" in error
            ? String(error.code)
            : "";
        if (errorCode === "ENOENT") {
          return null;
        }
        throw error;
      }
    }),
  );
  return entries.filter(Boolean);
}

async function restorePreservedFiles(targetRoot, preservedFiles) {
  for (const [relativePath, content] of preservedFiles) {
    assertSafeRelativePath(relativePath, "restore");
    const targetPath = path.join(targetRoot, relativePath);
    assertPathInside(targetRoot, targetPath, "restore preserved file");
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
  }
}

function annotateEmilDesignEngineeringFormsControls(content) {
  const lines = content.split("\n");
  const helperHeadingIndex = lines.findIndex(
    (line) => line.trim() === "### Input Types",
  );

  if (helperHeadingIndex !== -1) {
    const codeFenceStart = lines.findIndex(
      (line, index) => index > helperHeadingIndex && line.trim() === "```html",
    );
    const codeFenceEnd =
      codeFenceStart === -1
        ? -1
        : lines.findIndex(
            (line, index) => index > codeFenceStart && line.trim() === "```",
          );

    if (codeFenceStart !== -1 && codeFenceEnd !== -1) {
      const inputLineIndexes = [];
      for (let index = codeFenceStart + 1; index < codeFenceEnd; index += 1) {
        if (lines[index].trim().startsWith("<input ")) {
          inputLineIndexes.push(index);
        }
      }

      // The password example triggers the repo secret scanner. Target the line
      // that contains `type="password"` so harmless nearby examples are not
      // annotated.
      const passwordLineIndex = inputLineIndexes.find((idx) =>
        lines[idx].includes('type="password"'),
      );
      if (
        passwordLineIndex !== undefined &&
        !lines[passwordLineIndex].includes("// pragma: allowlist secret")
      ) {
        lines[passwordLineIndex] =
          `${lines[passwordLineIndex]} // pragma: allowlist secret`;
      }
    }
  }

  return lines.join("\n");
}

async function applyPostRefreshReplacements(skillName, targetRoot) {
  if (skillName === "emil-design-engineering") {
    const formsControlsPath = path.join(targetRoot, "forms-controls.md");
    const formsControlsContent = await readFile(formsControlsPath, "utf8");
    const patchedContent =
      annotateEmilDesignEngineeringFormsControls(formsControlsContent);

    if (patchedContent !== formsControlsContent) {
      await writeFile(formsControlsPath, patchedContent, "utf8");
    }
  }

  for (const replacement of POST_REFRESH_REPLACEMENTS) {
    if (replacement.skillName !== skillName) {
      continue;
    }

    const targetPath = path.join(targetRoot, replacement.relativePath);
    const content = await readFile(targetPath, "utf8");
    if (!content.includes(replacement.search)) {
      continue;
    }

    await writeFile(
      targetPath,
      content.replace(replacement.search, replacement.replace),
      "utf8",
    );
  }

  if (skillName === "emil-design-engineering") {
    const targetPath = path.join(targetRoot, "forms-controls.md");
    const lines = (await readFile(targetPath, "utf8")).split("\n");

    const helperHeadingIndex = lines.findIndex(
      (line) => line === "### 1Password Integration", // pragma: allowlist secret
    );
    if (helperHeadingIndex !== -1) {
      lines[helperHeadingIndex] =
        "### 1Password Integration // pragma: allowlist secret"; // pragma: allowlist secret
    }

    const helperCopyIndex = lines.findIndex(
      (line) => line === "Disable 1Password autocomplete when not needed:", // pragma: allowlist secret
    );
    if (helperCopyIndex !== -1) {
      lines[helperCopyIndex] =
        "Disable 1Password autocomplete when not needed: // pragma: allowlist secret"; // pragma: allowlist secret
    }

    const helperInputIndex = lines.findIndex(
      (line) => line.includes('data-lpignore="true" data-1p-ignore'), // pragma: allowlist secret
    );
    if (
      helperInputIndex !== -1 &&
      !lines[helperInputIndex].includes("pragma: allowlist secret")
    ) {
      lines[helperInputIndex] =
        `${lines[helperInputIndex]} // pragma: allowlist secret`;
    }

    const inputTypesIndex = lines.findIndex(
      (line) => line.trim() === "Use appropriate `type` attributes:",
    );
    if (inputTypesIndex !== -1) {
      for (let index = inputTypesIndex + 1; index < lines.length; index += 1) {
        if (lines[index].startsWith("<input type=")) {
          if (!lines[index].includes("pragma: allowlist secret")) {
            lines[index] = `${lines[index]} // pragma: allowlist secret`;
          }
          break;
        }
      }
    }

    await writeFile(targetPath, lines.join("\n"), "utf8");
  }
}

async function refreshLocalSkill({ skillName, from, preserve = [] }) {
  assertSafeCanonicalSkillDirName(skillName, "local refresh");
  const to = path.join(canonicalRoot, skillName);
  assertPathInside(canonicalRoot, to, "local refresh target");

  if (skillName === "emil-design-engineering" && !process.env.HOME?.trim()) {
    throw new Error(
      `refreshLocalSkill (${skillName}): HOME is not set (or empty); cannot resolve ~/.cursor/skills/${skillName}.`,
    );
  }

  // Guard: verify the source exists before deleting the canonical tree.
  // Without this check, rm(to) could delete the canonical skill tree on a
  // machine that has not run the upstream installer.
  try {
    await access(from);
  } catch {
    throw new Error(
      `refreshLocalSkill: source path does not exist - "${from}"\n` +
        `Aborting to avoid deleting canonical tree at "${to}".\n` +
        `Run the upstream installer first, then retry.`,
    );
  }

  const preservedFiles = await readPreservedFiles(to, preserve);
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  await restorePreservedFiles(to, preservedFiles);
  await applyPostRefreshReplacements(skillName, to);
  console.log(
    `refreshed ${path.relative(repoRoot, to)} <= ${path.relative(repoRoot, from)}`,
  );
}

function runGit(args, context, { capture = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(
      `${context} failed with exit ${result.status}${stderr ? `:\n${stderr}` : ""}`,
    );
  }

  return result.stdout?.trim() ?? "";
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(filePath) {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

async function formatSkillTarget(targetRoot) {
  const prettierBin = path.join(
    repoRoot,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prettier.cmd" : "prettier",
  );

  if (!(await fileExists(prettierBin))) {
    console.warn(
      `[warn] prettier not found at ${path.relative(repoRoot, prettierBin)}; copied ${path.relative(repoRoot, targetRoot)} without repo formatting`,
    );
    return;
  }

  const result = spawnSync(prettierBin, ["--write", targetRoot], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `prettier failed for ${path.relative(repoRoot, targetRoot)} with exit ${result.status}`,
    );
  }
}

async function readSkillsLock() {
  const raw = await readFile(skillsLockPath, "utf8");
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("skills-lock.json must contain an object");
  }
  if (typeof parsed.version !== "number") {
    throw new Error("skills-lock.json is missing numeric version");
  }
  if (typeof parsed.skills !== "object" || parsed.skills === null) {
    throw new Error("skills-lock.json is missing skills object");
  }
  return parsed;
}

async function writeSkillsLock(lockfile) {
  const sortedSkills = Object.fromEntries(
    Object.entries(lockfile.skills).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  const sortedLockfile = {
    version: lockfile.version,
    skills: sortedSkills,
  };
  await writeFile(
    skillsLockPath,
    `${JSON.stringify(sortedLockfile, null, 2)}\n`,
    "utf8",
  );
}

function buildUpstreamMetadata({ group, skillName, hash, commitSha }) {
  const upstreamPath = group.upstreamPath(skillName);
  const sourceUrl = group.sourceUrlForSkill(skillName);
  const lockSkillPath = group.lockSkillPath(skillName);
  return `---
source_name: ${group.source} (${skillName})
source_url: ${sourceUrl}
source_type: github
upstream_path: ${upstreamPath}
skills_lock_hash: ${hash}
last_reviewed: ${lastReviewed}
---

# Upstream: ${skillName}

Canonical copy in this repo: \`docs/ai/skills/${skillName}/\` (mirrored to \`.cursor/skills/\` and \`.agents/skills/\` via \`bun run skills:sync\`).

- **Repository:** ${group.sourceUrl}
- **Ref:** \`${group.ref}\`
- **Commit reviewed:** \`${commitSha}\`
- **Upstream path:** \`${upstreamPath}\`
- **Lock skillPath:** \`${lockSkillPath}\`
- **Computed hash:** \`${hash}\`

## Refresh from upstream

1. Run \`bun run skills:refresh-upstream\`.
2. The script clones \`${group.repo}\` at \`${group.ref}\`, verifies the upstream skill directory exists, copies the full skill directory into \`docs/ai/skills/${skillName}/\`, and updates this metadata.
3. Run \`bun run skills:sync\` and \`bun run skills:verify\` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this \`references/\` directory when refreshing.
`;
}

async function writeUpstreamMetadata({
  targetRoot,
  group,
  skillName,
  hash,
  commitSha,
}) {
  const metadataPath = path.join(targetRoot, "references", "upstream.md");
  assertPathInside(targetRoot, metadataPath, "upstream metadata");
  await mkdir(path.dirname(metadataPath), { recursive: true });
  await writeFile(
    metadataPath,
    buildUpstreamMetadata({ group, skillName, hash, commitSha }),
    "utf8",
  );
}

async function copySkillExtraFiles({ cloneDir, targetRoot, extraCopies = [] }) {
  for (const extraCopy of extraCopies) {
    assertSafeRelativePath(extraCopy.from, "skill extra source");
    assertSafeRelativePath(extraCopy.to, "skill extra target");

    const sourcePath = path.join(cloneDir, extraCopy.from);
    const targetPath = path.join(targetRoot, extraCopy.to);
    assertPathInside(cloneDir, sourcePath, "skill extra source");
    assertPathInside(targetRoot, targetPath, "skill extra target");

    if (!(await fileExists(sourcePath))) {
      throw new Error(
        `Missing required upstream support file: ${extraCopy.from}`,
      );
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, { recursive: true, force: true });
  }
}

async function copyCompanionFiles({ cloneDir, group }) {
  for (const extraCopy of group.extraCopies ?? []) {
    assertSafeRelativePath(extraCopy.from, `${group.name} companion source`);
    assertSafeRelativePath(extraCopy.to, `${group.name} companion target`);

    const sourcePath = path.join(cloneDir, extraCopy.from);
    const targetPath = path.join(repoRoot, extraCopy.to);
    assertPathInside(cloneDir, sourcePath, `${group.name} companion source`);
    assertPathInside(repoRoot, targetPath, `${group.name} companion target`);

    if (!(await fileExists(sourcePath))) {
      throw new Error(
        `Missing required upstream companion file: ${extraCopy.from}`,
      );
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, { force: true });
    console.log(
      `refreshed companion ${path.relative(repoRoot, targetPath)} <= ${extraCopy.from}`,
    );
  }
}

async function refreshGithubGroup(group, lockfile) {
  for (const skillName of group.skillNames) {
    assertSafeCanonicalSkillDirName(skillName, `${group.name} config`);
  }

  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "core-skill-upstream-"),
  );
  const cloneDir = path.join(tempRoot, group.source.replace(/[^\w.-]+/g, "-"));

  try {
    // Maintainers can rerun this command to pull newer upstream content without
    // manually copy-pasting skill files from GitHub.
    runGit(
      ["clone", "--depth", "1", "--branch", group.ref, group.repo, cloneDir],
      `clone ${group.name}`,
    );
    const commitSha = runGit(
      ["-C", cloneDir, "rev-parse", "HEAD"],
      `resolve ${group.name} commit`,
      { capture: true },
    );

    let refreshed = 0;
    for (const skillName of group.skillNames) {
      const upstreamSkillDir = path.join(cloneDir, group.sourceRoot, skillName);
      const upstreamSkillFile = path.join(upstreamSkillDir, "SKILL.md");
      const targetRoot = path.join(canonicalRoot, skillName);

      assertPathInside(cloneDir, upstreamSkillDir, `${group.name} source`);
      assertPathInside(canonicalRoot, targetRoot, `${group.name} target`);

      if (!(await fileExists(upstreamSkillFile))) {
        console.warn(
          `[warn] skipping ${skillName}: upstream SKILL.md not found at ${path.relative(cloneDir, upstreamSkillFile)}`,
        );
        continue;
      }

      const preservedFiles = await readPreservedFiles(targetRoot, [
        "references/upstream.md",
      ]);
      await rm(targetRoot, { recursive: true, force: true });
      await cp(upstreamSkillDir, targetRoot, { recursive: true });
      await restorePreservedFiles(targetRoot, preservedFiles);
      await copySkillExtraFiles({
        cloneDir,
        targetRoot,
        extraCopies: group.skillExtraCopies?.[skillName] ?? [],
      });
      await formatSkillTarget(targetRoot);

      const hash = await sha256File(path.join(targetRoot, "SKILL.md"));
      await writeUpstreamMetadata({
        targetRoot,
        group,
        skillName,
        hash,
        commitSha,
      });

      lockfile.skills[skillName] = {
        source: group.source,
        sourceType: "github",
        skillPath: group.lockSkillPath(skillName),
        computedHash: hash,
      };

      refreshed += 1;
      console.log(
        `refreshed ${path.relative(repoRoot, targetRoot)} <= ${path.relative(cloneDir, upstreamSkillDir)}`,
      );
    }

    await copyCompanionFiles({ cloneDir, group });
    return refreshed;
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function main() {
  let skipped = 0;
  for (const source of localUpstreamSources) {
    try {
      await refreshLocalSkill(source);
    } catch (error) {
      console.warn(
        `[warn] skipping ${source.skillName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      skipped += 1;
    }
  }

  const lockfile = await readSkillsLock();
  let githubRefreshed = 0;
  for (const group of githubUpstreamGroups) {
    try {
      githubRefreshed += await refreshGithubGroup(group, lockfile);
    } catch (error) {
      console.warn(
        `[warn] skipping ${group.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
      skipped += 1;
    }
  }

  if (githubRefreshed > 0) {
    await writeSkillsLock(lockfile);
    console.log(
      `updated skills-lock.json for ${githubRefreshed} GitHub skill(s)`,
    );
  }

  if (skipped > 0) {
    console.warn(
      `${skipped} source(s) skipped - install missing upstream sources or check network access to refresh them.`,
    );
  }
  console.log(
    "upstream skill refresh complete - run `bun run skills:sync` then `bun run skills:verify`",
  );
}

main().catch((error) => {
  console.error("refresh-upstream-skills failed");
  console.error(error);
  process.exit(1);
});
