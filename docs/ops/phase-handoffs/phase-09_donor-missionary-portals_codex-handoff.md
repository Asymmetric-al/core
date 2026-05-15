# Phase 09 - Donor And Missionary Portals Handoff

Generated: 2026-05-15
Repo: `Asymmetric-al/core`
Branch: `epic`
Baseline commit: `3a164ff16f`
Status: `ready-to-start`

## Purpose

This is the repo-local Codex handoff for Phase 9 after Phase 8 repo
finalization. Use this file before beginning implementation. Do not reopen
Phases 3-8 unless current verification proves a regression that directly blocks
Phase 9.

Phase 9 hardens the donor portal and missionary workspace into coherent
role-scoped surfaces. The donor portal must become the donor self-service home
for giving, recurring gifts, receipts, statements, account details, and related
confidence-building actions. The missionary workspace must become the support
raising and communication home for missionaries without drifting into staff
operations.

## Required Evidence To Read First

- `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline-final.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_follow-up.md`
- `docs/ops/phase-evidence/2026-05-14_phase-05_crm-domain-workflows.md`
- `docs/ops/phase-evidence/2026-05-14_phase-06_payload-cms-foundation.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_web-studio-ux.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_repo-finalization.md`
- `docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`
- `docs/ops/phase-evidence/2026-05-15_phase-08_repo-finalization.md`

Product and architecture references:

- `openspec/specs/platform-surfaces/spec.md`
- `openspec/changes/integrate-twenty-crm-core/design.md`
- `docs/guides/architecture/authz-memberships.md`
- `docs/guides/architecture/data-access-boundary.md`
- `docs/guides/architecture/runtime-map.md`
- `docs/guides/development/getting-started.md`

## Settled Baseline Decisions

- Phase 8 is complete and repo-finalized at `3a164ff16f`.
- Twenty Cloud remains accepted for current CRM work.
- `TWENTY_API_URL=https://api.twenty.com/rest`.
- `TWENTY_WORKSPACE_ID` remains optional in current code.
- Production CRM writes remain disabled unless the owner explicitly approves.
- Donor profile and donor-facing account truth stay in Asym and Supabase.
- Donations, payment execution, refunds, receipts, statements, reconciliation,
  recurring gifts, and payment methods stay in Asym finance and Stripe-backed
  systems.
- Donor portal CRM context is role-scoped projection only; it does not expose
  staff notes, duplicate management, payment internals, or care records.
- Missionary workspace CRM context is role-scoped projection only; it does not
  become a Mission Control replacement.
- Payload CMS tenant IDs and public Supabase tenant UUIDs remain intentionally
  distinct.
- CMS writes use Payload tenant IDs; giving/CRM validation uses public Supabase
  tenant UUIDs.
- CMS does not own gifts, payment state, staged gifts, allocations, receipt
  facts, CRM records, donor account truth, or missionary account truth.
- Resend app-send/log/webhook paths are proven and should be reused.
- Sentry sourcemaps remain Phase 11 unless build/deploy requires them earlier.
- Mobilization stage-transition workflow remains deferred and must not block
  Phase 9.

## Phase 9 Scope

### In scope

- Make the donor portal a complete donor self-service surface for:
  - Giving history.
  - Receipt and statement access.
  - Recurring gift visibility and safe self-service actions.
  - Payment method management paths that remain Stripe-owned.
  - Donor profile, account, preferences, and communication settings.
  - Clear public-to-donor continuity after giving.
- Make the missionary workspace a complete support-raising surface for:
  - Support progress and recent giving visibility appropriate to the
    missionary role.
  - Donor relationship context that respects privacy and CRM projection
    boundaries.
  - Ministry Updates and public page/project management actions the missionary
    is authorized to control.
  - Tasks, settings, and communication workflows that help the missionary
    respond to donors without staff-style operations.
- Preserve Phase 6-7 CMS/public website continuity for missionary pages,
  project pages, public storytelling, and giving flows.
- Preserve Phase 8 Support Hub behavior and Resend inbound routing.
- Add or harden role-aware server boundaries for donor and missionary flows.
- Add focused donor and missionary portal tests, including auth and tenant
  membership behavior.
- Prove donor and missionary production health for the Phase 9 commit.
- End with a dated Phase 9 evidence report under `docs/ops/phase-evidence/`.

### Out of scope

- Phase 10 studio operational hubs.
- Phase 11 observability expansion and Sentry sourcemap work unless required to
  keep builds/deployments passing.
- Production CRM writes or raw Twenty UI in donor/missionary surfaces.
- Moving donor account, payment, receipt, statement, or recurring gift truth
  into Twenty or Payload.
- Moving care workflows or staff notes into donor/missionary portals.
- Reopening mobilization stage-transition workflow.
- Treating the missionary workspace as a second admin console.

## Primary Implementation Targets

- `apps/donor/**`
- `apps/missionary/**`
- `packages/api/src/giving/**`
- `packages/api/src/crm/**`
- `packages/api/src/email/**`
- `packages/auth/**`
- `packages/database/query-keys.ts`
- `packages/ui/**`
- `tests/unit/apps/donor/**`
- `tests/unit/apps/missionary/**`
- `tests/unit/packages/api/**`
- `tests/e2e/**`
- `docs/ops/phase-evidence/**`

Read current files before editing; do not assume these directories are the only
targets if repo search shows the relevant portal contracts live elsewhere.

## Recommended Work Sequence

1. Re-read repo instructions, this handoff, Phase 8 finalization evidence, and
   platform-surface intent.
2. Inspect donor and missionary app routes, auth middleware, shared layout,
   server actions, data loaders, and existing tests.
3. Trace the giving, receipt, recurring gift, donor account, missionary profile,
   Ministry Updates, and CMS preview/public routes before changing UX.
4. Confirm role and tenant membership boundaries for donor and missionary
   access.
5. Implement donor portal improvements behind server-owned data access and
   Stripe-owned payment-management boundaries.
6. Implement missionary workspace improvements behind server-owned data access
   and role-scoped CRM/CMS projections.
7. Add or update tests for portal auth, tenant isolation, self-service donor
   flows, missionary visibility, and public-to-authenticated continuity.
8. Run focused donor/missionary checks, then the full repo gate.
9. Run Vercel production readiness for the pushed Phase 9 commit.
10. Write `docs/ops/phase-evidence/2026-05-15_phase-09_donor-missionary-portals.md`
    or the current-date equivalent with commands, results, stop conditions, and
    provider proof gaps.
11. If needed after product evidence lands, write a Phase 9 repo-finalization
    evidence file before marking Phase 10 safe to begin.

## Required Boundaries

- Keep donor and missionary route handlers thin. Shared business logic belongs
  in packages, not in page components.
- Enforce donor access with donor membership and missionary access with
  missionary membership; client-side checks are not security controls.
- Keep all provider credentials server-only.
- Do not expose service-role keys, Stripe secrets, Resend secrets, Payload
  secrets, or CRM credentials to the browser.
- Do not add `NEXT_PUBLIC_TWENTY_*`.
- Keep Stripe as the payment execution and payment-method authority.
- Keep Resend as the email-send/log/webhook path already proven in earlier
  phases.
- Keep CMS public content authority separate from giving, CRM, payment, donor
  account, and missionary account truth.
- Keep CRM data in donor/missionary portals to role-scoped projections only.
- Preserve production CRM write gates unless owner approval explicitly changes
  them.

## Verification Gate

Phase 9 is not complete until these pass and are recorded in evidence:

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

Add focused Phase 9 checks as implementation requires, including donor,
missionary, auth, giving, receipt, recurring gift, and CMS-public-continuity
coverage. Prefer existing scripts when available; otherwise document exact
commands used in the evidence report.

If Supabase migrations change, also run and document the repo's current
migration verifier or a disposable Postgres/Supabase CLI proof appropriate to
the migration shape.

## Exit Criteria

- Donor portal supports the intended self-service giving/account workflows in
  donor language.
- Missionary workspace supports the intended support-raising, communication,
  update, and authorized public-page/project workflows.
- Donor and missionary auth and tenant boundaries are enforced server-side.
- Giving, receipt, recurring gift, and payment-method state remain Asym/Stripe
  owned.
- CMS content remains Payload/public-surface owned without taking over giving
  or account truth.
- CRM data exposed to donor/missionary surfaces is role-scoped projection only.
- Existing Phase 8 Support Hub and Resend behavior remains intact.
- Production readiness passes for the Phase 9 commit.
- No secrets are printed or committed.
- The worktree is clean or intentionally documented before Phase 10 starts.
- A dated Phase 9 evidence file exists in `docs/ops/phase-evidence/`.
