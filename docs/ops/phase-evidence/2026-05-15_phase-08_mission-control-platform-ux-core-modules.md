# Phase 08 Mission Control Platform UX And Core Modules Evidence

Generated: 2026-05-15
Repo: `Asymmetric-al/core`
Branch: `epic`
Baseline commit: `92292aab972182f2766c2fdb96ef6c2b96f8383d`
Status: `complete-local-verification`

## Scope

Phase 8 made the Donor Care Support Hub persistent, tenant-scoped, and routed
through server-owned Mission Control APIs. The phase preserved the existing
Support Hub UX while replacing process-local data access with a Supabase-backed
`SupportHubAdapter`.

## Source Evidence Read

- `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline-final.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_follow-up.md`
- `docs/ops/phase-evidence/2026-05-14_phase-05_crm-domain-workflows.md`
- `docs/ops/phase-evidence/2026-05-14_phase-06_payload-cms-foundation.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_web-studio-ux.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_repo-finalization.md`
- `docs/features/support-hub/release-notes.md`
- `docs/features/support-hub/admin-guide.md`
- `docs/features/support-hub/operator-guide.md`
- `docs/features/support-hub/phase-07-hardening-and-release.md`

Nia was required by repo instructions, but no Nia tool was exposed in this
Codex session. The fallback was direct `rg` plus full-source reads from the
repo checkout.

## Implementation Summary

- Added `supabase/migrations/20260515025814_support_hub_core_modules.sql` and
  `rollback_20260515025814_support_hub_core_modules.sql`.
- Added persistent Support Hub tables for inboxes, agents, teams, labels,
  business hours, SLA policies, signatures, inbox settings, conversations,
  labels, messages, attachments, saved views, macros, canned responses,
  automation rules, notification preferences, assignments, and audit logs.
- Added `email_inbound_messages` bridge columns for Support Hub threading and
  routed-message correlation.
- Added tenant RLS policies on every Support Hub table using the existing
  `authz` helpers.
- Added a private, service-role-only tenant onboarding function:
  `private.seed_support_hub_defaults(...)`.
- Implemented `packages/api/src/admin/support-hub/adapter/supabase.ts` and
  flipped `adapter/index.ts` to the Supabase adapter.
- Routed the admin Support Hub client hooks through `/api/admin/support/**`.
- Mounted the route-backed `SupportInbox` as the `/support` landing surface,
  keeping `/support/tickets/**` as the existing ticket-workspace path.
- Added missing thin routes for inboxes and conversation priority.
- Wired `routeInboundToSupportHub()` into the Resend `email.received` branch.
- Kept existing Resend event persistence and inbound body/attachment failure
  tolerance intact.
- Updated Support Hub release/admin/operator docs for the Phase 8 cutover.

## Tenant And Data Boundaries

- Browser code never receives service-role keys or provider credentials.
- Route handlers remain thin; Support Hub business logic lives in
  `packages/api/src/admin/support-hub/*`.
- The Supabase adapter requires `runWithSupportHubTenant(...)` request context;
  calls without a bound tenant throw `SUPPORT_HUB_TENANT_REQUIRED`.
- Supabase reads and writes stamp/filter `tenant_id` server-side.
- RLS mirrors the authenticated tenant boundary and does not rely on client
  filters.
- Payload CMS tenant ids remain separate from public Supabase tenant UUIDs.
- CRM production writes remain unchanged and disabled by the existing gates.

## Migration Proof

The repo verifier was attempted first:

```bash
bun run verify:supabase-migrations
```

Result:

- Failed before executing migrations because `DATABASE_URL` was not set.

A disposable Postgres 16 container was then used for a syntax and rollback
proof. Minimal stubs were created for existing schemas/tables/roles that this
single migration references (`authz`, `auth.users`, `public.tenants`,
`public.profiles`, `public.email_send_logs`, and
`public.email_inbound_messages`).

```bash
docker run -d --rm --name asym-core-phase8-pg -e POSTGRES_PASSWORD=postgres postgres:16-alpine
docker exec -i asym-core-phase8-pg psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/20260515025814_support_hub_core_modules.sql
docker exec -i asym-core-phase8-pg psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/rollback_20260515025814_support_hub_core_modules.sql
docker rm -f asym-core-phase8-pg
```

Result:

- Migration applied successfully.
- Rollback applied successfully.
- The disposable container was removed.

## Focused Verification

```bash
bun run --cwd packages/api typecheck
bun run typecheck:admin
bunx vitest run tests/unit/packages/api/admin/support-hub tests/unit/packages/api/email --coverage=false
```

Results:

- `packages/api` typecheck: passed.
- `@asym/admin` typecheck: passed.
- Focused Support Hub/email unit suite: 13 files passed, 80 tests passed.

## Full Gate Results

Full phase gates recorded for this local Phase 8 implementation:

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
bun run test:e2e:smoke -- --grep "Support Hub"
```

Results:

- `bun run format:check`: passed.
- `bun run lint`: passed.
- `bun run typecheck`: passed.
- `bun run build`: passed.
- `bun run test:unit`: passed after updating the support UI structure contract
  for the `/support` route-backed inbox; final result was 206 files passed,
  921 tests passed, 1 skipped.
- `bun run verify:data-boundary`: passed.
- `bun run verify:workspace-contract`: passed after adding the new
  `/api/admin/support/conversations/[id]/priority` and
  `/api/admin/support/inboxes` routes to the runtime map.
- `bun run verify:eslint`: passed.
- `bun run verify:shadcn-diff`: passed.
- `bun run skills:verify`: passed.
- `bun run verify:vercel-production -- --commit $(git rev-parse HEAD)`:
  passed with overall `READY` for `92292aab972182f2766c2fdb96ef6c2b96f8383d`.
  This verifies the currently deployed baseline commit; Phase 8 changes remain
  local until committed and deployed.
- `bun run test:e2e:smoke -- --grep "Support Hub"`: passed, 6 tests passed.

Notes:

- `bun run verify:supabase-migrations` could not run in this shell because
  `DATABASE_URL` was unset. The migration still received a disposable
  Postgres apply-and-rollback proof recorded above.
- The first Support Hub smoke attempt exposed a stale harness path: the spec
  used the donor Playwright base URL while checking admin routes. The test now
  installs the demo session and navigates on `adminBaseURL`.
- The `/support` landing page now mounts `SupportInbox`, so the smoke test
  exercises the route-backed persistent inbox instead of the older summary
  loader.

## Stop Conditions

- Phase 9 donor/missionary portal work was not started.
- Phase 10 studio operational hubs were not started.
- Phase 11 observability / Sentry sourcemap work was not started.
- Production CRM writes were not enabled.
- Mobilization stage-transition workflow was not reopened.
- CMS ownership boundaries were not changed.
- No secrets, provider tokens, or service-role keys were committed.
- The worktree contains the local Phase 8 implementation plus pre-existing
  unrelated deployment-file changes that were present before this phase work.
