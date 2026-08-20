---
source_name: Fission-AI/OpenSpec (openspec-archive-change)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v1.9.0/skills/openspec-archive-change
source_type: github
upstream_path: skills/openspec-archive-change/
skills_lock_hash: 91b1fd6f81b345cc585c4e7509b092cf65e9d10323ec9789e7c24bd2702ec806
last_reviewed: 2026-08-18
---

# Upstream: openspec-archive-change

Canonical copy in this repo: `docs/ai/skills/openspec-archive-change/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v1.9.0`
- **Commit reviewed:** `2826b8889e5223a9a8095d4428b60b56597e1020`
- **Upstream path:** `skills/openspec-archive-change/`
- **Lock skillPath:** `skills/openspec-archive-change/SKILL.md`
- **Computed hash:** `91b1fd6f81b345cc585c4e7509b092cf65e9d10323ec9789e7c24bd2702ec806`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v1.9.0`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec-archive-change/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.

## Core overlay

Official workflow text is preserved. Core adds a marked overlay that requires
`bun run openspec --`, an explicit change ID, and no Stores. Frontmatter
`allowed-tools` includes `Bash(bun:*)` so the local wrapper can run. Do not
run `openspec update` against the live customized repository.
