# Phase 09 Evidence - Donor and Missionary Portals

Date: 2026-05-15
Branch: `production`
Goal source: `docs/ops/phase-handoffs/phase-09_donor-missionary-portals_codex-handoff.md`

## Scope

Phase 09 hardened the donor portal and missionary workspace without moving ownership of payment, finance, CRM, CMS, or support data:

- Donor portal self-service now reads a server-owned portal snapshot from `@asym/api/donor-portal`.
- Donor receipts and annual giving statements are generated only from donations owned by the signed-in donor account.
- Payment-method management is a Stripe Billing Portal handoff; the app does not create or store card details directly.
- Missionary workspace now reads a server-owned portal snapshot from `@asym/api/missionary-portal`.
- Missionary task CRUD now goes through BFF routes scoped to the signed-in missionary profile instead of direct browser Supabase writes.
- Missionary donor relationship data is a role-scoped projection and excludes staff-only fields such as donor notes, address, score, and CRM internals.

## Implementation Evidence

Donor portal:

- `packages/api/src/donor-portal/index.ts` exposes the donor snapshot and donor profile/preference update route.
- `packages/api/src/donor-portal/service.ts` resolves the signed-in donor by `profile_id` + `tenant_id`, then reads donations, recurring gifts, and feed preferences.
- `packages/api/src/donor-portal/receipts.ts` validates donation ownership before returning a receipt text attachment.
- `packages/api/src/donor-portal/statements.ts` validates the requested year and returns settled, owned gifts only.
- `packages/api/src/donor-portal/billing.ts` creates Stripe Billing Portal sessions for the linked Stripe customer.
- `apps/donor/app/api/donor/**/route.ts` re-export the package handlers.
- `packages/database/hooks/donor-portal.ts` provides donor portal query/mutation hooks.
- `apps/donor/features/donor/components/donor-dashboard-main-body.tsx` and donor history now consume portal data instead of hard-coded donor totals.

Missionary workspace:

- `packages/api/src/missionary-portal/index.ts` exposes the missionary workspace snapshot.
- `packages/api/src/missionary-portal/service.ts` resolves the signed-in missionary by `profile_id` + `tenant_id`, then reads support gifts, donor relationships, tasks, and updates.
- `packages/api/src/missionary-portal/tasks.ts` and `task.ts` own task list/create/update/delete behind missionary role checks.
- `apps/missionary/app/api/missionary/**/route.ts` re-export the package handlers.
- `packages/lib/hooks/use-tasks.ts` uses `/api/missionary/tasks` and no longer writes directly to `missionary_tasks` from the browser.
- `packages/missionary/components/dashboard-home.tsx` consumes the missionary portal snapshot for support progress, active donors, tasks, and updates.
- `packages/api/src/profile/index.ts` now supports authenticated profile/public-page updates for missionary-owned profile fields.

Runtime and boundaries:

- `docs/guides/architecture/runtime-map.md` lists the new donor and missionary BFF routes with no route segment runtime exports.
- `packages/api/src/missionaries/metrics.ts` accepts either `missionaries.id` or `missionaries.profile_id` and prevents ordinary missionary users from reading another missionary's metrics.

## Verification

Completed:

- `bun --filter @asym/api typecheck`
- `bun --filter @asym/database typecheck`
- `bun --filter @asym/lib typecheck`
- `bun --filter @asym/missionary typecheck`
- `bun --filter @asym/donor typecheck`
- `bun --filter @asym/missionary-app typecheck`
- `bunx vitest run tests/unit/packages/api/donor-portal/model.test.ts tests/unit/packages/api/donor-portal/billing-boundary.test.ts tests/unit/packages/api/missionary-portal/model.test.ts tests/unit/packages/lib/use-tasks-api-boundary.test.ts --coverage=false`
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

Production readiness:

- Admin: READY, latest production deployment for commit `3a164ff16f6957dd2a7a6d253d28e92ae74ad328`, health check HTTP 200 at `https://admin.asymmetric.al/api/health`.
- Donor: READY, latest production deployment for commit `3a164ff16f6957dd2a7a6d253d28e92ae74ad328`, health check HTTP 200 at `https://donor.asymmetric.al/api/health`.
- Missionary: READY, latest production deployment for commit `3a164ff16f6957dd2a7a6d253d28e92ae74ad328`, health check HTTP 200 at `https://missionary.asymmetric.al/api/health`.
