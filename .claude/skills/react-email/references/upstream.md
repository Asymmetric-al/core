---
source_name: resend/react-email
source_url: https://github.com/resend/react-email
source_type: github
upstream_path: skills/react-email/SKILL.md
reviewed_commit: e0561e164e9c28859d24373804e30b364931ee77
skills_lock_hash: 5d989d8109068b40bfc00111013d8488b577c21d8973013f0e810e946a670987
license: MIT
last_reviewed: 2026-11-18
status: reviewed
ownership: ecosystem
---

# Upstream: react-email

Reviewed source: https://github.com/resend/react-email/tree/e0561e164e9c28859d24373804e30b364931ee77/skills/react-email
The commit is the one `docs/ai/skill-source-audit.json` records as examined. The lock hash above is the `skills-lock.json` value. License notices are preserved in `UPSTREAM-LICENSE`.

## Core adaptations

- Scanner allowlist comments are retained; they change no upstream instruction.
- A marked Core overlay (AL-2715) points at Core's email owners: the React Email editor in `packages/ui`, the shared `@asym/email` package in `packages/email`, and `docs/guides/features/resend-integration.md`.

## Refresh

1. Use an isolated temporary checkout at a reviewed immutable source commit. Verify its resolved commit and complete file inventory before import. Install only this skill if a Skills CLI copy is needed; pass `--agent codex --copy` for a project-local scratch install. Do not use global defaults or add unrelated pack members.
2. Compare the complete source tree and all support files. Preserve the marked Core overlay and this provenance. Record raw upstream hashes separately from adapted bytes.
3. Replace the installed source directory transactionally, then update its lock metadata in the same transaction. Never run imported lifecycle hooks, launchers, scripts or tests as a refresh side effect.
4. The Core overlay is restored by `scripts/lib/ecosystem-skill-adapters.mjs` from `scripts/refresh-overlays/ecosystem-core-overlays.json` during `bun run skills:sync`. Review that overlay with upstream drift; it does not advance provenance.
5. Run `bun run skills:sync`, then non-mutating `bun run skills:verify`.

This skill remains ecosystem-owned under `.agents/skills`. Repository authority, secrets policy and installed package evidence outrank generic source recipes.
