# GitHub Actions Secrets & Variables

This file documents every secret and variable required by `.github/workflows/ci.yml` and `.github/workflows/ci-integration.yml`.

## Secrets vs Variables

- **Secrets** — encrypted at rest; values are masked in logs; set under _Settings → Secrets and variables → Actions → Secrets_.
- **Variables** — plain text; visible in logs; set under _Settings → Secrets and variables → Actions → Variables_. Use for non-sensitive configuration like team slugs.

## Required secrets and variables

| Name                             | Type                      | Used by                                                       | Purpose                                                                            |
| -------------------------------- | ------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `TURBO_TOKEN`                    | Secret                    | All jobs in `ci.yml`                                          | Vercel Turborepo remote cache authentication                                       |
| `TURBO_TEAM`                     | **Variable** (not Secret) | All jobs in `ci.yml`                                          | Vercel team slug for remote cache scoping                                          |
| `NEXT_PUBLIC_SUPABASE_URL`       | Secret                    | `build` job (`ci.yml`), `test-e2e` job (`ci-integration.yml`) | Supabase project URL — stub value is fine for `build`; real value needed for E2E   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Secret                    | `build` job (`ci.yml`), `test-e2e` job (`ci-integration.yml`) | Supabase anon key — stub for `build`; real for E2E                                 |
| `E2E_AUTH_SECRET`                | Secret                    | `test-e2e` job (`ci-integration.yml`)                         | HMAC signing key for the E2E auth bypass cookie (shared by producer + verifiers)   |
| `E2E_AUTH_ALLOWED_SUPABASE_REFS` | Secret                    | `test-e2e` job (`ci-integration.yml`)                         | Supabase project ref(s) allowed for the E2E auth bypass (demo project, never prod) |
| `DEMO_PASSWORD`                  | Secret                    | `test-e2e` job (`ci-integration.yml`)                         | Password for the demo login accounts used by E2E flows                             |
| `DEMO_ADMIN_EMAIL`               | Secret                    | `test-e2e` job (`ci-integration.yml`)                         | Demo admin account email                                                           |
| `DEMO_MISSIONARY_EMAIL`          | Secret                    | `test-e2e` job (`ci-integration.yml`)                         | Demo missionary account email                                                      |
| `DEMO_DONOR_EMAIL`               | Secret                    | `test-e2e` job (`ci-integration.yml`)                         | Demo donor account email                                                           |

## Notes

- `TURBO_TEAM` must be added under **Variables**, not Secrets. It is referenced in the workflow as `${{ vars.TURBO_TEAM }}`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used with `SKIP_ENV_VALIDATION=1` in the `build` job, so stub values (e.g. `https://example.supabase.co` / `example-anon-key`) are sufficient for build-time validation. Real values are required for the `test-e2e` job.
- The local-Supabase jobs in `ci-integration.yml` run against the CLI stack with its non-confidential built-in keys, so they need no repository secrets; only the hosted-project `test-e2e` job consumes the `E2E_AUTH_*` and `DEMO_*` secrets above.
- Stripe keys (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `*_STRIPE_WEBHOOK_SECRET`) are **not** used by CI; they belong to `sync-vercel-production-env.yml` (manual production env sync) and are documented there.

## How to add a secret

1. Go to the repository on GitHub.
2. Navigate to _Settings → Secrets and variables → Actions_.
3. Click **New repository secret** (for Secrets) or **New repository variable** (for Variables).
4. Enter the name exactly as shown in the table above and paste the value.
5. Click **Add secret** / **Add variable**.
