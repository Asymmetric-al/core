---
source_name: currents-dev/playwright-best-practices-skill
source_url: https://github.com/currents-dev/playwright-best-practices-skill
source_type: github
upstream_path: playwright-best-practices/SKILL.md
skills_lock_hash: 42684b93abd595551d6f4b6949b951645503baa445aefa76aa2f0d52ddda2bf7
last_reviewed: 2026-09-16
---

# Upstream: playwright-best-practices

Canonical copy in this repo: `docs/ai/skills/playwright-best-practices/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/currents-dev/playwright-best-practices-skill
- **Upstream path:** `playwright-best-practices/SKILL.md` (plus activity reference files under `core/`, `testing-patterns/`, `infrastructure-ci-cd/`, `debugging/`, `browser-apis/`, `architecture/`, `frameworks/`, and `advanced/`)
- **Install via Skills CLI:** `npx skills add currents-dev/playwright-best-practices-skill --skill playwright-best-practices -y`

## Refresh from ecosystem

1. `npx skills add currents-dev/playwright-best-practices-skill --skill playwright-best-practices -y` updates `.agents/skills/playwright-best-practices/` and `skills-lock.json`.
2. Copy the skill tree into `docs/ai/skills/playwright-best-practices/` if the canonical copy needs updating.
3. Preserve this `references/upstream.md` file.
4. Run `bun run skills:sync` and `bun run skills:verify`.

Subordinate to **`docs/ai/rules/testing.md`** and repo Playwright configs under `playwright*.config.ts`. This skill does not replace Core's `playwright-cli` adapter or committed `@playwright/test` coverage.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
