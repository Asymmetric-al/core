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
