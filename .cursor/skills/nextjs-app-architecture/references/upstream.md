---
source_name: aurorascharff/nextjs-app-architecture-skill (nextjs-app-architecture)
source_url: https://github.com/aurorascharff/nextjs-app-architecture-skill
source_type: github
upstream_path: SKILL.md
reviewed_commit: f2902b8538b25610da694394ecf88e69adf5f96a
skills_lock_hash: 94f700fb57aef401e135ddbb0d13a2986d6416820ee4e1b2bf1fd8e17fae0d66
license: MIT
last_reviewed: 2026-08-28
---

# Upstream: nextjs-app-architecture

Canonical copy in this repo: `docs/ai/skills/nextjs-app-architecture/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/aurorascharff/nextjs-app-architecture-skill
- **Upstream path:** `SKILL.md` plus `references/{cache-components,components,example,feature-folders,pages-suspense,queries-actions,single-page-applications,ux-patterns}.md`
- **License:** MIT; copyright Aurora Scharff (see the ecosystem `LICENSE` copied by the Skills CLI)
- **Install via Skills CLI:** `npx skills add aurorascharff/nextjs-app-architecture-skill -y`

The skill packages next-beats-style RSC composition for Next.js 16 App Router: synchronous pages, feature-owned async server components, colocated skeletons, and Cache Components practice. Inside Core it stays subordinate to installed Next.js docs, `docs/ai/rules/frontend.md`, and the data-access boundary.

## Refresh from ecosystem

1. `npx skills add aurorascharff/nextjs-app-architecture-skill -y` updates `.agents/skills/nextjs-app-architecture/` and `skills-lock.json`. On Claude Code it may also create a project-level `.claude/skills/nextjs-app-architecture` symlink — delete it; this repo routes Claude Code through `docs/ai/skills/` + `AGENTS.md`, not `.claude/skills/`.
2. Copy the skill tree (`SKILL.md` + `references/*`, excluding this file) into `docs/ai/skills/nextjs-app-architecture/` if the canonical copy needs updating.
3. Preserve this `references/upstream.md` file, the **This repository** section and **Core remaps** in `SKILL.md`, and the **Core** notes at the top of `references/queries-actions.md` and `references/feature-folders.md`.
4. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today.
