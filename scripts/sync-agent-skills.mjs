#!/usr/bin/env node

import {
  cp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sourceRoot = path.join(repoRoot, "docs", "ai", "skills");
const targetRoots = [
  path.join(repoRoot, ".agents", "skills"),
  path.join(repoRoot, ".cursor", "skills"),
];
const CANONICAL_MANIFEST_FILENAME = ".repo-canonical-skills.json";
const CANONICAL_MANIFEST_VERSION = 1;

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

async function overlayDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const sourceEntries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of sourceEntries) {
    const sourceEntryPath = path.join(sourceDir, entry.name);
    const targetEntryPath = path.join(targetDir, entry.name);
    await cp(sourceEntryPath, targetEntryPath, {
      recursive: true,
      force: true,
    });
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

    for (const name of canonicalSkills) {
      assertSafeCanonicalSkillDirName(name, "canonical manifest read");
    }

    return {
      version:
        typeof parsed?.version === "number"
          ? parsed.version
          : CANONICAL_MANIFEST_VERSION,
      canonicalSkills: canonicalSkills.sort(),
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
      };
    }

    throw new Error(
      `Unable to read canonical skill manifest: ${path.relative(repoRoot, manifestPath)}`,
      { cause: error },
    );
  }
}

async function writeCanonicalManifest(targetRoot, canonicalSkills) {
  for (const name of canonicalSkills) {
    assertSafeCanonicalSkillDirName(name, "canonical manifest write");
  }

  const manifestPath = getCanonicalManifestPath(targetRoot);
  const manifest = {
    version: CANONICAL_MANIFEST_VERSION,
    canonicalSkills: [...canonicalSkills].sort(),
  };

  await mkdir(targetRoot, { recursive: true });
  await writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );
}

async function pruneStaleCanonicalSkills(targetRoot, canonicalSkills) {
  const previous = await readCanonicalManifest(targetRoot);
  const currentSkillSet = new Set(canonicalSkills);
  const staleSkills = previous.canonicalSkills.filter(
    (skillName) => !currentSkillSet.has(skillName),
  );

  for (const skillName of staleSkills) {
    assertSafeCanonicalSkillDirName(skillName, "manifest prune");
    assertMirrorSkillDirUnderRoot(targetRoot, skillName);
    const targetDir = path.join(targetRoot, skillName);
    await rm(targetDir, { recursive: true, force: true });
    console.log(`pruned ${path.relative(repoRoot, targetDir)}`);
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

    // Overlay sync (per-skill): merge canonical files while preserving extra
    // runtime-only assets. Stale canonical skill dirs are removed earlier via
    // pruneStaleCanonicalSkills using the manifest diff.
    await overlayDirectory(sourceDir, targetDir);
    console.log(`synced ${skillName} -> ${path.relative(repoRoot, targetDir)}`);
  }
}

async function mirrorAgentSkillToCursor(skillName) {
  assertSafeCanonicalSkillDirName(skillName, "agent→cursor mirror");
  const sourceDir = path.join(repoRoot, ".agents", "skills", skillName);
  const targetDir = path.join(repoRoot, ".cursor", "skills", skillName);

  try {
    // If the source directory already resolves to the cursor path (junction/symlink),
    // skip to avoid copying a directory onto itself.
    const [sourceResolved, targetResolved] = await Promise.all([
      realpath(sourceDir),
      realpath(targetDir),
    ]);
    if (sourceResolved === targetResolved) {
      console.log(
        `skipped ${skillName}: source already mapped to cursor skill path`,
      );
      return;
    }
  } catch {
    // Ignore realpath failures here; overlayDirectory will report actionable errors.
  }

  try {
    await overlayDirectory(sourceDir, targetDir);
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
        `skipped ${skillName}: source already mapped to cursor skill path`,
      );
      return;
    }

    if (errorCode === "ENOENT") {
      console.warn(`skipped ${skillName}: source missing`);
      return;
    }

    console.warn(`skipped ${skillName}: source unreadable`);
    if (error instanceof Error) {
      console.warn(error.message);
    }
  }
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

  for (const targetRoot of targetRoots) {
    await pruneStaleCanonicalSkills(targetRoot, canonicalSkills);
  }

  for (const skillName of canonicalSkills) {
    await syncCanonicalSkill(skillName);
  }

  for (const targetRoot of targetRoots) {
    await writeCanonicalManifest(targetRoot, canonicalSkills);
  }

  const agentToCursorMirrorSkills = await listAgentSkillsForMirror();

  for (const skillName of agentToCursorMirrorSkills) {
    await mirrorAgentSkillToCursor(skillName);
  }
  console.log("agent skill sync complete");
}

main().catch((error) => {
  console.error("agent skill sync failed");
  console.error(error);
  process.exit(1);
});
