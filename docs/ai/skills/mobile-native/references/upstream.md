---
source_name: emilkowalski/skills
source_url: https://github.com/emilkowalski/skills
source_path: skills/mobile-native/
source_commit: 2d228630ba1446365f614a108cb8252f1feda202
upstream_skill_commit: 2d228630ba1446365f614a108cb8252f1feda202
license: MIT
last_reviewed: 2026-10-22
reviewed_commit: 2d228630ba1446365f614a108cb8252f1feda202
skills_lock_hash: 888b7651d66d66dbac4e72b7c554638eb19bd971d686d6cbdf030a5ef3788f55
---

# Upstream: mobile-native

Canonical copy in this repo: `docs/ai/skills/mobile-native/`, mirrored to
`.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` by
`bun run skills:sync`.

- **Repository:** https://github.com/emilkowalski/skills
- **Reviewed pack commit:** `2d228630ba1446365f614a108cb8252f1feda202`
- **Source path:** `skills/mobile-native/`
- **License:** MIT; the exact upstream notice is preserved in
  [LICENSE.md](LICENSE.md).

## Refresh from upstream

1. Refresh the lockfile-managed skill with a targeted Skills CLI add:
   `npx skills add emilkowalski/skills --skill mobile-native -y`.
   Do **not** run `npx skills add emilkowalski/skills -y`.
2. Run the matching `bun run skills:refresh-*` / `skills:refresh-upstream
--only=emilkowalski/skills` command so marked Core overlays and this provenance
   file are preserved.
3. Review newly added or removed upstream files against Core's Base UI,
   `base-maia`, and routing constraints.
4. Run `bun run skills:sync` and `bun run skills:verify`.

## Repo-specific notes

- Content between `<!-- CORE-OVERLAY-START -->` and
  `<!-- CORE-OVERLAY-END -->` is owned by Core and preserved by the focused
  refresh command.
- `docs/ai/rules/frontend.md`, Base UI, and `base-maia` remain
  higher-priority than generic upstream visual recipes.
- Update `source_commit`, `upstream_skill_commit`, and `last_reviewed`
  whenever the vendored upstream changes.

## Reviewed refresh, 2026-10-22

- Source: `emilkowalski/skills` at `2d228630ba1446365f614a108cb8252f1feda202`.
- Complete upstream skill tree: `skills/mobile-native/`; MIT notice: [LICENSE.md](LICENSE.md).
- Raw upstream `SKILL.md` SHA-256: `888b7651d66d66dbac4e72b7c554638eb19bd971d686d6cbdf030a5ef3788f55`.
- Preserve Core discovery metadata, explicit-only invocation, existing overlays and compatibility corrections. Raw upstream scripts are vendored data; none were executed during this refresh.
