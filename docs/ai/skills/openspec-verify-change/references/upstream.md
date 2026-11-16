---
source_name: Fission-AI/OpenSpec (openspec-verify-change)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v2.0.0/skills/openspec-verify-change
source_type: github
upstream_path: skills/openspec-verify-change/
skills_lock_hash: a4ac732435c7ef91066154e74d16e4ba4275cb35f5de0600168799138ac6af24
last_reviewed: 2026-11-13
---

# Upstream: openspec-verify-change

Canonical copy in this repo: `docs/ai/skills/openspec-verify-change/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v2.0.0`
- **Commit reviewed:** `d12c2817776779e06891d68230773b3bb673b106`
- **Upstream path:** `skills/openspec-verify-change/`
- **Lock skillPath:** `skills/openspec-verify-change/SKILL.md`
- **Computed hash:** `a4ac732435c7ef91066154e74d16e4ba4275cb35f5de0600168799138ac6af24`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v2.0.0`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec-verify-change/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.
