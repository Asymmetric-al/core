# Working Set

- Date: 2026-03-06
- Repo: Asymmetric-al/core

## Current Goal (single source of truth)

Inspect PR `#71` (`cursor/site-studio-integration-70ab` -> `epic`) for meaningful untested behavior, then add the minimum deterministic regression tests that cover the riskiest new production logic without changing product behavior.

## Current Scope

- Changed production modules in `apps/admin`, `apps/donor`, `packages/auth`, `packages/api`, and related test coverage under `tests/unit`
- PR diff against `origin/epic`
- Existing Vitest conventions and helper patterns

## Constraints

- Prioritize business-risky behavior over broad diff coverage
- Keep tests deterministic, isolated, and low-maintenance
- Avoid production changes unless a tiny refactor is required for testability
- Run targeted validation for touched tests and relevant package checks

## Open Decisions

- Which changed production path has the highest regression risk with the weakest current coverage?
- Whether the best ROI is in auth middleware/permissions, CMS tenant/public APIs, or shared API utilities

## Evidence Sources Used

- `git diff origin/epic...HEAD`
- `tests/unit/**/*`
- `docs/ai/rules/testing.md`
- `docs/ai/stack-registry.md`

## Tooling Note

- MCP/Nia resources are unavailable in this runtime; used repo-scoped `git diff`, `rg`, direct file reads, and targeted command verification instead.
