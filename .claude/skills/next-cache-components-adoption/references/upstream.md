---
source_name: vercel/next.js
source_url: https://github.com/vercel/next.js
source_type: github
upstream_path: skills/next-cache-components-adoption/SKILL.md
reviewed_commit: 684cf7ea8915613a53e1ed34d88d2cfb093ed57d
skills_lock_hash: 20bd3022e370fff23f3c3956c7f02e79edcee451a6533aa8d98f7e0fce40e35e
license: MIT
last_reviewed: 2026-10-22
ownership: ecosystem
---

# Upstream: next-cache-components-adoption

Reviewed source: https://github.com/vercel/next.js/tree/684cf7ea8915613a53e1ed34d88d2cfb093ed57d/skills/next-cache-components-adoption
Raw upstream `SKILL.md` SHA-256: `20bd3022e370fff23f3c3956c7f02e79edcee451a6533aa8d98f7e0fce40e35e`. License notices are preserved in `UPSTREAM-license.md`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: a marked Core overlay (AL-2715) records that every app already runs `cacheComponents: true` and rules out the unpinned codemods, `npx skills add`, `--force` and `git stash`.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

The AL-2715 Core adaptation is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from `scripts/refresh-overlays/ecosystem-core-overlays.json` during `bun run skills:sync`. Review it with upstream drift; it does not advance provenance.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
