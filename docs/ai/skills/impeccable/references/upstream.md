---
source_name: pbakaus/impeccable
source_url: https://github.com/pbakaus/impeccable
source_type: github
upstream_path: .agents/skills/impeccable/SKILL.md
reviewed_commit: 8644175285360c166e57b1e35ecadfbc85ff5209
skills_lock_hash: 88e9a46a91b6ddd1059f03f578bd0f9bbe6d212d6a395124379b9bb5c97c5cf2
license: Apache-2.0
last_reviewed: 2026-10-22
---

# Upstream: impeccable

Reviewed source: https://github.com/pbakaus/impeccable/tree/8644175285360c166e57b1e35ecadfbc85ff5209/.agents/skills/impeccable
Raw upstream `SKILL.md` SHA-256: `88e9a46a91b6ddd1059f03f578bd0f9bbe6d212d6a395124379b9bb5c97c5cf2`. License notices are preserved in `UPSTREAM-LICENSE`, `UPSTREAM-NOTICE.md`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: Mark Core design-system, ownership, and explicit launcher/hook boundaries.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains canonical-owned under `docs/ai/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.

All companion scripts, agents, native and degraded references, binary/data assets and notices are preserved as source. They were inspected as data and never invoked during refresh.
