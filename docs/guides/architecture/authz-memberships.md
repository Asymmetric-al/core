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
- `is_active`

### Multi-dashboard access

A single login can access multiple dashboards by holding multiple memberships in the same tenant:

- Donor portal access requires a `donor` membership
- Missionary dashboard access requires a `missionary` membership
- Mission Control admin access requires a `staff` membership

## MVP permission boundaries

- **Donor:** own giving portal + own giving records/workflows
- **Missionary:** own missionary workflows and designation-specific views
- **Staff:** Mission Control operational workflows

### Staff sub-roles in MVP

Sub-roles are modeled now, but all staff sub-roles currently share full admin-dashboard access:

- Finance
- Mobilizer
- Development
- HR
- Member Care

This is intentional for MVP velocity. The capability map is explicit in code so each sub-role can be narrowed later without call-site rewrites.

## Enforcement layers

## 1) BFF route/handler checks (primary)

- App proxies enforce dashboard-level access by membership-derived roles.
- API route handlers use centralized `requireRole(...)` checks built on membership-aware role resolution.
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

## Principal and active assignment (preparation, unwired)

`packages/api/src/principal` (`@asym/api/principal`, #2258) is the first slice of Phase 12 T4 (#669). Nothing in a request path imports it yet: `getAuthContext`, middleware, routes, the PDP (#667) and the token are unchanged. It follows #669's caveats C1–C4: preparation only; delivery waits for #667, #668, #670 and #2250; the types are a draft of the agreed interface; and the slice was not Ready until #2250 merged.

### Four principal classes

`Principal` is a discriminated union. The class is carried in `kind`, never derived from a role string.

| `kind`              | Carries                                                | Status here                                        |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `human`             | `userId` plus exactly one validated `ActiveAssignment` | resolved by `resolveActivePrincipal`               |
| `external`          | a server-produced `PublicProjectionContext` only       | type only; it cannot hold an assignment or a grant |
| `service_account`   | `nhiId`, one `tenantId`, `ownerAssignmentId`           | type only; no table, ceiling or resolution         |
| `platform_operator` | `operatorId`                                           | type only; no grant, sink or break-glass           |

`ActiveAssignment` is one active `authz.memberships` row owned by the session user: `assignmentId`, `userId`, `tenantId`, `revision`, `membershipRole` and `staffRole` (`null` for donor and missionary rows). The role fields are for display, derivation and default selection only. `revision` is the row's `updated_at`, opaque until #670 supplies an epoch. `toHumanProjectionAssignment` maps it onto the projection resolver's `assignment` input.

### Selecting the hat

`resolveActiveAssignment({ userId, proposedAssignmentId?, expectedTenantId? }, reader)` reads live rows through an injected `AssignmentReader` on every call and returns `{ ok: true, assignment, selection }` or `{ ok: false, reason }`. It never throws, never caches and never falls back to a default tenant. It reads no profile role or profile tenant, no demo tenant and no login-token claim.

1. A `userId` that is not a canonical UUID is `reader_error`, with no read.
2. A proposal that is not a canonical UUID is `not_owned_or_inactive`, with no read.
3. A reader failure, or any malformed row (bad id or tenant, another user's row, unknown role or staff role, a staff/sub-role mismatch, no `updated_at`, a repeated id), is `reader_error` for the whole call. Bad rows are never dropped.
4. A proposal not among the rows is `not_owned_or_inactive`; one in a tenant other than `expectedTenantId` is `tenant_mismatch`; otherwise it wins with `selection: "proposed"`, even over the staff default.
5. With no proposal, the candidates are the rows, narrowed (never widened) to `expectedTenantId` when one is given:

| Candidates                                            | Result                                       |
| ----------------------------------------------------- | -------------------------------------------- |
| none                                                  | `no_assignment`                              |
| one                                                   | `ok`, `selection: "sole"`                    |
| two or more, spanning more than one tenant            | `ambiguous`                                  |
| two or more in one tenant, exactly one staff row      | `ok`, that row, `selection: "default_staff"` |
| two or more in one tenant, zero or several staff rows | `ambiguous`                                  |

The default never picks a tenant: a caller that needs one passes `expectedTenantId`. It never ranks staff sub-roles either, because that would choose privileges by role name; a user with two staff rows in one tenant must propose one. Preferring staff over donor and missionary rows is selection, not authorization: it matches the order `derivePrimaryRole` already uses, and the chosen hat still has to pass the PDP and its grants. That one comparison lives in `pickDefaultAssignment` on the single line marked `// authz-exempt: default-selection`, which the names-never-authorize scan allows nowhere else.

`resolveActivePrincipal(session, proposedAssignmentId, reader)` wraps the resolver with #669's signature. It returns a `HumanPrincipal` or throws `PrincipalDeniedError` with the deny `reason`.

### Reader and RPC

`createRpcAssignmentReader(client)` is the only reader. It takes a user-JWT client, calls `public.current_user_assignments()` with no arguments, and throws on an error or a non-array result. It never uses an admin client or a service-role key.

The RPC (`20261025120700_current_user_assignments_rpc.sql`) is `SECURITY INVOKER`, `STABLE` and `SET search_path = ''`, with no parameters. It returns `id, user_id, tenant_id, role, staff_role, updated_at` for `authz.memberships` rows where `user_id = auth.uid()` and `is_active`, so the existing "select own" policy and grants bound it as well. Its EXECUTE grants are revoked by name from `PUBLIC`, `anon`, `authenticated` and `service_role`, then granted to `authenticated` only (see `docs/security/function-execute-grants.md`). `public.current_user_memberships(uuid)` is unchanged.

### What this slice does not do

- **No persisted hat.** No table, column or setting stores the active assignment. It is validated per request.
- **No fire-time re-check.** Re-validating a deferred member action's assignment when it fires is #2259.
- **No wiring and no tenant plumbing.** A later wired caller passes `ActiveAssignment.tenantId` to #2250's `withTenant(tenantId, fn)`, and `assignmentId` to #2289's assignment-bound grant RPC and to #2287's `current_governance_version(p_assignment_id)` (criterion 23). This slice makes none of those calls.
- **Slice (b) / #668 item 4 boundary.** Removing the super_admin demo-tenant synthesis in `packages/auth/context.ts` and retiring the `member_care` backfill in `20260226113000_authz_memberships_foundation.sql` belong to #669 slice (b) and #668 item 4, which need their own ruling. This slice touches neither.

## Key files

- `supabase/migrations/20260226113000_authz_memberships_foundation.sql`
- `packages/auth/permissions.ts`
- `packages/auth/context.ts`
- `packages/auth/middleware.ts`
- `packages/api/src/principal/` (preparation, unwired) and `supabase/migrations/20261025120700_current_user_assignments_rpc.sql`
