---
source_name: resend/resend-skills
source_url: https://github.com/resend/resend-skills
source_type: github
upstream_path: skills/email-best-practices/SKILL.md
reviewed_commit: b2ae7b1798b70134faf679f35fc05b4331462988
skills_lock_hash: f1b957138619784e2c22f7ae689bde6e903a8134ee52d626d8846809382ef0c8
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: email-best-practices

Reviewed source: https://github.com/resend/resend-skills/tree/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices
Raw upstream `SKILL.md` SHA-256: `f1b957138619784e2c22f7ae689bde6e903a8134ee52d626d8846809382ef0c8`. License notices are preserved in `UPSTREAM-LICENSE`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: correct the invalid `new AbortSignal.timeout(10000)` constructor example to `AbortSignal.timeout(10000)`; `timeout` is a static factory, not a constructor.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
