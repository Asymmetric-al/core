# Working Set

## 2026-02-23

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

## 2026-02-16

- Date: 2026-02-16
- Repo: Asymmetric-al/core
- Goal: Prepare deterministic Supabase demo seed data for a new hosted project with exactly one profile identity, full relational coverage across app tables, and optional public read-only demo RLS migration.
- Primary area: `supabase/seed.sql`, `supabase/migrations/*`, `scripts/*`, `AGENTS.md`
- Constraints:
  - No hardcoded secrets.
  - Seed must be idempotent + relationally valid.
  - Keep demo data realistic and varied.
  - Preserve Supabase migration-first workflow.
- Evidence sources used:
  - `supabase/schema.sql`
  - `supabase/migrations/20250101000000_init_schema.sql`
  - `supabase/migrations/20260214090000_foundation_1_schema.sql`
  - table usage search in `apps/*` and `packages/*`
- Tooling note:
  - Nia MCP may be intermittently unavailable (tool registration can drop); fallback is repo-scoped `rg` + direct file reads.
