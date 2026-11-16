# Mutation Wrapper (`withOperation`)

## What It Is

`withOperation` is the standard entry point for protected mutation handlers in
`packages/api/src/`. It centralizes repeated setup so mutation handlers can stay
focused on domain logic.

## What It Does

`withOperation` runs the same setup sequence for each wrapped handler:

1. Create `requestId` with `crypto.randomUUID()`.
2. Read the request's `cookie` header so a `GET` handler is not statically
   prerendered under Cache Components before `cookies()` runs.
3. Initialize the admin DB client via `getAdminClient()`.
4. Load auth context via `getAuthContext(request)`.
5. Enforce access with `requireRole(auth, options.roles)` when `roles` is set,
   otherwise `requireAuth(auth)`.
6. Build the audit helper via `createAuditLogger(auth, request)`.
7. Call the wrapped handler with a typed `OperationContext`.
8. Normalize failures to `{ error, requestId }`:
   - Thrown errors go through `toErrorResponse(error, "Internal error", requestId)`;
     5xx errors are also logged. Next.js prerender control-flow errors are
     rethrown, never converted to JSON.
   - Handler-returned non-OK **JSON** responses whose body is an object with a
     **string** `error` property and no existing **string** `requestId` get
     `requestId` merged in. Other shapes or non-JSON responses are unchanged.

If the admin client is unavailable, it returns a `503` response that also
includes `requestId`.

## When To Use It

Use `withOperation` for `POST`, `PATCH`, `PUT`, and `DELETE` handlers in
`packages/api/src/`, and for `GET` handlers that need the same authenticated
admin-client and audit setup (many staff `GET` handlers already use it).

## When Not To Use It

- Public or unauthenticated handlers.
- Health endpoints under `packages/api/src/health/`.
- Read-only demo or stub handlers that always return a fixed response and do not
  run domain logic.
- Any handler outside `packages/api/`.

## Import Path Rule

Import it with a relative path to `packages/api/src/shared/with-operation.ts`
(for example `../../shared/with-operation`). It is intentionally not exported
from `packages/api/package.json`.

## `OperationContext` Reference

| Field           | Type                                   | Purpose                                    |
| --------------- | -------------------------------------- | ------------------------------------------ |
| `supabaseAdmin` | non-null admin `SupabaseClient`        | Privileged DB client for mutation work     |
| `auth`          | `AuthenticatedContext`                 | Authenticated user/tenant context          |
| `audit`         | `ReturnType<typeof createAuditLogger>` | Structured audit logging helper            |
| `request`       | `NextRequest`                          | Incoming request object                    |
| `requestId`     | `string`                               | Request correlation ID for error responses |
| `routeContext`  | `{ params?: Promise<...> }` (optional) | Dynamic route params, also passed as arg 2 |

## Wrapping a handler

1. Write `export const METHOD = withOperation(async (ctx, routeContext) => { ... }, options)`.
2. Pass role constraints through `options.roles` when needed.
3. Do not repeat setup the wrapper already does (`getAdminClient`, auth
   guards, audit logger).
4. Keep fixed-response demo/stub handlers as plain route functions; their
   error bodies may omit `requestId`.
5. Test the auth/admin failure paths and successful passthrough.
