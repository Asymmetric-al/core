#!/usr/bin/env node

import { cp, mkdir, readdir, realpath } from "node:fs/promises";
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

const skillsToSync = [
  "supabase-postgres-best-practices",
  "nextjs-supabase-auth",
];

async function overlayDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const sourceEntries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of sourceEntries) {
    const sourceEntryPath = path.join(sourceDir, entry.name);
    const targetEntryPath = path.join(targetDir, entry.name);
    await cp(sourceEntryPath, targetEntryPath, { recursive: true, force: true });
  }
}

async function syncCanonicalSkill(skillName) {
  const sourceDir = path.join(sourceRoot, skillName);
  for (const targetRoot of targetRoots) {
    const targetDir = path.join(targetRoot, skillName);
    await mkdir(targetRoot, { recursive: true });

    // Non-destructive sync: overlay canonical files while preserving
    // additional runtime-only assets already present in target skills.
    await overlayDirectory(sourceDir, targetDir);
    console.log(`synced ${skillName} -> ${path.relative(repoRoot, targetDir)}`);
  }
}

async function mirrorAgentSkillToCursor(skillName) {
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
      skillNames.push(entry.name);
    }
  }

  return skillNames.sort();
}

async function main() {
  for (const skillName of skillsToSync) {
    await syncCanonicalSkill(skillName);
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
