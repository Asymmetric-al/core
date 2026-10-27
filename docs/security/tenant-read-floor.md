# Tenant read floor: missionaries, funds, follows, assets, campaigns (#2312)

None of these five tables is public. Before #2312, the public anon key could read every row of every tenant through `USING (true)` policies. Migration: `supabase/migrations/20261025120800_close_public_reads_tenant_scope.sql`.

## Rulings

- **Blake's ruling (Oct 24, 2026):** none of `missionaries`, `funds`, `follows`, `assets` or `campaigns` is meant to be publicly readable. Every anon and `USING (true)` read is removed, on both the live and the develop policy names, anon loses SELECT, and reads are tenant-scoped only.
- **Samson's `follows` ruling (Oct 24, 2026, #2298 OQ2):** `follows` is narrowed to the follower's own rows plus tenant staff, because other donors' follows reveal donor relationships. Donors reading `missionaries`, `funds` and `campaigns` in their own tenant is accepted as donor-facing content.
- **`assets` flag (for Blake):** `assets` gets the plain tenant floor, so upload metadata is readable by every tenant member once #2298 wires the tenant context. Accepted and flagged; narrowing it needs its own ruling.

Re-opening any of these reads, or making any part of them public, needs a new ruling from Blake.

## What the migration replaces

| Table          | Legacy policy (dropped)                       | New policy (`TO authenticated`, `FOR SELECT`) |
| -------------- | --------------------------------------------- | --------------------------------------------- |
| `missionaries` | `tanstack browser read` (live: `public read`) | `tenant scoped read`                          |
| `funds`        | `tanstack browser read` (live: `public read`) | `tenant scoped read`                          |
| `follows`      | `tanstack browser read` (live: `public read`) | `tenant scoped own or staff read`             |
| `assets`       | `tanstack browser read` (live: `public read`) | `tenant scoped read`                          |
| `campaigns`    | `public read`                                 | `tenant scoped read`                          |

`public read` comes from `20260216153000_demo_readonly_rls.sql` and is what hosted projects carry today. `tanstack browser read` comes from `20260625002117_canonical_tanstack_db_realtime_rls.sql` and is develop's state for four tables. Neither legacy migration is edited.

## Grant matrix (all five tables)

| Role            | Table privileges                    |
| --------------- | ----------------------------------- |
| `anon`          | none                                |
| `PUBLIC`        | none                                |
| `authenticated` | `SELECT` only                       |
| `service_role`  | unchanged (every product read path) |

`REVOKE ALL ... FROM PUBLIC, anon, authenticated` runs before the `GRANT SELECT`, so hosted default privileges and any column-level privileges are cleared as well. RLS stays enabled and forced on all five (#2251, `20261025070000_force_rls_tenant_tables.sql`); this migration adds no FORCE statement.

## Policy shapes

`missionaries`, `funds`, `assets`, `campaigns` (`tenant scoped read`):

```sql
tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id())
```

`follows` (`tenant scoped own or staff read`): the same tenant floor AND (own OR staff).

```sql
tenant_id IS NOT NULL AND tenant_id = (SELECT authz.current_tenant_id())
AND (
  EXISTS (
    SELECT 1 FROM public.donors d JOIN public.profiles p ON p.id = d.profile_id
    WHERE d.id = follows.donor_id
      AND d.tenant_id = follows.tenant_id
      AND (p.user_id = (SELECT auth.uid()) OR p.id = (SELECT auth.uid()))
  )
  OR (SELECT authz.has_staff_membership(follows.tenant_id, NULL::authz.staff_role[]))
)
```

- **Own:** the caller is the follower. The row's `donor_id` is a `donors` row in the same tenant whose profile belongs to `auth.uid()`, by `user_id` or by `id`, as in every existing owner policy. A donor row in another tenant never owns a follow.
- **Staff:** an active `staff` membership in the row's tenant, any staff role (`authz.has_staff_membership`, `SECURITY DEFINER`).
- **Not an owner:** the followed missionary (`follows.missionary_id`, a profile id). Missionary follower lists are served by the admin client.
- **Dependency:** the own term reads `donors` and `profiles` as the caller. It relies on the owner branch of `"donors owner or staff select"` and on `"profiles select own authenticated"` (both `20260625002117`), and on `authenticated` keeping SELECT on both tables. Narrowing either policy breaks the own term.

NULL-tenant rows are hidden from every user JWT. With no tenant context, or a malformed one, `authz.current_tenant_id()` is NULL and nothing matches.

## Who reads these tables

Every product read goes through the service-role admin client and is unchanged. The TanStack collections for these tables (including `followsCollection`) are defined but nothing instantiates them. The only anon reader was `scripts/supabase-env-smoke.mjs`; its anon probe of `campaigns` now expects permission denied (42501) and fails when rows come back.

Signed-in reads follow `authz.current_tenant_id()`. Today it reads the JWT `app_metadata.tenant_id` claim, so user-JWT reads mostly return 0 rows; after #2298 it follows the request tenant GUC with no edit here.

**Realtime:** `funds` stays in `supabase_realtime`. Realtime applies RLS per subscriber, so anon receives nothing and an authenticated subscriber only gets its tenant's rows.

## Live names and the pre-assert

The migration drops the legacy policies by the names it finds in `pg_policies`, never with `IF EXISTS`. Before dropping, a pre-assert checks each table: at least one policy, and every policy is `public read` or `tanstack browser read`, `SELECT`, qual `true`, no `WITH CHECK`, roles within `{anon, authenticated}`. Anything else (an extra policy, a missing policy, another command or role) raises, naming the table and what it found. The deploy stops and Samson rules; the accepted set is never widened silently.

The post-assert raises unless each table has exactly its one new policy, anon and `PUBLIC` hold nothing, `authenticated` holds exactly `SELECT`, no column-level privileges remain, and RLS is enabled and forced.

## Forward rule

No later migration may create a policy on these five tables `TO anon`, `TO public` or `USING (true)`, or grant any of them to `anon`. The #2312 static acceptance test enforces this on every migration above `20261025120800`.

## Deploy order

Production is behind develop. Apply the backlog first, as its own deploy: every develop migration below `20261025120800`, in version order, from a develop commit before #2312's merge. That backlog runs `20260625002117`, which re-opens `USING (true)` for anon on four of these tables, so this migration follows promptly. Then take the read-only preflight (applied versions, policies, privileges, realtime publication) and keep the policy and privilege rows as the rollback record. Then deploy `20261025120800` by the normal in-order migration deploy.

Never apply this migration before the backlog: a later run of `20260625002117` would recreate `USING (true)` and the anon grant. On the development project, reconcile its out-of-order versions first so the backlog neither re-runs nor skips files by number.

## Down

Forward-fix is preferred. A rollback re-opens the exposure and runs only on Blake's explicit call: drop the five new policies, then restore the grants and policies recorded in the preflight taken after the backlog deploy, by their recorded names. Never re-run or revert backlog migrations as part of the rollback.
