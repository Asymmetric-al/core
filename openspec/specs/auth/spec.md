# auth Specification

## Purpose

Define how authenticated server-side code resolves user context, enforces role-based access, exposes demo account sign-in, and currently handles request middleware.

## Requirements

### Requirement: Auth context is derived from Supabase session and profile data

Server-side auth helpers SHALL resolve application auth context from the current Supabase session and the matching `profiles` row.

#### Scenario: Authenticated user with a tenant profile

- **WHEN** `getAuthContext()` runs for a request with a valid Supabase session
- **AND** the authenticated user has a matching row in `public.profiles`
- **THEN** the returned context includes `userId`, `profileId`, `tenantId`, and `role`
- **AND** `isAuthenticated` is `true`

#### Scenario: Anonymous request or unresolved profile

- **WHEN** `getAuthContext()` runs without an authenticated Supabase user
- **OR** the authenticated user has no matching profile row
- **THEN** the returned context omits tenant, profile, and role information
- **AND** `isAuthenticated` is `false`

### Requirement: Route-level auth guards enforce authenticated and role-scoped access

Server-side auth guards SHALL fail closed when required authentication or role membership is missing.

#### Scenario: Auth is required for a protected handler

- **WHEN** `requireAuth()` receives a context that is not fully authenticated
- **THEN** it throws an `Unauthorized` error

#### Scenario: Role membership is required for a protected handler

- **WHEN** `requireRole()` receives an authenticated context whose `role` is not in the allowed list
- **THEN** it throws a `Forbidden` error naming the accepted roles

### Requirement: Demo account login is environment-gated and role-scoped

The demo account API SHALL expose only the configured demo roles and SHALL disable production demo login unless explicitly allowed.

#### Scenario: Demo role availability is reported

- **WHEN** `GET /api/auth/demo-account` runs
- **THEN** it reports availability for the `admin`, `missionary`, and `donor` demo roles
- **AND** a role is available only when both its configured email and the shared demo password are present

#### Scenario: Production demo login is disabled by default

- **WHEN** `POST /api/auth/demo-account` runs in production
- **AND** `ALLOW_DEMO_ACCOUNTS` is not enabled
- **THEN** the endpoint returns a `403` response

#### Scenario: Demo login establishes a Supabase session

- **WHEN** `POST /api/auth/demo-account` receives an allowed demo role with configured credentials
- **THEN** the endpoint signs in through Supabase password auth
- **AND** it returns `ok: true`
- **AND** it writes the resulting auth cookies to the response

### Requirement: Shared auth middleware currently passes requests through unchanged

The shared auth middleware factory SHALL currently behave as a no-op pass-through.

#### Scenario: Middleware is created for an app

- **WHEN** `createAuthMiddleware()` is called with any options
- **THEN** it returns a request handler
- **AND** that handler responds with `NextResponse.next()`
- **AND** it does not currently redirect, reject, or mutate the request based on auth state
