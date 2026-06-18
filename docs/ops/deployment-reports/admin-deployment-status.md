# Admin Deployment Status Report

Generated: 2026-05-10 Asia/Bangkok

## Summary

The `admin` Vercel project is visible under the `asymmetric-al` scope. Live
Vercel project settings report `productionBranch: production`, which matches the
repository's current GitHub default branch. The previous repo-side blocker was
that `apps/admin/vercel.json` disabled `production`, so Vercel could not create the
intended Production deployment from the current release branch.

This remediation removes that branch-gating conflict, adds verifier coverage for
the live Vercel Production Branch, adds the missing production Stripe webhook
route, updates the deployment docs, and adds a guarded Vercel Production env
sync path plus a guarded Resend production webhook configuration path.
Production deployment remains blocked until real live Stripe and Sentry values
are supplied and Vercel produces a READY Production deployment for the exact
release commit.

## Current Vercel Project Facts

- Project: `admin`
- Project ID: `prj_SB9DucsrJOT0wF1v43SWMFsSNdn8`
- Scope: `asymmetric-al`
- Root Directory: `apps/admin`
- Production Branch: `production`
- Framework: Next.js
- Node.js Version: `24.x`
- Install Command: `bun install --cwd ../.. --frozen-lockfile`
- Build Command: `bun run build`
- Output Directory: Next.js default

## Deployment Facts Observed During Initial Audit

- Latest deployment: `admin-nr1yo6gg4-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Created: `2026-05-09T11:55:11.206Z`
- Commit metadata: `4eddb1905edf1343dbba17e668da1e12ed058b3c`
- Ref metadata: `cursor/ai-tooling-standardization-ee26`
- Latest READY production deployment: `admin-7j9vnxrzy-asymmetric-al.vercel.app`
- Latest READY production commit: `4de67ff4a95a08071291e398824bccb40112bd04`
- Latest READY production created: `2026-02-21T00:07:52.859Z`

## Post-Fix Deployment Attempt

After the branch-gating fix was pushed to `production`, Vercel created a new
Production build for the target commit. This proves the repo-side Production
Branch block is resolved.

- Deployment: `admin-gj32wxwch-asymmetric-al.vercel.app`
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

- Latest deployment: `admin-rgqw7c347-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Commit metadata: `75f407526473e263dd8057adfcbbff282ac13052`
- Ref metadata: `production`
- Readiness verifier result: blocked by the same missing live Stripe and Sentry
  values listed below; no READY Production deployment exists for this commit.

## Production Alias Smoke Check

Checked on 2026-05-10:

- `https://admin.asymmetric.al/api/health` returns `404` from Vercel with `x-matched-path: /404`.
- This branch contains `apps/admin/app/api/health/route.ts`, so the `404` confirms the current admin source tree is not deployed to the production alias.
- Treat any existing admin production alias response as stale until Vercel shows a new `READY` production deployment from the current production source commit.

## Build Failure

The failed deployment reached Next.js compilation and TypeScript successfully, then failed while collecting page data. The relevant failure was:

- `STRIPE_SECRET_KEY is required for development and production deployments.`
- `STRIPE_WEBHOOK_SECRET is required for development and production deployments.`
- `SENTRY_DSN is required for development and production deployments.`
- Build error: `Failed to collect page data for /api/admin/comments`

The same log also showed non-blocking warnings:

- Payload warns that Next.js 16 is unsupported by Payload.
- Next/Turbopack warns that `outputFileTracingRoot` and `turbopack.root` differ.
- `apps/admin/instrumentation.ts` uses `process.on`, which is not supported in the Edge Runtime.

Those warnings did not stop this deployment. The env validation did.

## Remediation Completed In This Branch

- `apps/admin/vercel.json` no longer disables the live Vercel Production Branch, `production`.
- `apps/admin/app/api/webhooks/stripe/route.ts` now exposes `POST /api/webhooks/stripe`.
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
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_ENCRYPTION_KEY`

The admin database values currently come from the existing Supabase project connection string available in the local production env file. If Vercel cannot resolve or reach the direct Supabase database host at runtime, replace `PAYLOAD_DATABASE_URI` and `SUPABASE_DB_URL` with the Supavisor session-pooler URL for the same production project.

The following required external values are still missing and must be added before a real production deployment can succeed:

- `STRIPE_SECRET_KEY` with an `sk_live_` prefix
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with a `pk_live_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix for `https://admin.asymmetric.al/api/webhooks/stripe`
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

Required for intended admin/Web Studio behavior is now configured, subject to the database reachability note above.

If Cloudinary is enabled later, also add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Do not use `SKIP_ENV_VALIDATION` as the production fix. It would hide the exact production contract the app is currently enforcing.

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

## What Must Happen For Admin To Deploy Successfully

1. Add the remaining live Stripe and Sentry values listed above as GitHub
   Secrets, using `ADMIN_STRIPE_WEBHOOK_SECRET` for the admin-specific Stripe
   webhook signing secret, then run the guarded `Sync Vercel Production Env`
   workflow first as a dry-run and then as a write.
2. Create or verify the live Stripe webhook endpoint for `https://admin.asymmetric.al/api/webhooks/stripe`.
3. Confirm the admin database URL is reachable from Vercel, preferably through Supavisor if direct Supabase DNS fails.
4. Push or merge the approved release commit to `production`, the current Vercel Production Branch.
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
bun run verify:vercel-production -- --commit <sha>
gh api graphql -f query='query { repository(owner:"Asymmetric-al", name:"core") { branchProtectionRules(first:20) { nodes { pattern requiresDeployments requiredDeploymentEnvironments requiredStatusCheckContexts } } } }'
git rev-list --left-right --count origin/main...origin/production
vercel api /v10/projects/admin --scope asymmetric-al --raw
```

## References

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- Vercel build/root directory settings: https://vercel.com/docs/builds/configure-a-build
- Repo env schema: `packages/env/src/schema.ts`
- Repo deployment guide: `docs/ops/environments.md`
- Repo deploy checklist: `docs/ops/deploy-checklist.md`
