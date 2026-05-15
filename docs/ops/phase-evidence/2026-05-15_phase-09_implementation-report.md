# Phase 09 Implementation Report - Donor and Missionary Portals

Date: 2026-05-15
Repo: `/Users/blake/Documents/asymmetrical/repos/core`
Branch: `epic`
Handoff: `docs/ops/phase-handoffs/phase-09_donor-missionary-portals_codex-handoff.md`

## Executive Summary

Phase 09 implemented the donor portal and missionary workspace hardening called for in the handoff. The implementation moves the main self-service experiences behind package-owned BFF APIs, keeps Stripe/payment ownership outside local card-editing code, removes direct browser writes for missionary tasks, and preserves the privacy boundary between missionary-visible donor relationship context and staff-only CRM/admin data.

The work is implemented locally and verified. Production readiness was checked against the current deployed HEAD commit `3a164ff16f6957dd2a7a6d253d28e92ae74ad328`; these Phase 09 changes still need a commit/deploy step before they are live.

## Donor Portal Implementation

New package API surface:

- `packages/api/src/donor-portal/index.ts`
- `packages/api/src/donor-portal/service.ts`
- `packages/api/src/donor-portal/model.ts`
- `packages/api/src/donor-portal/billing.ts`
- `packages/api/src/donor-portal/receipts.ts`
- `packages/api/src/donor-portal/statements.ts`
- `packages/api/src/donor-portal/route-helpers.ts`

New donor app route handlers:

- `apps/donor/app/api/donor/portal/route.ts`
- `apps/donor/app/api/donor/billing-portal/route.ts`
- `apps/donor/app/api/donor/receipts/[donationId]/route.ts`
- `apps/donor/app/api/donor/statements/[year]/route.ts`

Behavior delivered:

- Resolves the signed-in donor through `profile_id` and `tenant_id`.
- Returns a donor portal snapshot with profile, donor preferences, giving summary, donations, recurring gifts, payment-method labels, feed preferences, statement years, and receipt URLs.
- Allows donor-owned profile/preference updates without exposing another donor account.
- Generates receipt text attachments only after validating donation ownership.
- Generates annual statement text attachments only from settled gifts owned by the signed-in donor.
- Sends payment-method management to Stripe Billing Portal instead of creating or storing cards locally.
- Wires donor dashboard summary and donor history to portal data through `packages/database/hooks/donor-portal.ts` and the updated donor history collection.

## Missionary Workspace Implementation

New package API surface:

- `packages/api/src/missionary-portal/index.ts`
- `packages/api/src/missionary-portal/service.ts`
- `packages/api/src/missionary-portal/model.ts`
- `packages/api/src/missionary-portal/tasks.ts`
- `packages/api/src/missionary-portal/task.ts`
- `packages/api/src/missionary-portal/route-helpers.ts`

New missionary app route handlers:

- `apps/missionary/app/api/missionary/portal/route.ts`
- `apps/missionary/app/api/missionary/tasks/route.ts`
- `apps/missionary/app/api/missionary/tasks/[taskId]/route.ts`

Behavior delivered:

- Resolves the signed-in missionary through `profile_id` and `tenant_id`.
- Returns a missionary portal snapshot with public-page profile context, support progress, recent gifts, donor relationship projection, tasks, and ministry updates.
- Keeps missionary-visible donor data limited to relationship fields such as display name, contact preference, contact details, giving totals, tags, and pledge status.
- Excludes staff-only donor notes, addresses, scores, CRM internals, and admin-only private context from missionary projections.
- Moves missionary task list/create/update/delete behind server routes scoped to the signed-in missionary profile.
- Updates `packages/lib/hooks/use-tasks.ts` to stop importing a browser Supabase client or writing directly to `missionary_tasks`.
- Updates the missionary dashboard to consume live portal context for support progress, active donor count, pending tasks, and ministry updates.

## Shared Boundary Changes

- `packages/api/package.json` now exports the donor and missionary portal route modules.
- `packages/database/hooks/index.ts` now exports donor and missionary portal hooks/types.
- `packages/api/src/profile/index.ts` now supports authenticated profile and missionary public-page updates.
- `packages/api/src/missionaries/metrics.ts` now accepts either `missionaries.id` or `missionaries.profile_id` and blocks ordinary missionary users from reading another missionary's metrics.
- `docs/guides/architecture/runtime-map.md` lists the new BFF routes and keeps the no-route-segment-runtime-export policy intact.

## Tests Added or Updated

Added:

- `tests/unit/packages/api/donor-portal/model.test.ts`
- `tests/unit/packages/api/donor-portal/billing-boundary.test.ts`
- `tests/unit/packages/api/missionary-portal/model.test.ts`
- `tests/unit/packages/lib/use-tasks-api-boundary.test.ts`

Updated:

- `tests/unit/packages/lib/use-tasks-realtime.test.tsx`

Coverage intent:

- Donor snapshot mapping and receipt/statement URL shape.
- Stripe Billing Portal handoff boundary.
- Missionary support snapshot and donor relationship privacy projection.
- Missionary task hook BFF boundary and removal of direct browser Supabase task writes.

## Verification Results

Focused verification:

- `bun --filter @asym/api typecheck`
- `bun --filter @asym/database typecheck`
- `bun --filter @asym/lib typecheck`
- `bun --filter @asym/missionary typecheck`
- `bun --filter @asym/donor typecheck`
- `bun --filter @asym/missionary-app typecheck`
- `bunx vitest run tests/unit/packages/api/donor-portal/model.test.ts tests/unit/packages/api/donor-portal/billing-boundary.test.ts tests/unit/packages/api/missionary-portal/model.test.ts tests/unit/packages/lib/use-tasks-api-boundary.test.ts --coverage=false`

Full gate verification:

- `bun run format:check`
- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run test:unit`
- `bun run verify:data-boundary`
- `bun run verify:workspace-contract`
- `bun run verify:eslint`
- `bun run verify:shadcn-diff`
- `bun run skills:verify`
- `bun run verify:vercel-production -- --commit 3a164ff16f6957dd2a7a6d253d28e92ae74ad328`
- `bun run ci:preflight`

Full unit result:

- 210 test files passed.
- 925 tests passed.
- 1 test skipped.

Production readiness result for current deployed HEAD:

- Admin: READY, HTTP 200 health check.
- Donor: READY, HTTP 200 health check.
- Missionary: READY, HTTP 200 health check.
- Overall: READY.

## Operational Notes

- Payment methods remain Stripe-owned. The donor app requests a Stripe Billing Portal session and does not create local payment methods.
- Finance truth remains in donations, donor pledges, Stripe, and existing giving pipeline records.
- CRM/private donor context remains staff-owned; missionary surfaces receive only a constrained projection.
- CMS/public-page ownership remains separate; missionary profile edits update the missionary-owned public-page fields, not payment or CRM data.
- Support Hub and Resend boundaries are untouched.
- The implementation is currently uncommitted local work and should be committed/deployed before treating Phase 09 as live.
