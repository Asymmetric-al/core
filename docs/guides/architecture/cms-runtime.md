# CMS runtime architecture

## Runtime placement

Payload runs in `apps/admin` and is exposed through:

- Admin UI: `/admin`
- REST/GraphQL routes under `(payload)` route group
- Public CMS routes: `/api/cms/public/*`

This keeps CMS management inside Mission Control and avoids running multiple Payload runtimes.

## Data model boundaries

- Existing platform tables remain in `public`.
- Payload-managed CMS tables live in `cms` schema.
- SQL schema creation: `supabase/migrations/20260223100000_create_cms_schema.sql`
- Payload migration execution is handled by `bun run cms:migrate`.

## Authentication model

- Supabase remains the identity provider.
- Payload auth uses a custom Supabase session strategy (`supabase-strategy`).
- Admin middleware enforces staff/admin/super-admin access before `/admin` routes.

## Tenant isolation model

- Shared tenant context is derived from authenticated CMS user data.
- Collection access is deny-by-default and tenant-scoped for non-super-admin users.
- Public endpoints resolve tenant from:
  1. `?tenant=<slug>` query override
  2. host / forwarded host domain match
  3. subdomain slug fallback
- Public endpoints use explicit tenant + published-only filters.

## Public rendering flow

1. Donor app requests CMS data from `apps/admin` public CMS endpoints.
2. Admin endpoint resolves tenant context and applies published-only filters.
3. Donor app renders fallback content for unmatched routes from returned CMS page data.

## API surface and contracts

### Staff-only management APIs (Payload runtime)

| Method                              | Endpoint                         | Auth                    | Source file                                       | Notes                                                                 |
| ----------------------------------- | -------------------------------- | ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| `GET/POST/PATCH/PUT/DELETE/OPTIONS` | `/api/*` (Payload REST handlers) | Staff/Admin/Super Admin | `apps/admin/app/(payload)/api/[...slug]/route.ts` | Includes collection CRUD and upload operations from Payload REST API. |
| `POST/OPTIONS`                      | `/api/graphql`                   | Staff/Admin/Super Admin | `apps/admin/app/(payload)/api/graphql/route.ts`   | Payload GraphQL endpoint for admin-authorized queries and mutations.  |

### Public, tenant-scoped read APIs

| Method | Endpoint                          | Tenant resolution                                      | Source file                                              | Response contract                                                             |
| ------ | --------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `GET`  | `/api/cms/public/pages/:slug*`    | `?tenant=`, host domain match, then subdomain fallback | `apps/admin/app/api/cms/public/pages/[...slug]/route.ts` | `{ tenant: { id, slug }, page }` on success, `404` with `{ error }` otherwise |
| `GET`  | `/api/cms/public/navigation`      | `?tenant=`, host domain match, then subdomain fallback | `apps/admin/app/api/cms/public/navigation/route.ts`      | `{ tenant: { id, slug }, navigation }` where `navigation` can be `null`       |
| `GET`  | `/api/cms/public/updates?limit=5` | `?tenant=`, host domain match, then subdomain fallback | `apps/admin/app/api/cms/public/updates/route.ts`         | `{ tenant: { id, slug }, updates: [] }` with `limit` clamped to `1..20`       |

### Consumer contract in donor app

`apps/donor/lib/cms/client.ts` is the canonical integration layer for downstream apps. It forwards `x-forwarded-host` and normalizes CMS responses into app-safe helpers:

- `fetchPublishedCmsPage(slugSegments, hostOverride?)`
- `fetchPublishedCmsUpdates(limit?, hostOverride?)`
- `lexicalToPlainText(value)`

This file should be reused as a reference when wiring additional apps (missionary/public microsites) to avoid tenant-resolution drift.

## Operational guarantees

- CI integration job executes SQL migrations + Payload migrations in deterministic order.
- Payload migration status is checked in CI to catch drift.
- Tenant access logic is covered with unit tests and focused Playwright checks.
