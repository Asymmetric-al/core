# Production Deployment Completion Audit

Generated: 2026-05-10 Asia/Bangkok

## Status

The production deployment goal is not complete. Repo-side remediation is merged
to remote `epic` and verified, but the intended Vercel Production deployments
for `admin`, `donor`, and `missionary` are still blocked by missing external
provider values, stale `main`, and absent READY production deployments for the
current target commit.

Deployment implementation commit audited:
`1fd4daa490d3f6b7293f68b1cc2e5eead6f73861`. Later commits may refresh this
report without changing the deployment implementation.

## Objective Checklist

| Requirement                                                              | Evidence                                                                                                                                                                                                                                                                                                                | Status   |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Use the latest deployment reports for `admin`, `donor`, and `missionary` | Per-app reports exist in this directory and include Vercel project facts, deployment facts, missing envs, branch wiring, and evidence commands.                                                                                                                                                                         | Complete |
| Fix repo-side production deployment wiring                               | `apps/admin/vercel.json`, `apps/donor/vercel.json`, and `apps/missionary/vercel.json` allow `main` and `develop` while keeping legacy `epic` disabled.                                                                                                                                                                  | Complete |
| Add missing production Stripe webhook routes                             | Build output includes `/api/webhooks/stripe` for all three apps. Shared handler is exported from `@asym/api/stripe/webhooks`.                                                                                                                                                                                           | Complete |
| Test repo changes before shipping                                        | Local `bun run ci:preflight` passed, pre-push `ci:preflight` passed, and GitHub CI passed for the target commit.                                                                                                                                                                                                        | Complete |
| Verify remote checks, not only local checks                              | GitHub CI run `25616918248` and Nia source check run `25616918269` both succeeded for the target commit.                                                                                                                                                                                                                | Complete |
| Add a permanent production readiness verifier                            | `bun run verify:vercel-production -- --commit <sha>` checks required Vercel Production envs, unreadable sensitive values, READY production deployment metadata, and production `/api/health`.                                                                                                                           | Complete |
| Add a guarded production env sync path                                   | `.github/workflows/sync-vercel-production-env.yml` and `scripts/sync-vercel-production-env.mjs` can sync real GitHub Secrets into all three Vercel Production projects after validating required provider values. Dry-run workflow `25616946268` failed closed because required GitHub secret inputs are still missing. | Complete |
| Document the deployment contract                                         | `docs/ops/environments.md`, `docs/ops/deploy-checklist.md`, and per-app deployment reports document required Production envs, webhook endpoints, branch contract, env sync path, and verification commands.                                                                                                             | Complete |
| Configure all required Vercel Production env values                      | Current verifier reports missing Stripe, Sentry, and Resend values for every app. Supabase/Payload sensitive values are present but unreadable by Vercel CLI.                                                                                                                                                           | Blocked  |
| Ensure `main` contains the current `epic` lineage before production      | `origin/epic` remains substantially ahead of `origin/main`; run `git rev-list --left-right --count origin/main...origin/epic` for the exact current count before release. `main` is stale relative to `epic`.                                                                                                           | Blocked  |
| Ship successful intended Vercel Production deployments                   | Current verifier reports no READY Production deployment for the target commit for `admin`, `donor`, or `missionary`.                                                                                                                                                                                                    | Blocked  |
| Smoke-check production health                                            | Current health checks: `admin` returns `404`, `donor` returns `200` from a stale deployment, and `missionary` returns `404`.                                                                                                                                                                                            | Blocked  |

## Current Blocking Values

These values are missing from Vercel Production for all three projects:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_ENCRYPTION_KEY`

Secret-source checks on 2026-05-10 found:

- Shell environment: all eight values absent.
- Local root `.env.local`: Stripe secret, Stripe publishable key, and public
  Sentry DSN are present but empty; the other five values are absent.
- GitHub repository secrets: `RESEND_API_KEY` exists; Stripe, Sentry,
  `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY` are absent.
- Local secret-manager CLIs checked: `stripe`, `sentry-cli`, `op`, `doppler`,
  and `infisical` are not installed.

Do not deploy with dummy values. The app can be made to build with syntactically
valid placeholders, but that would not be an intended production deployment
because Stripe webhooks, Sentry reporting, and Resend webhook verification would
not work.

## Required Completion Sequence

1. Add real live Stripe values and create live Stripe webhook endpoints for all
   three production URLs.
2. Add real Sentry DSNs for server and browser reporting.
3. Add the missing values as GitHub repository secrets using the exact names
   documented in `docs/ops/environments.md`.
4. Run the `Sync Vercel Production Env` workflow first as a dry-run and then as
   a write. `RESEND_API_KEY` already exists in GitHub secrets, but it is not
   currently in Vercel Production. `RESEND_WEBHOOK_SECRET` must come from the
   Resend webhook configuration, and `RESEND_ENCRYPTION_KEY` must be a managed
   production secret because it protects tenant email API keys.
5. Re-run `bun run verify:vercel-production -- --commit <target-commit>`.
6. Merge current `epic` into `main` only after the verifier no longer reports
   missing Production env values.
7. Wait for Vercel to produce READY Production deployments for all three apps.
8. Re-run the production readiness verifier against the deployed `main` commit
   and complete the smoke checks in `docs/ops/deploy-checklist.md`.
