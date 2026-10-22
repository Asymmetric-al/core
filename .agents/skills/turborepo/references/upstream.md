---
source_name: vercel/turborepo
source_url: https://github.com/vercel/turborepo
source_type: github
upstream_path: skills/turborepo/SKILL.md
reviewed_commit: b90e6ea31e02ab150b8ab85f5fab18b941b21e75
skills_lock_hash: e475e520f1822f0de4ca5fbbfd37906949db67d35b038f2b8a76ef4c95c13c53
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: turborepo

Reviewed source: https://github.com/vercel/turborepo/tree/b90e6ea31e02ab150b8ab85f5fab18b941b21e75/skills/turborepo
Raw upstream `SKILL.md` SHA-256: `e475e520f1822f0de4ca5fbbfd37906949db67d35b038f2b8a76ef4c95c13c53`. License notices are preserved in `UPSTREAM-LICENSE`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: none.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.

Installed `turbo@2.11.10` includes `node_modules/turbo/docs/README.md` and the task-indexed MDX guides, verified on 2026-10-22. The current official documentation-router skill is compatible; 25 retired bundled skill reference files were removed rather than retaining a contradictory old reference snapshot.
