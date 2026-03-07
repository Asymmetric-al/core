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
- Admin proxy enforces staff/admin/super-admin access before `/admin`, Payload REST, and GraphQL routes.
- Explicit public allowlist exceptions exist for:
  - `/api/cms/public/*`
  - `/api/health`
  - auth/login metadata routes needed before a session exists

## Tenant isolation model

- Shared tenant context is derived from authenticated CMS user data.
- Collection access is deny-by-default and tenant-scoped for non-super-admin users.
- Public endpoints resolve tenant from:
  1. `?tenant=<slug>` query override
  2. host / forwarded host domain match
  3. subdomain slug fallback
- Public endpoints only resolve **active** tenants.
- Public endpoints use explicit tenant + published-only filters and return host-varying `no-store` responses until cross-app invalidation is implemented.

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

| Method | Endpoint                          | Tenant resolution                                      | Source file                                              | Response contract                                                                 |
| ------ | --------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `GET`  | `/api/cms/public/pages/:slug*`    | `?tenant=`, host domain match, then subdomain fallback | `apps/admin/app/api/cms/public/pages/[...slug]/route.ts` | `{ tenant: { id, slug }, page }` on success, structured `404/500` error otherwise |
| `GET`  | `/api/cms/public/navigation`      | `?tenant=`, host domain match, then subdomain fallback | `apps/admin/app/api/cms/public/navigation/route.ts`      | `{ tenant: { id, slug }, navigation }` where `navigation` can be `null`           |
| `GET`  | `/api/cms/public/updates?limit=5` | `?tenant=`, host domain match, then subdomain fallback | `apps/admin/app/api/cms/public/updates/route.ts`         | `{ tenant: { id, slug }, updates: [] }` with `limit` clamped to `1..20`           |

### Shared public CMS contract

The public CMS boundary is intentionally typed and runtime-validated in one place:

- Shared schema/types: `packages/api/src/cms/public.ts`
- Admin-side DTO mapping + headers: `apps/admin/src/cms/public/response.ts`
- Donor-side parsing + fetch wrapper: `apps/donor/lib/cms/client.ts`

Rules:

- Admin routes **must not** return raw Payload docs directly.
- Downstream consumers **must** parse the shared response shape instead of casting `response.json()` blindly.
- Error bodies are machine-readable:

```json
{
  "error": {
    "code": "TENANT_NOT_FOUND | PAGE_NOT_FOUND | UPSTREAM_FAILURE",
    "message": "Human-readable explanation"
  }
}
```

- Route responses send:
  - `Cache-Control: no-store`
  - `Vary: x-forwarded-host, host`

This keeps host-based tenant resolution safe while there is still a cross-app HTTP boundary between admin/Payload and donor SSR.

### Consumer contract in donor app

`apps/donor/lib/cms/client.ts` is the canonical integration layer for downstream apps. It forwards `x-forwarded-host`, validates the shared DTO contract at runtime, and preserves the difference between `404` content misses and operational failures via `CmsFetchError`.

- `fetchPublishedCmsPage(slugSegments, hostOverride?)`
- `fetchPublishedCmsUpdates(limit?, hostOverride?)`
- `lexicalToPlainText(value)`

This file should be reused as a reference when wiring additional apps (missionary/public microsites) to avoid tenant-resolution drift.

## Content integrity constraints

Payload collection hooks enforce the invariants the public API depends on:

- `pages`: slug must be unique within a tenant
- `navigation`: only one navigation document is allowed per tenant

Source:

- `apps/admin/src/cms/hooks/public-contract.ts`
- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/src/cms/collections/navigation.ts`

## Operational guarantees

- CI integration job executes SQL migrations + Payload migrations in deterministic order.
- Payload migration status is checked in CI to catch drift.
- Tenant access logic is covered with unit tests and focused Playwright checks.
