---
source_name: ueberdosis/tiptap
source_url: https://github.com/ueberdosis/tiptap
source_type: github
upstream_path: .agents/skills/tiptap/SKILL.md
reviewed_commit: 5b6bee8090e857d1a285427b12a8e79eaedd98a5
skills_lock_hash: 075de80e65012f9ad6ae4fba4c99df3c297f583b10fb5aedf381a0e1a3c02a5a
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: tiptap

Reviewed source: https://github.com/ueberdosis/tiptap/tree/5b6bee8090e857d1a285427b12a8e79eaedd98a5/.agents/skills/tiptap
Raw upstream `SKILL.md` SHA-256: `075de80e65012f9ad6ae4fba4c99df3c297f583b10fb5aedf381a0e1a3c02a5a`. License notices are preserved in `UPSTREAM-LICENSE.md`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: none.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains canonical-owned under `docs/ai/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.

Upstream moved from `skills/tiptap` to `.agents/skills/tiptap`; the installed skill identity remains `tiptap`. All four new topic references accompany the compact entrypoint.
