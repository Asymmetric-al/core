# Site Studio (Payload CMS) development guide

This guide explains how to run and validate the Site Studio integration that lives inside `apps/admin`.

**Canonical architecture & inventory:** [`web-studio-living-spec.md`](../architecture/web-studio-living-spec.md) · **Runbook:** [`web-studio-runbook.md`](./web-studio-runbook.md) · **Handoff:** [`web-studio-handoff.md`](./web-studio-handoff.md)

## What is included

- Payload admin UI mounted at `/web-studio` in Mission Control
- Payload admin theming bridged to shared Maia + Zinc design tokens from `@asym/ui`
- **Web Studio Phase 2 editorial shell:** Mission Control–native list/edit workspaces for:
  - `pages`
  - `navigation`
  - `missionary-profiles`
  - `ministry-updates`
  - `media`
- Collection-specific native rollout flags (see rollback section) so each collection can fall back to stock Payload independently
- CMS tables in Postgres `cms` schema
- Tenant-aware collection access controls
- Public read endpoints under `/api/cms/public/*`
- Donor-side CMS consumption fallback for unmatched public routes

### Current parity boundary (Phase 2+)

- Native by default for editorial collections (including Phase 3: `page-templates`, `missionary-giving-pages`, `project-pages`) — see the **living spec** for the full list.
- Still stock Payload for most:
  - nested `versions`, `version`, `api`, and `live preview` document subviews
  - `tenants` and `cms-users`

This is intentional: the default document body remains Payload-owned and stable, while nested subviews still use stock Payload routes/tabs until dedicated wrappers are added safely.

## Required environment variables

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PAYLOAD_SECRET=local-payload-secret
PAYLOAD_DATABASE_URI=postgresql://postgres:postgres@127.0.0.1:54322/postgres
CMS_BASE_URL=http://127.0.0.1:3030
# Optional: donor origin for “Preview” links from Pages (defaults to http://127.0.0.1:3000)
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

`PAYLOAD_DATABASE_URI` can point at local Supabase Postgres or a hosted Postgres test database.

### Form stack note

- **Payload document editing** (collection edit bodies, drafts, publish, upload, relationship wiring): keep Payload’s document form context and hooks — do **not** put the main document fields on TanStack Form.
- **Mission Control-only dialogs/settings** in this workstream: use **TanStack Form + Zod** via `@asym/ui` (`useAsymForm`), not React Hook Form. If an older doc mentions RHF for this workstream, treat **this guide + the Phase 1 prompt** as source of truth.

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

`cms:importmap` runs Payload generation and post-processes **every** existing Payload import map under `apps/admin/app/(payload)/` — today `web-studio/importMap.js` and, if present, legacy `admin/importMap.js` — for eslint + typed export consistency.

### CMS smoke E2E and native shell

`bun run test:e2e:smoke:cms` sets **`CMS_WEB_STUDIO_NATIVE_PAGES=true`** for the Playwright process so native Web Studio assertions in `tests/e2e/cms-web-studio-native.spec.ts` match the intended rollout (native editorial shell on by default).

If you run that spec locally with **`CMS_WEB_STUDIO_NATIVE_PAGES=false`** (or `0`), the native-shell tests **skip** because stock Payload views replace the Mission Control shell for Pages (and the spec targets native-only UI).

**CI / agents:** if `PAYLOAD_SECRET` is missing, run with `NODE_ENV=test` so local dev defaults apply, e.g. `NODE_ENV=test bun run cms:importmap`.

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

1. `?tenant=<slug>`
2. `x-forwarded-host` or `host` exact domain match
3. subdomain slug fallback

### Staff endpoints (auth required)

- `GET/POST/PATCH/PUT/DELETE /api/*` (Payload REST)
- `POST /api/graphql` (Payload GraphQL)
- `POST /api/web-studio/create-from-template` (Payload custom endpoint — template instantiation)
- `GET /api/admin/missionaries`, `GET /api/admin/funds` (thin re-exports to `@asym/api` — Web Studio wizards)

These are guarded by Mission Control auth middleware and require `staff`, `admin`, or `super_admin` (except Payload’s own auth rules where applicable).

## Rollback notes

### Collection-level Web Studio rollback

Each editorial collection can be disabled independently:

```bash
CMS_WEB_STUDIO_NATIVE_PAGES=false
CMS_WEB_STUDIO_NATIVE_NAVIGATION=false
CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES=false
CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES=false
CMS_WEB_STUDIO_NATIVE_MEDIA=false
CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES=false
CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES=false
CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES=false
NODE_ENV=test bun run cms:importmap
```

Then redeploy. Disabled collections fall back to stock Payload list/edit views while the rest of Web Studio remains native.

If a deployment must be rolled back:

1. Revert app/runtime changes (routes, payload config, access files).
2. Keep the `cms` schema in place unless data loss is explicitly approved.
3. If absolutely required, revert Payload migrations first, then application code.
4. Re-run:
   - `bun run cms:migrate:status`
   - `bun run typecheck:admin`
   - `bun run lint:admin`

Do **not** drop `cms` data in production without an approved backup + restore plan.
