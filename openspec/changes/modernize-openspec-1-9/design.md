# Design: Modernize OpenSpec 1.9

## Context

PR #1324 merged into `develop` at `0a569f0c`. Its current archive is
`openspec/changes/archive/2026-08-19-modernize-agent-dev-environment/`.
The original archival attempt encountered `EXDEV` on an overlay filesystem and
used a documented copy/remove recovery; that is dated operational evidence,
not a prescribed manual archive procedure. Use the pinned archive workflow
and current acceptance gates for new work.

The August execution verified OpenSpec `1.9.0` and pinned that exact version.
The current manifest still owns that pin; this historical observation does not
claim it is the newest upstream release today.

## Decisions

- Exact pin: `@fission-ai/openspec@1.9.0`. Never `@latest`.
- Local invocation: `bunx --no-install --package @fission-ai/openspec openspec`.
- Schema stays `spec-driven`. No Stores. No custom schema.
- Skills imported through `scripts/refresh-upstream-skills.mjs` GitHub group
  `Fission-AI/OpenSpec` at tag `v1.9.0` / commit
  `2826b8889e5223a9a8095d4428b60b56597e1020`.
- Core overlay on each skill requires `bun run openspec --`, forbids Stores,
  and documents `Bash(bun:*)` in `allowed-tools`.
- Existing numbered commands remain the end-to-end wrappers. Official Propose
  stays planning-only for ordinary future work.
- CI/preflight runs `skills-verify`, `phase25-spec`, `openspec-validate`, then
  `openspec-deltas`. The last stage checks every active delta against current
  durable requirement identities without applying or archiving it.
- Run archive audit (`validate --archived`) for archive changes. The September
  16 audit passed all 32 retained archives, including the retired Twenty package;
  a dated pass does not replace verification after a new archive change.

## Affected surfaces

- Root `package.json` / `bun.lock`
- `openspec/config.yaml`, `openspec/project.md`
- `docs/ai/skills/openspec-*` and generated mirrors
- `AGENTS.md`, rulebooks, numbered commands, Guardian wording
- `scripts/verify/ci-preflight.mjs` and `.github/workflows/ci.yml`

## Rollback

Revert the pin, skill group, CI stage, and instruction edits. Historical
archives remain. Do not run `openspec update`.
