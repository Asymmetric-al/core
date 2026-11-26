# 0012. Each request resolves one live assignment under the caller's own session

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

A person signs in once with Supabase Auth but may hold several memberships:
rows of `authz.memberships` in more than one organization (a tenant), or several
staff sub-roles in one. An assignment is one live membership row, active and
owned by the signed-in user; `ActiveAssignment.assignmentId` is that row's `id`.
Each surface acts under one role class (staff, missionary or donor), and each
request must act under exactly one assignment of that class. The browser
proposes the tenant and the assignment in request headers, so those values are
claims to check, never facts. When a check refuses the scope a loaded document
was rendered for, the browser must learn it and retire the document, but a
passing database error must not have that effect.

## Decisions

### Reading the caller's live rows

1. **The membership read runs on the caller's own token.**
   `createRpcAssignmentReader` in `principal/reader.ts` calls
   `public.current_user_assignments()`. That function returns only the rows whose
   `user_id` is `auth.uid()`, so it reads the caller's rows only when the client
   carries the caller's own JWT. `AssignmentRpcClient` in the same file asks for
   that one RPC call and nothing more, which a Supabase client built on the
   user's JWT satisfies. The reader returns the rows unchanged, typed as
   `AssignmentRow` in `principal/types.ts`: the Data API's wire shape, not a
   checked value. The resolver validates every row (decision 3). Cited:
   `public.current_user_assignments()`.

2. **Live rows are read again on every resolution.** `AssignmentReader` in
   `principal/types.ts` is a port over the caller's live memberships, read anew
   on each call. `resolveActiveAssignment` in `principal/assignment.ts` checks
   its inputs, then calls `readActiveAssignments` every time they pass, and
   `selectAssignment` when the read succeeds. It keeps no cache and never falls back to a default tenant. A membership that is revoked
   or deactivated therefore stops counting on the next request. Cited:
   [plan 5.1](../../../../docs/audits/core-crm-cms-database-target-architecture.md#51-authentication-and-authority).

3. **One bad row fails the whole read.** `readActiveAssignments` in
   `principal/assignment.ts` parses the rows with `toActiveAssignments`. If the
   read fails or throws, if any row is malformed, or if two rows share an id,
   the result is `reader_error`. The function catches anything the reader
   throws, but not an exception raised while it inspects the returned rows,
   such as one from a getter. Bad rows are never dropped. `toActiveAssignment` calls a row malformed when its id or
   tenant id is not a canonical UUID, it belongs to another user, its role or
   staff sub-role is unknown, a staff row has no sub-role or another row has one,
   its tenant-administrator flag is not a boolean or is `true` on a non-staff
   row, or its `updated_at` is empty. Dropping a row could make a person with two
   rows look like a person with one, and the resolver would then select the
   remaining row as the only candidate.

4. **A failed read keeps its cause, for diagnostics only.** The resolver and the
   proxy's membership read both report a failed read only as `reader_error`, so
   the underlying error would otherwise be lost. `withReadErrorCause` in
   `principal/reader.ts` wraps a reader and remembers that error: the Supabase
   error when the reader wrapped one, otherwise what was thrown. The proxy
   (`readSurfaceAssignments` in `middleware.ts`) passes it to the
   `membership_query_failed` diagnostic in `access-diagnostics.ts`, which logs
   only an error code from a fixed list and a failure class, never the raw
   error. The read and its result are unchanged. Cited: council round 1, A5.

5. **The resolver and its types live in this package.** The request's auth
   context (`context.ts`), the proxy (`middleware.ts`, `resolve-user-role.ts`)
   and the Payload strategy (`apps/admin/src/cms/auth/supabase-strategy.ts`) all
   use the resolver in `principal/`, so they apply one rule. The API package's
   principal module (`packages/api/src/principal`) re-exports it beside the
   principal union. `ActiveAssignment` in `principal/types.ts` carries the row's
   class as `membershipRole`, so code that holds an assignment never derives the
   class from a role string. Only the E2E bypass derives one: a test session
   that lists no memberships and names a canonical `tenantId` gets a synthetic
   assignment in that tenant whose class comes from its role
   (`impliedE2EAuthMembership` in `e2e-auth.ts`); one that names no canonical
   tenant gets none. Cited: #2258; AL-2675; AL-2676.

6. **An assignment's revision is opaque.** `ActiveAssignment.revision` in
   `principal/types.ts` holds the row's `updated_at`, and `toActiveAssignment`
   requires it to be a non-empty string. It is not an authorization epoch. Until
   #670 supplies an epoch, code may carry the value but must not interpret it.
   Cited: #670.

### Selecting the assignment

7. **A proposed assignment or tenant only narrows the caller's live rows.** Both
   come from the client, in the `x-asym-assignment` and `x-asym-tenant` headers
   or as options, so `selectAssignment` in `principal/assignment.ts` checks them
   against the rows it read. A proposed assignment
   (`ResolveAssignmentInput.proposedAssignmentId`) must be a canonical UUID and
   one of the caller's live rows, or the result is `not_owned_or_inactive`. It
   must be of the surface's role class, or the result is `role_class_mismatch`.
   When a tenant is expected, it must be in that tenant, or the result is
   `tenant_mismatch`. An expected tenant (`ResolveAssignmentInput.expectedTenantId`)
   only filters the candidates: when the caller holds no row of the class there,
   the result is `no_assignment`, and no tenant is supplied from anywhere else.
   Cited:
   [plan 5.1](../../../../docs/audits/core-crm-cms-database-target-architecture.md#51-authentication-and-authority).

8. **On the donor portal, a person with two live donor rows is refused.**
   `selectAssignment` counts the caller's live donor rows before it looks at
   either header, and returns `ambiguous` when there are several. Neither a
   proposed assignment nor an expected tenant can pick one of them. The plan
   refuses such a person on the donor portal, for the proxy check, server reads
   and the browser header alike, until WP3 resolves the portal's tenant from its
   verified host. The order matters: narrowing first would let a header make one
   of several rows look like the only one. For a Supabase session all three
   paths meet this rule, because the proxy's role check (`resolve-user-role.ts`)
   and `getAuthContext` in `context.ts` both resolve through `selectAssignment`.
   For an E2E bypass identity the proxy checks only the signed role, and
   `getE2EAuthBypassContext` in `context.ts` applies the rule. Cited:
   [plan section 12, WP2, "Interim rules until WP3"](../../../../docs/audits/core-crm-cms-database-target-architecture.md#wp2--membership-as-the-only-authority);
   AL-2675; JB12.

### What the request acts under

9. **A signed-in person with no assignment is not authenticated for the
   surface.** `getAuthContext` in `context.ts` validates the user with Supabase
   Auth, reads the profile for its id only, and resolves the assignment for the
   surface's role class. When the resolver refuses, the context keeps the user
   id and the profile id but has `isAuthenticated: false`, and `assignmentDenial`
   holds the resolver's reason. With no role class the reason is
   `no_role_class`. When the profile cannot be read, the profile id and the
   reason are both `null`. A login says who the person is; only an assignment
   lets a request act on the surface. Cited:
   [plan 5.1](../../../../docs/audits/core-crm-cms-database-target-architecture.md#51-authentication-and-authority);
   AL-2675 (WP2a;
   [plan 5.2](../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant)
   and WP2 "Interim rules").

10. **The database receives the resolved scope, never the caller's headers.**
    `requestScopeOf` in `context.ts` gives the server's session clients the
    tenant and the membership row to send to the database. It takes both from
    `AuthContext.assignment`, the row the resolver selected, and returns `null`
    unless the context is authenticated and that row's tenant equals
    `context.tenantId`. The tenant and assignment headers the caller sent are only
    proposals, which the resolver has already checked against the caller's live
    rows, so the resolver's result is what the request acts under. Cited:
    [plan 5.4](../../../../docs/audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands);
    AL-2675.

11. **Choosers read every live row through a separate function that authorizes
    nothing.** `getSignedInAssignments` in `context.ts` returns every live
    membership row of the signed-in person, of every class and in every tenant,
    validated by `readActiveAssignments`, and, from a separate read of
    `public.current_user_organizations()`, the names of the person's
    organizations. Both reads run on the person's own token, so the names come
    only from organizations in which the person holds a live row. The two reads
    are not checked against each other, so a tenant can be missing from the
    names, and the choosers then show a short form of its id. The result is `unavailable` when `readActiveAssignments`
    reports a failed or malformed read, or when the organization read ends in
    an `OrganizationNamesReadError`: the RPC answered with an error, with
    something that is not an array, or with a malformed row. Any other error
    from the organization read, such as a request that rejects, is thrown to
    the caller, so `unavailable` does not cover every failure. The function
    exists because a chooser must list a person's rows before any one is
    selected, while `getAuthContext` returns only the one it selects and
    refuses with `ambiguous` when the role class, tenant and proposed assignment
    leave several.
    It decides nothing itself: a choice in the organization chooser goes back
    through the proxy's membership decision, and Web Studio's render gate
    (`apps/admin/src/cms/web-studio-access.ts`) selects among the rows with
    `selectAssignment`, through `decideWebStudioAccess` in `web-studio.ts`. For
    an E2E bypass identity, `organizationNames` is empty, because no database
    rows stand behind it. Cited:
    [plan 5.2](../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant);
    D-26 in the
    [implementation record](../../../../docs/audits/core-crm-cms-database-implementation-record.md),
    as the coordinator's ruling amends it; AL-2675 (WP2b).

### Telling the browser its scope was refused

12. **Only the resolver's own refusal of a proposed scope is marked.**
    `AuthContext.scopeRefused` in `context.ts` is `true` only when the request
    proposed a tenant or an assignment and the resolver refused it for a reason
    in `SCOPE_REFUSALS`: `not_owned_or_inactive`, `role_class_mismatch`,
    `tenant_mismatch`, `ambiguous` or `no_assignment`. Such a refusal means the
    caller cannot act under the scope the request proposed, for example because
    the row was revoked or another person signed in. Routes answer the flag with the
    `x-asym-scope-refused` header, and the own-API fetch wrapper in
    `packages/database/own-api.ts` retires the document's scope when a scoped
    request gets that header back. `reader_error` (a failed or thrown read, or a
    malformed row) is not in the set, and no other 401 or 403 from the server
    carries the mark: marking a passing database error would retire the
    document and reload it. The browser marks only its own answer to a request
    from a document whose scope is already retired (`retiredScopeResponse` in
    `packages/database/request-scope-headers.ts`). Cited:
    [plan 5.2](../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant);
    AL-2675; JB1; JR2.

13. **A refused scope keeps the ordinary "Unauthorized" answer.**
    `ScopeRefusedError` in `context.ts` is an `Error` whose message is
    `"Unauthorized"`, the same message `requireAuth` throws for any other
    unauthenticated context, and it carries the resolver's reason. `requireAuth`
    throws it when `scopeRefused` is set, so every route that maps that message
    keeps its status and body. The shared error mapper, `toApiHttpError` in
    `packages/api/src/shared/http-errors.ts`, recognizes the error by name and
    adds the `x-asym-scope-refused` header with the reason, so the browser can
    tell this 401 from any other. Routes that build their own 401 from the
    context add the header with `scopeRefusedHeaders`. Cited: JB1.

14. **A refused proposal from an E2E bypass identity is marked too.**
    `getE2EAuthBypassContext` in `context.ts` selects among the bypass identity's
    synthetic assignments, with `selectAssignment` when the surface has a role
    class. When nothing is selected and the request proposed a tenant or an
    assignment, it returns an unauthenticated context, still with no user id,
    carrying `assignmentDenial` and `scopeRefused` under the rule of decision
    12, so the route can report the refusal. When nothing was proposed it
    returns `null`, and the identity is simply not authenticated for the
    surface. Cited: JB1.

15. **A stale name generation is refused before the live rows are read.**
    With `CORE_SERVE_UNDER_PATHS` on and a valid verified name, an own-API
    call whose `x-asym-scope-generation` is absent or differs from the name's
    trusted generation gets `assignmentDenial: "generation_mismatch"` with
    `scopeRefused`, in the session and the E2E bypass alike, after the tenant
    conflict and before `resolveActiveAssignment`; the reason is an
    `AuthContext` denial, not an `AssignmentDenyReason`, so `selectAssignment`
    and `SCOPE_REFUSALS` are unchanged, and it reaches the browser through
    decision 13 like any other. The live read on every call stays the defence
    against a revoked row (decision 2). See
    [0015](0015-organization-from-the-verified-name.md), decisions 14 and 16.

## Accepted records this code implements

- `toActiveAssignment` in `principal/assignment.ts` and
  `ActiveAssignment.isTenantAdmin` in `principal/types.ts` (the
  tenant-administrator flag is `true` only on a staff row, as the database check
  `authz_memberships_tenant_admin_staff_chk` requires):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 1.
- `ActiveAssignment` in `principal/types.ts` (`membershipRole` and `staffRole`
  choose the role bundles through which the capability registry grants
  authority, and `isTenantAdmin` is the tenant-administration flag on a staff
  row):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 1.
- `getAuthContext` in `context.ts` (the profile supplies the profile id only,
  never a tenant, a role or a fallback):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 1.
- `HumanPrincipal` in `principal/types.ts` (a signed-in person acting through
  exactly one validated assignment):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 2.
- `RoleClass` and `ResolveAssignmentInput.roleClass` in `principal/types.ts`
  (the surface fixes the role class, and only rows of that class are
  candidates):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 2.
- `selectAssignment` in `principal/assignment.ts`, without a proposal (the one
  candidate is the assignment; several are refused, never guessed):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 2.
- `AuthContext.memberships` in `context.ts` (holds at most the one membership
  the request acts under; the person's other rows add nothing):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 2.
- `AuthContextOptions` in `context.ts` (the role class, the proposed assignment
  and the expected tenant fall back to the `x-asym-role-class`,
  `x-asym-assignment` and `x-asym-tenant` headers; on a tenant-addressed page of
  Mission Control or the missionary workspace the proxy sets the last two from
  the page address after its membership decision, it removes them from every
  other page request, and on an API request the own-API fetch wrapper sends the
  page's):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clauses 2 and 5.
- `createBearerSupabaseClient` in `context.ts` (a public-key client that acts
  with the caller's bearer token under row-level security, never the service
  role):
  [ADR-0224](../../../../docs/adr/0224-caller-token-server-lanes-and-sql-commands.md),
  clause 1.
