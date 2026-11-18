---
source_name: Fission-AI/OpenSpec (openspec-sync-specs)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v2.1.0/skills/openspec-sync-specs
source_type: github
upstream_path: skills/openspec-sync-specs/
skills_lock_hash: abad850be1b643b3306de032ff352b02cdc138df932653e24bc3251716a49933
last_reviewed: 2026-11-17
---

# Upstream: openspec-sync-specs

Canonical copy in this repo: `docs/ai/skills/openspec-sync-specs/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v2.1.0`
- **Commit reviewed:** `8bd4b3557b5bf1d231cd2f165b28f24e2d90a2a0`
- **Upstream path:** `skills/openspec-sync-specs/`
- **Lock skillPath:** `skills/openspec-sync-specs/SKILL.md`
- **Computed hash:** `abad850be1b643b3306de032ff352b02cdc138df932653e24bc3251716a49933`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v2.1.0`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec-sync-specs/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.
