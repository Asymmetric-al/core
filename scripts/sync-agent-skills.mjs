#!/usr/bin/env node

import { cp, mkdir, readdir } from "node:fs/promises";
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

async function syncSkill(skillName) {
  const sourceDir = path.join(sourceRoot, skillName);

  for (const targetRoot of targetRoots) {
    const targetDir = path.join(targetRoot, skillName);
    await mkdir(targetRoot, { recursive: true });

    // Non-destructive sync: overlay canonical files while preserving
    // additional runtime-only assets already present in target skills.
    await mkdir(targetDir, { recursive: true });
    const sourceEntries = await readdir(sourceDir, { withFileTypes: true });
    for (const entry of sourceEntries) {
      const sourceEntryPath = path.join(sourceDir, entry.name);
      const targetEntryPath = path.join(targetDir, entry.name);
      await cp(sourceEntryPath, targetEntryPath, { recursive: true, force: true });
    }
    console.log(`synced ${skillName} -> ${path.relative(repoRoot, targetDir)}`);
  }
}

async function main() {
  for (const skillName of skillsToSync) {
    await syncSkill(skillName);
  }
  console.log("agent skill sync complete");
}

main().catch((error) => {
  console.error("agent skill sync failed");
  console.error(error);
  process.exit(1);
});
