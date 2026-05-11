# Admin Deployment Status Report

Generated: 2026-05-10 Asia/Bangkok

## Summary

The `admin` Vercel project is visible under the `asymmetric-al` scope, but the code currently merged to GitHub `main` is not deployed. The latest deployment tied to the PR #223 work is a manual production deployment for commit `4eddb1905edf1343dbba17e668da1e12ed058b3c`, and it failed during `next build` because required production environment variables were missing.

The current merged `main` commit is `2df3b31c4e143be02578665fdcee0892ed9f1b8e`. Vercel has no deployment for that commit.

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

## Production Environment Variables

`vercel env ls production` for the linked `admin` project returned an empty env list. Production env vars must be configured before a real production build can succeed.

Required by the shared env schema for protected deployments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` with an `sk_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix
- `SENTRY_DSN`

Required for intended admin/Web Studio behavior:

- `PAYLOAD_SECRET`
- `PAYLOAD_DATABASE_URI` or `SUPABASE_DB_URL`
- Prefer a Supavisor session-pooler connection string for Payload if Vercel cannot resolve the direct Supabase database host.

Recommended production vars for complete app behavior:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_ENABLED`
- If Cloudinary is enabled: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Do not use `SKIP_ENV_VALIDATION` as the production fix. It would hide the exact production contract the app is currently enforcing.

## Git And Deployment Wiring

Each app-level `vercel.json` currently contains:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": false,
      "develop": false,
      "epic": false
    }
  }
}
```

Vercel documentation says production deployments are created when commits land on the production branch, but this repo explicitly disables automatic Vercel deployments for `main`, `develop`, and `epic`.

There is also a process mismatch:

- GitHub `main` branch protection requires deployments named `Production - admin`, `Production - donor`, and `Production - missionary`.
- Repo docs still describe production as PR merge to `epic`.
- PR #223 merged the integration to `main`.

Before the next release, choose one production branch and align GitHub branch protection, Vercel project production-branch settings, and repo docs.

## What Must Happen For Admin To Deploy Successfully

1. Add the required production env vars to the `admin` Vercel project.
2. Add admin-specific Payload vars: `PAYLOAD_SECRET` and either `PAYLOAD_DATABASE_URI` or `SUPABASE_DB_URL`.
3. Confirm the database URL is reachable from Vercel, preferably through Supavisor if direct Supabase DNS fails.
4. Decide whether production deploys should be automatic Git deploys or manual CLI/deploy-hook deploys.
5. If automatic, remove the `main: false` or `epic: false` deployment block for the selected production branch.
6. Trigger a new production deployment from the current production source commit.
7. Confirm Vercel reports `READY`.
8. Run the admin smoke checks from `docs/ops/deploy-checklist.md`, especially:
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
```

## References

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- Vercel build/root directory settings: https://vercel.com/docs/builds/configure-a-build
- Repo env schema: `packages/env/src/schema.ts`
- Repo deployment guide: `docs/ops/environments.md`
- Repo deploy checklist: `docs/ops/deploy-checklist.md`
