# Donor Deployment Status Report

Generated: 2026-05-10 Asia/Bangkok

## Summary

The `donor` Vercel project is visible under the `asymmetric-al` scope. Live
Vercel project settings report `productionBranch: production`, which matches the
repository's current GitHub default branch. The previous repo-side blocker was
that `apps/donor/vercel.json` disabled `production`, so Vercel could not create the
intended Production deployment from the current release branch.

The latest visible `donor` production deployment is stale and failed against an older `production` commit because the configured root directory did not exist in that historical checkout. In the current `origin/main` tree, `apps/donor` does exist, so the latest failure should not be treated as proof that the current source still has a missing-directory problem.

This remediation removes that branch-gating conflict, adds verifier coverage for
the live Vercel Production Branch, adds the missing production Stripe webhook
route, updates the deployment docs, and adds a guarded Vercel Production env
sync path plus a guarded Resend production webhook configuration path.
Production deployment remains blocked until real live Stripe and Sentry values
are supplied and Vercel produces a READY Production deployment for the exact
release commit.

## Current Vercel Project Facts

- Project: `donor`
- Project ID: `prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL`
- Scope: `asymmetric-al`
- Root Directory: `apps/donor`
- Production Branch: `production`
- Framework: Next.js
- Node.js Version: `24.x`
- Install Command: `bun install --cwd ../.. --frozen-lockfile`
- Build Command: `bun run build`
- Output Directory: Next.js default

## Deployment Facts Observed During Initial Audit

- Latest deployment: `donor-kud1cv6o6-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Created: `2026-03-11T05:37:00.116Z`
- Commit metadata: `6c76ce45c10c558c0b9b0a37bd22311a4a868ec7`
- Ref metadata: `production`
- Latest READY production deployment: `donor-ge3mqb98s-asymmetric-al.vercel.app`
- Latest READY production commit: `ec2284071fcd55aff8258de033cd5a91aaf40b3a`
- Latest READY production created: `2026-02-20T08:50:56.960Z`

## Post-Fix Deployment Attempt

After the branch-gating fix was pushed to `production`, Vercel created a new
Production build for the target commit. This proves the repo-side Production
Branch block and the stale missing-root-directory failure are resolved for the
current source tree.

- Deployment: `donor-1verqi74v-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Commit metadata: `81d718335ab6afc5988e05a84eaeca1e77f27fd5`
- Ref metadata: `production`
- Build result: failed during Next.js page-data collection because required
  external Production env values are still absent. This attempt happened after
  the targeted `RESEND_API_KEY`, `RESEND_ENCRYPTION_KEY`, and
  `RESEND_WEBHOOK_SECRET` Production backfills and after the default full sync
  path was fixed so `RESEND_WEBHOOK_SECRET` is targeted-only, so Resend absence
  is no longer part of the build failure.

Use `bun run verify:vercel-production -- --commit <sha>` for the newest
deployment state after each later push; this report intentionally records the
latest code/config remediation evidence rather than treating any docs-only
follow-up push as a new source of product readiness.

Current audit refresh on 2026-05-10 10:53 +07:

- Latest deployment: `donor-92jxb801i-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Commit metadata: `75f407526473e263dd8057adfcbbff282ac13052`
- Ref metadata: `production`
- Readiness verifier result: blocked by the same missing live Stripe and Sentry
  values listed below; no READY Production deployment exists for this commit.

## Production Alias Smoke Check

Checked on 2026-05-10:

- `https://donor.asymmetric.al/api/health` returns `200` with `{"status":"ok"}`.
- This proves the donor production alias currently points at a responding deployment, but it does not prove current code is deployed because Vercel still reports the latest production deployment as the stale `6c76ce4` failure and the latest ready production deployment is from February 2026.
- Treat the donor alias as stale until Vercel shows a new `READY` production deployment from the current production source commit.

## Previous Stale Failure

The pre-fix failed `donor` deployment log showed:

```text
The specified Root Directory "apps/donor" does not exist. Please update your Project Settings.
```

That failure came from the older `6c76ce4` `production` commit. The post-fix
deployment for `adb880cc75968edc856b57612dbc62ecd5db428c` reached the Next.js
build and failed on missing Production env values instead, so the current
source tree no longer has the old missing-root-directory blocker.

## Current Build Failure

The post-fix deployment reached Next.js compilation and TypeScript successfully,
then failed while collecting page data. The relevant failure was:

- `STRIPE_SECRET_KEY is required for staging and production deployments.`
- `STRIPE_WEBHOOK_SECRET is required for staging and production deployments.`
- `SENTRY_DSN is required for staging and production deployments.`
- Build error: `Failed to collect page data for /api/auth/cleanup-demo-users`

## Remediation Completed In This Branch

- `apps/donor/vercel.json` no longer disables the live Vercel Production Branch, `production`.
- `apps/donor/app/api/webhooks/stripe/route.ts` now exposes `POST /api/webhooks/stripe`.
- The route delegates to the shared `@asym/api/stripe/webhooks` handler instead of embedding data access in the app route.
- The shared handler verifies Stripe signatures against the raw request body, records PaymentIntent state changes, and records charge refunds.
- Unit coverage exists in `tests/unit/packages/api/stripe-webhooks.test.ts`.
- Runtime docs and deployment docs now include the new route and the current Vercel Production Branch contract.
- `.github/workflows/configure-resend-production-webhook.yml` and
  `scripts/configure-resend-production-webhook.mjs` can create or update the
  production Resend webhook, mask the returned signing secret, and sync
  `RESEND_WEBHOOK_SECRET` into all three Vercel Production projects.
- Unit coverage exists in
  `tests/unit/scripts/configure-resend-production-webhook.test.ts`.
- `scripts/sync-vercel-production-env.mjs` keeps `RESEND_WEBHOOK_SECRET`
  available for targeted Resend handoff only; the default full provider sync no
  longer requires that value from GitHub Secrets.
- Unit coverage exists in
  `tests/unit/scripts/sync-vercel-production-env.test.ts`.

## Production Environment Variables

Production env vars were initially empty. The following Vercel Production variables are now configured for the linked `donor` project; names only are listed here, never secret values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAIN_DOMAIN`
- `NEXT_PUBLIC_CLOUDINARY_ENABLED`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_ENCRYPTION_KEY`

The following required external values are still missing and must be added before a real production deployment can succeed:

- `STRIPE_SECRET_KEY` with an `sk_live_` prefix
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with a `pk_live_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix for `https://donor.asymmetric.al/api/webhooks/stripe`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Additional secret-source audit on 2026-05-10:

- Local root `.env.local` has `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SENTRY_DSN` present but empty; `STRIPE_WEBHOOK_SECRET`, `SENTRY_DSN`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY` are absent.
- GitHub repository secrets include Vercel and Supabase values plus `RESEND_API_KEY` and `RESEND_ENCRYPTION_KEY`, but no Stripe or Sentry secret names. `RESEND_WEBHOOK_SECRET` is derived from Resend during the guarded workflow and is not stored as a GitHub repository secret.
- `RESEND_API_KEY` was backfilled into Vercel Production for this project by `Sync Vercel Production Env` write run `25617834101`; Vercel now reports it as present but sensitive/unreadable.
- `RESEND_ENCRYPTION_KEY` was generated as a new managed production secret, stored in GitHub Secrets, and synced to this Vercel Production project by `Sync Vercel Production Env` write run `25618153850`; Vercel now reports it as present but sensitive/unreadable.
- `Configure Resend Production Webhook` dry-run `25618472678` confirmed the
  endpoint would be created, and write run `25618482475` created Resend webhook
  `52e90eb0-21e3-422e-8683-974629cd1517`, masked its signing secret, and
  synced `RESEND_WEBHOOK_SECRET` into this Vercel Production project. Vercel now
  reports it as present but sensitive/unreadable.
- `Sync Vercel Production Env` dry-run `25618854696` now fails only on missing
  Stripe/Sentry inputs:
  `ADMIN_STRIPE_WEBHOOK_SECRET`, `DONOR_STRIPE_WEBHOOK_SECRET`,
  `MISSIONARY_STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SENTRY_DSN`, and
  `STRIPE_SECRET_KEY`. It no longer requires `RESEND_WEBHOOK_SECRET` in the
  default full sync path.
- Vercel Preview and Development env scopes are empty, so there are no existing non-Production Vercel provider values to promote.
- Vercel Marketplace integrations list no connected integration resource that can supply Stripe, Sentry, or Resend values.
- Production Supabase `public.tenants` currently has one tenant and zero populated tenant Stripe secret, publishable, or webhook-secret fields.

Required by the shared env schema for protected deployments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` with an `sk_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix
- `SENTRY_DSN`
- `RESEND_API_KEY` with an `re_` prefix
- `RESEND_WEBHOOK_SECRET` with a `whsec_` prefix
- `RESEND_ENCRYPTION_KEY` with at least 32 characters

Required donor origin and Supabase variables are now configured. If Cloudinary is enabled later, also add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Do not use `SKIP_ENV_VALIDATION` as the production fix. The donor app handles public donation and checkout surfaces; hiding missing production env vars would create a false deploy success.

## Git And Deployment Wiring

This branch keeps app-level `vercel.json` minimal:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json"
}
```

Vercel's `git.deploymentEnabled` default is `true` for unspecified branches, so
the live Vercel Production Branch `production` is now deployable. If the team later
migrates Production to `main`, first update the Vercel Production Branch setting
for all three projects and then update this file.

GitHub branch-state audit on 2026-05-10:

- GitHub default branch: `production`
- Vercel Production Branch: `production`
- Production branch protection exists on `main`, but live Vercel production deploys are currently governed by the Vercel project Production Branch setting above.

## What Must Happen For Donor To Deploy Successfully

1. Add the remaining live Stripe and Sentry values listed above as GitHub
   Secrets, using `DONOR_STRIPE_WEBHOOK_SECRET` for the donor-specific Stripe
   webhook signing secret, then run the guarded `Sync Vercel Production Env`
   workflow first as a dry-run and then as a write.
2. Create or verify the live Stripe webhook endpoint for `https://donor.asymmetric.al/api/webhooks/stripe`.
3. Confirm Supabase production values point to the production project, not preview or staging.
4. Push or merge the approved release commit to `production`, the current Vercel Production Branch.
5. Confirm Vercel creates a new production deployment from the current production source commit.
6. Confirm the deployment moves past the stale missing-root-directory error and reaches `READY`.
7. Run the donor smoke checks from `docs/ops/deploy-checklist.md`, especially:
   - `https://donor.asymmetric.al/`
   - `https://donor.asymmetric.al/api/health`
   - Auth login/logout
   - Donation checkout path
   - Stripe webhook receipt
   - Supabase read/write connectivity
   - Sentry and Vercel Analytics monitoring after deploy

## Useful Evidence Commands

```bash
vercel project inspect donor --scope asymmetric-al
vercel env ls production --cwd /tmp/core-vercel-donor --scope asymmetric-al --format=json
vercel list donor --scope asymmetric-al --format=json
vercel inspect donor-kud1cv6o6-asymmetric-al.vercel.app --scope asymmetric-al --logs
bun run verify:vercel-production -- --commit <sha>
git ls-tree -d origin/main apps/donor
git ls-tree -d origin/production apps/donor
git rev-list --left-right --count origin/main...origin/production
vercel api /v10/projects/donor --scope asymmetric-al --raw
```

## References

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- Vercel build/root directory settings: https://vercel.com/docs/builds/configure-a-build
- Repo env schema: `packages/env/src/schema.ts`
- Repo deployment guide: `docs/ops/environments.md`
- Repo deploy checklist: `docs/ops/deploy-checklist.md`
