# Production Deployment Completion Audit

Generated: 2026-05-10 Asia/Bangkok

## Status

The production deployment goal is not complete. Repo-side remediation is merged
to remote `epic` and verified through commit
`75f407526473e263dd8057adfcbbff282ac13052`, but the intended Vercel
Production deployments for `admin`, `donor`, and `missionary` are still blocked
by missing live Stripe and Sentry provider values and absent READY production
deployments for the current target commit.

Live Vercel project settings currently report `productionBranch: epic` for all
three projects. The repo-side branch-gating conflict that disabled `epic` in
each app-level `vercel.json` has been removed, and the readiness verifier now
checks this condition explicitly.

## Objective Checklist

| Requirement                                                              | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Status   |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Use the latest deployment reports for `admin`, `donor`, and `missionary` | Per-app reports exist in this directory and include Vercel project facts, deployment facts, missing envs, branch wiring, and evidence commands.                                                                                                                                                                                                                                                                                                                                                                                        | Complete |
| Fix repo-side production deployment wiring                               | Live Vercel project settings use `epic` as the Production Branch. `apps/admin/vercel.json`, `apps/donor/vercel.json`, and `apps/missionary/vercel.json` no longer disable `epic`.                                                                                                                                                                                                                                                                                                                                                      | Complete |
| Add missing production Stripe webhook routes                             | Build output includes `/api/webhooks/stripe` for all three apps. Shared handler is exported from `@asym/api/stripe/webhooks`.                                                                                                                                                                                                                                                                                                                                                                                                          | Complete |
| Test repo changes before shipping                                        | Local `bun run ci:preflight` passed, pre-push `ci:preflight` passed, targeted unit coverage passed, and GitHub CI passed for the target commit.                                                                                                                                                                                                                                                                                                                                                                                        | Complete |
| Verify remote checks, not only local checks                              | GitHub CI run `25618974104` and Nia source check run `25618974105` succeeded for commit `75f407526473e263dd8057adfcbbff282ac13052`. Targeted `Sync Vercel Production Env` dry-run/write workflows succeeded for `RESEND_API_KEY` and `RESEND_ENCRYPTION_KEY`; targeted `Configure Resend Production Webhook` dry-run/write workflows succeeded for `RESEND_WEBHOOK_SECRET`; full `Sync Vercel Production Env` dry-run `25618854696` now fails only on the missing Stripe/Sentry inputs and no longer requires `RESEND_WEBHOOK_SECRET`. | Complete |
| Add a permanent production readiness verifier                            | `bun run verify:vercel-production -- --commit <sha>` checks required Vercel Production envs, unreadable sensitive values, live Vercel Production Branch compatibility with app-level `vercel.json`, READY production deployment metadata, and production `/api/health`.                                                                                                                                                                                                                                                                | Complete |
| Add a guarded production env sync path                                   | `.github/workflows/sync-vercel-production-env.yml` and `scripts/sync-vercel-production-env.mjs` can sync real GitHub Secrets into all three Vercel Production projects after validating required provider values. `RESEND_API_KEY` dry-run `25617820225`/write `25617834101` succeeded; `RESEND_ENCRYPTION_KEY` dry-run `25618145516`/write `25618153850` succeeded. `RESEND_WEBHOOK_SECRET` remains supported only for the targeted Resend workflow handoff.                                                                          | Complete |
| Add a guarded Resend webhook configuration path                          | `.github/workflows/configure-resend-production-webhook.yml` and `scripts/configure-resend-production-webhook.mjs` created Resend webhook `52e90eb0-21e3-422e-8683-974629cd1517`, masked the returned signing secret, and synced `RESEND_WEBHOOK_SECRET` into all three Vercel Production projects. Unit coverage exists in `tests/unit/scripts/configure-resend-production-webhook.test.ts`.                                                                                                                                           | Complete |
| Document the deployment contract                                         | `docs/ops/environments.md`, `docs/ops/deploy-checklist.md`, and per-app deployment reports document required Production envs, webhook endpoints, branch contract, env sync path, and verification commands.                                                                                                                                                                                                                                                                                                                            | Complete |
| Configure all required Vercel Production env values                      | Current verifier reports missing Stripe and Sentry values for every app. Supabase/Payload, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY` sensitive values are present but unreadable by Vercel CLI.                                                                                                                                                                                                                                                                                                           | Blocked  |
| Ensure the release branch matches Vercel Production Branch               | Live Vercel project settings currently use `epic`, and GitHub's default branch is `epic`. If Production is later migrated to `main`, update the Vercel project settings and docs first.                                                                                                                                                                                                                                                                                                                                                | Complete |
| Prove Vercel now attempts Production builds from the release branch      | After the branch-gating fix reached `epic`, Vercel created Production builds for all three projects from commit `81d718335ab6afc5988e05a84eaeca1e77f27fd5` and again from current commit `75f407526473e263dd8057adfcbbff282ac13052`. Those builds failed on missing provider envs rather than branch filtering or missing root directories.                                                                                                                                                                                            | Complete |
| Ship successful intended Vercel Production deployments                   | Current verifier reports no READY Production deployment for the target commit for `admin`, `donor`, or `missionary`. The latest attempts are `admin-rgqw7c347-asymmetric-al.vercel.app`, `donor-92jxb801i-asymmetric-al.vercel.app`, and `missionary-3sdb69962-asymmetric-al.vercel.app`, all `ERROR` for commit `75f407526473e263dd8057adfcbbff282ac13052`.                                                                                                                                                                           | Blocked  |
| Smoke-check production health                                            | Current health checks: `admin` returns `404`, `donor` returns `200` from a stale deployment, and `missionary` returns `404`.                                                                                                                                                                                                                                                                                                                                                                                                           | Blocked  |

## Current Blocking Values

These values are missing from Vercel Production for all three projects:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Secret-source checks on 2026-05-10 found:

- Shell environment: the remaining five provider values are absent.
- Local root `.env.local`: Stripe secret, Stripe publishable key, and public
  Sentry DSN are present but empty; Stripe webhook, server Sentry DSN,
  `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY` are
  absent.
- Vercel Preview and Development env scopes: empty for all three projects, so
  there are no lower-environment Vercel provider values to promote.
- GitHub repository secrets: `RESEND_API_KEY` exists and was synced to Vercel
  Production by workflow run `25617834101`; Stripe and Sentry are absent.
  `RESEND_WEBHOOK_SECRET` is derived from Resend during the guarded workflow and
  is intentionally not stored as a GitHub repository secret.
- `RESEND_ENCRYPTION_KEY` was generated as a new managed production secret,
  stored in GitHub Secrets, and synced to all three Vercel Production projects.
  The pre-check found `tenant_email_settings` unavailable through the production
  REST API and zero tenant Stripe credentials, so there was no existing
  encrypted Resend tenant key material to rotate.
- `Configure Resend Production Webhook` dry-run `25618472678` confirmed the
  endpoint would be created, and write run `25618482475` created Resend webhook
  `52e90eb0-21e3-422e-8683-974629cd1517`, masked its signing secret, and synced
  `RESEND_WEBHOOK_SECRET` into all three Vercel Production projects.
- `Sync Vercel Production Env` dry-run `25618854696` now fails only on missing
  Stripe/Sentry inputs: `ADMIN_STRIPE_WEBHOOK_SECRET`,
  `DONOR_STRIPE_WEBHOOK_SECRET`, `MISSIONARY_STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SENTRY_DSN`,
  and `STRIPE_SECRET_KEY`. It no longer requires `RESEND_WEBHOOK_SECRET` in the
  default full sync path.
- Vercel Production env scope: `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and
  `RESEND_ENCRYPTION_KEY` are now present for all three projects as sensitive
  values, so the CLI can confirm the names exist but cannot read or print the
  values.
- Vercel integration resources: none connected under the `asymmetric-al` scope.
- Local secret-manager CLIs checked: `stripe`, `sentry-cli`, `op`, `doppler`,
  and `infisical` are not installed.
- Re-check at 2026-05-10 10:53 +07: GitHub repository secrets still lack
  `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `ADMIN_STRIPE_WEBHOOK_SECRET`, `DONOR_STRIPE_WEBHOOK_SECRET`,
  `MISSIONARY_STRIPE_WEBHOOK_SECRET`, `SENTRY_DSN`, and
  `NEXT_PUBLIC_SENTRY_DSN`; `RESEND_API_KEY`, `RESEND_ENCRYPTION_KEY`, and
  `VERCEL_TOKEN` remain present.

## Current Deployment Audit Refresh

Re-run on 2026-05-10 10:53 +07:

```bash
bun run verify:vercel-production -- --commit 75f4075264
```

Result: `Overall: BLOCKED (admin, donor, missionary)`.

Latest Production deployments for the current commit:

| App        | Deployment URL                                  | State | Commit                                     | Health                                                                |
| ---------- | ----------------------------------------------- | ----- | ------------------------------------------ | --------------------------------------------------------------------- |
| Admin      | `admin-rgqw7c347-asymmetric-al.vercel.app`      | ERROR | `75f407526473e263dd8057adfcbbff282ac13052` | `https://admin.asymmetric.al/api/health` -> 404                       |
| Donor      | `donor-92jxb801i-asymmetric-al.vercel.app`      | ERROR | `75f407526473e263dd8057adfcbbff282ac13052` | `https://donor.asymmetric.al/api/health` -> 200 from stale deployment |
| Missionary | `missionary-3sdb69962-asymmetric-al.vercel.app` | ERROR | `75f407526473e263dd8057adfcbbff282ac13052` | `https://missionary.asymmetric.al/api/health` -> 404                  |

Do not deploy with dummy values. The app can be made to build with syntactically
valid placeholders, but that would not be an intended production deployment
because Stripe webhooks and Sentry reporting would not work.

## Required Completion Sequence

1. Add real live Stripe values and create live Stripe webhook endpoints for all
   three production URLs.
2. Add real Sentry DSNs for server and browser reporting.
3. Add the missing Stripe and Sentry values as GitHub repository secrets using
   the exact names documented in `docs/ops/environments.md`: `STRIPE_SECRET_KEY`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `ADMIN_STRIPE_WEBHOOK_SECRET`,
   `DONOR_STRIPE_WEBHOOK_SECRET`, `MISSIONARY_STRIPE_WEBHOOK_SECRET`,
   `SENTRY_DSN`, and `NEXT_PUBLIC_SENTRY_DSN`.
4. Run the `Sync Vercel Production Env` workflow first as a dry-run and then as
   a write. `RESEND_API_KEY` and `RESEND_ENCRYPTION_KEY` have already been
   backfilled into Vercel Production, and `RESEND_WEBHOOK_SECRET` has been
   sourced from Resend and synced to Vercel Production, but that does not make
   Production deployable until the remaining provider values exist.
5. Re-run `bun run verify:vercel-production -- --commit <target-commit>`.
6. Push or merge the approved release commit to `epic`, the current Vercel
   Production Branch.
7. Wait for Vercel to produce READY Production deployments for all three apps.
8. Re-run the production readiness verifier against the deployed `epic` commit
   and complete the smoke checks in `docs/ops/deploy-checklist.md`.
