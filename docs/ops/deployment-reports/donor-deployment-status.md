# Donor Deployment Status Report

Generated: 2026-05-10 Asia/Bangkok

## Summary

The `donor` Vercel project is visible under the `asymmetric-al` scope, but the code currently merged to GitHub `main` is not deployed. Vercel has no deployment for the merged `main` commit `2df3b31c4e143be02578665fdcee0892ed9f1b8e`.

The latest visible `donor` production deployment is stale and failed against an older `epic` commit because the configured root directory did not exist in that historical checkout. In the current `origin/main` tree, `apps/donor` does exist, so the latest failure should not be treated as proof that the current source still has a missing-directory problem. The current hard blocker is that the `donor` Vercel project has no production environment variables configured.

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

## Latest Failure

The latest failed `donor` deployment log shows:

```text
The specified Root Directory "apps/donor" does not exist. Please update your Project Settings.
```

That failure came from the older `6c76ce4` `epic` commit. Current `origin/main` does contain `apps/donor`, so a new deployment should move past this specific failure if it deploys the current tree.

## Production Environment Variables

`vercel env ls production` for the linked `donor` project returned an empty env list. Production env vars must be configured before a real production build can succeed.

Required by the shared env schema for protected deployments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` with an `sk_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix
- `SENTRY_DSN`

Strongly recommended for intended donor behavior:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_MAIN_DOMAIN`
- `NEXT_PUBLIC_SITE_URL`

Required if Cloudinary is enabled:

- `NEXT_PUBLIC_CLOUDINARY_ENABLED=true`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Do not use `SKIP_ENV_VALIDATION` as the production fix. The donor app handles public donation and checkout surfaces; hiding missing production env vars would create a false deploy success.

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

## What Must Happen For Donor To Deploy Successfully

1. Add the required production env vars to the `donor` Vercel project.
2. Confirm Stripe live-mode keys and webhook secret are for the donor production endpoint.
3. Confirm Supabase production values point to the production project, not preview or staging.
4. Decide whether production deploys should be automatic Git deploys or manual CLI/deploy-hook deploys.
5. If automatic, remove the `main: false` or `epic: false` deployment block for the selected production branch.
6. Trigger a new production deployment from the current production source commit.
7. Confirm the deployment moves past the stale missing-root-directory error and reaches `READY`.
8. Run the donor smoke checks from `docs/ops/deploy-checklist.md`, especially:
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
git ls-tree -d origin/main apps/donor
```

## References

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- Vercel build/root directory settings: https://vercel.com/docs/builds/configure-a-build
- Repo env schema: `packages/env/src/schema.ts`
- Repo deployment guide: `docs/ops/environments.md`
- Repo deploy checklist: `docs/ops/deploy-checklist.md`
