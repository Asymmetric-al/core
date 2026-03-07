# Site Studio (Payload CMS) development guide

This guide explains how to run and validate the Site Studio integration that lives inside `apps/admin`.

## What is included

- Payload admin UI mounted at `/admin` in Mission Control
- Payload admin theming bridged to shared Maia + Zinc design tokens from `@asym/ui`
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

`cms:importmap` now runs Payload generation plus post-processing to keep the generated file lint/type-safe automatically.

## Design-system alignment checks (Maia + Zinc)

- Shared shadcn config lives in `packages/ui/components.json` and is pinned to:
  - `style: maia`
  - `base: base`
  - `baseColor: zinc`
  - `theme: zinc`
- Shared tokens come from `packages/ui/styles/globals.css` (Tailwind v4 `@theme inline` + `@source` monorepo scanning).
- Payload visual token bridge lives in `apps/admin/src/styles/payloadStyles.css` and must only reference existing shared tokens/variables (no one-off hex values).
- Payload UI override components (`apps/admin/src/cms-ui/*`) should use shared primitives from `@asym/ui/components/shadcn/*` and motion patterns from `@asym/lib/motion`.

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

## Cloud VM walkthrough capture

If you want a one-command Site Studio walkthrough recording in a cloud VM:

```bash
bun run site-studio:walkthrough:cloud
```

Required env vars in the VM session:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PAYLOAD_SECRET`
- `PAYLOAD_DATABASE_URI`

Output is written under `site-studio-review/<date>/cloud-agent/`:

- `results/` raw Playwright artifacts
- `merged/site-studio-full-walkthrough.mp4`
- `screenshots/site-studio-frame-*.png`

## API endpoint quick reference

### Public endpoints (tenant-aware, no auth)

- `GET /api/cms/public/pages/<slug>`
  - Success: `{ tenant: { id, slug }, page }`
  - Errors use structured bodies:
    - `404 { error: { code: "TENANT_NOT_FOUND", message: "Tenant not found" } }`
    - `404 { error: { code: "PAGE_NOT_FOUND", message: "Page not found" } }`
    - `500 { error: { code: "UPSTREAM_FAILURE", message: "Failed to fetch page content" } }`
- `GET /api/cms/public/navigation`
  - Success: `{ tenant: { id, slug }, navigation }`
- `GET /api/cms/public/updates?limit=5`
  - Success: `{ tenant: { id, slug }, updates: [] }`
  - `limit` is clamped to `1..20`

Implementation notes:

- Shared schema/types live in `packages/api/src/cms/public.ts`
- Admin DTO/headers live in `apps/admin/src/cms/public/response.ts`
- Donor runtime parsing lives in `apps/donor/lib/cms/client.ts`
- Responses are `Cache-Control: no-store` and `Vary: x-forwarded-host, host`
- The donor app intentionally performs uncached reads here until a cross-app invalidation mechanism exists

Tenant resolution priority:

1. `?tenant=<slug>`
2. `x-forwarded-host` or `host` exact domain match
3. subdomain slug fallback

Only active tenants are eligible for resolution.

### Staff endpoints (auth required)

- `GET/POST/PATCH/PUT/DELETE /api/*` (Payload REST)
- `POST /api/graphql` (Payload GraphQL)

These are guarded by Mission Control auth middleware and require `staff`, `admin`, or `super_admin`.

## Public signup note

Self-service registration only supports `donor` and `missionary` roles.
Privileged roles are provisioned separately and are not derived from public form input.

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
