# Complete Emil skills and clarify Codex environment discovery

## Why

Core's reviewed Emil skill pack omits the upstream `animation-performance` and
`break-ui` skills. Its focused refresh promotes repository-installed copies,
which prevents a reviewed upstream checkout from being supplied directly.
Installed skill files also need to be distinguished from skills registered in
the running Codex application's catalog.

## What Changes

- Add both missing canonical skills, companion assets, licenses, provenance,
  and narrow Core guidance; regenerate all three runtime mirrors.
- Let the focused Emil refresh consume an explicitly supplied reviewed source
  directory through the existing transaction and raw-source hash pipeline.
- Refresh the reviewed Emil pack while preserving Core overlays, the
  `emil-prototype` alias, and the separate animation-opportunity adapter.
- Document global and cloud skill discovery in scoped development guidance,
  including saved environment setup and actual app-catalog verification.

## Scope and Non-goals

This change affects agent tooling and documentation only. It does not change
product code, dependencies, database behavior, or the root instruction budget.
It does not publish a hosted environment profile or register application
capability roots. Those actions require a supported app configuration surface
and must be verified independently.

## Affected Capability

- `agent-instruction-system`

## Validation and Rollback

Use public refresh-command tests, raw-source provenance checks, canonical
inventory checks, mirror parity, formatting, OpenSpec validation, and the
normal repository readiness gate. Revert the scoped tooling and skill changes
through Git to restore the previous reviewed pack. Do not replace installed
working snapshots in an unrelated environment as part of repository rollback.
