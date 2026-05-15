# Phase 11 - Scale, Observability, And V2 Expansion Handoff

Generated: 2026-05-15
Repo: `Asymmetric-al/core`
Branch: `epic`
Baseline commit: `b28ac0cc09`
Status: `ready-to-start`

## Purpose

This is the repo-local Codex handoff for Phase 11 after Phase 10 evidence was
committed and pushed. Use this file before beginning implementation. Do not
reopen Phases 3-10 unless current verification proves a regression that
directly blocks Phase 11.

Phase 11 closes the scale, observability, reliability, and v2 expansion work
left intentionally out of earlier phases. This is the proper home for Sentry
sourcemap proof, monitoring evidence, backup/restore proof, operational
readiness, and explicitly selected optional v2 providers.

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
- `docs/ops/phase-evidence/2026-05-15_phase-10_studios-operational-hubs.md`

Product and architecture references:

- `openspec/specs/platform-surfaces/spec.md`
- `openspec/changes/integrate-twenty-crm-core/design.md`
- `openspec/changes/integrate-twenty-crm-core/specs/platform-boundaries/spec.md`
- `docs/ci.md`
- `docs/ops/environments.md`
- `docs/ops/deploy-checklist.md`
- `docs/env-var-audit.md`
- `docs/guides/architecture/runtime-map.md`

## Settled Baseline Decisions

- Phase 10 is complete and evidence-backed at `b28ac0cc09`.
- Phase 10 selected the Mission Control PDF Studio template persistence hub.
- Phase 10 added no Supabase migration; it used the existing `pdf_templates`
  table and proved production readiness for product commit `7ba815f72b`.
- PDF Studio template persistence, provider boundaries, and rollback docs must
  remain intact through Phase 11.
- Phase 9 donor and missionary portal BFF boundaries are complete and must
  remain intact through observability work.
- Sentry sourcemaps belong here unless an earlier build/deploy required them.
- Runtime Sentry DSNs are distinct from sourcemap upload credentials.
- `SENTRY_AUTH_TOKEN` is server/build-only and must never be printed or
  committed.
- Production CRM writes remain disabled unless the owner explicitly approves.
- Backup/restore proof must use isolated targets and must not restore over
  production data.
- Optional AI, accounting, automation, support, signing, media, and PDF
  providers remain out of scope unless explicitly selected.

## Phase 11 Scope

### In scope

- Prove Sentry release wiring and sourcemap upload where configured.
- Harden error, log, performance, and release-health observability across
  admin, donor, and missionary apps.
- Add production monitoring proof and operational runbook updates.
- Prove backup and restore paths for selected databases or provider stores,
  using isolated restore targets.
- Add reliability, rate-limit, performance, and cost controls where evidence
  shows scale risk.
- Implement explicitly selected v2 provider expansion only after scope, secrets,
  and ownership boundaries are clear.
- Update CI/deploy docs when gates or release-health checks change.
- End with a dated Phase 11 evidence report under `docs/ops/phase-evidence/`.

### Out of scope

- Completing unfinished Phase 9 or Phase 10 product work.
- Enabling optional providers without explicit scope and secrets.
- Restoring over production data.
- Printing or committing provider tokens, DSNs, auth tokens, service-role keys,
  or `.env.local` files.
- Moving ownership of donor, missionary, CMS, CRM, giving, or payment truth.

## Primary Implementation Targets

- `apps/admin/next.config.ts`
- `apps/donor/next.config.ts`
- `apps/missionary/next.config.ts`
- `apps/*/instrumentation*.ts`
- `apps/*/sentry.*.config.ts`
- `docs/ci.md`
- `docs/ops/environments.md`
- `docs/ops/deploy-checklist.md`
- `docs/env-var-audit.md`
- `packages/api/src/**`
- `packages/database/**`
- `scripts/**`
- `.github/workflows/**`
- `tests/unit/**`
- `tests/e2e/**`
- `docs/ops/phase-evidence/**`

Read Phase 9 and Phase 10 evidence before finalizing this target list; those
phases may add new runtime surfaces that Phase 11 must observe and back up.

## Recommended Work Sequence

1. Confirm `git status` and keep unrelated deployment-control scratch separate
   from Phase 11 work.
2. Inventory current Sentry, deployment, health, backup, restore, CI, and
   provider docs.
3. Verify required env var names by environment without printing values.
4. Prove or implement Sentry release and sourcemap behavior for the installed
   Next.js/Sentry setup.
5. Add monitoring and release-health checks for admin, donor, and missionary
   deployments.
6. Prove backup/restore paths against isolated targets and record row-count or
   provider-object reconciliation evidence where appropriate.
7. Implement selected v2 provider expansion only if scope and secrets are
   explicit.
8. Add tests and operational docs for every new reliability or provider path.
9. Run the full repo gate and Vercel production readiness for the pushed Phase
   11 commit.
10. Write `docs/ops/phase-evidence/2026-05-15_phase-11_scale-observability-v2-expansion.md`
    or the current-date equivalent with commands, results, provider proof, and
    stop conditions.

## Required Boundaries

- Keep secrets and provider tokens out of source and evidence logs.
- Use isolated restore targets for backup/restore proof.
- Keep runtime monitoring distinct from build-time sourcemap upload.
- Do not use Sentry sourcemap work as a reason to reopen unrelated product
  phases.
- Do not enable production CRM writes unless owner approval explicitly changes
  that gate.
- Keep ownership boundaries from Phases 3-10 intact.

## Verification Gate

Phase 11 is not complete until these pass and are recorded in evidence:

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

Add focused Phase 11 checks as implementation requires, including Sentry
release/sourcemap proof, monitoring proof, backup/restore proof, and any
selected provider smoke tests.

If Supabase migrations change, also run and document the repo's current
migration verifier or a disposable Postgres/Supabase CLI proof appropriate to
the migration shape.

## Exit Criteria

- Sentry release and sourcemap behavior is proven or explicitly documented as
  not configured by owner decision.
- Runtime monitoring and release-health checks are documented for admin, donor,
  and missionary apps.
- Backup/restore proof is recorded against isolated targets.
- Any selected v2 providers have smoke tests, rollback docs, and ownership
  boundaries.
- CI/deploy docs match the implemented release-health and observability gates.
- Production readiness passes for the Phase 11 commit.
- No secrets are printed or committed.
- A dated Phase 11 evidence file exists in `docs/ops/phase-evidence/`.
