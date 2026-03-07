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

## Public signup policy

Public signup is intentionally narrower than the full internal role model.

- Allowed self-service roles:
  - `donor`
  - `missionary`
- Not assignable from public signup input:
  - `staff`
  - `admin`
  - `super_admin`

Why:

- Public form input is an untrusted API boundary.
- Privileged roles must come from a server-managed invite, provisioning, or admin assignment flow.
- The authz trigger in `supabase/migrations/20260226113000_authz_memberships_foundation.sql` now sanitizes incoming signup role metadata so unknown or privileged values collapse to `donor`.

Code references:

- UI helper: `packages/auth/self-signup.ts`
- Public forms:
  - `apps/admin/app/register/page.tsx`
  - `apps/donor/app/(auth)/register/page.tsx`
  - `apps/missionary/app/register/page.tsx`
- Trigger sanitization:
  - `supabase/migrations/20260226113000_authz_memberships_foundation.sql`

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

## Key files

- `supabase/migrations/20260226113000_authz_memberships_foundation.sql`
- `packages/auth/permissions.ts`
- `packages/auth/context.ts`
- `packages/auth/middleware.ts`
