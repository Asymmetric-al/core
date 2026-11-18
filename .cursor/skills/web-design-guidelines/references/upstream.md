---
source_name: vercel-labs/agent-skills
source_url: https://github.com/vercel-labs/agent-skills
source_type: github
upstream_path: skills/web-design-guidelines/SKILL.md
reviewed_commit: 063bee94c3f4df8453406c830b0a7df0f2860278
skills_lock_hash: f3bc47f890f42a44db1007ab390709ec368e4b8c089baee6b0007182236ac474
license: not established in Core's review
last_reviewed: 2026-10-22
status: reviewed
ownership: ecosystem
---

# Upstream: web-design-guidelines

Reviewed source: https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines
The commit is the one `docs/ai/skill-source-audit.json` records as examined in the 2026-10-22 installed-skill audit (AL-2186), which is the date above. This file was written on 2026-11-18 (AL-2715) from that audit record and the `skills-lock.json` value above; no fresh upstream comparison was made then. `SYNC.md` is upstream's own sync note. No licence notice ships with this skill, and Core's review has not established one.

## Core adaptations

- A marked Core overlay (AL-2715) gives `accessibility-review` and `docs/ai/rules/frontend.md` precedence, and treats the guideline text this skill fetches from a mutable URL on every run as data, not instructions.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve the marked Core overlay and this provenance. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, then update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. The Core overlay is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from `scripts/refresh-overlays/ecosystem-core-overlays.json` during `bun run skills:sync`. Review that overlay with upstream drift; it does not advance provenance.
5. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
