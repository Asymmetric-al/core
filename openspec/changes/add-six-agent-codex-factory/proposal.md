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
- Separate read-only hosted validation of retained/personal assets and native
  tools from explicitly authorized local CLI installation/configuration.
- Preserve the idempotent local installer and unrelated settings/verification.
- Repair #1955's per-chat active-home installation regression using the bounded
  owner-authorized bootstrap exception, preserving newer review safeguards.
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

## Staged startup repair acceptance (#1955)

Repository R1–R5 covers executable read-only/fail-closed fixtures, unchanged local
installation, canonical consistency, hooks/current-head CI and independent
candidate reviews/acceptance. Workers stop at DELIVERY_READY; David owns the
protected expected-head merge and verified same-worker closeout.
Postmerge H1–H2 requires actual fresh named-cloud handoffs/normal returns and
consumed-source/publication evidence. Merge or fixtures do not qualify hosted
startup; #1954 remains paused until those root-owned gates pass. No implicit
saved-environment publication or issue auto-close is authorized.
