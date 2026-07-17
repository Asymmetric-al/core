---
source_name: cursor/plugins (run-smoke-tests)
source_url: https://github.com/cursor/plugins/tree/main/cursor-team-kit/skills/run-smoke-tests
source_type: github
upstream_path: cursor-team-kit/skills/run-smoke-tests/
skills_lock_hash: 848c9f34af50f8a0edecbdc239707b694f5f9ac497c61b5907f2bf0caa1372fb
last_reviewed: 2026-06-26
---

# Upstream: run-smoke-tests

Canonical copy in this repo: `docs/ai/skills/run-smoke-tests/` (mirrored to `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/cursor/plugins
- **Ref:** `main`
- **Commit reviewed:** `0452e08a314c03621ec5ac1324f1ad1dd824f1a4`
- **Upstream path:** `cursor-team-kit/skills/run-smoke-tests/`
- **Lock skillPath:** `cursor-team-kit/skills/run-smoke-tests/SKILL.md`
- **Computed hash:** `848c9f34af50f8a0edecbdc239707b694f5f9ac497c61b5907f2bf0caa1372fb`

## Refresh from upstream

1. Run `bun run skills:refresh-upstream`.
2. The script clones `https://github.com/cursor/plugins.git` at `main`, verifies the upstream skill directory exists, copies the full skill directory into `docs/ai/skills/run-smoke-tests/`, and updates this metadata.
3. Run `bun run skills:sync` and `bun run skills:verify` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this `references/` directory when refreshing.
