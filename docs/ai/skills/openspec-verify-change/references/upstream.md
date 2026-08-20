---
source_name: Fission-AI/OpenSpec (openspec-verify-change)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v1.9.0/skills/openspec-verify-change
source_type: github
upstream_path: skills/openspec-verify-change/
skills_lock_hash: 53d52c56bf4c20e4c693df80dedff5fcaa6df30978892b2295aba4f058e2b37a
last_reviewed: 2026-08-18
---

# Upstream: openspec-verify-change

Canonical copy in this repo: `docs/ai/skills/openspec-verify-change/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v1.9.0`
- **Commit reviewed:** `2826b8889e5223a9a8095d4428b60b56597e1020`
- **Upstream path:** `skills/openspec-verify-change/`
- **Lock skillPath:** `skills/openspec-verify-change/SKILL.md`
- **Computed hash:** `53d52c56bf4c20e4c693df80dedff5fcaa6df30978892b2295aba4f058e2b37a`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v1.9.0`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec-verify-change/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.

## Core overlay

Official workflow text is preserved. Core adds a marked overlay that requires
`bun run openspec --`, an explicit change ID, and no Stores. Frontmatter
`allowed-tools` includes `Bash(bun:*)` so the local wrapper can run. Do not
run `openspec update` against the live customized repository.
