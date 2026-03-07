# Mutation Wrapper (`withOperation`)

## What It Is

`withOperation` is the standard entry point for protected mutation handlers in
`packages/api/src/`. It centralizes repeated setup so mutation handlers can stay
focused on domain logic.

## What It Does

`withOperation` runs the same setup sequence for each wrapped handler:

1. Create `requestId` with `crypto.randomUUID()`.
2. Initialize admin DB client via `getAdminClient()`.
3. Load auth context via `getAuthContext()`.
4. Enforce access with `requireRole(...)` or `requireAuth(...)`.
5. Build audit helper via `createAuditLogger(...)`.
6. Call the wrapped handler with a typed `OperationContext`.
7. Normalize thrown errors through `toApiHttpError(...)`, and normalize
   handler-returned JSON error responses, so wrapped failures return
   `{ error, requestId }`.

If the admin client is unavailable, it returns a `503` response that also
includes `requestId`.

## When To Use It

Use `withOperation` for `POST`, `PATCH`, `PUT`, and `DELETE` handlers in
`packages/api/src/`.

## When Not To Use It

- `GET` handlers, unless they already require the same auth/admin/audit setup.
- Health endpoints under `packages/api/src/health/`.
- Read-only demo/no-op endpoints that should return a fixed response without
  touching auth or admin-client setup.
- Any handler outside `packages/api/`.

## Import Path Rule

Always import it with a relative path from route modules:

- `../shared/with-operation` (or equivalent relative path)

Do not export `withOperation` from `packages/api/package.json`.

## `OperationContext` Reference

| Field           | Type                                   | Purpose                                    |
| --------------- | -------------------------------------- | ------------------------------------------ |
| `supabaseAdmin` | `SupabaseClient`                       | Privileged DB client for mutation work     |
| `auth`          | `AuthenticatedContext`                 | Authenticated user/tenant context          |
| `audit`         | `ReturnType<typeof createAuditLogger>` | Structured audit logging helper            |
| `request`       | `NextRequest`                          | Incoming request object                    |
| `requestId`     | `string`                               | Request correlation ID for error responses |

## Migration Checklist

1. Keep the existing domain logic body intact.
2. Replace boilerplate setup with:
   - `export const METHOD = withOperation(async (ctx) => { ... }, options)`
3. Pass role constraints through `options.roles` when needed.
4. Remove duplicate imports now handled by the wrapper
   (`getAdminClient`, auth guards, audit logger setup).
5. Preserve existing status codes and success payloads from domain logic.
   Wrapped error responses should consistently include `requestId`.
6. Add or update tests for auth/admin failure paths and successful passthrough.
