# GitHub Actions Secrets & Variables

This file documents every secret and variable required by `.github/workflows/ci.yml` and `.github/workflows/ci-integration.yml`.

## Secrets vs Variables

- **Secrets** — encrypted at rest; values are masked in logs; set under _Settings → Secrets and variables → Actions → Secrets_.
- **Variables** — plain text; visible in logs; set under _Settings → Secrets and variables → Actions → Variables_. Use for non-sensitive configuration like team slugs.

## Required secrets and variables

| Name                                 | Type                      | Used by                     | Purpose                                                                          |
| ------------------------------------ | ------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| `TURBO_TOKEN`                        | Secret                    | All jobs in `ci.yml`        | Vercel Turborepo remote cache authentication                                     |
| `TURBO_TEAM`                         | **Variable** (not Secret) | All jobs in `ci.yml`        | Vercel team slug for remote cache scoping                                        |
| `NEXT_PUBLIC_SUPABASE_URL`           | Secret                    | `build` job, `test-e2e` job | Supabase project URL — stub value is fine for `build`; real value needed for E2E |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Secret                    | `build` job, `test-e2e` job | Supabase anon key — stub for `build`; real for E2E                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Secret                    | `test-e2e` job              | Stripe test-mode publishable key (donation E2E flow)                             |
| `STRIPE_SECRET_KEY`                  | Secret                    | `test-e2e` job              | Stripe test-mode secret key (donation E2E flow)                                  |

## Notes

- `TURBO_TEAM` must be added under **Variables**, not Secrets. It is referenced in the workflow as `${{ vars.TURBO_TEAM }}`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used with `SKIP_ENV_VALIDATION=1` in the `build` job, so stub values (e.g. `https://example.supabase.co` / `example-anon-key`) are sufficient for build-time validation. Real values are required for the `test-e2e` job.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are only needed once the E2E donation test is fully implemented. The `test-e2e` job is non-blocking (`continue-on-error: true`), so missing Stripe keys will not block merges.

## How to add a secret

1. Go to the repository on GitHub.
2. Navigate to _Settings → Secrets and variables → Actions_.
3. Click **New repository secret** (for Secrets) or **New repository variable** (for Variables).
4. Enter the name exactly as shown in the table above and paste the value.
5. Click **Add secret** / **Add variable**.
