---
source_name: testdino-hq/playwright-skill
source_url: https://github.com/testdino-hq/playwright-skill
source_type: github
upstream_path: ./SKILL.md
reviewed_commit: 178d1cb537604279d7b54500c4823a6db42b9de6
skills_lock_hash: 2a1041c630dc58963aba6a76cd2b9a7533e49124dff39295f584605c4a2ec461
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: playwright-skill

Reviewed source: https://github.com/testdino-hq/playwright-skill/tree/178d1cb537604279d7b54500c4823a6db42b9de6/
Raw upstream `SKILL.md` SHA-256: `2a1041c630dc58963aba6a76cd2b9a7533e49124dff39295f584605c4a2ec461`. License notices are preserved in `UPSTREAM-LICENSE`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: none.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
