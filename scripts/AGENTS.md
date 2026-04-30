# Scripts Workflow Rules

**Name:** `scripts-workflow-rules`
**Purpose:** Rules for operational scripts that apply migrations, seed demo data, and verify seeded integrity.

## Triggers

Use this doc when editing or running:

- `scripts/seed-demo.sh`
- `scripts/print-seed-demo-login.mjs` (prints deterministic demo email/passphrase from `supabase/seed.sql` for local testing only)
- package scripts related to database migration/seed/verification
- shell automation that touches Supabase data

## Workflow Steps

1. Keep scripts non-interactive and safe-by-default.
2. Require explicit env vars for hosted operations.
3. Never print secrets or embed credentials in script output.
4. Validate project targeting before hosted writes.
5. Provide a verification command with explicit row-count checks.

## Seed Script Added (2026-02-16)

- `scripts/seed-demo.sh`
  - `local`: runs `supabase db reset --local` (migrations + seed).
  - `hosted`: requires `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, and `NEXT_PUBLIC_SUPABASE_URL`; applies migrations then executes `supabase/seed.sql`.
  - `verify`: runs table row-count and single-profile checks via SQL.
- `scripts/print-seed-demo-login.mjs` + **`bun run seed:demo:login`**: parses `supabase/seed.sql` and prints the seeded Auth email and passphrase (dev convenience only; never log hosted credentials).

## Checklist

- [ ] Hosted mode requires explicit env vars and target URL validation
- [ ] Script output avoids secrets
- [ ] Commands fail fast (`set -euo pipefail`)
- [ ] Verification mode checks seeded table counts and profile singleton condition
