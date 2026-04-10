#!/usr/bin/env node
/**
 * Vendor selected ecosystem skills from `.agents/skills/` (Skills CLI install target)
 * into `docs/ai/skills/` so they remain the canonical source mirrored by `skills:sync`.
 *
 * Workflow:
 * 1. `npx skills add supabase/agent-skills -y`  (updates `.agents/skills/*` + `skills-lock.json`)
 * 2. `bun run skills:refresh-upstream`
 * 3. Re-apply any repo-specific frontmatter / "This repository" notes if the refresh overwrote them
 * 4. `bun run skills:sync` && `bun run skills:verify`
 */
import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const canonicalRoot = path.join(repoRoot, "docs", "ai", "skills");
const agentSkillsRoot = path.join(repoRoot, ".agents", "skills");

/** Skill directory names under supabase/agent-skills (must match `npx skills add` output). */
const UPSTREAM_SKILL_NAMES = ["supabase", "supabase-postgres-best-practices"];

async function refreshSkill(skillName) {
  const from = path.join(agentSkillsRoot, skillName);
  const to = path.join(canonicalRoot, skillName);
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(
    `refreshed ${path.relative(repoRoot, to)} <= ${path.relative(repoRoot, from)}`,
  );
}

async function main() {
  for (const name of UPSTREAM_SKILL_NAMES) {
    await refreshSkill(name);
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
