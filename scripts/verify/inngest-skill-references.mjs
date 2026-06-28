#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, "..", "..");

const LOCAL_MARKDOWN_LINK_RE =
  /\[[^\]]+\]\((?!https?:\/\/|mailto:|#)([^)\s]+?\.md)(?:#[^)]+)?\)/g;

function resolveMarkdownLink(repoRoot, sourcePath, href) {
  const cleanHref = decodeURI(href.split("#")[0]);
  if (cleanHref.startsWith("docs/")) {
    return path.join(repoRoot, cleanHref);
  }

  return path.resolve(path.dirname(sourcePath), cleanHref);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function findBrokenInngestSkillReferences(
  repoRoot = defaultRepoRoot,
) {
  const skillsRoot = path.join(repoRoot, "docs", "ai", "skills");
  const skillDirs = await readdir(skillsRoot, { withFileTypes: true });
  const brokenReferences = [];

  for (const entry of skillDirs) {
    if (!entry.isDirectory() || !entry.name.startsWith("inngest")) {
      continue;
    }

    const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
    if (!(await fileExists(skillPath))) {
      continue;
    }

    const content = await readFile(skillPath, "utf8");
    for (const match of content.matchAll(LOCAL_MARKDOWN_LINK_RE)) {
      const href = match[1];
      const targetPath = resolveMarkdownLink(repoRoot, skillPath, href);
      if (await fileExists(targetPath)) {
        continue;
      }

      brokenReferences.push({
        href,
        source: path.relative(repoRoot, skillPath),
        target: path.relative(repoRoot, targetPath),
      });
    }
  }

  return brokenReferences;
}

async function main() {
  const brokenReferences = await findBrokenInngestSkillReferences();
  if (brokenReferences.length === 0) {
    return;
  }

  console.error("Broken Inngest skill markdown references:");
  for (const reference of brokenReferences) {
    console.error(
      `- ${reference.source}: ${reference.href} -> ${reference.target}`,
    );
  }

  process.exit(1);
}

if (process.argv[1] === __filename) {
  main().catch((error) => {
    console.error("Inngest skill reference verification failed");
    console.error(error);
    process.exit(1);
  });
}
