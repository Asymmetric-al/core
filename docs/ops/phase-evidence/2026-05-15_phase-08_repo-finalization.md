# Phase 08 Repo Finalization Evidence

Generated: 2026-05-15
Repo: `Asymmetric-al/core`
Branch: `production`
Starting commit: `92292aab972182f2766c2fdb96ef6c2b96f8383d`
Phase 8 product commit: `d769c1770f7458ec7ae2c83b35f2bcff11e2ce17`
Status: `repo-finalized`

## Scope

This finalization closes Phase 8 only. It commits and deploy-verifies the local
Phase 8 Support Hub persistence and inbound-email cutover work recorded in:

- `docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`

Phase 9 was not started.

## Required Reading

- `AGENTS.md`
- `docs/ops/phase-handoffs/phase-08_mission-control-platform-ux-core-modules_codex-handoff.md`
- `docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`
- `docs/ops/phase-evidence/2026-05-15_phase-07_repo-finalization.md`
- `docs/features/support-hub/release-notes.md`
- `docs/features/support-hub/admin-guide.md`
- `docs/features/support-hub/operator-guide.md`
- `docs/features/support-hub/phase-07-hardening-and-release.md`

Nia was required by repo instructions, but no Nia tool was exposed in this
Codex session. The fallback was direct `rg` plus full-source reads from the
repo checkout.

## Intentional Product And Evidence Changes

The Phase 8 product commit intentionally includes Support Hub product,
database, email-routing, test, and documentation work only:

- Mission Control Support Hub UI and route handlers under:
  - `apps/admin/app/api/admin/support/**`
  - `apps/admin/app/support/page.tsx`
  - `apps/admin/features/support-hub/**`
- Support Hub API package services under:
  - `packages/api/src/admin/support-hub/**`
- Resend inbound webhook routing:
  - `packages/api/src/email/webhooks/resend.ts`
- Supabase Support Hub persistence:
  - `supabase/migrations/20260515025814_support_hub_core_modules.sql`
  - `supabase/migrations/rollback_20260515025814_support_hub_core_modules.sql`
- Runtime boundary updates:
  - `docs/guides/architecture/runtime-map.md`
  - `packages/database/query-keys.ts`
- Support Hub tests:
  - `tests/e2e/support-hub.smoke.spec.ts`
  - `tests/e2e/helpers/install-demo-session.ts`
  - `tests/unit/apps/admin/app/support/support-ui-structure.test.ts`
  - `tests/unit/apps/admin/features/support-hub/macro-runner.test.ts`
  - `tests/unit/packages/api/admin/support-hub/**`
  - `tests/unit/packages/api/email/webhooks-resend.test.ts`
- Support Hub docs and evidence:
  - `docs/features/support-hub/release-notes.md`
  - `docs/features/support-hub/admin-guide.md`
  - `docs/features/support-hub/operator-guide.md`
  - `docs/features/support-hub/phase-07-hardening-and-release.md`
  - `docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`
  - `docs/ops/phase-handoffs/phase-08_mission-control-platform-ux-core-modules_codex-handoff.md`
  - `docs/ops/phase-handoffs/README.md`

The committed implementation keeps the `SupportHubAdapter` export backed by
Supabase, requires a server-bound Support Hub tenant context, and routes Resend
`email.received` events through `routeInboundToSupportHub()`.

## Left Uncommitted

The checkout also contained unrelated local deployment-control scratch that
was deliberately excluded from the Phase 8 product commit:

- `apps/admin/vercel.json`
- `apps/donor/vercel.json`
- `apps/missionary/vercel.json`
- `docs/ai/working-set.md`
- `docs/ops/deploy-checklist.md`
- `docs/ops/environments.md`
- `docs/ops/phase-handoffs/phase-08_repo-finalization_follow-up-prompt.md`
- `scripts/vercel/should-ignore-build.mjs`
- `tests/unit/scripts/vercel-ignore-build.test.ts`

Those files were stashed while the Phase 8 candidate was verified and
committed. No `.env.local`, runtime artifact, provider token, or service-role
key was staged.

## Implementation Cross-Check

Before committing, the implementation was checked against the Phase 8 evidence:

- `apps/admin/app/support/page.tsx` renders `SupportInbox`.
- `packages/api/src/admin/support-hub/adapter/index.ts` exports
  `supabaseSupportHubAdapter`.
- `packages/api/src/admin/support-hub/adapter/supabase.ts` throws
  `SUPPORT_HUB_TENANT_REQUIRED` when no tenant context is bound.
- `packages/api/src/admin/support-hub/inbound-router.ts` routes inbound work
  inside `runWithSupportHubTenant(...)`.
- `packages/api/src/email/webhooks/resend.ts` calls
  `routeInboundToSupportHub(...)` for `email.received`.
- `supabase/migrations/20260515025814_support_hub_core_modules.sql` creates
  Support Hub tables, enables RLS, and defines
  `private.seed_support_hub_defaults(...)`.

## Migration Proof

The Phase 8 local evidence already recorded a single-migration apply and
rollback proof against a disposable Postgres 16 container with minimal schema
stubs.

Finalization added the repo migration verifier against a fresh disposable
Postgres 16 database:

```bash
docker run -d --rm --name asym-core-phase8-finalize-pg -e POSTGRES_PASSWORD=postgres -p 55438:5432 postgres:16-alpine
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55438/postgres bun run verify:supabase-migrations
docker stop asym-core-phase8-finalize-pg
```

Results:

- `bun run verify:supabase-migrations`: passed.
- Verifier output: `Verified 26 forward Supabase migrations.`
- The disposable Postgres container was stopped and removed.

## Verification Results

The Phase 8 candidate was verified with unrelated scratch stashed out of the
worktree.

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
bunx vitest run tests/unit/packages/api/admin/support-hub tests/unit/packages/api/email --coverage=false
bun run test:e2e:smoke -- --grep "Support Hub"
git diff --check
```

Results:

- `bun run format:check`: passed.
- `bun run lint`: passed.
- `bun run typecheck`: passed.
- `bun run build`: passed.
- `bun run test:unit`: passed, 205 files passed, 916 tests passed, 1 skipped.
- `bun run verify:data-boundary`: passed.
- `bun run verify:workspace-contract`: passed.
- `bun run verify:eslint`: passed.
- `bun run verify:shadcn-diff`: passed.
- `bun run skills:verify`: passed.
- Focused Support Hub/email unit suite: passed, 13 files passed, 80 tests
  passed.
- Support Hub smoke suite: passed, 6 tests passed.
- `git diff --check`: passed.

The product commit was:

```bash
git commit -m "feat(support-hub): persist Phase 8 core modules"
```

Result:

- `d769c1770f7458ec7ae2c83b35f2bcff11e2ce17`

## Push And Production Readiness

The SSH push path was unavailable in this shell:

```bash
git push origin production
```

Result:

- Failed with `Permission denied (publickey)`.

The same commit was pushed to `origin/production` through the GitHub HTTPS remote:

```bash
git push https://github.com/Asymmetric-al/core.git production:production
```

The repo pre-push `ci:preflight` hook ran before the push completed. It passed
format, skills verification, lint, data-boundary, workspace-contract,
eslint-config verification, shadcn diff verification, typecheck, build, and the
full unit suite.

Remote-tracking state was refreshed with:

```bash
git fetch https://github.com/Asymmetric-al/core.git production:refs/remotes/origin/production
```

Production readiness was then run against the pushed Phase 8 product commit:

```bash
bun run verify:vercel-production -- --commit d769c1770f7458ec7ae2c83b35f2bcff11e2ce17
```

The first run observed the admin deployment still `BUILDING`, while donor and
missionary were already `READY`. A second run passed after Vercel finished the
admin production deployment.

Final result:

- Overall: `READY`.
- Admin: `READY`, target commit
  `d769c1770f7458ec7ae2c83b35f2bcff11e2ce17`, production health check HTTP
  200 at `https://admin.asymmetric.al/api/health`.
- Donor: `READY`, target commit
  `d769c1770f7458ec7ae2c83b35f2bcff11e2ce17`, production health check HTTP
  200 at `https://donor.asymmetric.al/api/health`.
- Missionary: `READY`, target commit
  `d769c1770f7458ec7ae2c83b35f2bcff11e2ce17`, production health check HTTP
  200 at `https://missionary.asymmetric.al/api/health`.

## Stop Conditions

- Phase 9 donor/missionary portal work was not started.
- Phase 10 studio operational hubs were not started.
- Phase 11 observability / Sentry sourcemap work was not started.
- Production CRM writes were not enabled.
- Mobilization stage-transition workflow was not reopened.
- Payload CMS ownership boundaries were not changed.
- Support Hub, CRM, giving, payment, Payload, and Resend boundaries remain as
  recorded in the Phase 8 handoff and evidence.
- No unrelated Vercel deployment-control scratch was committed as Phase 8.
- No secrets, provider tokens, service-role keys, or `.env.local` files were
  committed.

## Phase 9 Readiness

Phase 9 is safe to begin only after this finalization evidence is committed and
pushed to `origin/production`. The Phase 8 product commit itself has passed the
required production-readiness gate.
