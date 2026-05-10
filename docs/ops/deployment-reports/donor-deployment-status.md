# Donor Deployment Status Report

Generated: 2026-05-10 Asia/Bangkok

## Summary

The `donor` Vercel project is visible under the `asymmetric-al` scope, but the code currently merged to GitHub `main` is not deployed. Vercel has no deployment for the merged `main` commit `2df3b31c4e143be02578665fdcee0892ed9f1b8e`.

The latest visible `donor` production deployment is stale and failed against an older `epic` commit because the configured root directory did not exist in that historical checkout. In the current `origin/main` tree, `apps/donor` does exist, so the latest failure should not be treated as proof that the current source still has a missing-directory problem.

This remediation branch fixes the repo-side deploy wiring, adds the missing production Stripe webhook route, updates the deployment docs, and partially configures Vercel Production environment variables. Production deployment remains intentionally blocked until live Stripe, Sentry, and Resend values are supplied.

This report has also been replayed onto current `origin/epic` because GitHub still reports `epic` as the default branch and `origin/epic` is ahead of `origin/main`. A credible production release must not deploy stale `main` code; it must first either merge the current `epic` lineage into `main` or explicitly change the production contract away from `main`.

The repo-side remediation is now merged to remote `epic` at commit `ddb558ce50ece088a359f2c29456604e48f733b7`. GitHub reports `ci-gate`, `format`, `lint`, `typecheck`, `test-unit`, `build`, and `source-check` as successful for that commit. No current Vercel Production deployment exists for that commit because legacy `epic` deployments are intentionally disabled and the intended Production branch remains `main`.

## Current Vercel Project Facts

- Project: `donor`
- Project ID: `prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL`
- Scope: `asymmetric-al`
- Root Directory: `apps/donor`
- Framework: Next.js
- Node.js Version: `24.x`
- Install Command: `bun install --cwd ../.. --frozen-lockfile`
- Build Command: `bun run build`
- Output Directory: Next.js default

## Current Deployment Facts

- Latest deployment: `donor-kud1cv6o6-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Created: `2026-03-11T05:37:00.116Z`
- Commit metadata: `6c76ce45c10c558c0b9b0a37bd22311a4a868ec7`
- Ref metadata: `epic`
- Latest READY production deployment: `donor-ge3mqb98s-asymmetric-al.vercel.app`
- Latest READY production commit: `ec2284071fcd55aff8258de033cd5a91aaf40b3a`
- Latest READY production created: `2026-02-20T08:50:56.960Z`

## Production Alias Smoke Check

Checked on 2026-05-10:

- `https://donor.asymmetric.al/api/health` returns `200` with `{"status":"ok"}`.
- This proves the donor production alias currently points at a responding deployment, but it does not prove current code is deployed because Vercel still reports the latest production deployment as the stale `6c76ce4` failure and the latest ready production deployment is from February 2026.
- Treat the donor alias as stale until Vercel shows a new `READY` production deployment from the current production source commit.

## Latest Failure

The latest failed `donor` deployment log shows:

```text
The specified Root Directory "apps/donor" does not exist. Please update your Project Settings.
```

That failure came from the older `6c76ce4` `epic` commit. Current `origin/main`, current `origin/epic`, and this remediation branch all contain `apps/donor`, so a new deployment should move past this specific failure if it deploys a current tree.

## Remediation Completed In This Branch

- `apps/donor/vercel.json` now allows `main` and `develop` deployments while keeping legacy `epic` deployments disabled.
- `apps/donor/app/api/webhooks/stripe/route.ts` now exposes `POST /api/webhooks/stripe`.
- The route delegates to the shared `@asym/api/stripe/webhooks` handler instead of embedding data access in the app route.
- The shared handler verifies Stripe signatures against the raw request body, records PaymentIntent state changes, and records charge refunds.
- Unit coverage exists in `tests/unit/packages/api/stripe-webhooks.test.ts`.
- Runtime docs and deployment docs now include the new route and the current `main` production branch contract.

## Production Environment Variables

Production env vars were initially empty. The following Vercel Production variables are now configured for the linked `donor` project; names only are listed here, never secret values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAIN_DOMAIN`
- `NEXT_PUBLIC_CLOUDINARY_ENABLED`

The following required external values are still missing and must be added before a real production deployment can succeed:

- `STRIPE_SECRET_KEY` with an `sk_live_` prefix
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with a `pk_live_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix for `https://donor.asymmetric.al/api/webhooks/stripe`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `RESEND_API_KEY` with an `re_` prefix
- `RESEND_WEBHOOK_SECRET` with a `whsec_` prefix
- `RESEND_ENCRYPTION_KEY` with at least 32 characters

Additional secret-source audit on 2026-05-10:

- Local root `.env.local` has `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SENTRY_DSN` present but empty; `STRIPE_WEBHOOK_SECRET`, `SENTRY_DSN`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY` are absent.
- GitHub repository secrets include Vercel and Supabase values, but no Stripe, Sentry, or Resend secret names.
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

This branch changes each app-level `vercel.json` to:

```json
{
  "git": {
    "deploymentEnabled": {
      "epic": false
    }
  }
}
```

That means Vercel can create automatic deployments from `main` and `develop`, matching the repo documentation updated in this remediation branch. Legacy `epic` deployments remain disabled.

GitHub branch-state audit on 2026-05-10:

- Default branch: `epic`
- Production branch protection exists on `main` and requires `Production - admin`, `Production - donor`, and `Production - missionary`.
- `origin/epic` is ahead of `origin/main`; this remediation is merged to `origin/epic` so it can be merged forward without losing current code.
- Do not switch the default branch or production deploy source to `main` until `main` includes the current `epic` lineage.

## What Must Happen For Donor To Deploy Successfully

1. Add the remaining live Stripe and Sentry values listed above.
2. Create or verify the live Stripe webhook endpoint for `https://donor.asymmetric.al/api/webhooks/stripe`.
3. Confirm Supabase production values point to the production project, not preview or staging.
4. Merge current `epic` plus this remediation into `main`, or make an explicit product decision to keep production on `epic` and reverse the `epic` deployment disablement.
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
git ls-tree -d origin/epic apps/donor
git rev-list --left-right --count origin/main...origin/epic
```

## References

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- Vercel build/root directory settings: https://vercel.com/docs/builds/configure-a-build
- Repo env schema: `packages/env/src/schema.ts`
- Repo deployment guide: `docs/ops/environments.md`
- Repo deploy checklist: `docs/ops/deploy-checklist.md`
