# Site Studio local CMS runbook

This runbook is the deterministic local path for Payload CMS and Web Studio. It
uses local Supabase/Postgres only and does not require hosted Supabase, Vercel,
Stripe, Resend, Cloudinary, or production secrets.

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

CMS seed (since WP6 part 2b, `scripts/cms/lib/cms-fixtures.mjs`):

- A Site presentation for every seed Site in `public.sites`, under the Site's id
- For each organization's default Site: the media record `Local CMS Demo Image`,
  the published page `local-cms-home`, the draft page `local-cms-draft-preview`
  and the menu `Main Navigation`
- No CMS login or organization row: a login gets its `principal-links` row when
  it first signs in to Web Studio, and starters live in code

Every organization in the seed gets the same rows, so the isolation tests have a
second organization with the same page addresses. The seed writes through the
service port (`apps/admin/src/cms/ports/service-port.ts`), refuses a database
that is not on this machine, and is idempotent: re-running
`bun run cms:local:seed` keeps rows instead of duplicating them. CI runs the
same fixtures with `bun run cms:fixtures` after the demo seed.

## Deterministic Payload schema

Local CMS setup writes:

```bash
PAYLOAD_DISABLE_SCHEMA_PUSH=1
```

This keeps Payload from creating development schema-push markers and makes
committed migrations the only local schema path. If `bun run cms:migrate`
reports a `dev` marker, run `bun run cms:local:reset` to realign the local
database with committed migrations.

## Retired prototype public CMS endpoints

The prototype `/api/cms/public/*` routes were retired in WP6 part 2a (AL-2679) ahead of WP7's public reader. Both `bun run cms:local:seed` and `bun run cms:local:verify` refuse non-loopback database URLs before connecting, and `cms:local:verify` asserts that the five retired public CMS paths answer `404` when `dev:admin` is running.

## Common failures

| Symptom                                                  | Fix                                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Docker is not running                                    | Start Docker, then rerun `bun run cms:local:reset`.                                       |
| Supabase ports are occupied                              | Stop the conflicting process or Supabase project, then rerun setup.                       |
| `.env.local` still points to hosted DB                   | Run `bun run cms:local:reset -- --force-env` to rewrite local CMS values.                 |
| Payload cannot connect to Postgres                       | Run `bun run cms:local:reset`; verify `PAYLOAD_DATABASE_URI` points to `127.0.0.1:54322`. |
| Retired `/api/cms/public/*` route returns non-404        | Restart `bun run dev:admin` so the current app build is serving.                          |
| Web Studio redirects to login after demo click           | Run `bun run cms:local:verify`; confirm demo profile and staff membership exist.          |
| Payload login screen appears instead of Web Studio shell | Run `bun run cms:local:seed`; the CMS user/tenant mirror is missing or stale.             |
| Import map errors                                        | Run `bun run cms:importmap`.                                                              |
| Media upload/list errors                                 | Ensure `apps/admin/media` exists; `cms:local:bootstrap` creates it.                       |
| Payload migration status dirty                           | Run `bun run cms:migrate`, then `bun run cms:migrate:status`.                             |

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
