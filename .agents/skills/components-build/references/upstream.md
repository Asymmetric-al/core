---
source_name: nolly-studio/components-build-skill (components-build)
source_url: https://github.com/nolly-studio/components-build-skill
source_type: github
upstream_path: skills/components-build/SKILL.md
skills_lock_hash: 55c76ed69a72f69b9e0a19ac08422f64bf88624f4f5f4069903f418883efba97
last_reviewed: 2026-09-16
---

# Upstream: components-build

Canonical copy in this repo: `docs/ai/skills/components-build/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

- **Repository:** https://github.com/nolly-studio/components-build-skill
- **Upstream path:** `skills/components-build/SKILL.md`
- **Install via Skills CLI:** `npx skills add nolly-studio/components-build-skill --skill components-build -y`

## Refresh from ecosystem

1. `npx skills add nolly-studio/components-build-skill --skill components-build -y`
2. Reconcile into `docs/ai/skills/components-build/`, restoring the **This repository** Base UI / `base-maia` overlay (no Radix / `asChild`).
3. Preserve this file. Run `bun run skills:sync` and `bun run skills:verify`.

This skill is **not** updated by `bun run skills:refresh-upstream` today.

## Core class-helper adaptation (2026-10-22)

Core component examples consume `cn` from `@asym/ui/lib/utils`; they do not
define another wrapper or install the generic `clsx`/`tailwind-merge` recipe.
The generic npm dependency example is retained as non-operative upstream
material. The existing Base UI / `base-maia` overlay and upstream authors,
MIT attribution, source identity and original `skills_lock_hash` remain intact.

`scripts/lib/components-build-adapter.mjs` applies the reviewed substitutions
and a scoped ownership note to `SKILL.md`, `README.md`, `AGENTS.md`,
`rules/overview.md`, `rules/styling.md` and `rules/npm.md`. Its data file retains the original
reviewed excerpts alongside the Core replacements. It validates the complete
known surface before writing and rejects competing helper drift. Provenance,
license notices and raw captures are outside its write set.

Apply that adapter to a complete staged tree during a reviewed manual source
reconciliation, before canonical promotion. `skills:sync` also restores this
contract before mirroring all three clients. This local adapter does not add an
upstream refresh source group or change upstream lock metadata. It preserves an
existing Core Base UI overlay; restore that overlay separately if an upstream
replacement erased it. After review,
run `bun run skills:sync` and non-mutating `bun run skills:verify`.
