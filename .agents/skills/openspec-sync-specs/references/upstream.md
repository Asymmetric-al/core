---
source_name: Fission-AI/OpenSpec (openspec-sync-specs)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v1.14.3/skills/openspec-sync-specs
source_type: github
upstream_path: skills/openspec-sync-specs/
skills_lock_hash: e9d31bbb10cc963c556f938cc33f98d83b747502ddc6825db80c7cdb476a7a76
last_reviewed: 2026-10-21
---

# Upstream: openspec-sync-specs

Canonical copy in this repo: `docs/ai/skills/openspec-sync-specs/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v1.14.3`
- **Commit reviewed:** `c794978f4f8845ce59693373c9dd882ee776588c`
- **Upstream path:** `skills/openspec-sync-specs/`
- **Lock skillPath:** `skills/openspec-sync-specs/SKILL.md`
- **Computed hash:** `e9d31bbb10cc963c556f938cc33f98d83b747502ddc6825db80c7cdb476a7a76`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v1.14.3`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec-sync-specs/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.
