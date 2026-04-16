#!/usr/bin/env node
/**
 * Vendor selected ecosystem skills from their install targets into `docs/ai/skills/`
 * so they remain the canonical source mirrored by `skills:sync`.
 *
 * Workflow:
 * 1. Refresh the upstream source (e.g. Skills CLI or vendor installer)
 * 2. `bun run skills:refresh-upstream`
 * 3. Re-apply any repo-specific notes or references if the refresh overwrote them
 * 4. `bun run skills:sync` && `bun run skills:verify`
 */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const canonicalRoot = path.join(repoRoot, "docs", "ai", "skills");
const upstreamSources = [
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
];

const POST_REFRESH_REPLACEMENTS = [
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search: '<input type="[REDACTED]" />',
    replace: '<input type="[REDACTED]" /> // pragma: allowlist secret',
  },
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
    replace:
      "### 1Password Integration // pragma: allowlist secret", // pragma: allowlist secret
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search:
      "Disable 1Password autocomplete when not needed:", // pragma: allowlist secret
    replace:
      "Disable 1Password autocomplete when not needed: // pragma: allowlist secret",
  },
];

async function readPreservedFiles(targetRoot, preserve) {
  const entries = await Promise.all(
    preserve.map(async (relativePath) => {
      try {
        const content = await readFile(path.join(targetRoot, relativePath), "utf8");
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
    const targetPath = path.join(targetRoot, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
  }
}

async function applyPostRefreshReplacements(skillName, targetRoot) {
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
}

async function refreshSkill({ skillName, from, preserve = [] }) {
  const to = path.join(canonicalRoot, skillName);
  const preservedFiles = await readPreservedFiles(to, preserve);
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  await restorePreservedFiles(to, preservedFiles);
  await applyPostRefreshReplacements(skillName, to);
  console.log(
    `refreshed ${path.relative(repoRoot, to)} <= ${path.relative(repoRoot, from)}`,
  );
}

async function main() {
  for (const source of upstreamSources) {
    await refreshSkill(source);
  }
  console.log(
    "upstream skill refresh complete — run `bun run skills:sync` then `bun run skills:verify`",
  );
}

main().catch((error) => {
  console.error("refresh-upstream-skills failed");
  console.error(error);
  process.exit(1);
});
