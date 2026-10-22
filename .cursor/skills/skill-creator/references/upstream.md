---
source_url: https://github.com/anthropics/skills
source_type: github
upstream_path: skills/skill-creator
reviewed_commit: dbd4588f9e1033efb41dad4bef2f7947c8993d44
skills_lock_hash: dcd4803e61e913e6fc27294184cd3a71f09f5e924ff20c8a9a20173e7b3c2bcf
license: Apache-2.0
last_reviewed: 2026-10-22
status: reviewed
ownership: ecosystem
---

# Upstream source

This complete skill tree is vendored from [anthropics/skills](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/skill-creator) at the immutable reviewed commit above. The installed Core slug is `skill-creator`; the license notice is retained at `LICENSE.txt`. Core changes are adaptations, not upstream changes.

## Core adaptations

- Preserved Core JSON script-tag escaping; no helper or evaluation was executed.
- Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.

## Imported file inventory

- `LICENSE.txt`
- `SKILL.md`
- `agents/analyzer.md`
- `agents/comparator.md`
- `agents/grader.md`
- `assets/eval_review.html`
- `eval-viewer/generate_review.py`
- `eval-viewer/viewer.html`
- `references/schemas.md`
- `scripts/__init__.py`
- `scripts/aggregate_benchmark.py`
- `scripts/generate_report.py`
- `scripts/improve_description.py`
- `scripts/package_skill.py`
- `scripts/quick_validate.py`
- `scripts/run_eval.py`
- `scripts/run_loop.py`
- `scripts/utils.py`

## Refresh workflow

1. Review the exact upstream commit, complete tree, license, and diff. Do not advance a mutable branch implicitly or execute imported scripts, tests, installers, or lifecycle hooks as part of refresh.
2. Stage the whole reviewed source directory outside the live skill directory, retaining the license notice and this provenance. Preserve the marked Core overlay and every adaptation listed above; the maintenance audit retains raw and adapted file hashes.
3. Reconcile additions and deletions against the previous owned inventory before atomic publication to `.agents/skills/skill-creator`. Preserve user-owned extras explicitly rather than deleting them by inference.
4. Update the raw upstream `SKILL.md` hash and reviewed commit together; do not hash the adapted skill as if it were raw source.
5. The reviewed Core adapter is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from the committed `ecosystem-core-guidance.json` and `ecosystem-core-overlays.json` configs under `scripts/refresh-overlays`. Review/update those transforms with upstream drift; they do not advance provenance automatically.
6. Run `bun run skills:sync` and non-mutating `bun run skills:verify`, then the focused metadata, reference, compatibility, and mirror tests. Bundled executables remain inert unless a separate authorized task needs them.
