# Design: Modernize OpenSpec 1.9

## Context

PR #1324 merged into `develop` at `0a569f0c` and is archived as
`openspec/changes/archive/2026-08-18-modernize-agent-dev-environment/`.
Official `openspec archive` failed on this overlay filesystem with `EXDEV`
during sibling rename; the archive was completed with copy-then-remove after
the main `agent-instruction-system` delta was applied. Archive validation of
that folder passed.

Latest stable OpenSpec at execution time is `1.9.0`. No newer stable release
was used.

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
- Strict `openspec validate --all --strict` runs in `ci-preflight` immediately
  after `skills-verify`.
- Archive audit (`validate --archived`) currently passes all historical
  archives, including the retired Twenty package. Keep it blocking.

## Affected surfaces

- Root `package.json` / `bun.lock`
- `openspec/config.yaml`, `openspec/project.md`
- `docs/ai/skills/openspec-*` and generated mirrors
- `AGENTS.md`, rulebooks, numbered commands, Guardian wording
- `scripts/verify/ci-preflight.mjs` and `.github/workflows/ci.yml`

## Rollback

Revert the pin, skill group, CI stage, and instruction edits. Historical
archives remain. Do not run `openspec update`.
