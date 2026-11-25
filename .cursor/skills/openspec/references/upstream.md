---
source_name: Fission-AI/OpenSpec (openspec)
source_url: https://github.com/Fission-AI/OpenSpec/tree/v2.2.0/skills/openspec
source_type: github
upstream_path: skills/openspec/
skills_lock_hash: 66adc24c0e8c46b893f7abad70cd14810039f6dda0785dde0f7531c5312b89a6
last_reviewed: 2026-11-25
---

# Upstream: openspec

Canonical copy in this repo: `docs/ai/skills/openspec/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/Fission-AI/OpenSpec
- **Ref:** `v2.2.0`
- **Commit reviewed:** `f1cd852f4edce22b8df9548a4df889172ca8ff25`
- **Upstream path:** `skills/openspec/`
- **Lock skillPath:** `skills/openspec/SKILL.md`
- **Computed hash:** `66adc24c0e8c46b893f7abad70cd14810039f6dda0785dde0f7531c5312b89a6`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/Fission-AI/OpenSpec.git` at `v2.2.0`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/openspec/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.
