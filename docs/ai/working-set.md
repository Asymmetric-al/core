# Working Set

## 2026-03-10

- Date: 2026-03-10
- Repo: Asymmetric-al/core
- Goal: Reconcile PR #68 with current `epic`, keep donor-specific contributions, share settled-status KPI handling, and resolve merge conflicts for admin merge.
- Primary area: `apps/admin/app/{page,contributions/page}.tsx`, `apps/admin/app/contributions/contributions-client.tsx`, `apps/admin/features/mission-control/components/AdminDashboardStatsSection.tsx`, `packages/api/src/reads/*`, `tests/unit/{apps/admin/app,packages/api/reads}/*`
- Constraints:
  - Keep `/contributions` donor-specific and validate `donorId` against the signed-in donor profile.
  - Preserve the existing dashboard shell when KPI stats fail to load.
  - Keep explicit contribution load failures visible in the UI.
  - Use one shared settled-status source for dashboard and missionary metrics.
  - Leave the tenant-wide contributions implementation out of this PR.
- Evidence sources used:
  - `apps/admin/app/page.tsx`
  - `apps/admin/app/contributions/page.tsx`
  - `apps/admin/app/contributions/contributions-client.tsx`
  - `apps/admin/features/mission-control/components/AdminDashboardStatsSection.tsx`
  - `packages/api/src/reads/{dashboard-stats,donor-history,missionary-metrics}.ts`
  - `tests/unit/packages/api/reads/*`
  - `tests/unit/apps/admin/app/*`
  - `.next-docs/01-app/01-getting-started/{03-layouts-and-pages,06-cache-components,10-error-handling}.mdx`
- Notes:
  - Nia repo-scoped search workflow is required by `AGENTS.md`, but Nia tools are not available in this session; using `rg`, `git grep`, and direct file reads as fallback.
  - PR #68 required conflict resolution against `epic` before merge.

## 2026-03-09

- Date: 2026-03-09
- Repo: Asymmetric-al/core
- Goal: Finish PR #67 for merge by keeping the new donor-specific contributions direction, adding safe dashboard KPI fallback behavior, moving donor lookup into `packages/api/src/reads`, and removing the Greptile informer workflow.
- Primary area: `packages/api/src/reads/*`, `apps/admin/app/page.tsx`, `apps/admin/app/contributions/page.tsx`, `tests/unit/packages/api/reads/*`, `tests/unit/apps/admin/app/*`, `.github/workflows/greptile-informer.yml`
- Constraints:
  - Keep `/contributions` donor-specific for this PR.
  - Preserve the existing dashboard shell when KPI stats fail to load.
  - Keep current placeholder contribution labels and visible bulk-action stubs.
  - Move page-level admin-client access into `packages/api/src/reads`.
- Evidence sources used:
  - `apps/admin/app/page.tsx`
  - `apps/admin/app/contributions/page.tsx`
  - `apps/admin/app/contributions/contributions-client.tsx`
  - `apps/admin/app/mc-shell.tsx`
  - `packages/api/src/reads/{dashboard-stats,donor-history,missionary-metrics}.ts`
  - `tests/unit/packages/api/reads/*`
  - `docs/guides/architecture/db-client-usage-matrix.md`
  - `.next-docs/01-app/01-getting-started/10-error-handling.mdx`
  - `.next-docs/01-app/03-api-reference/03-file-conventions/error.mdx`
- Notes:
  - Nia repo-scoped search workflow is required by `AGENTS.md`, but Nia tools are not available in this session; using `rg`, `git grep`, and direct file reads as fallback.
  - PR #67 is currently merge-conflicting with `epic`, so code fixes and rebase readiness need to be evaluated separately.

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

## 2026-02-22

- Date: 2026-02-22
- Repo: Asymmetric-al/core
- Goal: Implement a hybrid Supabase CLI workflow (global-first + pinned fallback) and align setup/scripts/docs with secure contributor defaults.
- Primary area: `scripts/supabase-cli.mjs`, `package.json`, `scripts/seed-demo.sh`, `scripts/setup/*`, `README.md`, `docs/ops/environments.md`, `docs/ai/rules/backend.md`
- Constraints:
  - No hardcoded secrets.
  - Keep Supabase auth client boundaries unchanged (`@supabase/ssr` server/client separation).
  - Preserve migration safety for hosted flows (`SUPABASE_DB_URL`, URL targeting checks).
  - Keep contributor setup non-blocking while improving reproducibility.
- Evidence sources used:
  - `package.json`
  - `scripts/seed-demo.sh`
  - `scripts/setup/index.sh`
  - `scripts/setup.ps1`
  - `scripts/setup/index.ps1`
  - `README.md`
  - `docs/ops/environments.md`
  - `docs/ai/rules/backend.md`
- Tooling note:
  - Repo uses Bun-first workflows; Supabase runner should work with/without globally installed `supabase` binary.
