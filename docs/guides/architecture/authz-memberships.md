# Membership authorization foundation

## Purpose

This document defines the baseline tenant-authorization model for the platform.

- **Primary enforcement:** BFF route/handler checks
- **Backup enforcement:** tenant-scoped Postgres RLS policies

This is an MVP foundation designed for safe expansion over time.

## Role model

Role membership is stored in `authz.memberships` with one row per role assignment:

- `user_id`
- `tenant_id`
- `role` (`donor`, `missionary`, `staff`)
- `staff_role` (`finance`, `mobilizer`, `development`, `hr`, `member_care`) for staff rows
- `is_active`, `revoked_at` and `granted_by`
- `is_tenant_admin`, the tenant-administrator flag, on staff rows

### Multi-dashboard access

A single login can access multiple dashboards by holding multiple memberships in the same tenant. Each request acts under one of them, the one of the surface's class:

- Donor portal access requires a `donor` membership
- Missionary dashboard access requires a `missionary` membership
- Mission Control admin access requires a `staff` membership

## MVP permission boundaries

- **Donor:** own giving portal + own giving records/workflows
- **Missionary:** own missionary workflows and designation-specific views
- **Staff:** Mission Control operational workflows

### Staff sub-roles

Every staff sub-role keeps full admin-dashboard access. Since AL-2675 each has its own capability bundle (`packages/auth/capabilities/bundles.ts`), so they differ in what they may do beyond it:

- Finance
- Mobilizer
- Development
- HR
- Member Care

Finance holds the finance-staff contribution capabilities, development can publish in Web Studio, member care holds `care.access`; mobilizer and hr hold the shared staff set. The tenant-administrator flag adds the administrator's bundle.

## Enforcement layers

## 1) BFF route/handler checks (primary)

- App proxies enforce dashboard-level access by the one live membership of the surface's class, which the principal resolver selects.
- API route handlers ask the one membership the request acts under for what their action needs, never a role name (AL-2675, the WP2a sweep): `requireCapability(auth, capability)` for a registry capability (plan 5.4 names it per command; staff-wide work uses the capabilities every staff bundle holds, such as `admin.dashboard.access`, `admin.crm.manage`, `admin.gifts.manage` and `admin.reports.view`), `requireTenantAdministrator(auth)` where the action is the tenant administrator's, or `requireRoleClass(auth, classes)` for the membership classes an endpoint serves. `withOperation` takes the same as `capability`, `tenantAdministrator` or `roleClasses`. Platform-only routes use `platformOperator: true`; mixed routes call `isPlatformOperator()` for the specific action. Neither checks a profile role.
- Client-side role checks are not treated as security controls.

## 2) Database RLS (backup)

Tenant-scoped RLS backup policies are enabled for platform tables:

- `public.notification_queue` (outbox)
- `public.pdf_templates` (templates)
- `public.audit_logs` (logs)

Policies are based on `authz.has_membership(tenant_id, ...)` and keep lookup paths index-friendly.

## Practical RLS design choices

- Tenant-scoped tables include `tenant_id`.
- Membership helper functions avoid heavy join chains.
- `authz.current_tenant_id()` is safe-cast from JWT app metadata and returns `NULL` when unset/invalid.

## Production hardening beyond this baseline

RLS is necessary but not sufficient as the only control. Production should layer:

1. Tenant workspace boundaries where practical (stronger isolation)
2. Gateway-level authorization checks on every sensitive route
3. Tenant-scoped API keys/credentials where integrations allow it

## Principal and active assignment (wired by AL-2675)

The resolver lives in `packages/auth/principal` (`@asym/auth/principal`), and `packages/api/src/principal` (`@asym/api/principal`, #2258) re-exports it beside the principal union. Since AL-2675 (WP2a of the CRM, CMS and database plan) it is the only way a request learns its tenant and role: `getAuthContext`, the three proxies' role check (`packages/auth/resolve-user-role.ts`) and Web Studio's Payload strategy all resolve through it. No code reads `profiles.role` or `profiles.tenant_id` to authorize. Since WP2b the page address or, in Web Studio, a signed cookie proposes the assignment (below). The fire-time re-check (#2259) is still to come.

### Four principal classes

`Principal` is a discriminated union. The class is carried in `kind`, never derived from a role string.

| `kind`              | Carries                                                | Status here                                        |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `human`             | `userId` plus exactly one validated `ActiveAssignment` | resolved by `resolveActivePrincipal`               |
| `external`          | a server-produced `PublicProjectionContext` only       | type only; it cannot hold an assignment or a grant |
| `service_account`   | `nhiId`, one `tenantId`, `ownerAssignmentId`           | type only; no table, ceiling or resolution         |
| `platform_operator` | `operatorId`                                           | type only; no grant, sink or break-glass           |

`ActiveAssignment` is one live `authz.memberships` row owned by the session user: `assignmentId`, `userId`, `tenantId`, `revision`, `membershipRole`, `staffRole` (`null` for donor and missionary rows) and `isTenantAdmin`, the tenant-administrator flag, which only a staff row carries. These fields feed the capability registry (`packages/auth/capabilities`), which authorizes; a role name never does. `revision` is the row's `updated_at`, opaque until #670 supplies an epoch. `toHumanProjectionAssignment` maps it onto the projection resolver's `assignment` input.

### Selecting the assignment

`resolveActiveAssignment({ userId, roleClass, proposedAssignmentId?, expectedTenantId? }, reader)` reads live rows through an injected `AssignmentReader` on every call and returns `{ ok: true, assignment, selection }` or `{ ok: false, reason }`. It never throws, never caches and never falls back to a default tenant. It reads no profile role or profile tenant, no demo tenant and no login-token claim.

`roleClass` is the surface's: Mission Control and Web Studio act on staff rows, the missionary workspace on the missionary row, the donor portal on the donor row (plan 5.1). Each app's proxy sets it as the `x-asym-role-class` request header on every request it passes on, overwriting any value the client sent, and `getAuthContext` reads it there unless the caller passes it.

1. A `userId` that is not a canonical UUID is `reader_error`, with no read. A `roleClass` that is not a membership class is `no_assignment`, with no read.
2. A proposal that is not a canonical UUID is `not_owned_or_inactive`, with no read.
3. A reader failure, or any malformed row (bad id or tenant, another user's row, unknown role or staff role, a staff/sub-role mismatch, a missing or non-boolean flag, the flag on a row that is not staff, no `updated_at`, a repeated id), is `reader_error` for the whole call. Bad rows are never dropped.
4. A proposal (the person's chosen row, which `getAuthContext` takes from the `x-asym-assignment` header) not among the rows is `not_owned_or_inactive`; one of another class is `role_class_mismatch`; one in a tenant other than `expectedTenantId` is `tenant_mismatch`; otherwise it wins with `selection: "proposed"`.
5. With no proposal, the candidates are the rows of `roleClass`, narrowed (never widened) to `expectedTenantId` when one is given:

| Candidates of the surface's class | Result                    |
| --------------------------------- | ------------------------- |
| none                              | `no_assignment`           |
| one                               | `ok`, `selection: "sole"` |
| two or more, in any tenants       | `ambiguous`               |

There is no default between classes: a staff row is never preferred over a donor or missionary row, because the surface fixes the class. Nor does the resolver rank staff sub-roles or pick a tenant: two candidates or more are `ambiguous` until something narrows or proposes one. Since WP2b that is the surface's own: Mission Control and the missionary workspace take the tenant, and for a person with several staff rows there the sub-role, from the page address (`/<tenant-id>[~<sub-role>]/…`, `packages/auth/tenant-address.ts`), which their organization chooser links to; Web Studio takes both from its signed selection ([Web Studio's organization](#web-studios-organization)). The donor portal still refuses a person with donor memberships in two tenants until WP3 resolves the verified home domain (amended 2026-11-24).

`resolveActivePrincipal(session, roleClass, proposedAssignmentId, reader)` wraps the resolver. It returns a `HumanPrincipal` or throws `PrincipalDeniedError` with the deny `reason`.

### Reader and RPC

`createRpcAssignmentReader(client)` is the only reader. It takes a user-JWT client, calls `public.current_user_assignments()` with no arguments, and throws on an error or a non-array result. It never uses an admin client or a service-role key.

The RPC is `SECURITY INVOKER`, `STABLE` and `SET search_path = ''`, with no parameters. It returns `id, user_id, tenant_id, role, staff_role, is_tenant_admin, updated_at` for `authz.memberships` rows where `user_id = auth.uid()` and `is_active`, so the existing "select own" policy and grants bound it as well. Its EXECUTE grants are revoked by name from `PUBLIC`, `anon`, `authenticated` and `service_role`, then granted to `authenticated` only (see `docs/security/function-execute-grants.md`). It was created by `20261025120700_current_user_assignments_rpc.sql` and gained the flag in `20261117160000_membership_lifecycle_and_tenant_admin_flag.sql`, which also added it to `public.current_user_memberships(uuid)`.

### The membership row since AL-2675

- `granted_by` and `revoked_at`. A row is live exactly when it is active and unrevoked: revoking sets `revoked_at` and `is_active = false` together, and granting a role held before revives the same row. A trigger keeps that rule for every writer, and a check constraint pins it.
- `is_tenant_admin`, the tenant-administrator flag, only on a staff row. It reaches the registry as the `tenant_admin` grant, and `hasRole(…, "admin")` is true only for a staff membership that carries it.
- `authz.assignment_capabilities(assignment_id)` is the database's copy of the registry's bundle mapping and judges one live row alone. `tenant_guard.begin_human_command(tenant, capability)` refuses a command whose selected row lacks the capability.
- `public.tenant_member_directory(tenant)` returns display name, email and role for the live members of a tenant, to a caller whose selected live staff row is there. Mission Control's users list (`packages/api/src/admin/users.ts`) reads it on the caller's own token, under the resolved row (`x-asym-assignment`), with its label filter and page applied in SQL.
- `public.tenant_member_profiles(tenant, profile_ids, user_ids, include_revoked, role, tenant_admin, after_membership_id, limit)` returns a tenant's memberships joined to profiles for service-key server code (`packages/api/src/shared/tenant-members.ts`). It filters by class and by the administrator flag in SQL and answers in pages ordered by membership id, 1,000 rows at most a call (the Data API's `max_rows`); `listTenantMembers` reads every page, so no list of a tenant's people is cut silently. Server code that needs a tenant's members, approvers or notification recipients reads them there: no query filters `profiles` on `tenant_id` or `role`, because a profile holds one tenant at most and a person may hold memberships in two (NR-68). The #2256 reader manifest fails on any such filter.

### Web Studio's organization

Payload's screens and REST calls cannot carry a tenant in their address, so Web Studio is the one surface whose organization lives in a cookie (plan 5.2, "One stated exception: Web Studio"; AL-2675, WP2b slice C).

- **The selection.** `asym_web_studio_tenant` holds a tenant and one membership row and nothing else, signed with HMAC-SHA-256 under a key derived from `PAYLOAD_SECRET`: HttpOnly, `SameSite=Strict`, `Path=/web-studio`, thirty days (`packages/auth/web-studio.ts`, `apps/admin/src/cms/web-studio-tenant-cookie.ts`). Only the Web Studio chooser's server action sets it, after checking the row against the person's live staff rows (`apps/admin/app/(auth)/web-studio/organization/actions.ts`); signing out clears it. Payload's REST routes sit under `/web-studio/api`, so the cookie reaches them and never Mission Control's `/api`. It is a proposal, not an assignment: a row the person no longer holds, live, selects nothing, and nothing falls back to another tenant.
- **Where it is read.** Three places, each judging it by the resolver's rule against the person's live rows (`decideWebStudioAccess`, `webStudioResolveInput`):
  1. The admin proxy, for a Web Studio page: one staff row needs no choice, several with no usable selection go to the chooser at `/web-studio/organization`, none goes to `/no-access` (`packages/auth/middleware.ts`). On `/web-studio/api/…` it only refreshes the session and leaves the decision to Payload's strategy.
  2. `requireWebStudioAccess` (`apps/admin/src/cms/web-studio-access.ts`), read once per request: the Payload layout on a document load, and Payload's catch-all page and the draft preview on every render, a client navigation included. It returns the document `scope` and the organization's name. A page rendered for another organization than its document's renders nothing and reloads.
  3. Payload's auth strategy (`apps/admin/src/cms/auth/supabase-strategy.ts`), for every REST or GraphQL call and every server function. Payload's own page renders and server functions act in the cookie's organization. A REST write, and every GraphQL call, must also name the document's scope in `x-asym-tenant` and `x-asym-assignment`, which the document's fetch wrapper adds. A tab opened for another organization is answered 409, with the refusal named in `x-asym-web-studio-refusal`, and the document asks the person to reload.
- **A new Web Studio server read** takes its tenant from one of those, never from `getAuthContext`, which does not read the cookie and would refuse a person with staff rows in two organizations: in a page, layout or server component, `requireWebStudioAccess(...).scope.tenantId`; inside Payload (hooks, access, endpoints), `req.user` through `getTenantContext(req)` (`apps/admin/src/cms/access/tenant-context.ts`), whose `publicTenantId` is the public tenant and `tenantId` the CMS tenant document. Never a route parameter or a value from the browser.

### What this does not do yet

- **No persisted assignment.** No table or column stores the active assignment; it is validated per request. Web Studio's cookie stores only a proposal, which the resolver accepts while the person holds that row, live.
- **No fire-time re-check.** Re-validating a deferred member action's assignment when it fires is #2259.
- **No tenant for the donor portal.** Until WP3 resolves it from the verified home domain, a person with donor memberships in two tenants is refused there.

## Key files

- `supabase/migrations/20260226113000_authz_memberships_foundation.sql`
- `packages/auth/permissions.ts`
- `packages/auth/context.ts`
- `packages/auth/middleware.ts`
- `packages/auth/principal/` (the resolver; `packages/api/src/principal/` re-exports it), `supabase/migrations/20261025120700_current_user_assignments_rpc.sql` and `supabase/migrations/20261117160000_membership_lifecycle_and_tenant_admin_flag.sql`
- `packages/auth/capabilities/` and `supabase/migrations/20261117160100_assignment_capability_function.sql`
