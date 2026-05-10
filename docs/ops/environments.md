# Environments Operating Guide

## 1. Introduction

This document is the canonical reference for how environments are defined and operated across the Asymmetric.al platform. Production handles real donor data and live Stripe transactions, so strict environment discipline is required for every release and operational action. For companion procedures that are out of scope here, see [docs/ops/rollback-plan.md](./rollback-plan.md) and [docs/ops/deploy-checklist.md](./deploy-checklist.md).

## 2. Four-Environment Matrix

| Property      | Local                                | Preview                  | Staging                                                                                          | Production                       |
| ------------- | ------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| Trigger       | `bun run dev:*`                      | PR opened/pushed         | Push to `develop`                                                                                | PR merged to `main`              |
| URL           | `localhost:3000`                     | `*.vercel.app`           | `staging-admin.asymmetric.al`, `staging-donor.asymmetric.al`, `staging-missionary.asymmetric.al` | `*.asymmetric.al`                |
| Supabase      | `bun run supabase -- start` (Docker) | Shared preview project   | Dedicated staging project                                                                        | Production project               |
| Stripe        | Test-mode                            | Test-mode                | Test-mode                                                                                        | Live-mode                        |
| Sentry        | Optional (DSN may be unset)          | Optional                 | Configured                                                                                       | Configured                       |
| Safe to break | Yes - fully disposable               | Yes - isolated test data | Mostly - recoverable                                                                             | **No - real donors, real money** |
| Seed data     | Local seed script                    | Shared test data         | Demo data (periodically refreshed)                                                               | Real data                        |

## 3. Local Development Setup

For full setup details and troubleshooting, use [README.md](../../README.md). The essential local workflow is:

1. Run `bun run setup` (first run creates `.env.local` with placeholders).
2. Fill in required values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Start local Supabase with `bun run supabase -- start` (Docker; config in [supabase/config.toml](../../supabase/config.toml)).
4. Run one app or all apps:
   - `bun run dev:admin`
   - `bun run dev:donor`
   - `bun run dev:missionary`
   - or `bun run dev` to run all three via Turbo

All other `.env.example` entries (Stripe, Sentry, Cloudinary, Email, PDF, etc.) are optional for local development.

## 4. Preview Environment Setup

Preview deploys for `admin`, `donor`, and `missionary` share one Supabase preview project. Keep it isolated to test-only data.

- Shared preview Supabase URL pattern: `https://<preview-project-ref>.supabase.co` (redacted)
- Data policy: all PR preview environments write to this shared preview database; never use production data

### 4.1 Preview env vars (scope: Preview only)

Set the following values in Vercel **Preview** scope for all three projects:

| Variable                             | Value / Source                           | Notes                                       |
| ------------------------------------ | ---------------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Shared preview Supabase URL              | `https://<preview-project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Shared preview Supabase anon key         | Supabase dashboard                          |
| `SUPABASE_SERVICE_ROLE_KEY`          | Shared preview Supabase service role key | Supabase dashboard (server only)            |
| `STRIPE_SECRET_KEY`                  | `sk_test_...`                            | Stripe test-mode secret key                 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...`                            | Stripe test-mode publishable key            |
| `NEXT_PUBLIC_APP_URL`                | `https://$VERCEL_URL`                    | Uses Vercel system variable                 |
| `NEXT_PUBLIC_SENTRY_DSN`             | Preview Sentry DSN                       | Optional in preview                         |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  | Preview/shared Cloudinary cloud name     | Non-secret identifier                       |

`STRIPE_WEBHOOK_SECRET` is intentionally not set for preview. Preview URLs are ephemeral and do not receive Stripe webhooks; `@asym/env` allows this variable to be omitted when `VERCEL_ENV === "preview"`.

### 4.2 `turbo-ignore` ignored build step

In each Vercel project (`Settings -> General -> Ignored Build Step`), configure:

| Vercel project | Ignored Build Step command              |
| -------------- | --------------------------------------- |
| `admin`        | `npx turbo-ignore @asym/admin`          |
| `donor`        | `npx turbo-ignore @asym/donor`          |
| `missionary`   | `npx turbo-ignore @asym/missionary-app` |

This skips preview builds when the PR does not touch files relevant to that app or its workspace dependencies.

## 5. Staging Environment Setup (`develop`)

Staging is branch-bound to `develop` using Vercel Custom Environments and remains isolated from both preview and production infrastructure.

### 5.1 Canonical staging URLs

| App        | Vercel project | Staging URL                                |
| ---------- | -------------- | ------------------------------------------ |
| Admin      | `admin`        | `https://staging-admin.asymmetric.al`      |
| Donor      | `donor`        | `https://staging-donor.asymmetric.al`      |
| Missionary | `missionary`   | `https://staging-missionary.asymmetric.al` |

### 5.2 Staging Supabase project

Create one dedicated staging Supabase project (recommended name: `asym-staging`) and record:

- `project ref` (used by CLI commands)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Apply schema + seed to staging:

```bash
npx supabase db push --project-ref <staging-project-ref>
npx supabase db execute --project-ref <staging-project-ref> --file supabase/seed.sql
```

After applying migrations and seed, verify data writes from staging URLs land in this project only (never production).

### 5.3 Vercel `staging` custom environment (all 3 projects)

For each Vercel project (`admin`, `donor`, `missionary`):

1. Create custom environment `staging`.
2. Assign branch `develop` to `staging`.
3. Set variables in **staging scope only** (not Preview/Production):

| Variable                             |
| ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      |
| `SUPABASE_SERVICE_ROLE_KEY`          |
| `STRIPE_SECRET_KEY`                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `STRIPE_WEBHOOK_SECRET`              |
| `NEXT_PUBLIC_APP_URL`                |
| `SENTRY_DSN`                         |
| `NEXT_PUBLIC_SENTRY_DSN`             |
| `RESEND_API_KEY`                     |
| `RESEND_WEBHOOK_SECRET`              |
| `RESEND_ENCRYPTION_KEY`              |
| `CLOUDINARY_CLOUD_NAME`              |
| `CLOUDINARY_API_KEY`                 |
| `CLOUDINARY_API_SECRET`              |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  |

Trigger staging deploys by pushing to `develop`.

### 5.4 DNS + domains

Assign these domains to each project's `staging` environment and point DNS CNAME records to Vercel:

- `staging-admin.asymmetric.al` -> `admin`
- `staging-donor.asymmetric.al` -> `donor`
- `staging-missionary.asymmetric.al` -> `missionary`

### 5.5 Stripe webhooks (test mode)

Use Stripe test-mode endpoints per staging app:

| App        | Endpoint URL                                                   |
| ---------- | -------------------------------------------------------------- |
| Admin      | `https://staging-admin.asymmetric.al/api/webhooks/stripe`      |
| Donor      | `https://staging-donor.asymmetric.al/api/webhooks/stripe`      |
| Missionary | `https://staging-missionary.asymmetric.al/api/webhooks/stripe` |

After creating each endpoint, copy its signing secret into that app's `STRIPE_WEBHOOK_SECRET` in Vercel `staging` scope, then redeploy.

### 5.6 Staging sync policy and Inngest note

- Staging deploy trigger: push to `develop`.
- Production deploy trigger: merge to `main`.
- To refresh staging parity ahead of QA/demo cycles, perform best-effort sync from `main` into `develop` (merge or cherry-pick).
- Inngest staging is not integrated yet and remains a future placeholder.

## 5.7 Production Vercel requirements

Production deploys are branch-bound to `main`. Each app-level `vercel.json`
allows `main` and `develop` deployments and keeps legacy `epic` deployments
disabled.

Migration note: GitHub may still report `epic` as the default branch during the
production-branch migration. Do not deploy from `main` until `main` contains the
current `epic` lineage, and do not re-enable `epic` deployments unless the
release owner explicitly reverses the `main` production-branch contract.

Set these Vercel variables in the **Production** scope before deploying:

| Variable                             | Admin | Donor | Missionary | Notes                                                   |
| ------------------------------------ | ----- | ----- | ---------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Yes   | Yes   | Yes        | Production Supabase project URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Yes   | Yes   | Yes        | Client-safe production key                              |
| `SUPABASE_SERVICE_ROLE_KEY`          | Yes   | Yes   | Yes        | Server-only production key                              |
| `STRIPE_SECRET_KEY`                  | Yes   | Yes   | Yes        | Live-mode key; use `sk_live_...` in production          |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes   | Yes   | Yes        | Live-mode publishable key; use `pk_live_...`            |
| `STRIPE_WEBHOOK_SECRET`              | Yes   | Yes   | Yes        | Signing secret for the app-specific production endpoint |
| `SENTRY_DSN`                         | Yes   | Yes   | Yes        | Required by protected deployment env validation         |
| `NEXT_PUBLIC_SENTRY_DSN`             | Yes   | Yes   | Yes        | Public client DSN when browser reporting is enabled     |
| `RESEND_API_KEY`                     | Yes   | Yes   | Yes        | Production Resend API key; use `re_...`                 |
| `RESEND_WEBHOOK_SECRET`              | Yes   | Yes   | Yes        | Production Resend webhook signing secret                |
| `RESEND_ENCRYPTION_KEY`              | Yes   | Yes   | Yes        | At least 32 characters; protects tenant email secrets   |
| `NEXT_PUBLIC_APP_URL`                | Yes   | Yes   | Yes        | App canonical origin                                    |
| `NEXT_PUBLIC_SITE_URL`               | Yes   | Yes   | Yes        | Same origin as the app unless a split site exists       |
| `NEXT_PUBLIC_MAIN_DOMAIN`            | Yes   | Yes   | Yes        | `asymmetric.al`                                         |
| `PAYLOAD_SECRET`                     | Yes   | No    | No         | Required by admin Web Studio outside local/test         |
| `PAYLOAD_DATABASE_URI`               | Yes   | No    | No         | Prefer Supavisor session pooler for Vercel              |
| `NEXT_PUBLIC_DONOR_URL`              | Yes   | No    | No         | `https://donor.asymmetric.al` for Web Studio previews   |
| `DONOR_APP_URL`                      | Yes   | No    | No         | Server-side donor origin for Web Studio previews        |

Production Stripe webhook endpoints:

| App        | Endpoint URL                                           |
| ---------- | ------------------------------------------------------ |
| Admin      | `https://admin.asymmetric.al/api/webhooks/stripe`      |
| Donor      | `https://donor.asymmetric.al/api/webhooks/stripe`      |
| Missionary | `https://missionary.asymmetric.al/api/webhooks/stripe` |

Configure each endpoint for at least these live-mode events:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.processing`
- `charge.refunded`

After creating each endpoint, copy its signing secret into that app's
`STRIPE_WEBHOOK_SECRET` in Vercel Production scope, then redeploy.

Verify production readiness without printing secret values:

```bash
bun run verify:vercel-production -- --commit <sha>
```

The verifier checks each Vercel project for required Production env names,
validates prefix/URL/length requirements for values Vercel exposes through
`vercel env pull` without printing secrets, reports sensitive values that are
present but unreadable by the CLI, confirms a READY Production deployment for
the target commit, and checks `/api/health` on the production domain.

## 6. Deploy Flows

Non-local environments are branch-triggered and map to deploy targets as follows:

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant PR as PullRequest
    participant Develop as developBranch
    participant Main as mainBranch
    participant Vercel as Vercel

    Dev->>PR: Open PR (feature branch)
    PR->>Vercel: Preview deploy (*.vercel.app)
    Note over Vercel: Preview Supabase project

    PR->>Main: Merge PR to main (production)
    Main->>Vercel: Production deploy (*.asymmetric.al)
    Note over Vercel: Production Supabase project

    Note over Main,Develop: Optional best-effort sync for QA/demos
    Main->>Develop: Merge/cherry-pick (best effort)
    Develop->>Vercel: Staging deploy (staging-*.asymmetric.al)
    Note over Vercel: Staging Supabase project
```

`develop` may drift from `main`; best-effort sync is performed before QA/demo cycles. Direct-to-`main` PRs remain the primary workflow.

## 7. Playwright `baseURL` Configuration

E2E tests can target different environments using `PLAYWRIGHT_BASE_URL`, configured in [playwright.config.ts](../../playwright.config.ts). In CI, set `PLAYWRIGHT_BASE_URL` to a preview or staging URL to run tests against deployed infrastructure instead of localhost.

## 8. Credential Rotation Schedule

| Environment | Service            | Frequency                 | How                                                                        |
| ----------- | ------------------ | ------------------------- | -------------------------------------------------------------------------- |
| Preview     | Supabase           | Quarterly                 | Regenerate in Supabase dashboard -> update Vercel env vars (preview scope) |
| Preview     | Stripe             | Quarterly                 | Roll test-mode keys in Stripe dashboard -> update Vercel env vars          |
| Preview     | Sentry             | Quarterly                 | Regenerate DSN -> update Vercel env vars                                   |
| Staging     | All services       | Quarterly                 | Same process, staging scope                                                |
| Production  | Supabase           | Quarterly + on compromise | Same process, production scope. Coordinate with team.                      |
| Production  | Stripe             | Quarterly + on compromise | Rolling live keys causes brief webhook verification downtime               |
| Production  | Sentry, Cloudinary | Quarterly + on compromise | Same process                                                               |
| Production  | Email, PDF         | Quarterly + on compromise | Rotate in respective service dashboards -> update Vercel env vars          |

Every rotation window must cover all six services: Supabase, Stripe, Sentry, Cloudinary, Email, and PDF generation services such as DocRaptor when configured.

## 9. If an Environment Is Compromised

1. **Immediately rotate** all credentials for the affected environment in each service dashboard, following the schedule above.
2. **Update Vercel environment variables** for the affected scope (preview/staging/production) across all three projects: `admin`, `donor`, and `missionary`.
3. **Redeploy** all three apps so new credentials are loaded.
4. **For production compromises**, coordinate with the full team before rotating Stripe live keys (brief webhook downtime expected), and notify affected users if any data was exposed.
5. **Audit access logs** in Supabase, Stripe, and Sentry for the affected incident window.
6. **Document the incident** in a post-mortem.

## 10. Related Documents

See also:

- [docs/ops/rollback-plan.md](./rollback-plan.md) - code and database rollback procedures (T5)
- [docs/ops/deploy-checklist.md](./deploy-checklist.md) - pre-deploy, deploy, and post-deploy smoke tests (T6)
- [README.md](../../README.md) - full local quickstart and monorepo workspace contract
- [supabase/config.toml](../../supabase/config.toml) - local Supabase configuration
