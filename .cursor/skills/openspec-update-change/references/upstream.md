---
source_name: Fission-AI/OpenSpec (openspec-update-change)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v1.9.0/skills/openspec-update-change
source_type: github
upstream_path: skills/openspec-update-change/
skills_lock_hash: e6f64e06dbc67c4c2e44770ebf18f5be2c29f2fbb1bbdc386826a6ab08cb9921
last_reviewed: 2026-08-18
---

# Upstream: openspec-update-change

Canonical copy in this repo: `docs/ai/skills/openspec-update-change/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v1.9.0`
- **Commit reviewed:** `2826b8889e5223a9a8095d4428b60b56597e1020`
- **Upstream path:** `skills/openspec-update-change/`
- **Lock skillPath:** `skills/openspec-update-change/SKILL.md`
- **Computed hash:** `e6f64e06dbc67c4c2e44770ebf18f5be2c29f2fbb1bbdc386826a6ab08cb9921`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v1.9.0`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec-update-change/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.

## Core overlay

Official workflow text is preserved. Core adds a marked overlay that requires
`bun run openspec --`, an explicit change ID, and no Stores. Frontmatter
`allowed-tools` includes `Bash(bun:*)` so the local wrapper can run. Do not
run `openspec update` against the live customized repository.
