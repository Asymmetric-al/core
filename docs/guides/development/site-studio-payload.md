# Site Studio (Payload CMS) development guide

This guide explains how to run and validate the Site Studio integration that lives inside `apps/admin`.

**Canonical architecture & inventory:** [`web-studio-living-spec.md`](../architecture/web-studio-living-spec.md) · **Local CMS runbook:** [`site-studio-local.md`](./site-studio-local.md) · **Operations runbook:** [`web-studio-runbook.md`](./web-studio-runbook.md) · **Handoff:** [`web-studio-handoff.md`](./web-studio-handoff.md)

## What is included

- Payload admin UI mounted at `/web-studio` in Mission Control
- Payload admin theming bridged to shared Maia + Zinc design tokens from `@asym/ui`
- Payload provider shell embedded inside the Mission Control root layout, so `/web-studio` keeps Payload form/access context without rendering a second document shell
- **Web Studio editorial shell:** Mission Control–native list/edit workspaces for:
  - `pages`
  - `navigation`
  - `missionary-profiles`
  - `ministry-updates`
  - `media`
  - `page-templates`
  - `missionary-giving-pages`
  - `project-pages`
- Collection-specific native rollout flags (see rollback section) so each collection can fall back to stock Payload independently
- Authenticated draft preview at `/web-studio/preview/:collection/:id` for page-like collections and ministry updates
- Editor state strip for dirty, saving, autosave, validation, lock, trash, preview, and publish state
- CMS tables in Postgres `cms` schema
- Tenant-aware collection access controls
- Public read endpoints under `/api/cms/public/*`
- Donor-side CMS consumption fallback for unmatched public routes

### Current parity boundary (Phase 7)

- Native by default for editorial collections — see the **living spec** for the full list.
- Still stock Payload for:
  - nested `versions`, `version`, `api`, and `live preview` document subviews
  - `tenants` and `cms-users`

This is intentional: the default document body remains Payload-owned and stable, while nested subviews still use stock Payload routes/tabs until dedicated wrappers are added safely.

## Required environment variables

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PAYLOAD_SECRET=local-payload-secret
PAYLOAD_DATABASE_URI=<payload-database-uri>
# Optional for hosted/Vercel runtime; defaults to 2 there.
# PAYLOAD_DATABASE_POOL_MAX=2
CMS_BASE_URL=http://127.0.0.1:3030
# Optional: donor origin for published public links from editor chrome (defaults to http://127.0.0.1:3000)
NEXT_PUBLIC_DONOR_URL=http://127.0.0.1:3000
# Optional: server-only donor origin (same resolution order as preview-url; use when NEXT_PUBLIC_* is unset in CI)
# DONOR_APP_URL=http://127.0.0.1:3000
# Optional: disable native collection UIs (stock Payload views)
# CMS_WEB_STUDIO_NATIVE_PAGES=false
# CMS_WEB_STUDIO_NATIVE_NAVIGATION=false
# CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES=false
# CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES=false
# CMS_WEB_STUDIO_NATIVE_MEDIA=false
# CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES=false
# CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES=false
# CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES=false
```

`PAYLOAD_DATABASE_URI` can point at local Supabase Postgres or a hosted Postgres test database. On Vercel and protected deployments, Web Studio bounds Payload's Postgres pool to `2` by default so the Supavisor session pool is not exhausted by node-postgres's default 10-client pool.

### Form stack note

- **Payload document editing** (collection edit bodies, drafts, publish, upload, relationship wiring): keep Payload’s document form context and hooks — do **not** put the main document fields on TanStack Form.
- **Mission Control-only dialogs/settings** in this workstream: use **TanStack Form + Zod** via `@asym/ui` (`useAsymForm`), not React Hook Form. If an older doc mentions RHF for this workstream, treat **this guide + the Phase 1 prompt** as source of truth.

## Local startup workflow

For the deterministic local Payload/Supabase path, prefer the local runbook:

```bash
bun run cms:local:reset
bun run dev:admin
bun run dev:donor
```

See [`site-studio-local.md`](./site-studio-local.md) for the generated env,
seed data, strict verification, and troubleshooting path.

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

`cms:importmap` runs Payload generation and post-processes **every** existing Payload import map under `apps/admin/app/(payload)/` — today `web-studio/importMap.js` and, if present, legacy `admin/importMap.js` — for eslint, typed export, and formatting consistency.

### CMS smoke E2E and native shell

`bun run test:e2e:smoke:cms` sets **`CMS_WEB_STUDIO_NATIVE_PAGES=true`** for the Playwright process so native Web Studio assertions in `tests/e2e/cms-web-studio-native.spec.ts` match the intended rollout (native editorial shell on by default).

If you run that spec locally with **`CMS_WEB_STUDIO_NATIVE_PAGES=false`** (or `0`), the native-shell tests **skip** because stock Payload views replace the Mission Control shell for Pages (and the spec targets native-only UI).

**CI / agents:** run `bun run cms:importmap` with the repo-root `.env.local`
available. If you deliberately use `NODE_ENV=test`, export the required public
Supabase env vars first because Next.js skips `.env.local` in test mode.

## Design-system alignment checks (Maia + Zinc)

- Shared shadcn config lives in `packages/ui/components.json` and is pinned to:
  - `style: base-maia` (shadcn/ui Maia variant for **Base UI** primitives — see [schema](https://ui.shadcn.com/schema.json))
  - `tailwind.baseColor: zinc`
  - Zinc surfaces and semantic tokens are defined in `packages/ui/styles/globals.css`, not a separate `theme` field in `components.json`
  - Some older shared components may still import `@radix-ui/*` until migrated; new installs from the CLI should follow **Base UI Maia** (`base-maia`).
- Shared tokens come from `packages/ui/styles/globals.css` (Tailwind v4 `@theme inline` + `@source` monorepo scanning).
- Payload visual token bridge lives in `apps/admin/src/styles/payloadStyles.css` and must only reference existing shared tokens/variables (no one-off hex values).
- Payload UI override components (`apps/admin/src/cms-ui/*`) should use shared primitives from `@asym/ui/components/shadcn/*` and motion patterns from `@asym/lib/motion`.

4. Start both apps:

```bash
bun run dev:admin
bun run dev:donor
```

## Quick verification checklist

- Open `http://127.0.0.1:3030/web-studio` and confirm unauthenticated users are redirected to `/login`.
- Sign in as staff/admin and confirm Payload admin loads.
- Open each of the following and confirm the **Mission Control shell** (`data-testid="web-studio-native-shell"`) wraps the list:
  - `/web-studio/collections/pages`
  - `/web-studio/collections/navigation`
  - `/web-studio/collections/missionary-profiles`
  - `/web-studio/collections/ministry-updates`
  - `/web-studio/collections/media`
- Open a saved draft from `pages`, `ministry-updates`, `missionary-giving-pages`, or `project-pages` and confirm Payload's preview button opens `/web-studio/preview/<collection>/<id>` while unauthenticated access redirects to `/login`.
- Confirm the edit shell state strip changes for unsaved edits, save/publish, autosave, validation errors, and preview availability.
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
  - Success: `{ tenant: { slug }, page }` (`page` is serialized for stable additive fields — see `serializePublished-page.ts`)
  - Errors: `404 { error: "Tenant not found" }` or `404 { error: "Page not found" }`
- `GET /api/cms/public/missionary-pages/<id>` — published `missionary-giving-pages` by `missionaryId`
- `GET /api/cms/public/project-pages/<slug>` — published `project-pages` by slug
- `GET /api/cms/public/navigation`
  - Success: `{ tenant: { slug }, navigation }`
- `GET /api/cms/public/updates?limit=5`
  - Success: `{ tenant: { slug }, updates: [] }`
  - `limit` is clamped to `1..20`

Tenant resolution priority:

1. `x-forwarded-host` or `host` exact domain match
2. subdomain slug fallback
3. `?tenant=<slug>` only when the host does not resolve a tenant
4. development/test only: loopback host fallback from `CMS_LOCAL_DEFAULT_TENANT_SLUG`

### Staff endpoints (auth required)

- `GET/POST/PATCH/PUT/DELETE /api/*` (Payload REST)
- `POST /api/graphql` (Payload GraphQL)
- `POST /api/web-studio/create-from-template` (Payload custom endpoint — template instantiation)
- `GET /web-studio/preview/:collection/:id` (authenticated draft preview; uses Payload access control with `overrideAccess: false`)
- `GET /api/admin/missionaries`, `GET /api/admin/funds` (thin re-exports to `@asym/api` — Web Studio wizards)

These are guarded by Mission Control auth middleware and require `staff`, `admin`, or `super_admin` (except Payload’s own auth rules where applicable).

### Ownership boundary

- Payload/Web Studio owns content structure, drafts, versions, media, navigation, templates, preview, and publish state.
- Twenty/CRM owns donor relationships, notes, donor detail, donor reports, and CRM workflow records.
- Stripe/Supabase giving owns gifts, staged gifts, allocations, receipt facts, reconciliation, and payment state.
- Resend/app email services own send logs, receipt sends, and delivery events.
- CMS giving CTAs may store copy and content references, but public CTA URLs resolve to the donor checkout flow by validated `missionary_id` / `fund_id` references; CMS must not create gifts or store payment truth.
- Payload/CMS tenant ids and public Supabase tenant UUIDs stay separate. Payload writes use CMS tenant document ids; giving/CRM reference validation uses `publicTenantId` from authenticated request context.

## Rollback notes

### Collection-level Web Studio rollback

Each editorial collection can be disabled independently:

```bash
export CMS_WEB_STUDIO_NATIVE_PAGES=false
export CMS_WEB_STUDIO_NATIVE_NAVIGATION=false
export CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES=false
export CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES=false
export CMS_WEB_STUDIO_NATIVE_MEDIA=false
export CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES=false
export CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES=false
export CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES=false
bun run cms:importmap
```

Then redeploy. Disabled collections fall back to stock Payload list/edit views while the rest of Web Studio remains native.

For import-map-only repairs, prefer `bun run cms:importmap` without
`NODE_ENV=test` so the command sees `.env.local` and the same plugin/env shape as
local development.

If a deployment must be rolled back:

1. Revert app/runtime changes (routes, payload config, access files).
2. Keep the `cms` schema in place unless data loss is explicitly approved.
3. If absolutely required, revert Payload migrations first, then application code.
4. Re-run:
   - `bun run cms:migrate:status`
   - `bun run typecheck:admin`
   - `bun run lint:admin`

Do **not** drop `cms` data in production without an approved backup + restore plan.
