---
source_name: supabase/agent-skills
source_url: https://github.com/supabase/agent-skills
source_type: github
upstream_path: skills/supabase-postgres-best-practices/SKILL.md
reviewed_commit: c9be0e931b7930f7d02126d04774d904c381e7d7
skills_lock_hash: ad65e776f45e761bafc609d3f506c77c1032225aa65e0c4c02f241b8071e5855
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: supabase-postgres-best-practices

Reviewed source: https://github.com/supabase/agent-skills/tree/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase-postgres-best-practices
Raw upstream `SKILL.md` SHA-256: `ad65e776f45e761bafc609d3f506c77c1032225aa65e0c4c02f241b8071e5855`. License notices are preserved in `UPSTREAM-LICENSE`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: Retain Core database triggers, auth routing, workflow, checklist and migration guidance.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains canonical-owned under `docs/ai/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
