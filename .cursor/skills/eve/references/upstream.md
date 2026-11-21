---
source_name: vercel/eve
source_url: https://github.com/vercel/eve
source_type: github
upstream_path: skills/eve/SKILL.md
skills_lock_hash: 35a7c82f96e20871ff91e9a3a0054ac110f341d35050ed72cd79f441fb9be8a6
last_reviewed: 2026-09-16
---

# Upstream: eve

Canonical copy in this repo: `docs/ai/skills/eve/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/vercel/eve
- **Upstream path:** `skills/eve/SKILL.md`
- **Install:** only through the reviewed, pinned Skills CLI procedure in `docs/ai/rules/agent-skill-routing.md`.

## Refresh from ecosystem

1. Stage only `eve` from a reviewed immutable checkout of `vercel/eve` with the targeted Skills CLI form in `docs/ai/rules/agent-skill-routing.md`, and update `skills-lock.json`.
2. Copy the skill tree into `docs/ai/skills/eve/` if the canonical copy needs updating.
3. Preserve this `references/upstream.md` file and reapply the Core adaptations below.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Core adaptations

- The docs path is `packages/eve-runtime/node_modules/eve/docs/`: Core installs eve in `packages/eve-runtime` (and `apps/admin`), not at the repository root. The skill points at `packages/eve-runtime/AGENTS.md`.
- The install and scaffold line uses the installed, pinned eve through `bunx eve` from `packages/eve-runtime`, and treats a version change as a Bun dependency decision, instead of `npm install eve` and `npx eve init` (AL-2715).

This skill is **not** updated by `bun run skills:refresh-upstream` today. Upstream moved the skill from repo-root `SKILL.md` to `skills/eve/SKILL.md`.
