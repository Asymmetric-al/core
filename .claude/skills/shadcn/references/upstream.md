---
source_name: shadcn-ui/ui
source_url: https://github.com/shadcn-ui/ui
source_type: github
upstream_path: skills/shadcn/SKILL.md
reviewed_commit: 25af02b1b467fcd53b63e0c6d6d324c57c16ef18
skills_lock_hash: 93951e5e83f616a3e046491c00d770bd54c0a64164706cd1191822a233d27592
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: shadcn

Reviewed source: https://github.com/shadcn-ui/ui/tree/25af02b1b467fcd53b63e0c6d6d324c57c16ef18/skills/shadcn
Raw upstream `SKILL.md` SHA-256: `93951e5e83f616a3e046491c00d770bd54c0a64164706cd1191822a233d27592`. License notices are preserved in `UPSTREAM-LICENSE.md`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: Preserve existing shared Sonner host and Base UI/base-maia boundaries.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
