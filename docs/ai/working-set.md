# Working Set

- Date: 2026-02-23
- Repo: Asymmetric-al/core

## Current Goal (single source of truth)

Resolve `origin/epic` merge conflicts cleanly with two intent-first outcomes:
1. Adopt a hybrid E2E strategy (fast core suite + dedicated CMS/admin suite).
2. Normalize `docs/ai/working-set.md` into a canonical "current truth" format that reduces future conflict churn.

## Current Scope

- `playwright.config.ts`
- `tests/e2e/*` (CMS tagging + suite boundaries)
- `package.json` (E2E script split)
- `.github/workflows/ci-integration.yml` (run both suites)
- `README.md` + `docs/ci.md` (workflow and command docs)
- `docs/ai/working-set.md` (canonical structure)

## Constraints

- Keep deterministic CI-equivalent behavior for default local/CI scripts.
- Keep strict modes available for real-environment validation.
- Maintain test stability (no hidden dependencies between donor-only and CMS/admin paths).
- Keep manual/video tour tests out of default blocking E2E runs.
- Avoid destructive rewrites outside merge-conflict scope.

## Open Decisions

- Should CMS E2E remain non-blocking long term, or become required after flake budget is reduced?
- Should `@cms` tagging expand to additional integration specs as Site Studio coverage grows?

## Recent Completed Streams (summary only)

- 2026-02-26: Authz membership/RLS foundation landed (`authz.memberships`, role helpers, middleware/context integration, docs).
- 2026-02-22: Supabase CLI hybrid workflow landed (global-first with pinned fallback, hosted migration safety).
- 2026-02-23: Site Studio/Payload integration and quality gates expanded across CI + docs + tests.

## Evidence Sources Used

- `playwright.config.ts`
- `tests/e2e/cms-*.spec.ts`
- `tests/e2e/usability-smoke.spec.ts`
- `package.json`
- `.github/workflows/ci-integration.yml`
- `docs/ci.md`
- `README.md`

## Tooling Note

- MCP resources are unavailable in this runtime; used repo-scoped `rg`, direct file reads, and targeted command verification.
