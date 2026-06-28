# Phase 3 Evidence - Payments and Giving Pipeline

Generated: 2026-05-12
Phase: 3 - Payments and Giving Pipeline
Status: complete-local-only
Branch: production
Base branch: origin/production
Commit SHA: f4d3831c4991ef9eb64b4cbbe37c5c3f828397f4
Branch divergence: 0 ahead, 0 behind origin/production at evidence time
Readiness source: docs/ops/phase-assessments/2026-05-12_secrets-access-readiness.md
Readiness source assessment commit: 1c66a3aa31e7da6b096cb66cf8655b778e65ae80
Current readiness status used: ready for local/dev only

## Summary

Phase 3 local/dev implementation is complete enough to hand to provider proof and deployment verification. The repo now stores raw Stripe webhook events before processing, locks and records processing state idempotently, stages successful gifts for finance review, queues approved gifts for Twenty through the existing CRM outbound queue, records receipt sends through Resend tenant email settings, exposes finance review/replay/reconciliation APIs through thin app route adapters, and wires Mission Control contributions UI actions to those APIs.

Production completion remains blocked by provider access and runtime prerequisites from the readiness report. No production provider resources were created or modified.

## Changed Files Summary

- Stripe ingestion and replay:
  - `packages/api/src/stripe/webhooks.ts`
  - `packages/api/src/stripe/event-store.ts`
  - `packages/api/src/stripe/replay.ts`
- Giving domain services:
  - `packages/api/src/giving/staged-gifts.ts`
  - `packages/api/src/giving/receipts.ts`
- Admin contributions API package handlers:
  - `packages/api/src/admin/contributions/staged-gifts.ts`
  - `packages/api/src/admin/contributions/replay.ts`
  - `packages/api/src/admin/contributions/reconcile.ts`
  - `packages/api/src/admin/contributions/model.ts`
  - `packages/api/src/admin/contributions/service.ts`
  - `packages/api/src/admin/contributions/types.ts`
- Thin app route adapters:
  - `apps/admin/app/api/admin/contributions/reconcile/route.ts`
  - `apps/admin/app/api/admin/contributions/replay/route.ts`
  - `apps/admin/app/api/admin/contributions/staged-gifts/route.ts`
  - `apps/admin/app/api/admin/contributions/staged-gifts/[stagedGiftId]/route.ts`
  - `apps/admin/app/api/admin/contributions/staged-gifts/[stagedGiftId]/approve/route.ts`
  - `apps/admin/app/api/admin/contributions/staged-gifts/[stagedGiftId]/retry/route.ts`
  - `apps/admin/app/api/admin/contributions/staged-gifts/[stagedGiftId]/receipt/route.ts`
- Admin contributions UI:
  - `apps/admin/app/contributions/use-admin-contributions.ts`
  - `apps/admin/app/contributions/page-client.tsx`
  - `apps/admin/app/contributions/contribution-detail-sheet.tsx`
  - `apps/admin/app/contributions/data.ts`
- CRM sync domain:
  - `packages/api/src/crm/sync/domains.ts`
  - `packages/api/src/crm/sync/types.ts`
- Package/runtime map:
  - `packages/api/package.json`
  - `docs/guides/architecture/runtime-map.md`
- Tests:
  - `tests/unit/packages/api/stripe-webhooks.test.ts`
  - `tests/unit/packages/api/stripe-event-store.test.ts`
  - `tests/unit/packages/api/giving-staged-gifts.test.ts`
  - `tests/unit/packages/api/giving-receipts.test.ts`
  - `tests/unit/apps/admin/app/contributions-page.test.tsx`
  - `tests/unit/phase-03-giving-pipeline-migration.test.ts`
- Agent scratch context:
  - `docs/ai/working-set.md`

## Migrations

Added:

- `supabase/migrations/20260512190000_phase_03_giving_pipeline.sql`

Migration contents:

- Adds `gifts` to `crm_sync_domain`.
- Adds `stripe_raw_events` with Stripe event uniqueness, signature metadata hashes, livemode/account metadata, processing state, retry/dead-letter fields, correlation IDs, and references to donations and donation saga outbox rows.
- Adds `staged_gifts`, `staged_gift_allocations`, `staged_gift_audit_events`, `donation_crm_links`, and `giving_reconciliation_runs`.
- Adds RPCs for raw event claiming, completion, and failure recording.
- Enables RLS and grants service-role access; app route handlers do not perform direct Supabase access.

Migration verification:

- `bun run verify:supabase-migrations`: skipped because `DATABASE_URL` is missing for the disposable migration verifier.
- `tests/unit/phase-03-giving-pipeline-migration.test.ts`: passed. This validates required table/RPC/index/RLS/schema text exists, but it is not a substitute for running the disposable migration verifier.

Destructive migration risk:

- No destructive table/column changes were added.
- `ALTER TYPE crm_sync_domain ADD VALUE IF NOT EXISTS 'gifts'` is additive. Rollback should leave the enum value inert unless an approved enum-rebuild migration is created.

## Env Vars and Secrets

Names only. No values were printed or committed.

Required or completion-gate items:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_STRIPE_WEBHOOK_SECRET`
- `DONOR_STRIPE_WEBHOOK_SECRET`
- `MISSIONARY_STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_ENCRYPTION_KEY`
- `TWENTY_API_URL`
- `TWENTY_API_KEY`
- `TWENTY_WORKSPACE_ID`
- `TWENTY_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `DATABASE_URL`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Provider/dashboard status:

- Stripe secrets are required for live webhook proof; dashboard endpoints and event subscriptions were not verified in this implementation pass.
- Resend secrets are required for production receipt delivery and webhook ingestion; verified domain and webhook events were not verified in this implementation pass.
- Twenty development/proof credentials are required before gift posting can be considered deployment-ready; `TWENTY_WORKSPACE_ID` remains a known missing item from readiness.
- `DATABASE_URL` is required only for the disposable migration verifier in this pass and was missing.
- Sentry runtime DSNs are the Phase 3 observability requirement. Sourcemap upload and `SENTRY_AUTH_TOKEN` are Phase 11 observability work unless a build/deploy explicitly fails because sourcemap upload is required.

## Commands Run

Baseline before implementation:

| Command                             | Status | Notes                                                                                   |
| ----------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `git status --short`                | passed | Working tree state was recorded before edits; no secret files were staged or committed. |
| `git branch --show-current`         | passed | `production`.                                                                           |
| `git rev-parse HEAD`                | passed | `f4d3831c4991ef9eb64b4cbbe37c5c3f828397f4`.                                             |
| `bun install --frozen-lockfile`     | passed | Dependencies already satisfied.                                                         |
| `bun run skills:verify`             | passed | Agent skill mirrors verified.                                                           |
| `bun run format:check`              | passed | Pre-implementation baseline passed.                                                     |
| `bun run lint`                      | passed | Pre-implementation baseline passed.                                                     |
| `bun run typecheck`                 | passed | Pre-implementation baseline passed.                                                     |
| `bun run build`                     | passed | Pre-implementation baseline passed.                                                     |
| `bun run test:unit`                 | passed | Pre-implementation baseline passed.                                                     |
| `bun run verify:data-boundary`      | passed | Pre-implementation baseline passed.                                                     |
| `bun run verify:workspace-contract` | passed | Pre-implementation baseline passed.                                                     |
| `bun run verify:eslint`             | passed | Pre-implementation baseline passed.                                                     |
| `bun run verify:shadcn-diff`        | passed | Pre-implementation baseline passed.                                                     |

Post-implementation:

| Command                                                                                                                                                                                                                                                                                                                                                                                        | Status                        | Notes                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bun run typecheck`                                                                                                                                                                                                                                                                                                                                                                            | passed                        | All TypeScript packages passed.                                                                                                                                                                                          |
| `bun run build`                                                                                                                                                                                                                                                                                                                                                                                | passed                        | 13 tasks passed; admin build listed the new contributions replay/reconcile/staged-gift routes.                                                                                                                           |
| `bunx vitest run tests/unit/apps/admin/app/contributions-page.test.tsx tests/unit/packages/api/stripe-webhooks.test.ts tests/unit/packages/api/stripe-event-store.test.ts tests/unit/packages/api/giving-staged-gifts.test.ts tests/unit/packages/api/giving-receipts.test.ts tests/unit/packages/api/admin/contributions-model.test.ts tests/unit/phase-03-giving-pipeline-migration.test.ts` | passed                        | 7 files, 22 tests passed.                                                                                                                                                                                                |
| `bun run test:unit`                                                                                                                                                                                                                                                                                                                                                                            | passed after test harness fix | Final run: 190 files, 847 tests passed. An intermediate run failed because the contributions page test lacked the app QueryProvider after mutations were added; the test now wraps the page with the repo QueryProvider. |
| `bun run format:check`                                                                                                                                                                                                                                                                                                                                                                         | passed                        | All matched files use Prettier style.                                                                                                                                                                                    |
| `bun run lint`                                                                                                                                                                                                                                                                                                                                                                                 | passed                        | 13 lint tasks passed.                                                                                                                                                                                                    |
| `bun run verify:data-boundary`                                                                                                                                                                                                                                                                                                                                                                 | passed                        | No direct Supabase imports in app API routes and no raw Twenty access in app source.                                                                                                                                     |
| `bun run verify:workspace-contract`                                                                                                                                                                                                                                                                                                                                                            | passed                        | Runtime map includes new routes.                                                                                                                                                                                         |
| `bun run verify:eslint`                                                                                                                                                                                                                                                                                                                                                                        | passed                        | ESLint config verification passed.                                                                                                                                                                                       |
| `bun run verify:shadcn-diff`                                                                                                                                                                                                                                                                                                                                                                   | passed                        | No component drift vs registry.                                                                                                                                                                                          |
| `bun run skills:verify`                                                                                                                                                                                                                                                                                                                                                                        | passed                        | Agent skill mirrors verified.                                                                                                                                                                                            |

## Commands Skipped

| Command/check                                                  | Status                   | Reason                                                                                                                                               |
| -------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run verify:supabase-migrations`                           | skipped                  | `DATABASE_URL` for the disposable migration verifier is missing. Do not run this verifier against hosted production.                                 |
| Stripe dashboard webhook endpoint and event subscription proof | skipped                  | Stripe dashboard/CLI proof was not available in this local/dev implementation pass.                                                                  |
| Resend domain and webhook event proof                          | skipped                  | Resend dashboard/CLI proof was not available in this local/dev implementation pass.                                                                  |
| Twenty workspace/API proof                                     | skipped                  | `TWENTY_WORKSPACE_ID` remains missing from readiness; project-scope Twenty env was not verified.                                                     |
| Sentry release/sourcemap proof                                 | not required for Phase 3 | Track sourcemaps and `SENTRY_AUTH_TOKEN` as Phase 11 observability work unless a build/deploy explicitly fails because sourcemap upload is required. |
| `bun run verify:vercel-production -- --commit <sha>`           | skipped                  | Deployment is not in scope for local/dev completion and provider/dashboard gates remain open.                                                        |
| Auth/CMS/smoke E2E suites                                      | skipped                  | Local provider env, browsers, ports, and running dev servers were not prepared for this pass.                                                        |

## Provider Proof Ledger

Completed:

- Repo-local data-boundary proof passed.
- Repo-local build proof passed.
- Repo-local unit proof passed.
- Repo-local runtime-map proof passed.

Missing provider proofs:

- Stripe webhook endpoints:
  - `https://admin.asymmetric.al/api/webhooks/stripe`
  - `https://donor.asymmetric.al/api/webhooks/stripe`
  - `https://missionary.asymmetric.al/api/webhooks/stripe`
- Stripe events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
  - `payment_intent.processing`
  - `charge.refunded`
- Resend verified sending domain and webhook endpoint:
  - `https://admin.asymmetric.al/api/email/webhooks/resend`
- Twenty development/proof workspace ID and project-scoped API credentials.
- Disposable Supabase migration verifier database URL.
- Sentry runtime DSN proof; sourcemap upload is Phase 11 observability work unless a build/deploy explicitly requires it.
- Vercel project production env and deployment proof for affected apps.

## UI Evidence

No screenshots or recordings were captured in this pass. The contributions UI changed, but no dev server/auth fixture/provider-backed E2E environment was prepared. UI behavior is covered by the contributions page unit test and admin production build route rendering in this local/dev handoff.

## Rollback Plan

Code rollback:

- Revert the Phase 3 code changes and thin route adapters.
- The previous donation saga and Stripe webhook behavior can be restored by reverting `packages/api/src/stripe/webhooks.ts` and related package exports.

Database rollback:

- Migration is additive. If applied and rollback is required before production data is written, create an approved rollback migration to drop the new tables, functions, and grants.
- Leave the additive `gifts` enum value inert unless an approved enum-rebuild migration is created. Removing Postgres enum values is not a simple drop operation and should not be done ad hoc.

Operational rollback:

- Disable or remove finance queue UI actions by reverting the admin contributions UI changes.
- Stop routing Stripe webhooks to the new event-store flow by rolling back the API package deployment.
- Do not delete provider events, donation records, or email logs without a separate data retention review.

Feature flags:

- No new feature flag was added.
- Existing `NEXT_PUBLIC_ADMIN_CONTRIBUTIONS_USE_MOCK` remains available for local/mock contributions UI data.

## Remaining Blockers

- `DATABASE_URL` missing for disposable Supabase migration verifier.
- `TWENTY_WORKSPACE_ID` missing from readiness and project-scope Vercel env inventory.
- `TWENTY_API_URL`, `TWENTY_API_KEY`, and `TWENTY_WEBHOOK_SECRET` not verified in project scope.
- Stripe webhook endpoints and event subscriptions not verified in Stripe dashboard/CLI.
- Resend verified domain and webhook event configuration not verified in Resend dashboard/CLI.
- Sentry runtime DSN proof remains relevant; `SENTRY_AUTH_TOKEN` is not a Phase 3 blocker unless build/deploy fails because sourcemap upload is required.
- Auth/CMS/smoke E2E skipped until local provider env, browsers, ports, and dev servers are prepared.
- Production deployment is not ready until Vercel env, provider proofs, migration verifier, CI, and rollback proof are recorded.

## Secret Exposure Scan

Ran a safe file-list scan over `docs/ops/phase-evidence` and `docs/ops/phase-assessments` for common secret-like prefixes. The only match was the prior quality-check report containing the documented scan command itself. No secret values were found in this evidence file.

## Final Status

Phase: 3 - Payments and Giving Pipeline
Status: complete-local-only
Provider proofs completed: repo-local only
Provider proofs missing: Stripe, Resend, Twenty, Supabase disposable migration verifier, Vercel; Sentry sourcemaps are Phase 11 unless build/deploy explicitly requires upload.
Ready for next phase: no

Phase 3 can continue into provider proof and deployment preparation once the remaining external blockers are resolved. It should not be marked production-complete yet.
