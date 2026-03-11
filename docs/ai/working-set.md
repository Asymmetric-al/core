# Working Set

## 2026-02-23 (resend future readiness hardening)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Keep Resend foundation simple, replay-safe, and easier to extend with minimal churn.
- Primary area: `packages/api/src/email/webhooks/resend.ts`, `tests/unit/packages/api/email/webhooks-resend.test.ts`, `turbo.json`, `docs/guides/features/resend-integration.md`
- Decisions in this pass:
  - Missing provider event ids now use deterministic synthetic ids for `email_events` upsert idempotency.
  - Outbound send-log tenant ambiguity remains fail-closed (`422`) with deterministic candidate ordering.
  - Inbound body and attachment retrieval now tolerate partial upstream failure and continue metadata persistence.
  - Turborepo build env hashing now includes `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY`.
- Deferred follow-up:
  - Add operational telemetry for tenant resolution failures and partial inbound retrieval failures.
  - Add admin operational dashboards for Resend event/suppression/inbound monitoring.
- File map for next iteration:
  - Webhook behavior: `packages/api/src/email/webhooks/resend.ts`
  - Resend SDK wrappers: `packages/email/resend.ts`
  - Tenant settings persistence/encryption: `packages/api/src/email/{connect,settings-store,crypto}.ts`
  - Schema/types: `supabase/schema.sql`, `packages/database/types/database.ts`
  - UI/API route entry points: `apps/admin/app/{api/email/settings/integrations/resend}/*`

## 2026-02-23 (resend webhook final pass)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Final hardening pass for webhook tenant resolution plus ops rollout documentation (key rotation + replay handling).
- Primary area: `packages/api/src/email/webhooks/resend.ts`, `tests/unit/packages/api/email/webhooks-resend.test.ts`, `docs/guides/features/resend-integration.md`
- Constraints:
  - Use hybrid strictness: reject unresolved outbound events and accept unresolved inbound events with warnings.
  - Keep inbound ingestion resilient when tenant resolution is unavailable.
  - Document operational runbooks without changing schema or introducing new infra.
- Evidence sources used:
  - `packages/api/src/email/webhooks/resend.ts`
  - `tests/unit/packages/api/email/webhooks-resend.test.ts`
  - `docs/guides/features/resend-integration.md`
  - `packages/api/src/email/crypto.ts`
  - `supabase/schema.sql`

## 2026-02-23 (resend hardening foundation)

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Strictly remove legacy SendGrid path and complete production-ready Resend foundation (service/API/schema/ingestion/UI/tests/docs).
- Primary area: `packages/email/*`, `packages/api/src/email/*`, `apps/admin/app/{api/email,settings/integrations/resend}/*`, `supabase/{schema.sql,migrations/*}`, `packages/database/types/*`, `tests/unit/packages/{email,api/email}/*`, `.cursor/.agents skill docs`
- Constraints:
  - Remove all `sendgrid`/`SENDGRID_` references across tracked repo content.
  - Keep admin integration state server-driven via persisted tenant settings.
  - Verify webhook signatures before processing and persist event/suppression/inbound foundations.
  - Keep API key material server-side; persist encrypted tenant API keys only.
- Evidence sources used:
  - `packages/email/{resend.ts,types.ts,constants.ts}`
  - `packages/api/src/email/{connect,test-send,webhooks/resend,settings-store,crypto}.ts`
  - `apps/admin/app/settings/integrations/resend/{page,resend-sections}.tsx`
  - `supabase/{schema.sql,migrations/20260223120000_resend_email_foundation.sql}`
  - `packages/database/types/{database,index}.ts`
  - `tests/unit/packages/{email,resend,api/email}/*.test.ts`

## 2026-02-23

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Complete SendGrid -> Resend migration by removing remaining SendGrid references from active docs/configs and documenting Resend environment variables.
- Primary area: `docs/guides/features/*`, `docs/README.md`, `docs/guides/architecture/overview.md`, `docs/ai/stack-registry.md`, `packages/email/README.md`, `packages/README.md`, `.env.example`, `supabase/config.toml`
- Constraints:
  - Keep docs internally consistent with the migrated package surface in `packages/email`.
  - Remove the legacy `/settings/integrations/sendgrid` route and keep only `/settings/integrations/resend`.
  - Remove active SendGrid references from repo docs and config comments.
- Evidence sources used:
  - `docs/guides/features/email-studio.md`
  - `docs/guides/features/pdf-studio.md`
  - `docs/guides/architecture/overview.md`
  - `docs/README.md`
  - `packages/email/README.md`
  - `docs/ai/stack-registry.md`
  - `.env.example`
  - `supabase/config.toml`

## 2026-02-23 (prior)

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
