---
source_url: https://github.com/davila7/claude-code-templates
source_type: github
upstream_path: cli-tool/components/skills/development/lint-and-validate
reviewed_commit: 5bbe5a76f1feb48cdadee248fd169cf53e053783
skills_lock_hash: 2ade7398d02788f2b52cbc72c5e4313dd7ff9843c7b6748d342577b83ec92d68
license: MIT
last_reviewed: 2026-10-22
status: reviewed
ownership: ecosystem
---

# Upstream source

This complete skill tree is vendored from [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates/tree/5bbe5a76f1feb48cdadee248fd169cf53e053783/cli-tool/components/skills/development/lint-and-validate) at the immutable reviewed commit above. The installed Core slug is `lint-and-validate`; the license notice is retained at `references/LICENSE.md`. Core changes are adaptations, not upstream changes.

## Core adaptations

- Removed unconditional audit/fix defaults and generic npm/npx commands from the primary workflow; generic helper scripts remain reference-only in Core.
- Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.

## Imported file inventory

- `SKILL.md`
- `scripts/lint_runner.py`
- `scripts/type_coverage.py`
- `references/LICENSE.md`

## Refresh workflow

1. Review the exact upstream commit, complete tree, license, and diff. Do not advance a mutable branch implicitly or execute imported scripts, tests, installers, or lifecycle hooks as part of refresh.
2. Stage the whole reviewed source directory outside the live skill directory, retaining the license notice and this provenance. Preserve the marked Core overlay and every adaptation listed above; the maintenance audit retains raw and adapted file hashes.
3. Reconcile additions and deletions against the previous owned inventory before atomic publication to `.agents/skills/lint-and-validate`. Preserve user-owned extras explicitly rather than deleting them by inference.
4. Update the raw upstream `SKILL.md` hash and reviewed commit together; do not hash the adapted skill as if it were raw source.
5. The reviewed Core adapter is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from the committed `ecosystem-core-guidance.json` and `ecosystem-core-overlays.json` configs under `scripts/refresh-overlays`. Review/update those transforms with upstream drift; they do not advance provenance automatically.
6. Run `bun run skills:sync` and non-mutating `bun run skills:verify`, then the focused metadata, reference, compatibility, and mirror tests. Bundled executables remain inert unless a separate authorized task needs them.
