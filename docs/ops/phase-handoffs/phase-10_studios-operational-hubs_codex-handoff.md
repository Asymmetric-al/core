# Phase 10 - Studios And Operational Hubs Handoff

Generated: 2026-05-15
Repo: `Asymmetric-al/core`
Branch: `production`
Baseline commit: `c3e3144413`
Status: `ready-to-start`

## Purpose

This is the repo-local Codex handoff for Phase 10 after Phase 9 repo
finalization. Use this file before beginning implementation. Do not reopen
Phases 3-9 unless current verification proves a regression that directly blocks
Phase 10.

Phase 10 expands operational hubs and studio surfaces after the donor and
missionary portals are complete. It should deepen Mission Control-owned
operational modules without moving donor, missionary, giving, payment, CMS, or
CRM ownership across the settled boundaries.

## Required Evidence To Read First

- `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline-final.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md`
- `docs/ops/phase-evidence/2026-05-14_phase-04_follow-up.md`
- `docs/ops/phase-evidence/2026-05-14_phase-05_crm-domain-workflows.md`
- `docs/ops/phase-evidence/2026-05-14_phase-06_payload-cms-foundation.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_web-studio-ux.md`
- `docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`
- `docs/ops/phase-evidence/2026-05-15_phase-09_donor-missionary-portals.md`
- `docs/ops/phase-evidence/2026-05-15_phase-09_implementation-report.md`
- `docs/ops/phase-evidence/2026-05-15_phase-09_repo-finalization.md`

Product and architecture references:

- `openspec/specs/platform-surfaces/spec.md`
- `docs/guides/architecture/data-access-boundary.md`
- `docs/guides/architecture/runtime-map.md`
- `docs/features/support-hub/release-notes.md`
- `docs/features/support-hub/operator-guide.md`
- `docs/ops/phase-assessments/2026-05-12_secrets-access-readiness.md`
- `docs/env-var-audit.md`

## Settled Baseline Decisions

- Phase 9 is complete and repo-finalized at `c3e3144413`.
- Mission Control remains the conceptual home for operational depth.
- Donor portal and missionary workspace remain role-specific surfaces, not
  operational hubs.
- CMS does not own gifts, payment state, staged gifts, allocations, receipt
  facts, CRM records, donor account truth, or missionary account truth.
- Production CRM writes remain disabled unless the owner explicitly approves.
- Donor and missionary BFF boundaries from Phase 9 must remain intact.
- Donor account, receipt, statement, recurring gift, task, and missionary donor
  relationship access controls from Phase 9 must not regress.
- Optional provider integrations are not required until the Phase 10 scope
  explicitly selects them.
- Unlayer remains legacy/fallback unless a specific studio path still depends
  on it.
- DocRaptor, Cloudinary, signing, accounting, automation, and AI providers are
  optional unless explicitly selected for this phase.
- Sentry sourcemaps remain Phase 11 unless build/deploy requires them earlier.

## Phase 10 Scope

### In scope

- Implement selected Mission Control-owned operational hubs and studio modules
  after Phase 9 is complete.
- Deepen existing studio surfaces only where the repo already carries a
  product path, such as Web Studio, Email Studio, PDF Studio, Sign Studio, or
  provider-backed operational workflows.
- Add provider-backed smoke tests and rollback docs for any selected provider.
- Keep Support Hub, donor, missionary, giving, CMS, CRM, and payment boundaries
  intact.
- Preserve Phase 9 donor and missionary portal BFF behavior while adding
  Mission Control-owned operational depth.
- Add focused tests for each selected hub, provider boundary, and rollback path.
- Update operator docs for each shipped hub.
- End with a dated Phase 10 evidence report under `docs/ops/phase-evidence/`.

### Out of scope

- Phase 9 donor/missionary portal work.
- Phase 11 observability, backup/restore, sourcemap, and v2 expansion work
  unless a build/deploy blocker forces a narrow fix.
- Enabling optional providers without explicit scope and secrets.
- Production money movement, provider writes, or CRM writes without owner
  approval and evidence.
- Moving Mission Control operational depth into donor or missionary surfaces.
- Replacing existing Phase 6-9 ownership boundaries.

## Primary Implementation Targets

- `apps/admin/app/**`
- `apps/admin/features/**`
- `apps/admin/src/cms-ui/**`
- `packages/api/src/**`
- `packages/config/**`
- `packages/email/**`
- `packages/ui/components/studio/**`
- `supabase/migrations/**`
- `tests/unit/apps/admin/**`
- `tests/unit/packages/**`
- `tests/e2e/**`
- `docs/features/**`
- `docs/ops/phase-evidence/**`

Read the current Phase 9 evidence before finalizing this target list; Phase 9
may add or move portal-facing contracts that Phase 10 must preserve.

## Recommended Work Sequence

1. Confirm `git status` and keep unrelated deployment-control scratch separate
   from Phase 10 work.
2. Re-read Phase 9 repo finalization evidence, platform-surface intent, and the
   current operational/studio docs.
3. Select the exact Phase 10 hub or studio modules from repo evidence and owner
   decisions before changing code.
4. Verify required provider secrets by name only; never print values.
5. Trace existing Mission Control, studio, and package boundaries before
   designing new persistence or provider calls.
6. Implement selected hubs with server-owned data access and provider adapters.
7. Add unit, integration, and smoke coverage for each selected hub.
8. Add or update rollback docs and provider-specific operator docs.
9. Run the full repo gate and Vercel production readiness for the pushed Phase
   10 commit.
10. Write `docs/ops/phase-evidence/2026-05-15_phase-10_studios-operational-hubs.md`
    or the current-date equivalent with commands, results, provider proof, and
    stop conditions.

## Required Boundaries

- Keep Mission Control operational depth in Mission Control.
- Keep donor and missionary portal APIs role-scoped and unchanged unless Phase
  10 directly requires a compatible server-side extension.
- Keep route handlers thin and business logic in packages.
- Keep provider credentials server-only and out of docs.
- Keep optional provider flags conservative by default.
- Do not enable production CRM writes unless owner approval explicitly changes
  that gate.
- Do not create donor/missionary staff workflows as part of studio hub work.
- Do not let a studio module become the source of truth for giving, payment,
  receipt, donor account, missionary account, CMS, or CRM records unless an
  accepted future spec changes that ownership.

## Verification Gate

Phase 10 is not complete until these pass and are recorded in evidence:

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

Add focused provider and hub checks as implementation requires. If Supabase
migrations change, also run and document the repo's current migration verifier
or a disposable Postgres/Supabase CLI proof appropriate to the migration shape.

## Exit Criteria

- Selected operational hubs or studio modules are complete and documented.
- Provider-specific smoke tests and rollback steps exist for every selected
  provider.
- Mission Control remains the operational home for shipped hub depth.
- Phase 9 donor and missionary portal boundaries still pass focused tests.
- Donor, missionary, CMS, CRM, giving, and payment ownership boundaries remain
  intact.
- Optional providers that were not selected remain disabled or untouched.
- Production readiness passes for the Phase 10 commit.
- No secrets are printed or committed.
- The worktree is clean or intentionally documented before Phase 11 starts.
- A dated Phase 10 evidence file exists in `docs/ops/phase-evidence/`.
