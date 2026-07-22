#!/usr/bin/env node

import {
  cp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sourceRoot = path.join(repoRoot, "docs", "ai", "skills");

// Canonical skill targets. `docs/ai/skills/*` is overlaid into each target.
// The manifest records canonical file ownership so removed canonical files can
// be pruned without deleting extra runtime assets installed by an ecosystem
// package. `.claude/skills` is included so Claude Code discovers project skills
// the same way Cursor and the .agents runtime do.
const targetRoots = [
  path.join(repoRoot, ".agents", "skills"),
  path.join(repoRoot, ".cursor", "skills"),
  path.join(repoRoot, ".claude", "skills"),
];

// Mirror destinations for the full `.agents/skills` set (canonical + ecosystem
// installs). `.agents/skills` is the mirror source, so it is intentionally not
// listed here. Each skill directory is replaced atomically so removed ecosystem
// files cannot remain stale in Cursor or Claude Code.
const skillMirrorRoots = [
  path.join(repoRoot, ".cursor", "skills"),
  path.join(repoRoot, ".claude", "skills"),
];

// Whole-directory mirrors for Claude Code. The source is the Cursor copy
// (already format-checked), and the target is fully replaced on each sync so
// deletions propagate and no stale files linger.
const treeMirrors = [
  {
    label: "commands",
    sourceRoot: path.join(repoRoot, ".cursor", "commands"),
    targetRoot: path.join(repoRoot, ".claude", "commands"),
  },
  {
    label: "agents",
    sourceRoot: path.join(repoRoot, ".cursor", "agents"),
    targetRoot: path.join(repoRoot, ".claude", "agents"),
  },
];

const CANONICAL_MANIFEST_FILENAME = ".repo-canonical-skills.json";
const CANONICAL_MANIFEST_VERSION = 2;

// Core-authored adapters fully own their runtime directories. Some adapters
// replace ecosystem installs with the same name (notably `vitest`), so an
// overlay would leave stale upstream references discoverable beside Core's
// version-specific guidance.
const fullyManagedCanonicalSkills = new Set([
  "accessibility-review",
  "find-animation-opportunities",
  "playwright-cli",
  "vitest",
]);

/** Single path segment: lowercase slug segments (matches docs/ai/skills/* layout). */
const SAFE_CANONICAL_SKILL_DIR_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function assertMirrorSkillDirUnderRoot(targetRoot, skillName) {
  const rootResolved = path.resolve(targetRoot);
  const targetDir = path.join(targetRoot, skillName);
  const dirResolved = path.resolve(targetDir);
  const prefix = rootResolved.endsWith(path.sep)
    ? rootResolved
    : `${rootResolved}${path.sep}`;
  if (dirResolved !== rootResolved && !dirResolved.startsWith(prefix)) {
    throw new Error(
      `Refusing path outside mirror root for skill ${JSON.stringify(skillName)}`,
    );
  }
}

function assertSafeRelativeSkillFile(relativePath, context) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    relativePath.includes("\\") ||
    path.isAbsolute(relativePath) ||
    relativePath
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error(
      `Refusing unsafe canonical skill file${context ? ` (${context})` : ""}: ${JSON.stringify(relativePath)}`,
    );
  }
}

function getSkillFilePathUnderRoot(targetRoot, skillName, relativePath) {
  assertSafeCanonicalSkillDirName(skillName, "canonical file path");
  assertSafeRelativeSkillFile(relativePath, skillName);
  const skillRoot = path.resolve(targetRoot, skillName);
  const targetPath = path.resolve(skillRoot, ...relativePath.split("/"));
  const prefix = `${skillRoot}${path.sep}`;
  if (!targetPath.startsWith(prefix)) {
    throw new Error(
      `Refusing canonical file path outside skill root: ${JSON.stringify(relativePath)}`,
    );
  }
  return targetPath;
}

async function overlayDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const sourceEntries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of sourceEntries) {
    await cp(
      path.join(sourceDir, entry.name),
      path.join(targetDir, entry.name),
      {
        recursive: true,
        force: true,
      },
    );
  }
}

function getErrorCode(error) {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
}

function getTemporarySiblingPath(targetDir, label) {
  const parentDir = path.dirname(targetDir);
  const targetName = path.basename(targetDir);
  const uniqueSuffix = `${process.pid}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  return path.join(parentDir, `.${targetName}.${label}-${uniqueSuffix}`);
}

/**
 * Windows can transiently fail a directory rename with EPERM/EACCES/EBUSY
 * while an indexer, antivirus scan, or editor watcher briefly holds a handle
 * on the directory or a child. The contention clears in milliseconds, so a
 * short bounded retry (the graceful-fs/npm pattern) makes the mirror swap
 * reliable without masking real permission failures.
 */
const TRANSIENT_RENAME_CODES = new Set(["EPERM", "EACCES", "EBUSY"]);

async function renameWithRetry(fromPath, toPath) {
  const maxAttempts = 6;
  let delayMs = 50;

  for (let attempt = 1; ; attempt += 1) {
    try {
      await rename(fromPath, toPath);
      return;
    } catch (error) {
      const isTransient = TRANSIENT_RENAME_CODES.has(getErrorCode(error));
      if (!isTransient || attempt >= maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(delayMs * 2, 800);
    }
  }
}

async function swapStagedDirectory(stagingDir, targetDir) {
  const backupDir = getTemporarySiblingPath(targetDir, "backup");
  let hasBackup = false;

  try {
    await renameWithRetry(targetDir, backupDir);
    hasBackup = true;
  } catch (error) {
    if (getErrorCode(error) !== "ENOENT") {
      throw error;
    }
  }

  try {
    await renameWithRetry(stagingDir, targetDir);
  } catch (error) {
    if (hasBackup) {
      await renameWithRetry(backupDir, targetDir);
    }
    throw error;
  }

  if (hasBackup) {
    try {
      await rm(backupDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn(
        `warning: failed to remove backup directory ${backupDir}`,
        cleanupError,
      );
    }
  }
}

async function replaceDirectory(sourceDir, targetDir) {
  const sourceEntries = await readdir(sourceDir, { withFileTypes: true });
  const parentDir = path.dirname(targetDir);
  const stagingDir = getTemporarySiblingPath(targetDir, "staging");
  let swapped = false;

  await mkdir(parentDir, { recursive: true });
  await rm(stagingDir, { recursive: true, force: true });
  await mkdir(stagingDir, { recursive: true });

  try {
    for (const entry of sourceEntries) {
      await cp(
        path.join(sourceDir, entry.name),
        path.join(stagingDir, entry.name),
        {
          recursive: true,
          force: true,
        },
      );
    }

    await swapStagedDirectory(stagingDir, targetDir);
    swapped = true;
  } finally {
    if (!swapped) {
      await rm(stagingDir, { recursive: true, force: true });
    }
  }
}

function getCanonicalManifestPath(targetRoot) {
  return path.join(targetRoot, CANONICAL_MANIFEST_FILENAME);
}

async function readCanonicalManifest(targetRoot) {
  const manifestPath = getCanonicalManifestPath(targetRoot);

  try {
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    const canonicalSkills = Array.isArray(parsed?.canonicalSkills)
      ? parsed.canonicalSkills.filter((skill) => typeof skill === "string")
      : [];
    const canonicalSkillFiles = {};

    for (const name of canonicalSkills) {
      assertSafeCanonicalSkillDirName(name, "canonical manifest read");
    }

    if (
      typeof parsed?.canonicalSkillFiles === "object" &&
      parsed.canonicalSkillFiles !== null &&
      !Array.isArray(parsed.canonicalSkillFiles)
    ) {
      for (const [skillName, filePaths] of Object.entries(
        parsed.canonicalSkillFiles,
      )) {
        assertSafeCanonicalSkillDirName(skillName, "canonical file manifest");
        if (!Array.isArray(filePaths)) {
          throw new Error(
            `Invalid canonical file manifest for ${JSON.stringify(skillName)}`,
          );
        }
        canonicalSkillFiles[skillName] = filePaths
          .filter((filePath) => typeof filePath === "string")
          .map((filePath) => {
            assertSafeRelativeSkillFile(
              filePath,
              `canonical file manifest ${skillName}`,
            );
            return filePath;
          })
          .sort();
      }
    }

    return {
      version:
        typeof parsed?.version === "number"
          ? parsed.version
          : CANONICAL_MANIFEST_VERSION,
      canonicalSkills: canonicalSkills.sort(),
      canonicalSkillFiles,
    };
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";

    if (errorCode === "ENOENT") {
      return {
        version: CANONICAL_MANIFEST_VERSION,
        canonicalSkills: [],
        canonicalSkillFiles: {},
      };
    }

    throw new Error(
      `Unable to read canonical skill manifest: ${path.relative(repoRoot, manifestPath)}`,
      { cause: error },
    );
  }
}

async function writeCanonicalManifest(
  targetRoot,
  canonicalSkills,
  canonicalSkillFiles,
) {
  for (const name of canonicalSkills) {
    assertSafeCanonicalSkillDirName(name, "canonical manifest write");
  }

  const manifestPath = getCanonicalManifestPath(targetRoot);
  const manifest = {
    version: CANONICAL_MANIFEST_VERSION,
    canonicalSkills: [...canonicalSkills].sort(),
    canonicalSkillFiles,
  };

  await mkdir(targetRoot, { recursive: true });
  await writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );
}

async function pruneStaleCanonicalSkills(
  targetRoot,
  canonicalSkills,
  previous,
) {
  const currentSkillSet = new Set(canonicalSkills);
  const staleSkills = previous.canonicalSkills.filter(
    (skillName) => !currentSkillSet.has(skillName),
  );

  for (const skillName of staleSkills) {
    assertSafeCanonicalSkillDirName(skillName, "manifest prune");
    if (previous.version < CANONICAL_MANIFEST_VERSION) {
      const targetDir = path.join(targetRoot, skillName);
      throw new Error(
        `Cannot safely prune stale canonical skill ${path.relative(repoRoot, targetDir)} from a v${previous.version} manifest without file ownership; reconcile the directory before rerunning skills:sync.`,
      );
    }

    const previouslyOwnedFiles = previous.canonicalSkillFiles[skillName] ?? [];

    for (const relativePath of previouslyOwnedFiles) {
      const targetPath = getSkillFilePathUnderRoot(
        targetRoot,
        skillName,
        relativePath,
      );
      await rm(targetPath, { recursive: true, force: true });
      console.log(`pruned ${path.relative(repoRoot, targetPath)}`);
    }
  }
}

async function listRelativeSkillFiles(skillRoot, relativeRoot = "") {
  const directory = path.join(
    skillRoot,
    ...relativeRoot.split("/").filter(Boolean),
  );
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = relativeRoot
      ? `${relativeRoot}/${entry.name}`
      : entry.name;
    assertSafeRelativeSkillFile(relativePath, "canonical source listing");

    if (entry.isDirectory()) {
      files.push(...(await listRelativeSkillFiles(skillRoot, relativePath)));
      continue;
    }

    files.push(relativePath);
  }

  return files.sort();
}

async function buildCanonicalSkillFiles(canonicalSkills) {
  const entries = await Promise.all(
    canonicalSkills.map(async (skillName) => [
      skillName,
      await listRelativeSkillFiles(path.join(sourceRoot, skillName)),
    ]),
  );
  return Object.fromEntries(entries);
}

async function pruneStaleCanonicalFiles(
  targetRoot,
  skillName,
  previousFiles,
  currentFiles,
) {
  const currentFileSet = new Set(currentFiles);
  const staleFiles = previousFiles.filter(
    (relativePath) => !currentFileSet.has(relativePath),
  );

  for (const relativePath of staleFiles) {
    const targetPath = getSkillFilePathUnderRoot(
      targetRoot,
      skillName,
      relativePath,
    );
    await rm(targetPath, { recursive: true, force: true });
    console.log(`pruned ${path.relative(repoRoot, targetPath)}`);
  }
}

async function listCanonicalSkillsForSync() {
  let entries;

  try {
    entries = await readdir(sourceRoot, { withFileTypes: true });
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";

    if (errorCode === "ENOENT") {
      throw new Error(
        `Canonical skill source directory not found: ${path.relative(repoRoot, sourceRoot)}`,
      );
    }

    throw new Error(
      `Unable to read canonical skill source directory: ${path.relative(repoRoot, sourceRoot)}`,
      { cause: error },
    );
  }

  const skillNames = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    // Sync only valid skills (directory containing SKILL.md).
    const skillDir = path.join(sourceRoot, entry.name);
    const skillFiles = await readdir(skillDir);
    if (skillFiles.includes("SKILL.md")) {
      assertSafeCanonicalSkillDirName(entry.name, "docs/ai/skills listing");
      skillNames.push(entry.name);
    }
  }

  return skillNames.sort();
}

async function syncCanonicalSkill(skillName) {
  assertSafeCanonicalSkillDirName(skillName, "sync canonical");
  const sourceDir = path.join(sourceRoot, skillName);
  for (const targetRoot of targetRoots) {
    const targetDir = path.join(targetRoot, skillName);
    await mkdir(targetRoot, { recursive: true });

    if (fullyManagedCanonicalSkills.has(skillName)) {
      await replaceDirectory(sourceDir, targetDir);
    } else {
      await overlayDirectory(sourceDir, targetDir);
    }
    console.log(`synced ${skillName} -> ${path.relative(repoRoot, targetDir)}`);
  }
}

async function mirrorAgentSkill(skillName, mirrorRoots) {
  assertSafeCanonicalSkillDirName(skillName, "agent skill mirror");
  const sourceDir = path.join(repoRoot, ".agents", "skills", skillName);

  for (const mirrorRoot of mirrorRoots) {
    assertMirrorSkillDirUnderRoot(mirrorRoot, skillName);
    const targetDir = path.join(mirrorRoot, skillName);

    try {
      // If the source directory already resolves to the target path
      // (junction/symlink), skip to avoid copying a directory onto itself.
      const [sourceResolved, targetResolved] = await Promise.all([
        realpath(sourceDir),
        realpath(targetDir),
      ]);
      if (sourceResolved === targetResolved) {
        console.log(
          `skipped ${skillName}: source already mapped to ${path.relative(repoRoot, targetDir)}`,
        );
        continue;
      }
    } catch {
      // Ignore realpath failures here; replaceDirectory will report errors.
    }

    try {
      await replaceDirectory(sourceDir, targetDir);
      console.log(
        `mirrored ${skillName} -> ${path.relative(repoRoot, targetDir)}`,
      );
    } catch (error) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";

      if (errorCode === "EINVAL") {
        console.log(
          `skipped ${skillName}: source already mapped to ${path.relative(repoRoot, targetDir)}`,
        );
        continue;
      }

      if (errorCode === "ENOENT") {
        console.warn(`skipped ${skillName}: source missing`);
        continue;
      }

      console.warn(`skipped ${skillName}: source unreadable`);
      if (error instanceof Error) {
        console.warn(error.message);
      }
    }
  }
}

async function mirrorDirectoryTree(sourceRoot, targetRoot, label) {
  let entries;

  try {
    entries = await readdir(sourceRoot, { withFileTypes: true });
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";

    if (errorCode === "ENOENT") {
      console.warn(
        `skipped ${label} mirror: source missing ${path.relative(repoRoot, sourceRoot)}`,
      );
      return;
    }

    throw new Error(
      `Unable to read ${label} mirror source: ${path.relative(repoRoot, sourceRoot)}`,
      { cause: error },
    );
  }

  // Skip self-copy when the source already resolves to the target.
  try {
    const [sourceResolved, targetResolved] = await Promise.all([
      realpath(sourceRoot),
      realpath(targetRoot),
    ]);
    if (sourceResolved === targetResolved) {
      console.log(`skipped ${label} mirror: source already mapped to target`);
      return;
    }
  } catch {
    // Target may not exist yet; continue with a full rebuild.
  }

  // Full replace so deletions in the source propagate and no stale files remain.
  await replaceDirectory(sourceRoot, targetRoot);
  console.log(
    `mirrored ${label} (${entries.length}) -> ${path.relative(repoRoot, targetRoot)}`,
  );
}

async function listAgentSkillsForMirror() {
  const agentSkillsRoot = path.join(repoRoot, ".agents", "skills");
  const entries = await readdir(agentSkillsRoot, { withFileTypes: true });
  const skillNames = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    // Mirror only valid skills (directory containing SKILL.md).
    const skillDir = path.join(agentSkillsRoot, entry.name);
    const skillFiles = await readdir(skillDir);
    if (skillFiles.includes("SKILL.md")) {
      assertSafeCanonicalSkillDirName(entry.name, ".agents/skills listing");
      skillNames.push(entry.name);
    }
  }

  return skillNames.sort();
}

async function main() {
  const canonicalSkills = await listCanonicalSkillsForSync();
  const canonicalSkillFiles = await buildCanonicalSkillFiles(canonicalSkills);
  const previousManifests = new Map();

  for (const targetRoot of targetRoots) {
    const previous = await readCanonicalManifest(targetRoot);
    previousManifests.set(targetRoot, previous);
    await pruneStaleCanonicalSkills(targetRoot, canonicalSkills, previous);
  }

  for (const targetRoot of targetRoots) {
    const previous = previousManifests.get(targetRoot);
    for (const skillName of canonicalSkills) {
      await pruneStaleCanonicalFiles(
        targetRoot,
        skillName,
        previous?.canonicalSkillFiles[skillName] ?? [],
        canonicalSkillFiles[skillName],
      );
    }
  }

  for (const skillName of canonicalSkills) {
    await syncCanonicalSkill(skillName);
  }

  for (const targetRoot of targetRoots) {
    await writeCanonicalManifest(
      targetRoot,
      canonicalSkills,
      canonicalSkillFiles,
    );
  }

  const agentMirrorSkills = await listAgentSkillsForMirror();

  for (const skillName of agentMirrorSkills) {
    await mirrorAgentSkill(skillName, skillMirrorRoots);
  }

  for (const mirror of treeMirrors) {
    await mirrorDirectoryTree(
      mirror.sourceRoot,
      mirror.targetRoot,
      mirror.label,
    );
  }

  console.log("agent skill sync complete");
}

main().catch((error) => {
  console.error("agent skill sync failed");
  console.error(error);
  process.exit(1);
});
