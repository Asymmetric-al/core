# Environments Operating Guide

## 1. Introduction

This document is the canonical reference for how environments are defined and operated across the Asymmetric.al platform. Production handles real donor data and live Stripe transactions, so strict environment discipline is required for every release and operational action. For companion procedures that are out of scope here, see [docs/ops/rollback-plan.md](./rollback-plan.md) and [docs/ops/deploy-checklist.md](./deploy-checklist.md).

## 2. Four-Environment Matrix

| Property      | Local                       | Preview                  | Staging                             | Production                       |
| ------------- | --------------------------- | ------------------------ | ----------------------------------- | -------------------------------- |
| Trigger       | `bun run dev:*`             | PR opened/pushed         | Push to `develop`                   | PR merged to `epic`              |
| URL           | `localhost:3000`            | `*.vercel.app`           | `staging-<app>.asymmetric.al` (TBD) | `*.asymmetric.al`                |
| Supabase      | `supabase start` (Docker)   | Shared preview project   | Dedicated staging project           | Production project               |
| Stripe        | Test-mode                   | Test-mode                | Test-mode                           | Live-mode                        |
| Sentry        | Optional (DSN may be unset) | Optional                 | Configured                          | Configured                       |
| Safe to break | Yes - fully disposable      | Yes - isolated test data | Mostly - recoverable                | **No - real donors, real money** |
| Seed data     | Local seed script           | Shared test data         | Demo data (periodically refreshed)  | Real data                        |

## 3. Local Development Setup

For full setup details and troubleshooting, use [README.md](../../README.md). The essential local workflow is:

1. Run `bun run setup` (first run creates `.env.local` with placeholders).
2. Fill in required values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Start local Supabase with `supabase start` (Docker; config in [supabase/config.toml](../../supabase/config.toml)).
4. Run one app or all apps:
   - `bun run dev:admin`
   - `bun run dev:donor`
   - `bun run dev:missionary`
   - or `bun run dev` to run all three via Turbo

All other `.env.example` entries (Stripe, Sentry, Cloudinary, Email, PDF, etc.) are optional for local development.

## 4. Deploy Flows

Non-local environments are branch-triggered and map to deploy targets as follows:

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant PR as PullRequest
    participant Develop as developBranch
    participant Epic as epicBranch
    participant Vercel as Vercel

    Dev->>PR: Open PR (feature branch)
    PR->>Vercel: Preview deploy (*.vercel.app)
    Note over Vercel: Preview Supabase project

    PR->>Epic: Merge PR to epic (production)
    Epic->>Vercel: Production deploy (*.asymmetric.al)
    Note over Vercel: Production Supabase project

    Note over Epic,Develop: Optional best-effort sync for QA/demos
    Epic->>Develop: Merge/cherry-pick (best effort)
    Develop->>Vercel: Staging deploy (staging domain TBD)
    Note over Vercel: Staging Supabase project
```

`develop` may drift from `epic`; best-effort sync is performed before QA/demo cycles. Direct-to-`epic` PRs remain the primary workflow.

## 5. Playwright `baseURL` Configuration

E2E tests can target different environments using `PLAYWRIGHT_BASE_URL`, configured in [playwright.config.ts](../../playwright.config.ts). In CI, set `PLAYWRIGHT_BASE_URL` to a preview or staging URL to run tests against deployed infrastructure instead of localhost.

## 6. Credential Rotation Schedule

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

Every rotation window must cover all six services: Supabase, Stripe, Sentry, Cloudinary, Email, and PDF.

## 7. If an Environment Is Compromised

1. **Immediately rotate** all credentials for the affected environment in each service dashboard, following the schedule above.
2. **Update Vercel environment variables** for the affected scope (preview/staging/production) across all three projects: `asym-admin`, `asym-donor`, and `asym-missionary`.
3. **Redeploy** all three apps so new credentials are loaded.
4. **For production compromises**, coordinate with the full team before rotating Stripe live keys (brief webhook downtime expected), and notify affected users if any data was exposed.
5. **Audit access logs** in Supabase, Stripe, and Sentry for the affected incident window.
6. **Document the incident** in a post-mortem.

## 8. Related Documents

See also:

- [docs/ops/rollback-plan.md](./rollback-plan.md) - code and database rollback procedures (T5)
- [docs/ops/deploy-checklist.md](./deploy-checklist.md) - pre-deploy, deploy, and post-deploy smoke tests (T6)
- [README.md](../../README.md) - full local quickstart and monorepo workspace contract
- [supabase/config.toml](../../supabase/config.toml) - local Supabase configuration
