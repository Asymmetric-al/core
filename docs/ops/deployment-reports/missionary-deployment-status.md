# Missionary Deployment Status Report

Generated: 2026-05-10 Asia/Bangkok

## Summary

The `missionary` Vercel project is visible under the `asymmetric-al` scope, but the code currently merged to GitHub `main` is not deployed. Vercel has no deployment for the merged `main` commit `2df3b31c4e143be02578665fdcee0892ed9f1b8e`.

The latest visible `missionary` production deployment is stale and failed against an older `epic` commit because the configured root directory did not exist in that historical checkout. In the current `origin/main` tree, `apps/missionary` does exist, so the latest failure should not be treated as proof that the current source still has a missing-directory problem. The current hard blocker is that the `missionary` Vercel project has no production environment variables configured.

## Current Vercel Project Facts

- Project: `missionary`
- Project ID: `prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN`
- Scope: `asymmetric-al`
- Root Directory: `apps/missionary`
- Framework: Next.js
- Node.js Version: `24.x`
- Install Command: `bun install --cwd ../.. --frozen-lockfile`
- Build Command: `bun run build`
- Output Directory: Next.js default

## Current Deployment Facts

- Latest deployment: `missionary-jmufalc5x-asymmetric-al.vercel.app`
- Target: `production`
- State: `ERROR`
- Created: `2026-03-11T05:37:00.164Z`
- Commit metadata: `6c76ce45c10c558c0b9b0a37bd22311a4a868ec7`
- Ref metadata: `epic`
- Latest READY production deployment: `missionary-o9jwhbqki-asymmetric-al.vercel.app`
- Latest READY production commit: `4de67ff4a95a08071291e398824bccb40112bd04`
- Latest READY production created: `2026-02-21T00:07:52.959Z`

## Latest Failure

The latest failed `missionary` deployment log shows:

```text
The specified Root Directory "apps/missionary" does not exist. Please update your Project Settings.
```

That failure came from the older `6c76ce4` `epic` commit. Current `origin/main` does contain `apps/missionary`, so a new deployment should move past this specific failure if it deploys the current tree.

## Production Environment Variables

`vercel env ls production` for the linked `missionary` project returned an empty env list. Production env vars must be configured before a real production build can succeed.

Required by the shared env schema for protected deployments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` with an `sk_` prefix
- `STRIPE_WEBHOOK_SECRET` with a `whsec_` prefix
- `SENTRY_DSN`

Strongly recommended for intended missionary behavior:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAIN_DOMAIN`

Required if Cloudinary is enabled:

- `NEXT_PUBLIC_CLOUDINARY_ENABLED=true`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Do not use `SKIP_ENV_VALIDATION` as the production fix. The missionary app is an authenticated production app and should fail closed when production credentials are absent.

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

## What Must Happen For Missionary To Deploy Successfully

1. Add the required production env vars to the `missionary` Vercel project.
2. Confirm Supabase production values point to the production project, not preview or staging.
3. Confirm Stripe values are intentionally configured for missionary production if Stripe-backed surfaces are active through shared packages.
4. Decide whether production deploys should be automatic Git deploys or manual CLI/deploy-hook deploys.
5. If automatic, remove the `main: false` or `epic: false` deployment block for the selected production branch.
6. Trigger a new production deployment from the current production source commit.
7. Confirm the deployment moves past the stale missing-root-directory error and reaches `READY`.
8. Run the missionary smoke checks from `docs/ops/deploy-checklist.md`, especially:
   - `https://missionary.asymmetric.al/`
   - `https://missionary.asymmetric.al/api/health`
   - Auth login/logout
   - At least one missionary dashboard read and write path
   - Supabase connectivity
   - Sentry and Vercel Analytics monitoring after deploy

## Useful Evidence Commands

```bash
vercel project inspect missionary --scope asymmetric-al
vercel env ls production --cwd /tmp/core-vercel-missionary --scope asymmetric-al --format=json
vercel list missionary --scope asymmetric-al --format=json
vercel inspect missionary-jmufalc5x-asymmetric-al.vercel.app --scope asymmetric-al --logs
git ls-tree -d origin/main apps/missionary
```

## References

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- Vercel build/root directory settings: https://vercel.com/docs/builds/configure-a-build
- Repo env schema: `packages/env/src/schema.ts`
- Repo deployment guide: `docs/ops/environments.md`
- Repo deploy checklist: `docs/ops/deploy-checklist.md`
