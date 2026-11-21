# GitHub Actions Secrets & Variables

This file documents every secret and variable required by `.github/workflows/ci.yml` and `.github/workflows/ci-integration.yml`.

## Secrets vs Variables

- **Secrets** — encrypted at rest; values are masked in logs; set under _Settings → Secrets and variables → Actions → Secrets_.
- **Variables** — plain text; visible in logs; set under _Settings → Secrets and variables → Actions → Variables_. Use for non-sensitive configuration like team slugs.

## Required secrets and variables

| Name                            | Type                      | Used by                                                                | Purpose                                                                            |
| ------------------------------- | ------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `TURBO_TOKEN`                   | Secret                    | `format`, `lint`, `typecheck`, `build` and `test-unit` jobs (`ci.yml`) | Vercel Turborepo remote cache authentication                                       |
| `TURBO_TEAM`                    | **Variable** (not Secret) | `format`, `lint`, `typecheck`, `build` and `test-unit` jobs (`ci.yml`) | Vercel team slug for remote cache scoping                                          |
| `NEXT_PUBLIC_SUPABASE_URL`      | Secret                    | `build` job (`ci.yml`)                                                 | Supabase project URL — stub value is fine for `build` with `SKIP_ENV_VALIDATION=1` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Secret                    | `build` job (`ci.yml`)                                                 | Supabase anon key — stub value is fine for `build` with `SKIP_ENV_VALIDATION=1`    |

## Notes

- `TURBO_TEAM` must be added under **Variables**, not Secrets. It is referenced in the workflow as `${{ vars.TURBO_TEAM }}`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used with `SKIP_ENV_VALIDATION=1` in the `build` job (`ci.yml`), so stub values (e.g. `https://example.supabase.co` / `example-anon-key`) are sufficient for build-time validation.
- All jobs in `ci-integration.yml` (`migrate`, `smoke`, `test-e2e-smoke`, `test-e2e`, and `instant-nav`) run hermetically against the placeholder Supabase datasource (`https://example.supabase.co` / `example-anon-key`) and ephemeral Postgres containers, so they need no repository secrets (`E2E_AUTH_*`, `DEMO_*`, or hosted Supabase keys). No end-to-end job runs against a hosted database.
- Stripe keys (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `*_STRIPE_WEBHOOK_SECRET`) are **not** used by CI; `sync-vercel-production-env.yml` (manual production env sync) reads them from its `production` environment.

## How to add a secret

1. Go to the repository on GitHub.
2. Navigate to _Settings → Secrets and variables → Actions_.
3. Click **New repository secret** (for Secrets) or **New repository variable** (for Variables).
4. Enter the name exactly as shown in the table above and paste the value.
5. Click **Add secret** / **Add variable**.
