---
source_name: resend/resend-cli
source_url: https://github.com/resend/resend-cli
source_type: github
upstream_path: skills/resend-cli/SKILL.md
reviewed_commit: d4367e18c194f2bb555aad99bf8851f21e81606a
skills_lock_hash: 42e772737cf68ec85703c694b73edc2b9f87850bda1992bb77841a98b7610cd7
license: MIT
last_reviewed: 2026-10-22
---

# Upstream: resend-cli

Reviewed source: https://github.com/resend/resend-cli/tree/d4367e18c194f2bb555aad99bf8851f21e81606a/skills/resend-cli
Raw upstream `SKILL.md` SHA-256: `42e772737cf68ec85703c694b73edc2b9f87850bda1992bb77841a98b7610cd7`. License notices are preserved in `UPSTREAM-LICENSE`.

Outcome: updated from the complete installed upstream subtree. Reviewed obsolete upstream companions are removed. Core adaptations: Preserve CLI/product ownership and secret-safe noninteractive workflow.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve marked Core overlays, exact package ownership, installed-version compatibility, and documented in-place corrections. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, removing reviewed stale upstream files while retaining local provenance and legitimate Core assets. Update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`; review canonical or ecosystem sources and generated mirrors together.

This skill remains canonical-owned under `docs/ai/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
