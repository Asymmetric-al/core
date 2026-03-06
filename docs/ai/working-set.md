# Working Set

- Date: 2026-03-06
- Repo: Asymmetric-al/core

## Current Goal (single source of truth)

Add missing regression coverage for newly introduced auth and authorization
paths on this PR, focusing on demo auth bypass and expanded role-based access
in shared API routes.

## Current Scope

- `tests/unit/api/demo-account.test.ts`
- `tests/unit/api/role-expanded-routes.test.ts`
- `packages/api/src/auth/demo-account.ts`
- `packages/api/src/admin/users.ts`
- `packages/api/src/profile/index.ts`
- `docs/ai/working-set.md`

## Constraints

- Follow existing Vitest route-test conventions.
- Keep tests deterministic and isolated; avoid network calls and external auth.
- Do not change production behavior unless a tiny refactor is unavoidable.
- Skip fragile harnesses for unresolved external runtime dependencies.

## Open Decisions

- Whether `packages/api/src/missionaries/metrics.ts` should get a dedicated route
  unit test once the `@supabase/ssr` module is easier to isolate in Vitest here.

## Recent Completed Streams (summary only)

- 2026-03-06: Added targeted API regression tests for demo auth bypass, staff
  access to admin users, and missionary enrichment via membership-aware auth.
- 2026-02-26: Authz membership/RLS foundation landed (`authz.memberships`, role helpers, middleware/context integration, docs).
- 2026-02-22: Supabase CLI hybrid workflow landed (global-first with pinned fallback, hosted migration safety).
- 2026-02-23: Site Studio/Payload integration and quality gates expanded across CI + docs + tests.

## Evidence Sources Used

- `packages/api/src/auth/demo-account.ts`
- `packages/api/src/admin/users.ts`
- `packages/api/src/profile/index.ts`
- `packages/auth/context.ts`
- `tests/unit/auth/e2e-auth.test.ts`
- `tests/unit/cms/public-pages-route.test.ts`

## Tooling Note

- MCP resources were unavailable in this runtime; used repo-scoped `rg`, direct
  file reads, Next.js docs from `.next-docs`, and targeted command verification.
