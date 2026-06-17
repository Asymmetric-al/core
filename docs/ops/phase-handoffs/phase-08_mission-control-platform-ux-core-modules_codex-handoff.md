# Phase 08 - Mission Control Platform UX And Core Modules Handoff

Generated: 2026-05-15
Repo: `Asymmetric-al/core`
Branch: `production`
Baseline commit: `92292aab972182f2766c2fdb96ef6c2b96f8383d`
Status: `ready-to-start`

## Purpose

This is the repo-local Codex handoff for Phase 8 after Phase 7 repo
finalization. Use this file before beginning implementation. Do not reopen
Phases 3-7 unless current verification proves a regression that directly blocks
Phase 8.

Phase 8 turns Mission Control's operational UX into persistent, tenant-scoped
core modules. The primary first module is the Donor Care Support Hub persistence
and inbound-email cutover. The phase must preserve the already-settled
boundaries between Payload CMS, Twenty CRM, giving/payments, Resend, and
Mission Control.

## Required Evidence To Read First

- `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline-final.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_follow-up.md`
- `docs/ops/phase-evidence/2026-05-14_phase-05_crm-domain-workflows.md`
- `docs/ops/phase-evidence/2026-05-14_phase-06_payload-cms-foundation.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_web-studio-ux.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_repo-finalization.md`

Support Hub continuity references:

- `docs/features/support-hub/release-notes.md`
- `docs/features/support-hub/admin-guide.md`
- `docs/features/support-hub/operator-guide.md`
- `docs/features/support-hub/phase-07-hardening-and-release.md`

## Settled Baseline Decisions

- Twenty Cloud remains accepted for current CRM work.
- `TWENTY_API_URL=https://api.twenty.com/rest`.
- `TWENTY_WORKSPACE_ID` remains optional in current code.
- `giftSummaries` exists and uses `currencyCode`.
- Production CRM writes remain disabled unless the owner explicitly approves.
- Payload CMS tenant IDs and public Supabase tenant UUIDs are intentionally
  distinct.
- CMS writes use Payload tenant IDs; giving/CRM validation uses public Supabase
  tenant UUIDs.
- CMS does not own gifts, payment state, staged gifts, allocations, receipt
  facts, or CRM records.
- Resend app-send/log/webhook paths are proven and should be reused.
- Sentry sourcemaps remain Phase 11 unless build/deploy requires them earlier.
- Mobilization stage-transition workflow remains deferred and must not block
  Phase 8.

## Phase 8 Scope

### In scope

- Land persistent, tenant-scoped Support Hub storage in Supabase.
- Keep the existing Mission Control Support Hub UX while moving data access
  behind server-owned route handlers and package services.
- Swap the Support Hub server adapter from in-memory state to Supabase behind
  `packages/api/src/admin/support-hub/adapter/index.ts`.
- Wire Resend inbound `email.received` handling into
  `routeInboundToSupportHub`.
- Preserve and extend tenant-isolation tests for the real Supabase adapter.
- Add operational seed posture for production tenants without seeding demo data
  into production by default.
- End with a dated Phase 8 evidence report under `docs/ops/phase-evidence/`.

### Out of scope

- Phase 9 donor/missionary portal implementation.
- Phase 10 studio operational hubs.
- Phase 11 observability expansion and Sentry sourcemap work unless required to
  keep builds/deployments passing.
- Production CRM writes or raw Twenty UI as the Mission Control product.
- Mobilization stage-transition workflow.
- Moving CMS ownership into CRM/giving/payment domains.

## Primary Implementation Targets

- `supabase/migrations/*support_hub*.sql`
- `packages/api/src/admin/support-hub/adapter/types.ts`
- `packages/api/src/admin/support-hub/adapter/index.ts`
- `packages/api/src/admin/support-hub/adapter/supabase.ts`
- `packages/api/src/admin/support-hub/inbound-router.ts`
- `packages/api/src/email/webhooks/resend.ts`
- `apps/admin/features/support-hub/**`
- `apps/admin/app/api/admin/support/**`
- `tests/unit/packages/api/admin/support-hub/**`
- `tests/unit/packages/api/email/**`
- `tests/e2e/support-hub.smoke.spec.ts`

## Recommended Work Sequence

1. Re-read current repo instructions and the Support Hub Phase 7 release notes.
2. Inspect the current Support Hub adapter contract and route handlers before
   designing the schema.
3. Add a Supabase migration and rollback for persistent Support Hub tables.
4. Implement the Supabase adapter against the existing `SupportHubAdapter`
   interface.
5. Run existing Support Hub read/mutation/tenant-isolation tests against the
   Supabase implementation or add a parallel adapter suite.
6. Flip the adapter export only after tests prove parity.
7. Wire `routeInboundToSupportHub()` into the Resend `email.received` branch.
8. Move demo seed behavior behind non-production guards and add a production
   onboarding seed path for default labels, SLA, business hours, and signatures.
9. Run the full local gate and production-readiness verification.
10. Write `docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`
    or the current-date equivalent with commands, results, and stop conditions.

## Required Boundaries

- Keep all Support Hub route handlers thin. Business logic belongs in
  `packages/api`.
- Keep tenant isolation server-side and database-enforced. RLS must mirror the
  authenticated tenant boundary instead of trusting client filters.
- Do not expose service-role keys or provider credentials to the browser.
- Do not add `NEXT_PUBLIC_TWENTY_*`.
- Do not make CMS the source of truth for Support Hub, CRM, giving, or payment
  facts.
- Do not let inbound email create cross-tenant conversations.
- Preserve the Resend webhook verification path and existing email event
  persistence.
- Keep production CRM sync flags disabled unless owner approval explicitly
  changes that gate.

## Verification Gate

Phase 8 is not complete until these pass and are recorded in evidence:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
bun run test:unit
bun run verify:data-boundary
bun run verify:workspace-contract
bun run verify:eslint
bun run verify:shadcn-diff
bun run skills:verify
bun run verify:vercel-production -- --commit $(git rev-parse HEAD)
```

Add focused Phase 8 checks as implementation requires, including:

```bash
bunx vitest run tests/unit/packages/api/admin/support-hub --coverage=false
bunx vitest run tests/unit/packages/api/email --coverage=false
bun run test:e2e:smoke -- --grep "Support Hub"
```

If Supabase migrations change, also run and document the repo's current
migration verifier or a disposable Postgres/Supabase CLI proof appropriate to
the migration shape.

## Exit Criteria

- Support Hub data is persistent and tenant-scoped.
- Supabase RLS or server-side tenant checks prevent cross-tenant reads and
  writes.
- The Mission Control Support Hub UX remains functional after the adapter swap.
- Resend inbound email can create/thread Support Hub messages through the server
  router.
- Existing outbound Resend logging remains intact.
- Production demo seed posture is safe and documented.
- No secrets are printed or committed.
- The worktree is clean or intentionally documented before Phase 9 starts.
- A dated Phase 8 evidence file exists in `docs/ops/phase-evidence/`.
