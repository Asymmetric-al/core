# Working Set

## 2026-02-23

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Pragmatic hardening pass for admin read-model wiring (authz boundaries, tenant contribution scope, explicit error states, and settled-only KPI semantics).
- Primary area: `apps/admin/app/{page,contributions/page}.tsx`, `apps/admin/lib/admin-access.ts`, `packages/api/src/reads/{dashboard-stats,tenant-contributions}.ts`, `tests/unit/{apps/admin,packages/api/reads}/*`
- Constraints:
  - Keep changes small and reversible; no new infra/framework.
  - Preserve server-component data loading with explicit role guards before service-role reads.
  - Keep contributions tenant-scoped by default; optional donor filter via query string.
  - Remove silent catch-to-empty paths and expose load failures in UI.
- Evidence sources used:
  - `packages/auth/context.ts`
  - `packages/database/types/database.ts`
  - `supabase/migrations/20250101000000_init_schema.sql`
  - `supabase/seed.sql`
  - `apps/admin/app/contributions/{page,types,columns}.tsx`
  - `packages/api/src/reads/{dashboard-stats,donor-history}.ts`

## 2026-02-23 (prior)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Implement ticket 2.2.7 by creating typed read-model modules and wiring them into admin dashboard/contributions with Next.js Cache Components patterns.
- Primary area: `packages/api/src/reads/*`, `apps/admin/app/page.tsx`, `apps/admin/app/contributions/*`, `tests/unit/packages/api/reads/*`, `packages/api/package.json`
- Constraints:
  - Keep changes additive and non-breaking for existing admin UI.
  - Use `'use cache'` + `cacheTag` + explicit `cacheLife` in read-model functions.
  - Keep DB access tenant-scoped and fail fast on admin client unavailability.
  - Preserve existing client interactivity by using server-wrapper + client-component split where required.
- Evidence sources used:
  - `supabase/schema.sql`
  - `packages/database/supabase/admin.ts`
  - `packages/auth/context.ts`
  - `apps/admin/app/page.tsx`
  - `apps/admin/app/contributions/page.tsx`
  - `tests/unit/packages/api/*`
  - `docs/ai/rules/{general,backend,frontend,testing}.md`
- Notes:
  - No dedicated admin missionary detail route under `apps/admin/app/missionaries/[id]/page.tsx`; missionary read-model module is exported and ready for future wiring.
  - Existing read-model proposal referenced `funds.status = 'active'`; current schema uses `funds.is_active` and implementation follows schema.

## 2026-02-23 (TanStack hardening)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Harden TanStack Query/Table/DB + Zod implementation against `epic` with modern patterns, cache-components readiness, and cleaner architecture boundaries.
- Primary area: `packages/database/*`, `packages/ui/components/shadcn/data-table/*`, `packages/api/src/*`, `docs/guides/development/tanstack-integration.md`, `tooling/eslint-config/*`
- Constraints:
  - Keep diffs surgical and backwards-compatible for public exports.
  - Preserve Turborepo task conventions and workspace script behavior.
  - Follow Next.js 16 Cache Components rules (`use cache`, `cacheTag`, `revalidateTag`).
  - Avoid introducing request-runtime APIs inside cached scopes.
  - No secrets in code/docs.
- Evidence sources used:
  - Local branch delta vs `epic` (`git diff epic...HEAD`)
  - `packages/database/providers/*`, `packages/database/collections/client-db.ts`
  - `packages/ui/components/shadcn/data-table/*`
  - `packages/api/src/shared/http-errors.ts` and route handlers
  - `.next-docs` cache-components and `use cache` docs
  - Nia indexed sources: `tanstack/query`, `tanstack/table`, `tanstack/db`, Zod tracer research
- Tooling note:
  - Nia index for `Asymmetric-al/core` can lag branch state; local file reads are source of truth for current implementation details.
