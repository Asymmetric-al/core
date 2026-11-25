---
source_name: Fission-AI/OpenSpec (openspec-propose)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v2.2.0/skills/openspec-propose
source_type: github
upstream_path: skills/openspec-propose/
skills_lock_hash: d443ecb16e4d964fb9fe4fbca8e5a50320279c81d0539ac50d8edb2304da9bbe
last_reviewed: 2026-11-25
---

# Upstream: openspec-propose

Canonical copy in this repo: `docs/ai/skills/openspec-propose/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v2.2.0`
- **Commit reviewed:** `f1cd852f4edce22b8df9548a4df889172ca8ff25`
- **Upstream path:** `skills/openspec-propose/`
- **Lock skillPath:** `skills/openspec-propose/SKILL.md`
- **Computed hash:** `d443ecb16e4d964fb9fe4fbca8e5a50320279c81d0539ac50d8edb2304da9bbe`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v2.2.0`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec-propose/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.
