---
source_name: vercel/next.js
source_url: https://github.com/vercel/next.js
source_type: github
upstream_path: skills/next-dev-loop/SKILL.md
reviewed_commit: 684cf7ea8915613a53e1ed34d88d2cfb093ed57d
skills_lock_hash: ca45c937ae77b2dc39399ffbe5afbfabcc1862056a62fd50c76342a32e6f8375
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: next-dev-loop

Reviewed source: https://github.com/vercel/next.js/tree/684cf7ea8915613a53e1ed34d88d2cfb093ed57d/skills/next-dev-loop
Raw upstream `SKILL.md` SHA-256: `ca45c937ae77b2dc39399ffbe5afbfabcc1862056a62fd50c76342a32e6f8375`. License notices are preserved in `UPSTREAM-license.md`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: none.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
