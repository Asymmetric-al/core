# Technical Decisions

Decisions that still constrain current code. Each section names the files it
applies to.

## React Compiler Enablement (Annotation Mode)

React Compiler runs in opt-in annotation mode in every product app:
`reactCompiler.compilationMode = "annotation"` in `apps/admin/next.config.ts`,
`apps/donor/next.config.ts` and `apps/missionary/next.config.ts`, with
`babel-plugin-react-compiler` as a root dev dependency. Only files marked
`"use memo"` are compiled; enabling the compiler alone changes no runtime
behavior. Files that must never be compiled carry `"use no memo"` (for example
the vendored ReUI data-grid files under `packages/ui/components/reui/data-grid/`,
which wrap TanStack Table).

## Tiptap StarterKit Extensions (v3)

Tiptap v3's StarterKit includes Link and Underline. Registering them separately
causes "Duplicate extension names" warnings, so configure Link through
`StarterKit.configure({ link: { ... } })`, as
`packages/ui/components/shadcn/rich-text-editor/extensions.ts` does.

## Read-Model Modules for Admin Dashboard (Ticket 2.2.7)

### Issue

Admin dashboard data and contributions history were UI-mocked and lacked a typed,
cache-aware read-model surface that can evolve cleanly as schema and access
patterns grow.

### Decisions

1. Add read models under `packages/api/src/reads/`:
   - `dashboard-stats.ts`
   - `missionary-metrics.ts`
   - `donor-history.ts`
   - `types.ts` (internal pagination primitives)
2. Use Next.js Cache Components APIs in read models:
   - function-scoped `'use cache'`
   - explicit `cacheLife('minutes')`
   - scoped `cacheTag(...)` keys for future invalidation
3. Keep read-model DB access server-only by calling
   `getAdminClient()` inside read-model functions.
4. The admin dashboard root page (`apps/admin/app/(app)/page.tsx`) is a Server
   Component that resolves the tenant and loads stats through
   `dashboard-stats-loader.ts`.
5. Admin org-wide **Contributions** (`/contributions`) has since moved on from
   this note; its current page, permission checks and data hooks live in
   `apps/admin/app/(app)/contributions/`.

### Schema Alignment

- Active funds are filtered with `funds.is_active = true` (current schema)
  rather than a non-existent `funds.status = 'active'` column.

### Files Added/Changed

- `packages/api/src/reads/*`
- `packages/api/package.json` exports for `./reads/*`
- `apps/admin/app/(app)/page.tsx`
- `apps/admin/features/mission-control/components/AdminDashboardStatsSection.tsx` (since removed — it had no importer)
- `apps/admin/app/(app)/contributions/page.tsx`
- `apps/admin/app/(app)/contributions/main-body.tsx`
- `apps/admin/app/(app)/contributions/use-admin-contributions.ts`
- `tests/unit/packages/api/reads/*.test.ts`

### Date

February 2026
