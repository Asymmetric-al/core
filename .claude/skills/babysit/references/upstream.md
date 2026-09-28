---
source_name: a5c-ai/babysitter-cursor (babysit)
source_url: https://github.com/a5c-ai/babysitter-cursor/tree/main/skills/babysit
source_type: github
upstream_path: skills/babysit/
skills_lock_hash: f7f9b3f8eddef18c6ae55c3e74216f0c26ccb375de651dfac4f0877d66bd47af
last_reviewed: 2026-09-23
---

# Upstream: babysit

Canonical copy in this repo: `docs/ai/skills/babysit/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/a5c-ai/babysitter-cursor
- **Ref:** `main`
- **Commit reviewed:** `baae1ad6c9386bad2fc04a95a13530a4497b3ff5`
- **Upstream path:** `skills/babysit/`
- **Lock skillPath:** `skills/babysit/SKILL.md`
- **Computed hash:** `f7f9b3f8eddef18c6ae55c3e74216f0c26ccb375de651dfac4f0877d66bd47af`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/a5c-ai/babysitter-cursor.git` at `main`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/babysit/`, and updates this metadata.
3. The refresh keeps Core's pinned SDK lookup and rewrites the Cursor harness
   instructions to use the non-interactive, in-turn `run:iterate` loop required
   by the Core overlay.
4. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.
