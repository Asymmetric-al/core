# Working Set

- Date: 2026-03-06
- Repo: Asymmetric-al/core

## Current Goal (single source of truth)

Harden regression coverage for PR `#71` by adding a focused unit test for a risky production code path that currently relies mostly on slower E2E validation.

## Current Scope

- `packages/api/src/auth/demo-account.ts`
- `tests/unit/auth/*`
- `docs/ai/working-set.md`

## Constraints

- Prefer deterministic unit coverage over broad new E2E coverage.
- Keep production behavior unchanged unless a tiny testability refactor is required.
- Cover high-risk branches with shared blast radius: auth gating, validation, backend failure handling, and cookie/session propagation.
- Keep tests isolated from real network and real Supabase state.

## Candidate Risk Area

- Shared demo auth route `/api/auth/demo-account` is used across admin, donor, missionary, and E2E flows.
- Existing coverage is mainly Playwright preflight smoke coverage; fast unit coverage is missing for several failure and guard branches.

## Evidence Sources Used

- `packages/api/src/auth/demo-account.ts`
- `apps/donor/app/api/auth/demo-account/route.ts`
- `tests/e2e/demo-auth-preflight.spec.ts`
- `tests/unit/auth/e2e-auth.test.ts`
- `tests/unit/cms/public-pages-route.test.ts`
- `tests/unit/cms/public-navigation-route.test.ts`
- `.next-docs/01-app/01-getting-started/15-route-handlers.mdx`
- `.next-docs/01-app/03-api-reference/03-file-conventions/route.mdx`

## Tooling Note

- MCP resources for `nia` are unavailable in this runtime; used repo-scoped `rg`, direct file reads, GitHub PR metadata, and targeted command verification instead.
