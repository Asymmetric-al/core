# Environments Operating Guide

## 1. Introduction

This document is the canonical reference for how environments are defined and operated across the Asymmetric.al platform. Production is where real donor data and live Stripe transactions will live, so strict environment discipline is required for every release and operational action. Today neither hosted Supabase project holds real donor data: the [database census](../audits/core-crm-cms-database-census.md) of 17 November 2026 found demo data, test personas and a few team members' logins in both, and the owner has classed all of it as fixtures (decision D-15 in the [implementation record](../audits/core-crm-cms-database-implementation-record.md)). For companion procedures that are out of scope here, see [production release controls](./production-release.md) and the [deploy checklist](./deploy-checklist.md). Each deployment needs its own reviewed rollback/forward-fix plan; this repository does not supply a universal database rollback procedure.

> **Tenant-owned domains (2026-11-24).** Under the owner's decision of 21 November 2026 (OpenSpec change `adopt-tenant-owned-domains`), the `asymmetric.al` hosts below serve only Asym's operations checks and Asym's own demonstration organization, never a tenant. Every tenant is served on names it owns, and release checks will also run through a test tenant domain (package N8).

## 2. Four-Environment Matrix

| Property      | Local                                | Preview                                                               | Development                                                                                                  | Production                                           |
| ------------- | ------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Trigger       | `bun run dev:*`                      | Disabled by default                                                   | Explicit checkpoint; merges to `develop` do not deploy                                                       | `bun run release:production` to `production`         |
| URL           | `localhost:3000`                     | `*.vercel.app`                                                        | `development-admin.asymmetric.al`, `development-donor.asymmetric.al`, `development-missionary.asymmetric.al` | `*.asymmetric.al`                                    |
| Supabase      | `bun run supabase -- start` (Docker) | Development; a migration PR's preview path is not set up (note below) | Development project; shared with ordinary previews and, until WP11, Production                               | Rebuilt development project until WP11; no live data |
| Stripe        | Test-mode                            | Test-mode                                                             | Test-mode                                                                                                    | Test mode until live cutover                         |
| Sentry        | Optional (DSN may be unset)          | Optional                                                              | Configured                                                                                                   | Configured                                           |
| Safe to break | Yes - fully disposable               | No blanket reset - shares development; no migration previews (below)  | No blanket reset: until WP11 the production domains read this database                                       | No: public production domains serve this build       |
| Seed data     | Local seed script                    | Shared test data                                                      | Demo data (periodically refreshed)                                                                           | Disposable development demo data until WP11          |

Since the first [production release](./release-job.md#switching-it-on) on 22 November 2026, Production and ordinary QA previews use the rebuilt development project. Keep live data out until WP11. There are no automatic Git previews. An eligible pull request without migrations can get an ordinary preview through the label-gated QA workflow. A migration pull request gets none: its separate rebuild needs the GitHub environment `release-preview`, and its later deployments also need the Vercel custom environment `preview-database`. Neither is configured (section 4).

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

A pull request does not get a Preview deployment automatically: Git deployments are off (`apps/*/vercel.json`). For an eligible pull request without a migration, the label-gated QA smoke workflow (label `qa:smoke`) can deploy `admin`, `donor` and `missionary` previews that read the development project. A pull request that carries a migration gets no such deployment today. The workflow's separate `preview-database` job would rebuild the disposable `preview` project, `btewedpsxwsjczvmegby` (the production-named project until WP11; [release job](./release-job.md), step 8), as soon as the GitHub environment `release-preview` existed with its release secrets: the rebuild is its first hosted step and does not look at Vercel. Only its later steps, the preview deployments that read that project, need a `preview-database` custom Vercel environment. Neither exists: a second custom environment costs money, and it was not created (D-38). Creating `release-preview` alone would allow the rebuild, not a preview deployment; it is not needed for production releases. Keep both projects to test-only data.

- Ordinary Vercel Preview scope: use the development project, `https://pnmlrbgjiqzzsthsoikm.supabase.co`, and its matching keys.
- Migration PRs only, once step 8 is enabled: the `preview-database` job would reset the disposable project (for which the GitHub environment `release-preview` is enough), and its preview deploys would use the separate `preview-database` custom Vercel environment and that project's URL and keys, not ordinary Preview scope. Until then a migration PR gets no preview.
- Data policy: ordinary PR previews write to development, and migration previews, once enabled, to the preview project; never use production data

### 4.1 Preview env vars (scope: Preview only)

Set the following values in Vercel **Preview** scope for all three projects:

| Variable                             | Value / Source                        | Notes                                      |
| ------------------------------------ | ------------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`           | Development Supabase URL              | `https://pnmlrbgjiqzzsthsoikm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Development Supabase anon key         | Supabase dashboard                         |
| `SUPABASE_SERVICE_ROLE_KEY`          | Development Supabase service role key | Supabase dashboard (server only)           |
| `STRIPE_SECRET_KEY`                  | `sk_test_...`                         | Stripe test-mode secret key                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...`                         | Stripe test-mode publishable key           |
| `NEXT_PUBLIC_APP_URL`                | `https://$VERCEL_URL`                 | Uses Vercel system variable                |
| `NEXT_PUBLIC_SENTRY_DSN`             | Preview Sentry DSN                    | Optional in preview                        |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  | Preview/shared Cloudinary cloud name  | Non-secret identifier                      |

`STRIPE_WEBHOOK_SECRET` is intentionally not set for preview. Preview URLs are ephemeral and do not receive Stripe webhooks; `@asym/env` allows this variable to be omitted when `VERCEL_ENV === "preview"`. `STRIPE_CONNECT_WEBHOOK_SECRET` is likewise unset in local and preview environments; while unset, `apps/admin` `/api/webhooks/stripe-connect` answers `503` without touching the database. The connected-accounts endpoint is a Stripe event destination on the platform's own account ("Events from: Your account"), payload style **thin**, subscribed to the Accounts v2 account events `v2.core.account.created`, `v2.core.account.updated`, `v2.core.account.closed`, `v2.core.account[requirements].updated` and `v2.core.account[configuration.merchant].capability_status_updated`; `STRIPE_CONNECT_WEBHOOK_SECRET` is that destination's own signing secret. A thin event names the account but carries no state, so the endpoint reads the account from Stripe with `STRIPE_SECRET_KEY` before it changes a binding. In this program that key must be a test key (`sk_test_` or `rk_test_`): onboarding and the endpoint refuse a live key.

### 4.2 Layered monorepo build controls

The three Core Vercel projects use four build-control layers to contain Build
CPU and on-demand deployment waste without changing runtime behavior or the
production release branch.

1. **Vercel affected-project deployments:** preferred first layer because
   Vercel can skip unchanged monorepo projects before they occupy build slots.
2. **Repo `ignoreCommand`:** source-controlled fallback for docs-only,
   evidence-only, tests-only, OpenSpec-only, and other non-runtime changes.
3. **Root Turbo build commands:** app-scoped Vercel builds execute from the
   monorepo root so Turbo can reuse the workspace graph and remote cache.
4. **Verifier:** `bun run verify:vercel-build-controls` checks live Vercel
   settings, Vercel Remote Cache status, app `vercel.json` controls, `.turbo`
   ignore posture, and the local ignored-build decision matrix.

Vercel affected-project deployments are enabled on the three Core app projects:

| Vercel project | Project ID                         | App root          |
| -------------- | ---------------------------------- | ----------------- |
| `admin`        | `prj_SB9DucsrJOT0wF1v43SWMFsSNdn8` | `apps/admin`      |
| `donor`        | `prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL` | `apps/donor`      |
| `missionary`   | `prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN` | `apps/missionary` |

Verify the Vercel-side gate without printing secrets:

```bash
bun run verify:vercel-affected-projects
```

Run the complete build-control verifier before and after deployment-control
changes:

```bash
bun run verify:vercel-build-controls
```

Enable or repair the setting for all three projects:

```bash
bun run ops:vercel-enable-affected-projects
```

The enable command captures a sanitized `/tmp/asym-vercel-affected-projects-*`
snapshot before mutating Vercel, patches only
`enableAffectedProjectsDeployments: true`, then re-reads the three projects.
This affected-project operation does not change branch gates, build queue
behavior, or deployment source; those controls are adjacent deployment
discipline settings and remain outside this phase.

Each Vercel app also owns its install, build, and ignored-build commands in
`apps/*/vercel.json`. Those files must **omit** `bunVersion`: that key selects
the [Bun Functions runtime](https://vercel.com/docs/functions/runtimes/bun)
(`"1.4.x"` or `"1.x"`), not the package manager. These projects stay on the
Next.js + Node 24.x Functions runtime.

| Vercel project | `installCommand`                                       | `buildCommand`                         | `ignoreCommand`                                                |
| -------------- | ------------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------- |
| `admin`        | `bunx bun@1.4.3 install --cwd ../.. --frozen-lockfile` | `cd ../.. && bun run build:admin`      | `node ../../scripts/vercel/should-ignore-build.mjs admin`      |
| `donor`        | `bunx bun@1.4.3 install --cwd ../.. --frozen-lockfile` | `cd ../.. && bun run build:donor`      | `node ../../scripts/vercel/should-ignore-build.mjs donor`      |
| `missionary`   | `bunx bun@1.4.3 install --cwd ../.. --frozen-lockfile` | `cd ../.. && bun run build:missionary` | `node ../../scripts/vercel/should-ignore-build.mjs missionary` |

Vercel runs `ignoreCommand` from the app root. The helper returns `0` to skip
the build and `1` to continue the build, matching Vercel's ignored-build
contract. It intentionally fails closed: an unknown app name, first commit,
missing diff, empty diff, or Git diff failure continues the build instead of
skipping it.

Current affected-project scope:

- `apps/admin/**`, `apps/donor/**`, or `apps/missionary/**` builds only the
  matching app.
- Shared runtime/build inputs can still build all three apps, including `packages/**`,
  `tooling/**`, `scripts/vercel/**`, `scripts/resolve-monorepo-root.mjs`,
  `package.json`, lockfiles, `turbo.json`, root TypeScript/build config files,
  and `.vercelignore`.
- Docs, phase evidence, tests, OpenSpec-only text, GitHub workflow-only changes,
  and other non-runtime files should be skipped by Vercel's affected-project
  gate before a build slot is occupied; the ignored-build command remains the
  fallback layer.
- Vercel build queue behavior should be `WAIT_FOR_NAMESPACE_QUEUE` on all three
  projects so bursts serialize at the namespace queue instead of fanning out
  avoidable concurrent builds.
- `.turbo` remains ignored in Git and Vercel upload inputs. Do not commit
  `.turbo/config.json`; Vercel Remote Cache plus `TURBO_TOKEN` / `TURBO_TEAM`
  remains the shared cache path for Vercel and CI.

Local decision checks can import the helper directly:

```bash
node -e "import('./scripts/vercel/should-ignore-build.mjs').then(({resolveBuildDecision}) => console.log(resolveBuildDecision({app: 'admin', changedFiles: ['docs/ops/environments.md']})))"
```

Each app also keeps source-controlled Git deployment branch gates in
`apps/*/vercel.json`:

- `production`: disabled; a release goes through `bun run release:production` and the release job
- `develop`: disabled; development hosts refresh only at explicit checkpoints
- `main`: deny-only legacy name; no canonical branch exists
- all other branches: no Git deployment creation because `"*": false` closes
  the default auto-deploy path

The local release guard blocks accidental direct pushes to `production`; use
`bun run release:production` for production.

Track deploy-related spend with `vercel usage` and the Vercel Usage dashboard. The Release workflow asks Vercel to build the exact Git source for each selected project, checks the staged deployment, then promotes the same id without rebuilding. Vercel’s automatic Git deployments stay off.

Official references:

- [Vercel monorepos](https://vercel.com/docs/monorepos)
- [Vercel project update API](https://vercel.com/docs/rest-api/reference/endpoints/projects/update-an-existing-project)
- [Vercel Turborepo](https://vercel.com/docs/monorepos/turborepo)
- [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration)
- [Vercel `vercel.json` `ignoreCommand`](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Turborepo remote caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Turborepo CI setup](https://turborepo.dev/docs/guides/ci-vendors)

## 5. Development Environment Setup (`develop`)

Development uses Vercel’s `core-development` custom environment and branch `develop`. It is separate from Preview and Production in Vercel, but ordinary QA previews and Production use the same development Supabase project until WP11. A merge does not refresh the development deployments.

### 5.1 Canonical development URLs

| App        | Vercel project | Development URL                                |
| ---------- | -------------- | ---------------------------------------------- |
| Admin      | `admin`        | `https://development-admin.asymmetric.al`      |
| Donor      | `donor`        | `https://development-donor.asymmetric.al`      |
| Missionary | `missionary`   | `https://development-missionary.asymmetric.al` |

### 5.2 Development Supabase project

The canonical development database is the visible Supabase project in the normal
Asymmetrical Supabase organization. Its dashboard display name should be
`development`; if the Supabase dashboard still shows `develop`, rename only the
display name and keep the project ref unchanged.

| Environment | Supabase project | Project ref            | Project URL                                | Policy                                                                                                                                                                                                                                                                                                                  |
| ----------- | ---------------- | ---------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development | `development`    | `pnmlrbgjiqzzsthsoikm` | `https://pnmlrbgjiqzzsthsoikm.supabase.co` | Demo/test data only                                                                                                                                                                                                                                                                                                     |
| Preview     | `preview`        | `btewedpsxwsjczvmegby` | `https://btewedpsxwsjczvmegby.supabase.co` | Rebuilt from source and seeded (`supabase/seed.sql`, its seeded logins given the release secret). Renamed from `production` on 18 November 2026. The production-named project, rebuilt from source as the disposable `preview` project and the project of WP1.6's hosted proofs; WP11 decides production's own database |
| Deleted     | Vercel-managed   | `uarazyactrqlxzmeygmr` | `https://uarazyactrqlxzmeygmr.supabase.co` | Exported, verified unused, deleted                                                                                                                                                                                                                                                                                      |

Do not point development at the Vercel-managed Supabase project ref
`uarazyactrqlxzmeygmr`. It was created by the Vercel/Supabase integration and
is intentionally retired in favor of the team-owned Supabase project above.

Cleanup state from the 2026-05-15 environment cutover:

- `pnmlrbgjiqzzsthsoikm` received all repo migrations and the development/demo seed.
- `uarazyactrqlxzmeygmr` was exported, verified absent from active
  production/development Vercel env pulls, and deleted.
- Completed exports are stored outside the repo at
  `/Users/blake/Documents/asymmetrical/ops-backups/core-supabase-cleanup-2026-05-15T08-05-59-447Z`.
- Remaining Supabase dashboard cleanup: rename display name `develop` to
  `development`.

Configured development Auth redirect URLs in the `pnmlrbgjiqzzsthsoikm` Supabase
Auth config:

- `https://development-admin.asymmetric.al/**`
- `https://development-donor.asymmetric.al/**`
- `https://development-missionary.asymmetric.al/**`

Access policy: do not recover or share existing passwords. Inventory
admin-capable Auth users in Supabase and use Supabase invite/reset-password
flows for development access.

### 5.3 Vercel `core-development` custom environment (all 3 projects)

For each Vercel project (`admin`, `donor`, `missionary`):

1. Select the custom environment `core-development`, not Vercel’s built-in Development scope.
2. Assign branch `develop` to `core-development`.
3. Set the following variables in that custom environment:

| Variable                             |
| ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      |
| `SUPABASE_SERVICE_ROLE_KEY`          |
| `STRIPE_SECRET_KEY`                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `STRIPE_WEBHOOK_SECRET`              |
| `STRIPE_CONNECT_WEBHOOK_SECRET`      |
| `NEXT_PUBLIC_APP_URL`                |
| `NEXT_PUBLIC_SITE_URL`               |
| `INNGEST_EVENT_KEY`                  |
| `INNGEST_SIGNING_KEY`                |
| `SENTRY_DSN`                         |
| `NEXT_PUBLIC_SENTRY_DSN`             |
| `SENTRY_AUTH_TOKEN`                  |
| `SENTRY_ORG`                         |
| `SENTRY_PROJECT`                     |
| `SENTRY_RELEASE`                     |
| `RESEND_API_KEY`                     |
| `RESEND_WEBHOOK_SECRET`              |
| `RESEND_ENCRYPTION_KEY`              |
| `CLOUDINARY_CLOUD_NAME`              |
| `CLOUDINARY_API_KEY`                 |
| `CLOUDINARY_API_SECRET`              |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  |

Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to the HTTPS development origin of the project (section 5.1). On admin and donor set `CMS_BASE_URL` to `https://development-admin.asymmetric.al`. The donor server’s CMS client sends no Vercel bypass, so it cannot read public CMS pages from the protected admin origin on development. On admin set `DONOR_APP_URL` and `NEXT_PUBLIC_DONOR_URL` to `https://development-donor.asymmetric.al`. Use the Inngest Development event and signing keys on all three projects in `core-development`; do not copy the Production pair here.

Supabase-specific development values must resolve to project ref
`pnmlrbgjiqzzsthsoikm`:

| Variable                        | Admin | Donor | Missionary | Notes                                                                         |
| ------------------------------- | ----- | ----- | ---------- | ----------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes   | Yes   | Yes        | `https://pnmlrbgjiqzzsthsoikm.supabase.co`                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes   | Yes   | Yes        | Client-safe key from the development Supabase project                         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes   | Yes   | Yes        | Server-only key from the development Supabase project                         |
| `SUPABASE_DB_URL`               | No    | No    | No         | Release-only; remove project and team-shared entries that reach any app.      |
| `PAYLOAD_DATABASE_URI`          | Yes   | No    | No         | Restricted `cms_runtime` role on the development session pooler; verify-full. |
| `PAYLOAD_DATABASE_SSL_CA`       | Yes   | No    | No         | Development project CA used to verify the pooler.                             |

On admin also set `PAYLOAD_SECRET`. Payload and the Web Studio tenant cookie take their signing key from it; if it is unset, the admin app throws outside local development and tests (`apps/admin/src/cms/payload-secret.ts`). Donor and missionary do not use it.

Merges to `develop` do not deploy. To refresh the three domains, follow the [development checkpoint](./release-job.md#switching-it-on): force builds of the exact commit in `core-development`, confirm the deployment ids and aliases, check detailed health and run the hosted smoke. Before a release record the signed-in evidence against the commit actually exercised.

Verify the development Supabase/Vercel map without printing secrets:

```bash
bun run verify:vercel-env-inventory -- --environments production,core-development
```

Expected refs:

- Production reads `pnmlrbgjiqzzsthsoikm`, marked disposable, until WP11. The separate migration-preview target is `btewedpsxwsjczvmegby`; that path remains disabled. Neither project is for live data.
- Development is `pnmlrbgjiqzzsthsoikm`.
- No active Vercel environment variable should reference `uarazyactrqlxzmeygmr`.

### 5.4 DNS + domains

Assign these domains to each project's `core-development` environment and point DNS CNAME records to Vercel:

- `development-admin.asymmetric.al` -> `admin`
- `development-donor.asymmetric.al` -> `donor`
- `development-missionary.asymmetric.al` -> `missionary`

### 5.5 Stripe webhooks (test mode)

Use Stripe test-mode endpoints per development app:

| App        | Endpoint URL                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admin      | `https://development-admin.asymmetric.al/api/webhooks/stripe`                                                                                                                                                                  |
| Admin      | `https://development-admin.asymmetric.al/api/webhooks/stripe-connect` (event destination: events from your account, thin payload, Accounts v2 account events; uses `STRIPE_CONNECT_WEBHOOK_SECRET`, optional until configured) |
| Donor      | `https://development-donor.asymmetric.al/api/webhooks/stripe`                                                                                                                                                                  |
| Missionary | `https://development-missionary.asymmetric.al/api/webhooks/stripe`                                                                                                                                                             |

If the development domain is protected by Vercel Authentication, Stripe cannot
reach the endpoint directly. A protected endpoint returns Vercel `401`
before the Next.js route runs, which Stripe records as a failed delivery.

Preferred protected-development setup:

1. In the Vercel project for the app, generate a Protection Bypass for
   Automation secret for development webhook automation.
2. In Stripe test mode, configure the endpoint URL with the bypass query
   parameter:

   ```text
   https://development-<app>.asymmetric.al/api/webhooks/stripe?x-vercel-protection-bypass=<VERCEL_AUTOMATION_BYPASS_SECRET>
   ```

3. Do not add `x-vercel-set-bypass-cookie` to Stripe webhook URLs; Stripe
   needs a one-request server-to-server bypass, not a browser cookie.
4. Copy the Stripe endpoint signing secret into that app's
   `STRIPE_WEBHOOK_SECRET` in Vercel `core-development` scope, then redeploy if either
   the webhook signing secret or the Vercel bypass secret changed. For the
   `/api/webhooks/stripe-connect` destination the signing secret goes in
   `STRIPE_CONNECT_WEBHOOK_SECRET` on the admin app instead.
5. Verify without exposing secrets:

   ```bash
   curl -i -X POST "https://development-<app>.asymmetric.al/api/webhooks/stripe" \
     -H "content-type: application/json" \
     --data "{}"
   ```

   Without a bypass parameter, protected development should return Vercel `401`.
   With the bypass parameter and no Stripe signature, the request should reach
   the app and return JSON `400` with `Missing Stripe signature.` A real Stripe
   test event should then return `2xx` and appear as delivered in Stripe
   Workbench.

Alternative: add the development custom domain as a Vercel Deployment Protection
Exception. This makes the entire development domain public, so only use it when
that exposure is acceptable.

### 5.6 Development sync policy and Inngest note

- Development deploy trigger: an explicit checkpoint; merges to `develop` do
  not deploy automatically.
- Production deploy trigger: `bun run release:production` pushes a verified
  commit to `production`, the Vercel Production Branch.
- The canonical repository has no `main` branch; do not create, sync, merge, or
  deploy one. Deny-only deployment configuration may still mention it.
- Refresh development on the chosen commit; a merge alone leaves the existing aliases in place.
- All three `core-development` deployments require the Inngest Development pair. Setting the keys does not sync the development app to Inngest; that sync was not observed at the first release. Do not shorten the three recovery schedules on Free: the enforced 50,000-execution monthly cap can stop all functions, including event-driven work (implementation record, D-141, for both ways of counting).

## 5.7 Production Vercel requirements

The [Release workflow](./release-job.md#switching-it-on) is on. A checked push to `production` starts the job, not a Vercel Git deployment. After its database gates the workflow stages, health-checks and promotes the selected apps. No app may receive a privileged Postgres URL, including through a team-shared variable; admin alone uses a restricted CMS login. Until WP11 all three production domains read rebuilt development. Do not load live donor or payment data.

If the team later migrates Production away from `production`, change the Vercel
project Production Branch for `admin`, `donor`, and `missionary`, ensure the
new branch contains the current `production` lineage, update this guide, and only then
adjust app-level deployment branch gates.

Set these Vercel variables in the **Production** scope before deploying:

| Variable                             | Admin                     | Donor                    | Missionary               | Notes                                                                                                                                                  |
| ------------------------------------ | ------------------------- | ------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`           | Yes                       | Yes                      | Yes                      | Development project until WP11                                                                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Yes                       | Yes                      | Yes                      | Client-safe key from that same project                                                                                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`          | Yes                       | Yes                      | Yes                      | Server-only key from that same project                                                                                                                 |
| `STRIPE_SECRET_KEY`                  | Yes                       | Yes                      | Yes                      | Use test mode pending live cutover; not observable from the public bundle                                                                              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes                       | Yes                      | Yes                      | Use test mode; verify the delivered bundle before accepting the release                                                                                |
| `STRIPE_WEBHOOK_SECRET`              | Yes                       | Yes                      | Yes                      | Signing secret for the app-specific production endpoint                                                                                                |
| `STRIPE_CONNECT_WEBHOOK_SECRET`      | Optional until configured | No                       | No                       | Signing secret (`whsec_...`) of the thin event destination for Accounts v2 account events at `/api/webhooks/stripe-connect`; returns `503` while unset |
| `SENTRY_DSN`                         | Yes                       | Yes                      | Yes                      | Required by protected deployment env validation                                                                                                        |
| `NEXT_PUBLIC_SENTRY_DSN`             | Yes                       | Yes                      | Yes                      | Public client DSN when browser reporting is enabled                                                                                                    |
| `SENTRY_AUTH_TOKEN`                  | If uploading source maps  | If uploading source maps | If uploading source maps | Build-only token; enables Sentry release creation and source map upload                                                                                |
| `SENTRY_ORG`                         | Optional                  | Optional                 | Optional                 | Build-time Sentry org override; defaults to `asymmetrical-4w`                                                                                          |
| `SENTRY_PROJECT`                     | Optional                  | Optional                 | Optional                 | Build-time Sentry project override; defaults to `javascript-nextjs`                                                                                    |
| `SENTRY_RELEASE`                     | Optional                  | Optional                 | Optional                 | Manual release name override; otherwise the Vercel commit SHA is used                                                                                  |
| `RESEND_API_KEY`                     | Yes                       | Yes                      | Yes                      | Production Resend API key; use `re_...`                                                                                                                |
| `RESEND_WEBHOOK_SECRET`              | Yes                       | Yes                      | Yes                      | Production Resend webhook signing secret                                                                                                               |
| `RESEND_ENCRYPTION_KEY`              | Yes                       | Yes                      | Yes                      | At least 32 characters; protects tenant email secrets                                                                                                  |
| `NEXT_PUBLIC_APP_URL`                | Yes                       | Yes                      | Yes                      | App canonical origin                                                                                                                                   |
| `NEXT_PUBLIC_SITE_URL`               | Yes                       | Yes                      | Yes                      | Same origin as the app unless a split site exists                                                                                                      |
| `NEXT_PUBLIC_MAIN_DOMAIN`            | Yes                       | Yes                      | Yes                      | `asymmetric.al`                                                                                                                                        |
| `PAYLOAD_SECRET`                     | Yes                       | No                       | No                       | Required by admin Web Studio outside local/test                                                                                                        |
| `PAYLOAD_DATABASE_URI`               | Yes                       | No                       | No                       | Restricted `cms_runtime` login via the development session pooler; verify-full.                                                                        |
| `PAYLOAD_DATABASE_SSL_CA`            | Yes                       | No                       | No                       | Development database CA.                                                                                                                               |
| `CMS_BASE_URL`                       | Yes                       | Yes                      | No                       | Admin origin: `https://admin.asymmetric.al`.                                                                                                           |
| `INNGEST_EVENT_KEY`                  | Yes                       | Yes                      | Yes                      | From Inngest Production; server-side event publishing.                                                                                                 |
| `INNGEST_SIGNING_KEY`                | Yes                       | Yes                      | Yes                      | From Inngest Production; verifies signed requests.                                                                                                     |
| `PAYLOAD_DATABASE_POOL_MAX`          | Optional                  | No                       | No                       | Optional Payload Postgres pool override; hosted runtime defaults to `2`                                                                                |
| `NEXT_PUBLIC_DONOR_URL`              | Yes                       | No                       | No                       | `https://donor.asymmetric.al` for Web Studio previews                                                                                                  |
| `DONOR_APP_URL`                      | Yes                       | No                       | No                       | Server-side donor origin for Web Studio previews                                                                                                       |

Production Stripe webhook endpoints:

| App        | Endpoint URL                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin      | `https://admin.asymmetric.al/api/webhooks/stripe`                                                                                                                                       |
| Admin      | `https://admin.asymmetric.al/api/webhooks/stripe-connect` (event destination: events from your account, thin payload, Accounts v2 account events; uses `STRIPE_CONNECT_WEBHOOK_SECRET`) |
| Donor      | `https://donor.asymmetric.al/api/webhooks/stripe`                                                                                                                                       |
| Missionary | `https://missionary.asymmetric.al/api/webhooks/stripe`                                                                                                                                  |

Configure each `/api/webhooks/stripe` endpoint in the active Stripe mode for at least these events:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.processing`
- `charge.refunded`

After creating each `/api/webhooks/stripe` endpoint, set `STRIPE_WEBHOOK_SECRET` on its app in Vercel Production. The `/api/webhooks/stripe-connect` destination is separate: it takes Accounts v2 account events as thin payloads, and its signing secret goes only in `STRIPE_CONNECT_WEBHOOK_SECRET` on the admin app, never in `STRIPE_WEBHOOK_SECRET`. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.

Production Resend webhook endpoint:

| App   | Endpoint URL                                            |
| ----- | ------------------------------------------------------- |
| Admin | `https://admin.asymmetric.al/api/email/webhooks/resend` |

The Resend webhook secret must come from Resend's webhook configuration for the
endpoint above. Use the guarded manual workflow
`Configure Resend Production Webhook` to create or update the endpoint, mask the
returned `whsec_...` signing secret, and sync that value into all three Vercel
Production projects as `RESEND_WEBHOOK_SECRET`. It requires typing
`configure-resend-production-webhook` and defaults to dry-run.

Local equivalent for inspection only when `RESEND_API_KEY` is available in the
shell:

```bash
bun run configure:resend-production-webhook -- --dry-run
```

Verify production readiness without printing secret values:

```bash
bun run verify:vercel-production -- --commit <sha>
```

The verifier inventories Production names, checks readable values, the branch configuration, READY deployments and `/api/health` at the requested commit. At the first release CLI 66.6.0 returned the marker `[sensitive]` for values it could not read. The verifier treated the marker as a value and exited BLOCKED (1), although the three deployments and their health matched. Record its actual result, check both Inngest names separately, and follow the independent checks in [step 7](./release-job.md#switching-it-on); do not dismiss missing names or other failures.

Inventory Vercel environment variable names without values:

```bash
bun run verify:vercel-env-inventory -- --environments production,preview,development,core-development
```

Use this before provider or observability work to confirm which names exist in
Production, Preview, Development, and the `core-development` custom environment without
printing secrets.

After the real provider values exist as GitHub repository secrets, sync them to
all three Vercel Production projects with the guarded manual workflow
`Sync Vercel Production Env`. It requires typing `sync-production-env` and
defaults to dry-run. The workflow reads these GitHub secret names:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ADMIN_STRIPE_WEBHOOK_SECRET`
- `DONOR_STRIPE_WEBHOOK_SECRET`
- `MISSIONARY_STRIPE_WEBHOOK_SECRET`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` (targeted only when source map upload is required)
- `RESEND_API_KEY`
- `RESEND_ENCRYPTION_KEY`
- `VERCEL_TOKEN`

`RESEND_WEBHOOK_SECRET` is intentionally not required for the default full sync
because the guarded `Configure Resend Production Webhook` workflow sources that
value directly from Resend and writes it to Vercel Production without storing it
as a GitHub repository secret. `SENTRY_AUTH_TOKEN` is also targeted-only because
runtime Sentry DSNs do not require source map upload. The sync script supports
`--keys RESEND_WEBHOOK_SECRET` and `--keys SENTRY_AUTH_TOKEN` for those handoff
paths.

Local equivalent:

```bash
bun run sync:vercel-production-env -- --dry-run
bun run sync:vercel-production-env
```

For a known-good GitHub secret that already exists, the workflow also supports
targeted backfill with the optional `only_keys` input. Use GitHub secret input
names, not Vercel env names. Targeted sync does not prove Production readiness;
the default full sync and `bun run verify:vercel-production -- --commit <sha>`
remain the release gates.

Example targeted dry-run/write for the existing Resend API key:

```bash
bun run sync:vercel-production-env -- --dry-run --keys RESEND_API_KEY
bun run sync:vercel-production-env -- --keys RESEND_API_KEY
```

Do not hand-enter or invent `RESEND_WEBHOOK_SECRET`. If it is missing, run
`Configure Resend Production Webhook` dry-run first and then write mode after
the dry-run confirms the endpoint action.

If source map upload is required, add a Sentry auth token as a GitHub secret and
sync it without printing the value:

```bash
bun run sync:vercel-production-env -- --dry-run --keys SENTRY_AUTH_TOKEN
bun run sync:vercel-production-env -- --keys SENTRY_AUTH_TOKEN
```

Do not include `SENTRY_AUTH_TOKEN` in evidence output; record only that the name
exists and whether `bun run verify:sentry-release` passed.

## 6. Deploy Flows

Production is branch-triggered; preview and development deploys are explicit.
The flows map to deploy targets as follows:

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant PR as PullRequest
    participant Develop as developBranch
    participant Prod as productionBranch
    participant Release as releaseWorkflow
    participant Vercel as Vercel

    Dev->>PR: Open PR (feature branch)
    PR->>Vercel: Label-gated QA preview only (qa-smoke-preview-deploy.yml)
    Note over Vercel: Development for an eligible PR without a migration; no preview for a migration PR until step 8

    PR->>Develop: Merge/push validated development work
    Develop-->>Vercel: No automatic deploy; explicit checkpoint refreshes development-*.asymmetric.al
    Note over Vercel: Development Supabase project

    Dev->>Prod: Checked fast-forward push with bun run release:production
    Prod-->>Vercel: No Git deployment (apps/*/vercel.json)
    Prod->>Release: Push starts the Release workflow (release.yml)
    Release->>Vercel: After migrations and gates, stage, health-check and promote each affected app (*.asymmetric.al)
    Note over Vercel: Production reads disposable development demo data until WP11

    Note over Prod,Develop: Optional best-effort sync for QA/demos
    Prod->>Develop: Merge/cherry-pick (best effort)
```

`develop` may drift from the Production Branch; best-effort sync is performed
before QA/demo cycles. Git deployments are off in every `apps/*/vercel.json`, so a
push to `production` produces no Vercel build of its own; the Release workflow
stages and promotes the apps its plan selects: an app whose own files or a
shared input (anything under `packages/`, among others) changed since the
commit its production domain serves, and any app whose live commit is unknown
or is not an ancestor of the release. An app the plan skips keeps its current
deployment and its old variables. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.

## 7. Playwright `baseURL` Configuration

E2E tests can target different environments using `PLAYWRIGHT_BASE_URL`, configured in [playwright.config.ts](../../playwright.config.ts). In CI, set `PLAYWRIGHT_BASE_URL` to a preview or development URL to run tests against deployed infrastructure instead of localhost.

## 8. Credential Rotation Schedule

| Environment | Service            | Frequency                 | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preview     | Supabase           | Quarterly                 | Rotate the shared development project keys across ordinary Preview, `core-development` and Production. Refresh the preview and development deployments; migration preview is not configured. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged. |
| Preview     | Stripe             | Quarterly                 | Roll test-mode keys in Stripe dashboard -> update Vercel Preview env vars -> redeploy existing previews                                                                                                                                                                                                                                                                                                                                                             |
| Preview     | Sentry             | Quarterly                 | Regenerate DSN -> update Vercel Preview env vars -> redeploy existing previews                                                                                                                                                                                                                                                                                                                                                                                      |
| Development | All services       | Quarterly                 | Rotate in service dashboards -> update Vercel `core-development` scope env vars -> refresh development deployments at the next checkpoint (section 5.3)                                                                                                                                                                                                                                                                                                             |
| Production  | Supabase           | Quarterly + on compromise | Coordinate with team. Update all scopes that use the development project and refresh development. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.                                                                                            |
| Production  | Stripe             | Quarterly + on compromise | Roll the keys for the active Stripe mode (test until live cutover) and update Production. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.                                                                                                    |
| Production  | Sentry, Cloudinary | Quarterly + on compromise | Rotate in the provider dashboards and update Vercel Production. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.                                                                                                                              |
| Production  | Email, PDF         | Quarterly + on compromise | Rotate in the provider dashboard and update Vercel Production. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.                                                                                                                               |

Cover Supabase, Stripe, Sentry, Cloudinary, email and PDF services where configured. For Inngest rotate only the pair belonging to the affected environment. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.

## 9. If an Environment Is Compromised

1. **Immediately rotate** all credentials for the affected environment in each service dashboard, following the schedule above. `RESEND_ENCRYPTION_KEY` is the exception to “rotate, update, rebuild”: it protects each tenant’s stored Resend API key, and a rebuild with a new value alone leaves every stored key unreadable. Rotate it with the [re-encryption procedure](../guides/features/resend-integration.md#rotate-resend_encryption_key-critical), which re-encrypts the stored keys before the new value is deployed. The stored keys sit in a database that ordinary Preview, `core-development` and, until WP11, Production all read: set the new value in every scope that reads it and deploy them together, because a scope left on the old value cannot decrypt the re-encrypted keys.
2. **Update Vercel environment variables** for the affected scope (preview/development/production) across all three projects: `admin`, `donor`, and `missionary`.
3. **Rebuild** all affected apps. Refresh the custom development environment explicitly. For a settings-only production change there is no commit or push. Dispatch **Release** anew with operation `release` and `apps: all`; check that the plan logged `build` for admin, donor and missionary and that each production domain serves the ID the run logged.
4. **For production compromises**, coordinate with the full team before rotating Stripe live keys (brief webhook downtime expected), and notify affected users if any data was exposed.
5. **Audit access logs** in Supabase, Stripe, and Sentry for the affected incident window.
6. **Document the incident** in a post-mortem.

## 10. Related Documents

See also:

- [Production release guide](./production-release.md) - release controls; record a release-specific rollback/forward-fix plan before deployment
- [docs/ops/deploy-checklist.md](./deploy-checklist.md) - pre-deploy, deploy, and post-deploy smoke tests (T6)
- [docs/ops/scale-observability-reliability.md](./scale-observability-reliability.md) - Phase 11 observability, release-health, and backup/restore runbook
- [README.md](../../README.md) - full local quickstart and monorepo workspace contract
- [supabase/config.toml](../../supabase/config.toml) - local Supabase configuration
