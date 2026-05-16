# CMS runtime architecture

**Canonical Web Studio narrative (phases 1–3+, diagrams, stack map):** [`web-studio-living-spec.md`](./web-studio-living-spec.md)

## Runtime placement

Payload runs in `apps/admin` and is exposed through:

- Admin UI: `/web-studio`
- REST/GraphQL routes under `(payload)` route group
- Public CMS routes: `/api/cms/public/*`

This keeps CMS management inside Mission Control and avoids running multiple Payload runtimes.

### Web Studio (Phase 2–3 — editorial collections + product flows)

Mission Control–native Web Studio shell + shared list/document workspaces cover editorial collections under `apps/admin/src/cms-ui/web-studio/`, including Phase 3 builder collections:

- `pages`
- `navigation`
- `missionary-profiles`
- `ministry-updates`
- `media`
- `page-templates`
- `missionary-giving-pages`
- `project-pages`

Top-level Payload admin views (still under `/web-studio`) provide template gallery and create wizards:

- `/web-studio/templates` — browse `page-templates` (includes `draft=true` so draft templates appear)
- `/web-studio/missionaries` — Supabase-backed missionary directory shortcuts
- `/web-studio/pages/give` — missionary giving page wizard
- `/web-studio/projects/new` — fund-backed project page wizard
- `/web-studio/pages/new-from-template` — standard page from template
- `/web-studio/ministry-updates/new` — ministry update starter from template

Draft instantiation uses the Payload root endpoint `POST /api/web-studio/create-from-template` (see `apps/admin/src/cms/create-from-template-endpoint.ts`), which runs inside Payload so collection access hooks apply.

Registration is collection-scoped via `admin.components.views` in each collection config and guarded by env rollout flags:

- `CMS_WEB_STUDIO_NATIVE_PAGES`
- `CMS_WEB_STUDIO_NATIVE_NAVIGATION`
- `CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES`
- `CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES`
- `CMS_WEB_STUDIO_NATIVE_MEDIA`
- `CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES`
- `CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES`
- `CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES`

Payload remains authoritative for schema, access, list state, and the document form runtime (including Lexical, relationships, arrays, and uploads). The native shell currently owns the **default** list/edit surfaces; nested document subviews such as versions/API/live-preview still use stock Payload routing/components unless a collection-specific wrapper is added later. See:

- `docs/guides/architecture/web-studio-phase1.md`
- `docs/guides/architecture/web-studio-phase2.md`

## Data model boundaries

- Existing platform tables remain in `public`.
- Payload-managed CMS tables live in `cms` schema.
- SQL schema creation: `supabase/migrations/20260223100000_create_cms_schema.sql`
- Payload migration execution is handled by `bun run cms:migrate`.

## Authentication model

- Supabase remains the identity provider.
- Payload auth uses a custom Supabase session strategy (`supabase-strategy`).
- Admin middleware enforces staff/admin/super-admin access before `/web-studio` routes.

## Tenant isolation model

- Shared tenant context is derived from authenticated CMS user data.
- Collection access is deny-by-default and tenant-scoped for non-super-admin users.
- Public endpoints resolve tenant from:
  1. host / forwarded host primary-domain match
  2. subdomain slug fallback when the host is not `www` or `localhost`
  3. `?tenant=<slug>` fallback only when the host does not resolve a tenant
  4. development/test-only loopback fallback from `CMS_LOCAL_DEFAULT_TENANT_SLUG`
- Public endpoints use explicit tenant + published-only filters.

## Public rendering flow

1. Donor app requests CMS data from `apps/admin` public CMS endpoints.
2. Admin endpoint resolves tenant context and applies published-only filters.
3. Donor app classifies public CMS read results before routing: content misses become `notFound()`, while CMS outages remain unavailable errors.
4. Donor app renders fallback content for unmatched routes from returned CMS page data.

### Published page-like content module

Published page-like content has one conceptual module with runtime-owned adapters:

- `packages/lib/cms/public-page.ts` owns shared descriptors, response/result types, path normalization, and cache tags for standard pages, missionary giving pages, and project pages.
- `packages/lib/cms/public-page-renderer.tsx` owns the supported server-side Lexical renderer and URL sanitization for public page content.
- `apps/admin/src/cms/public/published-page-read.ts` owns the Payload Local API adapter: collection selection, tenant predicate, `_status = published`, and JSON response shaping.
- `apps/donor/lib/cms/client.ts` owns the donor HTTP/cache adapter: `CMS_BASE_URL`, forwarded host, `fetch` cache policy, and result classification.

Payload runtime access stays in `apps/admin`; donor and shared packages must not import the Payload client directly.

## API surface and contracts

### Staff-only management APIs (Payload runtime)

| Method                              | Endpoint                         | Auth                    | Source file                                       | Notes                                                                 |
| ----------------------------------- | -------------------------------- | ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| `GET/POST/PATCH/PUT/DELETE/OPTIONS` | `/api/*` (Payload REST handlers) | Staff/Admin/Super Admin | `apps/admin/app/(payload)/api/[...slug]/route.ts` | Includes collection CRUD and upload operations from Payload REST API. |
| `POST/OPTIONS`                      | `/api/graphql`                   | Staff/Admin/Super Admin | `apps/admin/app/(payload)/api/graphql/route.ts`   | Payload GraphQL endpoint for admin-authorized queries and mutations.  |

### Public, tenant-scoped read APIs

| Method | Endpoint                               | Tenant resolution                                      | Source file                                                    | Response contract                                                                    |
| ------ | -------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GET`  | `/api/cms/public/pages/:slug*`         | host domain match, subdomain fallback, then `?tenant=` | `apps/admin/app/api/cms/public/pages/[...slug]/route.ts`       | `{ tenant: { slug }, page }` on success, `404` with `{ error }` otherwise            |
| `GET`  | `/api/cms/public/missionary-pages/:id` | same                                                   | `apps/admin/app/api/cms/public/missionary-pages/[id]/route.ts` | `{ tenant, page }` for published `missionary-giving-pages` matched by `missionaryId` |
| `GET`  | `/api/cms/public/project-pages/:slug`  | same                                                   | `apps/admin/app/api/cms/public/project-pages/[slug]/route.ts`  | `{ tenant, page }` for published `project-pages` matched by `slug`                   |
| `GET`  | `/api/cms/public/navigation`           | host domain match, subdomain fallback, then `?tenant=` | `apps/admin/app/api/cms/public/navigation/route.ts`            | `{ tenant: { slug }, navigation }` where `navigation` can be `null`                  |
| `GET`  | `/api/cms/public/updates?limit=5`      | host domain match, subdomain fallback, then `?tenant=` | `apps/admin/app/api/cms/public/updates/route.ts`               | `{ tenant: { slug }, updates: [] }` with `limit` clamped to `1..20`                  |

### Consumer contract in donor app

`apps/donor/lib/cms/client.ts` is the canonical integration layer for downstream apps. It forwards `x-forwarded-host` and normalizes CMS responses into app-safe helpers:

- `fetchPublishedCmsPage(slugSegments, hostOverride?)`
- `fetchPublishedCmsPageResult(slugSegments, hostOverride?)`
- `fetchPublishedMissionaryGivingPage(missionaryId, hostOverride?)`
- `fetchPublishedProjectPage(slug, hostOverride?)`
- `fetchPublishedCmsUpdates(limit?, hostOverride?)`

This file should be reused as a reference when wiring additional apps (missionary/public microsites) to avoid tenant-resolution drift.

## Operational guarantees

- CI integration job executes SQL migrations + Payload migrations in deterministic order.
- Payload migration status is checked in CI to catch drift.
- Tenant access logic is covered with unit tests and focused Playwright checks.
