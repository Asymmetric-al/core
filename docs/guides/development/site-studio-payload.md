# Site Studio (Payload CMS) development guide

This guide explains how to run and validate the Site Studio integration that lives inside `apps/admin`.

## What is included

- Payload admin UI mounted at `/admin` in Mission Control
- CMS tables in Postgres `cms` schema
- Tenant-aware collection access controls
- Public read endpoints under `/api/cms/public/*`
- Donor-side CMS consumption fallback for unmatched public routes

## Required environment variables

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PAYLOAD_SECRET=local-payload-secret
PAYLOAD_DATABASE_URI=postgresql://postgres:postgres@127.0.0.1:54322/postgres
CMS_BASE_URL=http://127.0.0.1:3030
```

`PAYLOAD_DATABASE_URI` can point at local Supabase Postgres or a hosted Postgres test database.

## Local startup workflow

1. Apply SQL migrations:

```bash
bun run db:migrate:local
```

2. Apply Payload migrations:

```bash
bun run cms:migrate
bun run cms:migrate:status
```

3. Generate admin import map (after any component override changes):

```bash
bun run cms:importmap
```

4. Start both apps:

```bash
bun run dev:admin
bun run dev:donor
```

## Quick verification checklist

- Open `http://127.0.0.1:3030/admin` and confirm unauthenticated users are redirected to `/login`.
- Sign in as staff/admin and confirm Payload admin loads.
- Confirm collection lists are tenant-filtered for non-super-admin users.
- Call:
  - `GET /api/cms/public/pages/<slug>?tenant=<tenant-slug>`
  - `GET /api/cms/public/navigation?tenant=<tenant-slug>`
  - `GET /api/cms/public/updates?tenant=<tenant-slug>`
- Open donor unknown route and confirm fallback behavior does not leak other tenants’ content.

## Rollback notes

If a deployment must be rolled back:

1. Revert app/runtime changes (routes, payload config, access files).
2. Keep the `cms` schema in place unless data loss is explicitly approved.
3. If absolutely required, revert Payload migrations first, then application code.
4. Re-run:
   - `bun run cms:migrate:status`
   - `bun run typecheck:admin`
   - `bun run lint:admin`

Do **not** drop `cms` data in production without an approved backup + restore plan.
