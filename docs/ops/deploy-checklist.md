# Deploy Checklist

Use this checklist for production deploys to the current Vercel Production
Branch. As of 2026-05-16, all three live Vercel projects (`admin`, `donor`, and
`missionary`) use `production` as the Production Branch. The normal production path is
`bun run release:production`; see [Production Release Guide](./production-release.md).
If a release also affects development validation, run the same checks against
`develop` before production. `main` is retired/protected historical history and
is not a deploy target.

## 1. Pre-deploy

- [ ] CI checks pass (`lint`, `typecheck`, `unit tests`)
- [ ] Deployment discipline verifier passes:
      `bun run verify:deployment-discipline`
- [ ] Monorepo build-control verifier passes:
      `bun run verify:vercel-build-controls`
- [ ] GitHub branch protection requires `ci-gate`, `integration-gate`, and
      `e2e-gate` on `production`; `ci-gate` and `integration-gate` on `develop`
- [ ] Migrations reviewed (additive-only, or expand-then-contract followed)
- [ ] Migrations tested on development first
- [ ] Vercel project Production Branch matches the intended release branch for all 3 projects
- [ ] The app-level `vercel.json` files allow only `production` and `develop` Git
      deployments
- [ ] The app-level `vercel.json` files keep the repo-owned ignored-build
      commands:
  - `apps/admin`: `node ../../scripts/vercel/should-ignore-build.mjs admin`
  - `apps/donor`: `node ../../scripts/vercel/should-ignore-build.mjs donor`
  - `apps/missionary`: `node ../../scripts/vercel/should-ignore-build.mjs missionary`
- [ ] Vercel affected-project deployments are enabled for `admin`, `donor`,
      and `missionary`: `bun run verify:vercel-affected-projects`
- [ ] The app-level `vercel.json` files keep root Turbo build commands:
  - `apps/admin`: `cd ../.. && bun run build:admin`
  - `apps/donor`: `cd ../.. && bun run build:donor`
  - `apps/missionary`: `cd ../.. && bun run build:missionary`
- [ ] Vercel build queue behavior is `WAIT_FOR_NAMESPACE_QUEUE` for `admin`,
      `donor`, and `missionary`
- [ ] If the release is docs/evidence/tests/ops-only, expect Vercel ignored
      or affected-project skips instead of three production builds
- [ ] New env vars added to all 3 Vercel projects in Production scope
- [ ] Env var names inventoried without values:
      `bun run verify:vercel-env-inventory`
- [ ] Sentry runtime DSNs are distinct from build-time source map upload:
      `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` enable reporting;
      `SENTRY_AUTH_TOKEN` is required only when release creation and source map
      upload should run during build
- [ ] Sentry release/source map behavior proved without printing token values:
      `bun run verify:sentry-release`
- [ ] Backup/restore proof ran against isolated targets:
      `bun run verify:backup-restore`
- [ ] If syncing from GitHub Secrets, run `Sync Vercel Production Env` with
      `dry_run=true`, then with `dry_run=false` after the dry-run passes
- [ ] Resend production webhook exists at
      `https://admin.asymmetric.al/api/email/webhooks/resend`; if missing, run
      `Configure Resend Production Webhook` with `dry_run=true`, then
      `dry_run=false`
- [ ] Stripe live webhook endpoints exist for each production app at `/api/webhooks/stripe`
- [ ] Production readiness verifier passes for the exact commit to ship:
      `bun run verify:vercel-production -- --commit <sha>`
- [ ] Rollback plan reviewed for this deploy: [docs/ops/rollback-plan.md](./rollback-plan.md)

## 2. Deploy

- [ ] Run the release command from a clean `develop` or `production` checkout:
      `bun run release:production`
- [ ] Monitor Vercel build or ignored-build status for all 3 projects:
  - `donor`
  - `missionary`
  - `admin`
- [ ] Do not force-deploy if any required build fails

## 3. Post-deploy smoke tests (within 5 minutes)

- [ ] App loads:
  - `https://donor.asymmetric.al/`
  - `https://missionary.asymmetric.al/`
  - `https://admin.asymmetric.al/`
- [ ] Health checks return `status:"ok"`, `checks.supabase:"ok"`, and
      `observability.release` metadata for the deployed surface:
  - `curl -sS https://donor.asymmetric.al/api/health`
  - `curl -sS https://missionary.asymmetric.al/api/health`
  - `curl -sS https://admin.asymmetric.al/api/health`
- [ ] Auth works: log in with a test account, log out, then log back in
- [ ] Stripe webhook works: trigger a test event via Stripe CLI/dashboard and verify receipt
- [ ] Supabase connectivity works: perform at least one read and one write action

## 4. Post-deploy monitoring (within 30 minutes)

- [ ] Sentry: check for new errors tagged with the deployed release
- [ ] Vercel Analytics: check for Web Vitals anomalies
- [ ] Supabase Dashboard: check for pool exhaustion and failed auth spikes
- [ ] Re-run production readiness verifier against the deployed commit:
      `bun run verify:vercel-production -- --commit <sha>`
- [ ] Confirm the readiness report shows release-health surface and commit data
      for `admin`, `donor`, and `missionary`; a non-`unknown` health commit that
      does not match `<sha>` blocks the release

## 5. If something is wrong

- [ ] Code-only issue: perform Vercel rollback (see [docs/ops/rollback-plan.md](./rollback-plan.md))
- [ ] Migration involved: assess and execute rollback/forward-fix via rollback plan
- [ ] Restore rehearsal or recovery work must target an isolated database first;
      never restore over production as a proof step
- [ ] Notify the team immediately with impact and mitigation status
