# Change: Minimal native Codex issue delivery

## Why

The owner requested native Codex coordination: Samson controls handoffs and
waiting, while specialists know only their assigned role/task. The earlier
sealed-dossier and isolated-ratifier design is superseded by this change.

## What Changes

- Keep six native roles, fresh specialist contexts and coordinator-only workflow.
- Add short role-specific outputs and current-commit review/acceptance decisions.
- Use one writer, independent acceptance, two reviews and optional adjudication.
- Extend delivery through hooks, PR/CI feedback, human-authorized protected merge
  into `develop`, and verified closeout; keep one short resume note.
- Install native role configuration and personal instructions idempotently,
  preserving unrelated settings; provide read-only drift verification.
- Prepare pinned, frozen-lockfile dependencies and reproducible startup material.
- Describe actual runtime controls and persistence honestly.

## Non-goals

No product changes, production credentials/deployment, GitHub protection changes,
custom execution ledger, background scheduler or filesystem isolation claim.
Setup completion does not authorize the paused first issue trial.

## Rollback

Stop new delivery assignments and revert the optional configuration/skill.
Retain run notes and existing GitHub results. The separately paused VM workflow
and its qualification evidence remain independent.
