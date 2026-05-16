# Site Studio local CMS runbook

This runbook is the deterministic local path for Payload CMS and Web Studio. It
uses local Supabase/Postgres only and does not require hosted Supabase, Vercel,
Stripe, Resend, Cloudinary, Twenty, or production secrets.

## Commands

Destructive reset for a clean local CMS:

```bash
bun run cms:local:reset
```

Non-destructive repair/bootstrap:

```bash
bun run cms:local:bootstrap
```

Seed or repair CMS rows only:

```bash
bun run cms:local:seed
```

Verify local DB, Payload, seed rows, import map, media directory, and public
endpoints when the admin server is running:

```bash
bun run cms:local:verify
```

Start setup plus admin and donor dev servers:

```bash
bun run cms:local:dev
```

Strict local browser proof:

```bash
bun run test:e2e:cms:local
```

`cms:local:reset` resets the local Supabase database for this checkout. It does
not target hosted databases. Commands are noninteractive.

## Local URLs

- Admin / Mission Control: `http://127.0.0.1:3030`
- Web Studio: `http://127.0.0.1:3030/web-studio`
- Donor app: `http://127.0.0.1:3000` for normal dev or `http://127.0.0.1:3005` under Playwright
- Supabase API: `http://127.0.0.1:54321`
- Supabase Studio: `http://127.0.0.1:54323`
- Local Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Demo login

```text
Email: demo-owner@givehope.test
Password: demo-password
```

The local path uses the real Supabase demo account flow. `E2E_AUTH_BYPASS=false`
is generated for the local CMS path; the strict local E2E suite uses the demo
login UI and fails if the local Payload DB or proof user is missing.

## What setup does

`cms:local:reset`:

1. Verifies local prerequisites (`bun`, Docker/Supabase runtime).
2. Starts local Supabase if needed.
3. Repairs root `.env.local` with local Supabase, Payload, admin, donor, and
   Web Studio values.
4. Links app env files through `bun run env:link-apps`.
5. Runs the existing local Supabase reset and public seed path.
6. Runs committed Payload migrations for the `cms` schema.
7. Regenerates the Payload import map.
8. Seeds CMS data idempotently.
9. Runs `cms:local:verify`.

`cms:local:bootstrap` follows the same shape without resetting local data. It
uses non-destructive Supabase migration push and then repairs/seeds missing CMS
content.

By default, env repair preserves non-empty values already in `.env.local`. If a
checkout has hosted values and you want to rewrite them to local-only values for
this workflow, pass the local force flag:

```bash
bun run cms:local:reset -- --force-env
```

## Seed data

Public Supabase seed:

- Tenant `00000000-0000-0000-0000-000000000001`, slug `give-hope-demo`
- Demo admin user/profile `11111111-1111-1111-1111-111111111111`
- Active staff membership
- Missionaries and funds used by giving/project page creation

CMS seed:

- Payload tenant `give-hope-demo` with `primaryDomain=localhost`
- CMS user `demo-owner@givehope.test` with admin tenant access
- Media fixture `Local CMS Demo Image`
- Page templates:
  - `standard-local`
  - `missionary-giving-local`
  - `project-local`
  - `ministry-update-local`
- Published page `local-cms-home`
- Draft preview page `local-cms-draft-preview`
- Main navigation
- Missionary profile linked to the seeded public missionary
- Published ministry update `local-ministry-update`
- Published missionary giving page for the demo missionary
- Published project page `local-project`
- Second tenant `second-demo` with a colliding page slug for isolation tests

The seed script uses Payload Local API for CMS rows and is idempotent. Re-running
`bun run cms:local:seed` updates or preserves rows instead of duplicating them.

## Deterministic Payload schema

Local CMS setup writes:

```bash
PAYLOAD_DISABLE_SCHEMA_PUSH=1
```

This keeps Payload from creating development schema-push markers and makes
committed migrations the only local schema path. If `bun run cms:migrate`
reports a `dev` marker, run `bun run cms:local:reset` to realign the local
database with committed migrations.

## Tenant resolution locally

Public CMS endpoints still resolve tenants by primary domain, then subdomain,
then explicit `?tenant=<slug>`. In development/test only, loopback hosts
(`localhost`, `127.0.0.1`, `[::1]`) can fall back to:

```bash
CMS_LOCAL_DEFAULT_TENANT_SLUG=give-hope-demo
```

The fallback is ignored in production. This allows donor requests from
`localhost:3000`, `localhost:3005`, or `127.0.0.1:*` to consume local CMS
content without manual query parameters.

## Public endpoint checks

With `bun run dev:admin` running:

```bash
curl -H 'x-forwarded-host: localhost:3000' \
  http://127.0.0.1:3030/api/cms/public/pages/local-cms-home

curl -H 'x-forwarded-host: localhost:3000' \
  http://127.0.0.1:3030/api/cms/public/navigation

curl -H 'x-forwarded-host: localhost:3000' \
  'http://127.0.0.1:3030/api/cms/public/updates?limit=5'

curl -H 'x-forwarded-host: localhost:3000' \
  http://127.0.0.1:3030/api/cms/public/project-pages/local-project

curl -H 'x-forwarded-host: localhost:3000' \
  http://127.0.0.1:3030/api/cms/public/missionary-pages/11111111-1111-1111-1111-111111111111
```

## Common failures

| Symptom                                                  | Fix                                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Docker is not running                                    | Start Docker, then rerun `bun run cms:local:reset`.                                                           |
| Supabase ports are occupied                              | Stop the conflicting process or Supabase project, then rerun setup.                                           |
| `.env.local` still points to hosted DB                   | Run `bun run cms:local:reset -- --force-env` to rewrite local CMS values.                                     |
| Payload cannot connect to Postgres                       | Run `bun run cms:local:reset`; verify `PAYLOAD_DATABASE_URI` points to `127.0.0.1:54322`.                     |
| `Tenant not found` from local public endpoints           | Ensure `CMS_LOCAL_DEFAULT_TENANT_SLUG=give-hope-demo`, rerun `bun run cms:local:seed`, and restart admin dev. |
| Web Studio redirects to login after demo click           | Run `bun run cms:local:verify`; confirm demo profile and staff membership exist.                              |
| Payload login screen appears instead of Web Studio shell | Run `bun run cms:local:seed`; the CMS user/tenant mirror is missing or stale.                                 |
| Import map errors                                        | Run `bun run cms:importmap`.                                                                                  |
| Media upload/list errors                                 | Ensure `apps/admin/media` exists; `cms:local:bootstrap` creates it.                                           |
| Payload migration status dirty                           | Run `bun run cms:migrate`, then `bun run cms:migrate:status`.                                                 |

## Final proof set

Use this before declaring local CMS ready:

```bash
bun run cms:local:reset
bun run cms:local:verify
bun run test:unit:cms
bun run test:e2e:cms:local
bun run lint:admin
bun run typecheck:admin
bun run cms:importmap
bun run cms:migrate:status
```
