# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Implement Phase 0 Ticket T1 (Monorepo Workspace Contract): audit current workspace layout and add documentation + automated guardrails.
- Document where code belongs (`apps/*`, `packages/*`, `tooling/*`) and naming/dependency conventions for all workspaces.
- Add a lightweight verification script that fails when workspace naming or internal dependency protocol drifts.
- Keep T1 merge gate scoped to workspace-contract changes; gate Supabase schema + money-unit checks as a separate QA track.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - README.md
  - package.json
  - turbo.json
  - scripts/

## Stack tags (pick from docs/ai/stack-registry.md)
- Bun
- Node.js
- Turborepo
- TypeScript

## Known identifiers (exact strings)
- files:
  - README.md
  - package.json
  - turbo.json
- symbols:
  - workspaces
  - apps/*
  - packages/*
  - tooling/*
  - @asym/
  - workspace:*
  - verify:workspace-contract
- routes:
  - N/A
- error strings:
  - N/A
- package ids:
  - N/A

## Expected behavior
- README clearly documents the monorepo workspace contract and onboarding steps for adding new apps/packages.
- All workspace package names remain in `@asym/*` format.
- Internal workspace dependencies remain `workspace:*` (no `file:` links for internal packages).
- Guardrail script can be run locally/CI to enforce contract drift detection.

## Constraints
- runtime: Bun/Node
- tooling: Turborepo + workspace package.json validation
- env/platform notes:
  - Keep diffs minimal and focused on contract hardening.
  - Do not introduce secrets or credentials.
  - Rules source of truth: docs/ai/rules/* (treat .cursor/rules/* as legacy).

## Verification
- `bun run verify:workspace-contract`
- `bun run verify:t1`
- `bun run verify:supabase-money` (separate QA track; not required for T1 merge)
- `git status`

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Implement Ticket T1 monorepo workspace contract hardening
Area: root package.json + README + scripts
Stack: Bun, Node.js, Turborepo, TypeScript
Keywords: workspaces, apps/*, packages/*, tooling/*, @asym/, workspace:*, README, verify
Constraints: minimal docs + guardrail diffs; no secrets; cite exact files + script behavior
Evidence required: file paths + validated conventions + brief explanation
