# Scale, Observability, And Reliability Runbook

## Triggers

Use this runbook when a release changes production readiness, Sentry release
wiring, `/api/health`, backup/restore proof, Vercel deployment controls, or
Phase 11 reliability evidence.

Use it before shipping changes to `admin`, `donor`, or `missionary` that affect:

- Sentry runtime reporting or build-time source map upload.
- Release-health metadata exposed by `/api/health`.
- Vercel production readiness or ignored-build behavior.
- Backup/restore proof for database-owned operational data.
- Optional v2 providers, only after the owner explicitly selects the provider,
  scopes, secrets, rollback owner, and smoke-test path.

## Workflow Steps

1. Read the current phase handoff and relevant prior evidence before changing
   reliability surfaces.
2. Verify environment variable names by environment without printing values:
   `bun run verify:vercel-env-inventory`.
3. Prove Sentry release and source map behavior without printing token values:
   `bun run verify:sentry-release`.
4. Prove database backup/restore against disposable isolated targets:
   `bun run verify:backup-restore`.
5. Run the standard repo gate and production readiness gate listed in
   [docs/ci.md](../ci.md) and [docs/ops/deploy-checklist.md](./deploy-checklist.md).
6. Record the command results, target commit, and any blocked provider proof in
   a dated file under `docs/ops/phase-evidence/`.

## Runtime Health Contract

Each app exposes the shared health contract through
`@asym/api/health/app`:

- `GET /api/health` on `admin`, `donor`, and `missionary`.
- `status`: `ok` or `degraded`.
- `checks.supabase`: `ok` or a sanitized Supabase error summary.
- `observability.surface`: `admin`, `donor`, or `missionary`.
- `observability.release.commit`: first available release identifier from
  `VERCEL_GIT_COMMIT_SHA`, `SENTRY_RELEASE`, `GIT_SHA`, `GITHUB_SHA`, or
  `NEXT_PUBLIC_GIT_SHA`.
- `observability.release.ref`: first available ref from
  `VERCEL_GIT_COMMIT_REF`, `GIT_REF`, or `NEXT_PUBLIC_GIT_REF`.
- `observability.release.environment`: first available environment from
  `VERCEL_TARGET_ENV` or `VERCEL_ENV`.
- `observability.release.runtime`: first available runtime from `NEXT_RUNTIME`
  or `NODE_ENV`.
- `observability.supabaseLatencyMs`: Supabase probe latency, or `null` when
  `SKIP_ENV_VALIDATION=1` intentionally bypasses live env checks.

The production readiness verifier blocks when a health endpoint reports a
release commit that is neither `unknown` nor the target commit. Legacy
deployments with `unknown` continue to pass until redeployed with the Phase 11
health contract.

## Sentry Release And Source Maps

Runtime Sentry reporting and build-time source map upload are separate gates.

- `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` enable runtime reporting.
- `SENTRY_AUTH_TOKEN` is build-only and enables release creation plus source map
  upload through `withSentryConfig`.
- `SENTRY_AUTH_TOKEN` must never be printed, committed, or copied into evidence.
- When `SENTRY_AUTH_TOKEN` is absent, source map upload is disabled while release
  injection still uses the best available commit identifier.
- `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_RELEASE` are optional build-time
  metadata overrides. Defaults remain `asymmetrical-4w` and
  `javascript-nextjs` unless the Sentry project changes.

Official references:

- [Sentry Next.js manual setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Vercel project configuration](https://vercel.com/docs/project-configuration)

## Backup And Restore Proof

`bun run verify:backup-restore` starts disposable `postgres:16-alpine` source
and target containers, writes probe rows to the source, exports a custom-format
dump with `pg_dump`, restores it into the isolated target with `pg_restore`, and
verifies the restored row count and marker range.

Rules:

- Never restore over production data.
- Never use production connection strings for the proof script.
- Keep proof output limited to container names, row counts, marker range, and
  whether production was touched.
- For hosted Supabase recovery work, follow Supabase's backup/restore guidance
  and perform rehearsal restores into a separate project or database before any
  production recovery.

Official reference:

- [Supabase backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore/)

## Deployment Cost And Reliability Control

The app-level `vercel.json` files own the ignored-build command for each Vercel
project:

- `apps/admin/vercel.json`: `node ../../scripts/vercel/should-ignore-build.mjs admin`
- `apps/donor/vercel.json`: `node ../../scripts/vercel/should-ignore-build.mjs donor`
- `apps/missionary/vercel.json`: `node ../../scripts/vercel/should-ignore-build.mjs missionary`

The helper skips docs, tests, phase evidence, OpenSpec-only text, and other
non-runtime changes while failing closed for unknown apps, missing diffs, empty
diffs, or Git errors. Shared runtime inputs still build all three apps.

## Checklist

- [ ] Environment names were inventoried without printing values.
- [ ] Sentry release/source map behavior was proven with and without
      `SENTRY_AUTH_TOKEN`.
- [ ] `/api/health` returned release metadata for all three apps or the
      production readiness report documented legacy `unknown` releases.
- [ ] Backup/restore proof ran against isolated disposable targets only.
- [ ] Vercel ignored-build behavior was tested if deployment controls changed.
- [ ] `docs/ci.md`, `docs/ops/deploy-checklist.md`,
      `docs/ops/environments.md`, and `docs/env-var-audit.md` match the
      implemented gate.
- [ ] Phase evidence records command results, target commit, provider status,
      and any explicit stop conditions.
