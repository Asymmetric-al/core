# Admin Deployment Status Report

Generated: 2026-05-10 Asia/Bangkok

## Summary

The `admin` Vercel project is visible under the `asymmetric-al` scope, but the code currently merged to GitHub `main` is not deployed. The latest deployment tied to the PR #223 work is a manual production deployment for commit `4eddb1905edf1343dbba17e668da1e12ed058b3c`, and it failed during `next build` because required production environment variables were missing.

This remediation branch fixes the repo-side deploy wiring, adds the missing production Stripe webhook route, updates the deployment docs, and partially configures Vercel Production environment variables. Production deployment remains intentionally blocked until live Stripe and Sentry values are supplied.

The current merged `main` commit is `2df3b31c4e143be02578665fdcee0892ed9f1b8e`. Vercel has no deployment for that commit.

This report has also been replayed onto current `origin/epic` because GitHub still reports `epic` as the default branch and `origin/epic` is ahead of `origin/main`. A credible production release must not deploy stale `main` code; it must first either merge the current `epic` lineage into `main` or explicitly change the production contract away from `main`.

## Current Vercel Project Facts

- Project: `admin`
- Project ID: `prj_SB9DucsrJOT0wF1v43SWMFsSNdn8`
- Scope: `asymmetric-al`
- Root Directory: `apps/admin`
- Framework: Next.js
- Node.js Version: `24.x`
- Install Command: `bun install --cwd ../.. --frozen-lockfile`
- Build Command: `bun run build`
- Output Directory: Next.js default

## Current Deployment Facts

- Latest deployment: `admin-nr1yo6gg4-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Created: `2026-05-09T11:55:11.206Z`
- Commit metadata: `4eddb1905edf1343dbba17e668da1e12ed058b3c`
- Ref metadata: `cursor/ai-tooling-standardization-ee26`
- Latest READY production deployment: `admin-7j9vnxrzy-asymmetric-al.vercel.app`
- Latest READY production commit: `4de67ff4a95a08071291e398824bccb40112bd04`
- Latest READY production created: `2026-02-21T00:07:52.859Z`

## Production Alias Smoke Check

Checked on 2026-05-10:

- `https://admin.asymmetric.al/api/health` returns `404` from Vercel with `x-matched-path: /404`.
- This branch contains `apps/admin/app/api/health/route.ts`, so the `404` confirms the current admin source tree is not deployed to the production alias.
- Treat any existing admin production alias response as stale until Vercel shows a new `READY` production deployment from the current production source commit.

## Build Failure

The failed deployment reached Next.js compilation and TypeScript successfully, then failed while collecting page data. The relevant failure was:

- `STRIPE_SECRET_KEY is required for staging and production deployments.`
- `STRIPE_WEBHOOK_SECRET is required for staging and production deployments.`
- `SENTRY_DSN is required for staging and production deployments.`
- Build error: `Failed to collect page data for /api/admin/comments`

The same log also showed non-blocking warnings:

- Payload warns that Next.js 16 is unsupported by Payload.
- Next/Turbopack warns that `outputFileTracingRoot` and `turbopack.root` differ.
- `apps/admin/instrumentation.ts` uses `process.on`, which is not supported in the Edge Runtime.

Those warnings did not stop this deployment. The env validation did.

## Remediation Completed In This Branch

- `apps/admin/vercel.json` now allows `main` and `develop` deployments while keeping legacy `epic` deployments disabled.
- `apps/admin/app/api/webhooks/stripe/route.ts` now exposes `POST /api/webhooks/stripe`.
- The route delegates to the shared `@asym/api/stripe/webhooks` handler instead of embedding data access in the app route.
- The shared handler verifies Stripe signatures against the raw request body, records PaymentIntent state changes, and records charge refunds.
- Unit coverage exists in `tests/unit/packages/api/stripe-webhooks.test.ts`.
- Runtime docs and deployment docs now include the new route and the current `main` production branch contract.

## Production Environment Variables

Production env vars were initially empty. The following Vercel Production variables are now configured for the linked `admin` project; names only are listed here, never secret values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `PAYLOAD_DATABASE_URI`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAIN_DOMAIN`
- `NEXT_PUBLIC_CLOUDINARY_ENABLED`
- `NEXT_PUBLIC_DONOR_URL`
- `DONOR_APP_URL`
- `CMS_BASE_URL`

The admin database values currently come from the existing Supabase project connection string available in the local production env file. If Vercel cannot resolve or reach the direct Supabase database host at runtime, replace `PAYLOAD_DATABASE_URI` and `SUPABASE_DB_URL` with the Supavisor session-pooler URL for the same production project.

The following required external values are still missing and must be added before a real production deployment can succeed:

- `STRIPE_SECRET_KEY` with an `sk_live_` prefix
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with a `pk_live_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix for `https://admin.asymmetric.al/api/webhooks/stripe`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Required by the shared env schema for protected deployments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` with an `sk_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix
- `SENTRY_DSN`

Required for intended admin/Web Studio behavior is now configured, subject to the database reachability note above.

If Cloudinary is enabled later, also add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Do not use `SKIP_ENV_VALIDATION` as the production fix. It would hide the exact production contract the app is currently enforcing.

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
- `origin/epic` is ahead of `origin/main`; this remediation has been ported onto `origin/epic` so it can be merged forward without losing current code.
- Do not switch the default branch or production deploy source to `main` until `main` includes the current `epic` lineage.

## What Must Happen For Admin To Deploy Successfully

1. Add the remaining live Stripe and Sentry values listed above.
2. Create or verify the live Stripe webhook endpoint for `https://admin.asymmetric.al/api/webhooks/stripe`.
3. Confirm the admin database URL is reachable from Vercel, preferably through Supavisor if direct Supabase DNS fails.
4. Merge current `epic` plus this remediation into `main`, or make an explicit product decision to keep production on `epic` and reverse the `epic` deployment disablement.
5. Confirm Vercel creates a new production deployment from the current production source commit.
6. Confirm Vercel reports `READY`.
7. Run the admin smoke checks from `docs/ops/deploy-checklist.md`, especially:
   - `https://admin.asymmetric.al/`
   - `https://admin.asymmetric.al/api/health`
   - Auth login/logout
   - At least one admin read and write path
   - Sentry and Supabase monitoring after deploy

## Useful Evidence Commands

```bash
vercel project inspect admin --scope asymmetric-al
vercel env ls production --cwd /tmp/core-vercel-admin --scope asymmetric-al --format=json
vercel list admin --scope asymmetric-al --format=json
vercel inspect admin-nr1yo6gg4-asymmetric-al.vercel.app --scope asymmetric-al --logs
gh api graphql -f query='query { repository(owner:"Asymmetric-al", name:"core") { branchProtectionRules(first:20) { nodes { pattern requiresDeployments requiredDeploymentEnvironments requiredStatusCheckContexts } } } }'
git rev-list --left-right --count origin/main...origin/epic
```

## References

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- Vercel build/root directory settings: https://vercel.com/docs/builds/configure-a-build
- Repo env schema: `packages/env/src/schema.ts`
- Repo deployment guide: `docs/ops/environments.md`
- Repo deploy checklist: `docs/ops/deploy-checklist.md`
