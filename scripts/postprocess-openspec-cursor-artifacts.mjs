#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function rewriteCommands(content) {
  return content
    .replace(/`openspec ([^`]+)`/g, (_match, command) => {
      return `\`bun run openspec -- ${command}\``;
    })
    .replace(/^(\s*)openspec (.+)$/gm, (_match, indent, command) => {
      return `${indent}bun run openspec -- ${command}`;
    });
}

async function getCommandFiles() {
  const commandsDir = path.join(repoRoot, ".cursor", "commands");
  const entries = await readdir(commandsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.startsWith("opsx-"))
    .map((entry) => path.join(commandsDir, entry.name));
}

async function getSkillFiles() {
  const skillsDir = path.join(repoRoot, ".cursor", "skills");
  const entries = await readdir(skillsDir, { withFileTypes: true });

  return entries
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith("openspec-"),
    )
    .map((entry) => path.join(skillsDir, entry.name, "SKILL.md"));
}

async function processFile(filePath) {
  const original = await readFile(filePath, "utf8");
  const rewritten = rewriteCommands(original);

  if (rewritten !== original) {
    await writeFile(filePath, rewritten, "utf8");
  }
}

async function main() {
  const files = [...(await getCommandFiles()), ...(await getSkillFiles())];

  await Promise.all(files.map((filePath) => processFile(filePath)));
}

main().catch((error) => {
  console.error("Failed to post-process OpenSpec Cursor artifacts.");
  console.error(error);
  process.exit(1);
});
