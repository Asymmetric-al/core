# Teams & Permissions (Mission Control)

This guide documents the current state of the Mission Control teams surface and how it relates to the newer membership-based authorization foundation.

## What exists today

- Route: `/system-admin/teams` inside `apps/admin`
- Entry point: `apps/admin/app/system-admin/teams/page.tsx`
- Shared UI surface: `apps/admin/app/(app)/admin/teams/teams-sections.tsx`
- Admin hub entry page: `apps/admin/app/system-admin/page.tsx`

The page presents a polished team-management experience with:

- A teams table with permission previews
- A slide-over management surface with `Permissions`, `Members`, and `Settings` tabs
- A system-users panel for invite/change-role style actions

## Important implementation constraint

The current Teams UI is a **frontend prototype**, not a persisted admin system yet.

Technically:

- Team and member data currently come from in-file constants: `TEAMS` and `MEMBERS`
- Permission edits in the sheet are not written to Supabase or Payload
- Create-team, invite-user, and save actions are present as UI affordances only

Plain language:

- The screen shows the intended product shape
- It does **not** yet save real team changes or enforce per-team permissions by itself

## How the UI is wired

`apps/admin/app/(app)/admin/teams/teams-sections.tsx` uses the shared tile registry from `@asym/config/tiles` to render module-level permission previews. That means the UI stays aligned with the current Mission Control navigation model, even though the permission choices are still mock data.

The permission levels shown in the UI are:

- `None`
- `View`
- `Manage`
- `Admin`

These levels are currently presentation-only. They are not yet mapped to persisted backend capabilities.

## Backend authorization foundation

The real authorization work that landed in this branch lives below the UI layer:

1. **BFF route/API checks** remain the primary enforcement path.
2. **Postgres RLS** provides tenant-scoped backup enforcement for selected platform tables.
3. Memberships are stored in `authz.memberships` as row-per-role assignments.

Key implementation files:

- `supabase/migrations/20260226113000_authz_memberships_foundation.sql`
- `packages/auth/permissions.ts`
- `packages/auth/middleware.ts`
- `docs/guides/architecture/authz-memberships.md`

## Current role model

Membership rows support these roles:

- `donor`
- `missionary`
- `staff`

Staff rows also require a `staff_role`:

- `finance`
- `mobilizer`
- `development`
- `hr`
- `member_care`

For the current MVP, all staff sub-roles still resolve to full Mission Control dashboard access. The code keeps the capability map explicit so staff permissions can be narrowed later without rewriting every route guard.

## What this means for contributors

If you are changing the Teams screen:

- Treat it as a product/UI surface first
- Do not claim persistence or enforcement unless you also wire writes into the authz model
- Update this guide and `docs/guides/architecture/authz-memberships.md` together if the UI starts managing real memberships

If you are changing authorization:

- Update `packages/auth/permissions.ts` and middleware/server checks first
- Treat the Teams UI as a separate follow-up unless the PR explicitly connects it to real data
