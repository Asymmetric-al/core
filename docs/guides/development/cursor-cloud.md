# Cursor Cloud specific instructions

Cloud-agent and disposable-VM setup for this monorepo. Root `AGENTS.md` points here; do not copy this runbook into always-on agent context.

## Triggers

- Starting a Cursor Cloud Agent or disposable VM for this monorepo
- Bringing up Mission Control, donor, admin, missionary, or local Supabase in a sandbox
- Diagnosing missing env vars, `SKIP_ENV_VALIDATION`, or the donor HTTP 500 from unforwarded `NEXT_PUBLIC_*`

## Workflow

1. Read this runbook instead of copying it into root `AGENTS.md`.
2. For Mission Control without live credentials, run `bun run setup:mission-control:cloud` then `bun run dev:mission-control`.
3. For donor in cloud sandboxes, wrap with `node scripts/run-with-ci-env.mjs -- bun run dev:donor`.
4. Start local Supabase only after Docker is running; use the `LOCK TABLE` workaround below when the foundation migration fails.
5. Keep secrets in gitignored repo-root `.env.local`. Replace placeholders before live auth or database-backed work.

## Checklist

- [ ] Used the service table ports and start commands
- [ ] Did not copy this runbook into always-on agent context
- [ ] Replaced placeholder credentials before testing live auth, Payload, or hosted data

## Cursor Cloud specific instructions

### Services overview

| Service                 | Port                                    | Start command                                                                                                                      |
| ----------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Donor app               | 3000                                    | `node scripts/run-with-ci-env.mjs -- bun run dev:donor` (cloud); `bun run dev:donor` when root `.env.local` is loaded in the shell |
| Admin app               | 3030                                    | `bun run dev:admin`                                                                                                                |
| Mission Control (cloud) | 3030                                    | `bun run dev:mission-control`                                                                                                      |
| Missionary app          | 4000                                    | `bun run dev:missionary`                                                                                                           |
| Local Supabase          | 54321 (API), 54322 (DB), 54323 (Studio) | `supabase start`                                                                                                                   |

### Mission Control Cloud Agent startup

For a fresh Cursor Cloud Agent or disposable VM that needs the Mission Control Dashboard without live Supabase credentials:

```bash
bun run setup:mission-control:cloud
bun run dev:mission-control
```

Then open `http://localhost:3030`. The setup command only writes gitignored `.env.local` defaults (`SKIP_ENV_VALIDATION=1`, `E2E_AUTH_BYPASS=true`, placeholder public Supabase values, `PAYLOAD_SECRET`, and admin Playwright URL/port). Existing explicit `E2E_AUTH_BYPASS=false` values are preserved unless you pass `--force-bypass`. Replace placeholders with real Supabase/demo-account values before testing live auth, hosted data, Payload/CMS, or database-backed admin workflows.

### Donor app in cloud sandboxes

After `bun run setup:mission-control:cloud`, start the donor dev server with the same CI env wrapper Turbo uses for admin and E2E (plain `bun run dev:donor` can return HTTP 500 because `NEXT_PUBLIC_*` vars from root `.env.local` are not always forwarded to the Turbo child):

```bash
node scripts/run-with-ci-env.mjs -- bun run dev:donor
```

Then open `http://localhost:3000`. For all three apps with one command, use `bun run dev:all` (loads `--env-file=.env.local`).

### Local Supabase startup

Docker and Supabase CLI must be installed and running before starting local Supabase. After starting Docker (`sudo dockerd &`), wait until `docker info` succeeds before running `supabase start` from the repo root.

**Known issue**: Migration `20260214090000_foundation_1_schema.sql` uses `LOCK TABLE` outside a transaction block, which fails with the Supabase CLI. Later migrations also have dependency chains that require the foundation schema. Workaround:

Use a unique staging directory so concurrent cloud VMs do not collide, and keep `seed.sql` out of the migration restore glob:

```bash
STAGING="$(mktemp -d)"
mkdir -p "$STAGING/migrations"
for f in supabase/migrations/2026*.sql; do mv "$f" "$STAGING/migrations/"; done
mv supabase/seed.sql "$STAGING/seed.sql"
```

1. Move **all** `2026*` migrations and `seed.sql` out as shown above.
2. Run `supabase start` (applies only the init migration `20250101000000`)
3. Restore migrations and seed separately: `mv "$STAGING/migrations/"*.sql supabase/migrations/` and `mv "$STAGING/seed.sql" supabase/seed.sql`.
4. Apply foundation migration: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres --single-transaction < supabase/migrations/20260214090000_foundation_1_schema.sql`
5. Record it in the migration table: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres -c "INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260214090000');"`
6. Apply remaining migrations in order (without `--single-transaction` for those with explicit `BEGIN`/`COMMIT`); record each version in `supabase_migrations.schema_migrations`
7. Apply seed: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres < supabase/seed.sql` (use without `--single-transaction` since the seed contains its own `BEGIN`/`COMMIT`)

### Environment variables

Keep secrets in **repo-root** `.env.local` (gitignored). Each app’s `next.config.ts` calls **`loadEnvConfig` from `@next/env`** on the monorepo root so Payload and Next see `SUPABASE_DB_URL`, `PAYLOAD_DATABASE_URI`, etc., without copying files.

Optional (older pattern): symlink root `.env.local` into each app if you rely on tooling that only reads `apps/<app>/.env.local`:

```bash
ln -sf ../../.env.local apps/donor/.env.local
ln -sf ../../.env.local apps/admin/.env.local
ln -sf ../../.env.local apps/missionary/.env.local
```

Minimum required env vars for local dev (from `supabase status -o env`):

- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>`

Optional (local dev and Cursor Cloud sandboxes only; do **not** rely on this in production or shared previews unless you deliberately accept weaker startup checks):

- `SKIP_ENV_VALIDATION=1` — bypasses strict env schema validation when optional keys like Stripe/Sentry are not set (see `packages/env/src/schema.ts`).

### Checks

Standard commands documented in `AGENTS.md` monorepo rules section:

- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Unit tests: `bun run test:unit`
- All checks: `bun run check`
