# Developer Guide

Local development reference: environment variables, troubleshooting and
everyday commands. Install prerequisites and run setup from the root
[`README.md`](../../../README.md). The "Give Hope" tenant name that appears in
some demo defaults is a test frontend, not the organization.

## Supabase Cloud

Most contributor development uses a hosted Supabase project (no local DB required). A fully local database runs through the Supabase CLI (Docker): `bun run db:migrate:local` or `bun run seed:demo:local`.

- **Required env vars**: Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Access**: Ask a maintainer for the shared dev project URL + anon key.

### Auth email on a local stack

Registering needs the mail catcher. Sign-up confirmation is on locally, as in
the hosted projects (`enable_confirmations` in `supabase/config.toml`), so a
new account has no session until its address is confirmed. A local stack
delivers every Auth email, sign-up confirmations and password reset links
alike, only to its mail catcher, Mailpit: open `http://127.0.0.1:54324`
(`bun run supabase -- status` prints it as `MAILPIT_URL`), open the message and
follow its link in the same browser that asked for it. The seeded login
(`demo-owner@givehope.test` after `bun run seed:demo:local`) is already
confirmed. To run the email journeys as tests, see
[Auth email round trips](../../../tests/e2e/README.md#auth-email-round-trips).

## Environment Variable Matrix

Use this matrix to decide what you need for cloud development vs production. "Required" means the related feature will not work without it.
This table mirrors `.env.example`. Internal-only vars (for example `NODE_ENV`, `CI`, `SUPABASE_SERVICE_ROLE_KEY`) are provided by the runtime or maintainers and are not required for contributors.

| Variable                                          | Requirement                                    | Purpose                                     | Example / default                                         | Feature impact if missing                                              |
| ------------------------------------------------- | ---------------------------------------------- | ------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                        | Required                                       | Supabase project URL                        | `https://your-project.supabase.co`                        | Auth + data access fail; API routes error.                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                   | Required                                       | Client-safe Supabase key                    | `your-anon-key`                                           | Client auth/data fail; middleware errors.                              |
| `NEXT_PUBLIC_SITE_URL`                            | Optional (dev), recommended in prod            | Base site URL for SEO + routing             | `http://localhost:3000` (default: `https://givehope.org`) | SEO links + public URLs use fallback.                                  |
| `GOOGLE_SITE_VERIFICATION`                        | Optional                                       | Google site verification                    | empty                                                     | No verification meta tag.                                              |
| `BING_SITE_VERIFICATION`                          | Optional                                       | Bing site verification                      | empty                                                     | No verification meta tag.                                              |
| `NEXT_PUBLIC_MAIN_DOMAIN`                         | Optional                                       | Main domain for subdomain routing           | `localhost:3000`                                          | Subdomain routing uses default.                                        |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`              | Optional (local), required for Stripe checkout | Stripe publishable key                      | `pk_test_...`                                             | Donation checkout fails.                                               |
| `STRIPE_SECRET_KEY`                               | Optional (local), required for Stripe API      | Stripe secret key                           | `sk_test_...`                                             | Server donation processing fails.                                      |
| `NEXT_PUBLIC_EMAIL_STUDIO_BUILDER`                | Optional                                       | Email Studio builder runtime                | `react_email`                                             | Ignored by Email Studio (always React Email); retained in schema only. |
| `NEXT_PUBLIC_EMAIL_STUDIO_LEGACY_UNLAYER_ENABLED` | Optional                                       | Schema-only compatibility flag              | `false`                                                   | Ignored by Email Studio; PDF Studio uses its own fallback flag.        |
| `NEXT_PUBLIC_UNLAYER_PROJECT_ID`                  | Optional legacy; required for PDF export       | Legacy Unlayer project id                   | `123456`                                                  | PDF Studio export/legacy paid features disabled.                       |
| `NEXT_PUBLIC_UNLAYER_WHITE_LABEL`                 | Optional legacy                                | Legacy Unlayer white-label toggle           | `false`                                                   | Legacy editor shows default branding.                                  |
| `NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS`             | Optional legacy                                | Legacy allowed domains                      | `localhost,127.0.0.1`                                     | Extra legacy editor domains not permitted.                             |
| `NEXT_PUBLIC_BRAND_NAME`                          | Optional                                       | Studio brand name                           | `GiveHope`                                                | Defaults apply.                                                        |
| `NEXT_PUBLIC_BRAND_LOGO_URL`                      | Optional                                       | Studio logo URL                             | `https://.../logo.png`                                    | Logo missing in editors.                                               |
| `NEXT_PUBLIC_BRAND_PRIMARY_COLOR`                 | Optional                                       | Brand primary color                         | `#0f172a`                                                 | Defaults apply.                                                        |
| `NEXT_PUBLIC_BRAND_ACCENT_COLOR`                  | Optional                                       | Brand accent color                          | `#2563eb`                                                 | Defaults apply.                                                        |
| `NEXT_PUBLIC_EMAIL_FOOTER_TEXT`                   | Optional                                       | Default email footer text                   | `YourOrg - 123 Main St`                                   | Footer empty.                                                          |
| `NEXT_PUBLIC_PDF_FOOTER_TEXT`                     | Optional                                       | Default PDF footer text                     | `YourOrg - 123 Main St`                                   | Falls back to email footer or empty.                                   |
| `DOCRAPTOR_API_KEY`                               | Optional, server-only                          | DocRaptor API key for future PDF generation | `...`                                                     | Unused until DocRaptor integration ships.                              |
| `NEXT_PUBLIC_CLOUDINARY_ENABLED`                  | Optional                                       | Enable Cloudinary integration               | `false`                                                   | Cloudinary features disabled.                                          |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`               | Required when Cloudinary enabled               | Cloudinary cloud name                       | `your-cloud`                                              | Uploads/media features fail.                                           |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY`                  | Required when Cloudinary enabled               | Cloudinary API key                          | `your-key`                                                | Uploads/media features fail.                                           |
| `CLOUDINARY_API_SECRET`                           | Required when Cloudinary enabled               | Cloudinary API secret                       | `your-secret`                                             | Uploads/media features fail.                                           |
| `NEXT_PUBLIC_SENTRY_DSN`                          | Optional                                       | Sentry DSN                                  | empty                                                     | Monitoring disabled (warning logged).                                  |
| `CRON_SECRET`                                     | Optional (recommended in prod)                 | Bearer token for cron endpoints             | `random-string`                                           | Demo-user cleanup returns 503; database health route needs no auth.    |
| `ALLOW_DEMO_ACCOUNTS`                             | Optional                                       | Allow demo accounts in prod                 | `false`                                                   | Demo account API disabled in production.                               |
| `DEMO_ADMIN_EMAIL`                                | Optional                                       | Demo admin email                            | empty                                                     | Demo admin login disabled.                                             |
| `DEMO_MISSIONARY_EMAIL`                           | Optional                                       | Demo missionary email                       | empty                                                     | Demo missionary login disabled.                                        |
| `DEMO_DONOR_EMAIL`                                | Optional                                       | Demo donor email                            | empty                                                     | Demo donor login disabled.                                             |
| `DEMO_PASSWORD`                                   | Optional                                       | Demo account password (shared)              | empty                                                     | Demo login disabled.                                                   |
| `PLAYWRIGHT_BASE_URL`                             | Optional                                       | Base URL for Playwright                     | `http://127.0.0.1:3005`                                   | Uses default if unset.                                                 |
| `VERIFY_E2E_PROJECTS`                             | Optional                                       | Run all Playwright projects                 | `all`                                                     | Runs `chromium`, `mobile-chrome`, `chromium-donor`, `chromium-admin`.  |

## Troubleshooting

| Issue                       | Quick fix                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| No Supabase credentials yet | Run `bun run setup:mission-control:cloud` and then `bun run dev:mission-control` for a credential-free Mission Control sandbox. |
| Supabase envs missing       | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.                                             |
| Supabase URL not reachable  | Verify the URL or request access to the shared dev project.                                                                     |
| Demo login disabled         | Ensure `DEMO_ADMIN_EMAIL`, `DEMO_MISSIONARY_EMAIL`, `DEMO_DONOR_EMAIL`, and `DEMO_PASSWORD` are set for pre-seeded users.       |

## Common Commands

| Command                               | Description                                                    |
| ------------------------------------- | -------------------------------------------------------------- |
| `bun run setup`                       | Hosted Supabase setup (env + deps + verify)                    |
| `bun run setup:mission-control:cloud` | Credential-free Mission Control setup for disposable sandboxes |
| `bun run dev:mission-control`         | Run the Mission Control admin app in credential-free mode      |
| `bun run verify`                      | Workspace contract; HTTP checks with `VERIFY_HTTP=1`           |
| `bun run dev`                         | Start all apps in dev mode                                     |
| `bun run dev:admin`                   | Start admin app only                                           |
| `bun run dev:donor`                   | Start donor app only                                           |
| `bun run dev:missionary`              | Start missionary app only                                      |
| `bun run lint`                        | Lint all apps and packages                                     |
| `bun run typecheck`                   | Type-check all apps and packages                               |
| `bun run build`                       | Build the admin, donor and missionary apps                     |
| `bun run test:e2e`                    | Run Playwright E2E tests                                       |
| `bun run react-doctor:audit`          | Run the configured React Doctor audit                          |

Build troubleshooting and CI-parity commands are documented in `docs/guides/development/build-runbook.md`.
Internal package `build` tasks are source-first TypeScript validation (`tsc --noEmit`; `packages/eve-runtime` runs its own `scripts/build.mjs`), while app builds compile through Next.js.
If you see Next.js lockfile/workspace-root warnings, follow `Multiple lockfile warnings during Next.js build` in the runbook.

Twenty CRM was retired on 2026-07-06
([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)).
Asym Postgres owns CRM truth. Do not add `TWENTY_*`, `CRM_SYNC_*`, or
`NEXT_PUBLIC_TWENTY_*` variables, and do not restore Twenty clients, routes,
webhooks, or health checks.

React/Next.js cleanup audits are documented in `docs/guides/development/react-doctor.md`; `bun run react-doctor:check` is the strict acceptance check.
