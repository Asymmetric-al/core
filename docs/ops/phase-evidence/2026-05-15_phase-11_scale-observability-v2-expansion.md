# Phase 11 Evidence - Scale, Observability, And V2 Expansion

- Date: 2026-05-15
- Repo: `Asymmetric-al/core`
- Branch: `epic`
- Product commit: `ad8c79b6c2fc64982719c2768445530e6d85c684`
- Evidence status: complete

## Scope

Phase 11 closed scale, observability, release-health, backup/restore, Sentry
release/source map, monitoring, deployment reliability, and explicitly selected
v2 expansion work.

No optional v2 provider was selected with scope, secrets, rollback ownership,
and smoke-test path, so no optional AI, accounting, automation, signing, media,
PDF, or payout provider was enabled.

## Required First Steps

- Inspected `git status` before implementation.
- Kept unrelated scratch outside the Phase 11 product commit:
  - `docs/ai/working-set.md`
  - `supabase/.temp/cli-latest`
  - `docs/ops/phase-handoffs/phase-08_repo-finalization_follow-up-prompt.md`
- Read the Phase 11 handoff:
  `docs/ops/phase-handoffs/phase-11_scale-observability-v2-expansion_codex-handoff.md`.
- Read all required Phase 3-10 evidence named by the handoff.
- Inventoried Sentry, deployment, health, backup, restore, CI, and provider docs.
- Verified Vercel env var names by environment without printing values.
- Nia was unavailable in this session, so repo-scoped `rg`, direct file reads,
  bundled Next.js docs, installed package source, and official provider docs were
  used as fallback evidence.

## Implementation Summary

- Added shared Sentry build options in `scripts/sentry/next-config.mjs`.
- Wired `apps/admin`, `apps/donor`, and `apps/missionary` Next configs through
  the shared Sentry options.
- Added shared release-health handler `@asym/api/health/app`.
- Replaced all three app `/api/health` routes with thin shared handlers.
- Expanded `scripts/verify/vercel-production-readiness.mjs` to read health JSON
  release metadata and block non-`unknown` commit mismatches.
- Added proof scripts:
  - `bun run verify:sentry-release`
  - `bun run verify:vercel-env-inventory`
  - `bun run verify:backup-restore`
- Adopted the existing deployment-control scratch into Phase 11:
  `apps/*/vercel.json`, `scripts/vercel/should-ignore-build.mjs`, and the
  matching unit coverage. This is now the repo-owned Vercel ignored-build path.
- Added operational docs:
  - `docs/ops/scale-observability-reliability.md`
  - `docs/ci.md`
  - `docs/ops/deploy-checklist.md`
  - `docs/ops/environments.md`
  - `docs/env-var-audit.md`
  - `docs/guides/architecture/runtime-map.md`

## Sentry Release And Source Map Proof

Command:

```bash
bun run verify:sentry-release
```

Result: passed.

Observed checks:

- Admin, donor, and missionary Next configs use the shared Sentry build options.
- Source map upload is disabled without `SENTRY_AUTH_TOKEN`.
- Release injection remains enabled without `SENTRY_AUTH_TOKEN` so runtime
  release metadata can still use the deployment commit.
- Source map upload, release creation, finalization, and deploy metadata are
  enabled when `SENTRY_AUTH_TOKEN` is present.
- Release name resolves from `VERCEL_GIT_COMMIT_SHA`.
- Turbo build hash includes `SENTRY_AUTH_TOKEN`, `SENTRY_DSN`, `SENTRY_ORG`,
  `SENTRY_PROJECT`, and `SENTRY_RELEASE`.
- Secret values printed: no.

Current Vercel inventory shows runtime Sentry DSNs are present by name for
production and staging. `SENTRY_AUTH_TOKEN` is not present by name in production,
preview, development, or staging, so production source map upload is documented
as not configured until the owner provides that build-only token.

## Vercel Env Name Inventory

Command:

```bash
bun run verify:vercel-env-inventory
```

Result: passed.

No values were printed. Name counts:

| Project    | Production | Preview | Development | Staging |
| ---------- | ---------- | ------- | ----------- | ------- |
| admin      | 29         | 0       | 2           | 20      |
| donor      | 15         | 0       | 2           | 15      |
| missionary | 15         | 0       | 2           | 15      |

Production and staging include `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` for all
three projects. `SENTRY_AUTH_TOKEN` is absent from every inventoried
environment.

## Runtime Monitoring And Release Health

The shared `/api/health` response now includes:

- `status`
- `checks.supabase`
- `observability.surface`
- `observability.checkedAt`
- `observability.release.commit`
- `observability.release.ref`
- `observability.release.environment`
- `observability.release.runtime`
- `observability.supabaseLatencyMs`

The production readiness verifier now reports these fields and blocks a release
when a non-`unknown` health commit does not match the target commit.

Production readiness for `ad8c79b6c2fc64982719c2768445530e6d85c684` passed:

| Project    | Deployment URL                                  | Health | Release health |
| ---------- | ----------------------------------------------- | ------ | -------------- |
| admin      | `admin-fnrl3xuqx-asymmetric-al.vercel.app`      | 200 OK | commit matches |
| donor      | `donor-hzzd5a6cj-asymmetric-al.vercel.app`      | 200 OK | commit matches |
| missionary | `missionary-h9xbymy4h-asymmetric-al.vercel.app` | 200 OK | commit matches |

Final verifier output: `Overall: READY`.

## Backup And Restore Proof

Command:

```bash
bun run verify:backup-restore
```

Result: passed.

Proof details:

- Source: disposable `postgres:16-alpine` container.
- Target: separate disposable `postgres:16-alpine` container.
- Database: `asym_phase11_restore`.
- Rows restored: `3`.
- Marker range: `phase11-alpha -> phase11-gamma`.
- Production touched: no.
- Secrets printed: no.

No Supabase migration changed in Phase 11.

## Verification

Focused Phase 11 checks:

```bash
bunx vitest run tests/unit/scripts/sentry-release-sourcemaps.test.ts tests/unit/scripts/backup-restore-proof.test.ts tests/unit/scripts/vercel-env-inventory.test.ts tests/unit/scripts/vercel-production-readiness.test.ts tests/unit/scripts/sync-vercel-production-env.test.ts tests/unit/scripts/vercel-ignore-build.test.ts tests/unit/packages/api/health/app.test.ts --coverage=false
bun run verify:sentry-release
bun run verify:vercel-env-inventory
bun run verify:backup-restore
```

Results:

- Focused Vitest: 7 files passed, 38 tests passed.
- `verify:sentry-release`: passed.
- `verify:vercel-env-inventory`: passed.
- `verify:backup-restore`: passed.

Full handoff gate:

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
```

Results:

- `format:check`: passed.
- `lint`: passed.
- `typecheck`: passed.
- `build`: passed.
- `test:unit`: passed, 219 files passed, 957 tests passed, 1 skipped.
- `verify:data-boundary`: passed.
- `verify:workspace-contract`: passed.
- `verify:eslint`: passed.
- `verify:shadcn-diff`: passed.
- `skills:verify`: passed.

Pre-push gate:

```bash
git push origin epic
```

Result: `ci:preflight` passed before push, including format, skills verify,
lint, data-boundary, workspace-contract, eslint config, shadcn diff, typecheck,
build, and unit tests.

Production readiness:

```bash
bun run verify:vercel-production -- --commit ad8c79b6c2fc64982719c2768445530e6d85c684
```

Result: passed after Vercel completed all three production builds. Final output:
`Overall: READY`.

## Boundaries Preserved

- No Phase 3-10 implementation was reopened.
- Production CRM writes remain disabled unless owner approval changes that gate.
- Runtime Sentry DSNs remain separate from build-only source map upload auth.
- No `NEXT_PUBLIC_TWENTY_*` variables were added.
- No provider token, DSN value, service-role key, database URL, or `.env.local`
  value was printed or committed.
- Backup/restore proof used isolated disposable targets only.
- Donor, missionary, CMS, CRM, giving, payment, PDF Studio, and Support Hub
  ownership boundaries remain unchanged.

## Official Docs Consulted

- Sentry Next.js manual setup:
  <https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/>
- Vercel project configuration:
  <https://vercel.com/docs/project-configuration>
- Vercel `vercel.json` configuration:
  <https://vercel.com/docs/project-configuration/vercel-json>
- Supabase backup and restore:
  <https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore/>
