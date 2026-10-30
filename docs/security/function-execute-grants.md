# Function EXECUTE grants (#2270)

`supabase/migrations/20261024163000_authz_definer_execute_lockdown.sql` gives
the `authz` SECURITY DEFINER helpers and `public.current_user_memberships` an
explicit EXECUTE grant list. A SECURITY DEFINER function runs as its owner and
reads past RLS, so who may call it is the whole boundary.

## Why `REVOKE … FROM PUBLIC` is not enough

Postgres grants EXECUTE on a new function to `PUBLIC`. Hosted Supabase goes
further: the `postgres` role has default privileges that grant EXECUTE on new
`public` functions to `anon`, `authenticated` and `service_role` **by name**.
`REVOKE ALL … FROM PUBLIC` removes only the `PUBLIC` entry and leaves those
named grants in place. A local or CI database built from the migrations has no
such defaults, so a test there passes while the hosted database stays open.

- `20260802041500_current_user_memberships_rpc.sql` revoked only `PUBLIC`, so
  on hosted databases `anon` and `service_role` could call
  `current_user_memberships`. With a plain anon key it returned 0 rows, because
  `auth.uid()` is NULL; its safety rested on that alone.
- `20260226113000_authz_memberships_foundation.sql` never revoked `PUBLIC` from
  the `authz` helpers. Only `anon`'s missing USAGE on schema `authz` kept it out;
  a later `GRANT USAGE ON SCHEMA authz TO anon` would have opened all three.

The fix is to revoke `PUBLIC` **and** `anon` (and any other role that should
not call the function) by name, then grant the exact list.

## Contract

After the migration, on any database whatever its default privileges:

| Function                                               | Security | EXECUTE grantees (exact)                            |
| ------------------------------------------------------ | -------- | --------------------------------------------------- |
| `public.current_user_memberships(uuid)`                | DEFINER  | `postgres` (owner), `authenticated`                 |
| `authz.is_super_admin()`                               | DEFINER  | `postgres` (owner), `authenticated`, `service_role` |
| `authz.has_membership(uuid, authz.membership_role[])`  | DEFINER  | `postgres` (owner), `authenticated`, `service_role` |
| `authz.has_staff_membership(uuid, authz.staff_role[])` | DEFINER  | `postgres` (owner), `authenticated`, `service_role` |

- No row has a `PUBLIC` or an `anon` entry.
- `service_role` has no EXECUTE on `current_user_memberships`. Both callers
  (`packages/auth/resolve-user-role.ts`, `packages/auth/context.ts`) use the
  request's session client, and for `service_role` `auth.uid()` is NULL.
- The `authz` INVOKER helpers `current_user_id()` and `current_tenant_id()`
  keep `PUBLIC` EXECUTE; they run with the caller's privileges and gain nothing.
- The 8 `authz staff tenant …` policies on `crm_command_logs`,
  `crm_record_links` and `crm_merge_candidates` were `TO public` and call these
  helpers. They are now `TO authenticated`, with USING and WITH CHECK
  unchanged. Hosted defaults give `anon` table privileges, so without this
  `anon` would get `permission denied for function is_super_admin` instead of
  0 rows.

`tests/unit/security/authz-definer-execute-grants.test.ts` fails the build if
a forward migration defines an `authz` SECURITY DEFINER function that is not in
its `AUTHZ_DEFINER_GRANTS` list, grants an `authz` function or
`current_user_memberships` to `PUBLIC` or `anon`, or grants `anon` USAGE on
`authz`. The real-stack acceptance test for #2270 checks the grantee sets on a
migrated database, including after simulating the hosted defaults.

## Adding an `authz` SECURITY DEFINER helper

In the migration that creates it:

1. `REVOKE ALL ON FUNCTION authz.<name>(<args>) FROM PUBLIC, anon;`
2. `GRANT EXECUTE ON FUNCTION authz.<name>(<args>) TO <exact roles>;`
3. Add the function to `AUTHZ_DEFINER_GRANTS` in the static test and a row to
   the table above.

The same applies to any SECURITY DEFINER function in `public`: revoke `PUBLIC`
and every role that must not call it by name, never `PUBLIC` alone. Policies
that call DEFINER helpers should name their roles (`TO authenticated`) rather
than default to `public`.

## Why the development project has `current_user_memberships` and production does not

This is release lag, not an orphaned function.

- The function came in with `20260802041500_current_user_memberships_rpc.sql`
  (commit `fe954896`, PR #974, merged to `develop` on Aug 1, 2026). It is on
  `develop`, unchanged.
- The `production` branch was last released at `fb168d89` (#384, Jun 20, 2026).
  Its newest migration is `20260515140948_native_pdf_studio_foundation.sql`, so
  the file is not there.
- The development project runs `develop`'s migrations; production runs the
  older branch's. `20260226113000` is identical on both, which is why the
  `authz` helpers carry `PUBLIC` EXECUTE on production too.

The repo stays the source of truth: the function is kept and its grants are
fixed. It is load-bearing on `develop`. Before `fe954896`, reading
`authz.memberships` through `.schema("authz")` returned PGRST106 and locked
every signed-in user out; dropping the function to match production would bring
that back.

## Production deploy

Applying this to production is a release step owned by the project owner, not
part of the PR.

- Production has none of the migrations after `20260515140948`. When it is next
  released, `20260802041500` (creates the function, revokes only `PUBLIC`) and
  `20261024163000` (this lockdown) must ship **in the same release**, so the
  `anon`/`service_role` window lasts only between two consecutive migrations in
  one push.
- The `authz` part needs only the foundation and CRM migrations, which
  production already has, but it ships through the normal release, not as a
  hotfix. Production is not exposed today: `anon` has no USAGE on `authz`.
- After applying, re-run the read-only grant check on the development project
  and on production and expect the table above.

### Manual revert

There is no rollback migration: reverting restores `PUBLIC` EXECUTE on the
`authz` helpers and re-opens the gaps described above. If a revert is needed
anyway, this restores the state the earlier migrations defined. It does not
re-grant `anon` or `service_role` on `current_user_memberships`, which no
migration intended.

```sql
BEGIN;
GRANT EXECUTE ON FUNCTION authz.is_super_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION authz.has_membership(UUID, authz.membership_role[]) TO PUBLIC;
GRANT EXECUTE ON FUNCTION authz.has_staff_membership(UUID, authz.staff_role[]) TO PUBLIC;
ALTER POLICY "authz staff tenant select crm_command_logs" ON public.crm_command_logs TO public;
ALTER POLICY "authz staff tenant insert crm_command_logs" ON public.crm_command_logs TO public;
ALTER POLICY "authz staff tenant select crm_record_links" ON public.crm_record_links TO public;
ALTER POLICY "authz staff tenant insert crm_record_links" ON public.crm_record_links TO public;
ALTER POLICY "authz staff tenant update crm_record_links" ON public.crm_record_links TO public;
ALTER POLICY "authz staff tenant select crm_merge_candidates" ON public.crm_merge_candidates TO public;
ALTER POLICY "authz staff tenant insert crm_merge_candidates" ON public.crm_merge_candidates TO public;
ALTER POLICY "authz staff tenant update crm_merge_candidates" ON public.crm_merge_candidates TO public;
SELECT pg_notify('pgrst', 'reload schema');
COMMIT;
```

## CRM table-preference functions (#2402)

`supabase/migrations/20261025125700_crm_table_preference_session_identity.sql`
replaces the five CRM table-view and table-preference writes. They used to be
SECURITY DEFINER functions for `service_role` that trusted the tenant, profile
and "can manage defaults" flag passed as arguments. Their bodies move
unchanged to `private`, and thin `public` wrappers take their place. The
wrappers have no profile or actor arguments: they take the acting user from
`auth.uid()` and the acting profile from `public.profiles` where
`user_id = auth.uid()`.

| Function                                                                                                                        | Security | EXECUTE grantees (exact)            |
| ------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| `public.create_crm_table_named_view(uuid, text, text, boolean, integer, text, jsonb)`                                           | DEFINER  | `postgres` (owner), `authenticated` |
| `public.update_crm_table_named_view(uuid, text, text, text, boolean, boolean, boolean, integer, text, boolean, jsonb, boolean)` | DEFINER  | `postgres` (owner), `authenticated` |
| `public.delete_crm_table_named_view(uuid, text, text, text)`                                                                    | DEFINER  | `postgres` (owner), `authenticated` |
| `public.save_crm_user_table_preference(uuid, text, text, boolean, integer, jsonb)`                                              | DEFINER  | `postgres` (owner), `authenticated` |
| `public.save_crm_tenant_table_default(uuid, text, text, boolean, integer, jsonb)`                                               | DEFINER  | `postgres` (owner), `authenticated` |

- Each wrapper is owned by `postgres` and uses `SET search_path = ''`. The
  migration revokes `PUBLIC`, `anon` and `service_role` by name, then grants
  `authenticated`.
- The original bodies (`private.<name>` with the old argument lists) and the
  helper `private.crm_table_preference_actor(uuid, text)` are EXECUTE for
  `postgres` only. `PUBLIC`, `anon`, `authenticated` and `service_role` are
  revoked by name, because `ALTER FUNCTION … SET SCHEMA` keeps the old ACL.
- Tenant rule. A super admin (`profiles.role = 'super_admin'`) may act in any
  existing tenant it passes. Anyone else must pass its profile's `tenant_id`
  and hold a CRM role there: `profiles.role` staff, admin or super_admin, or an
  active `staff` membership in `authz.memberships`. No `auth.uid()`, no
  profile, a different tenant or no CRM role fails with `42501` before the
  body runs, so nothing is written.
- Tenant defaults. Super admins may save them and change
  `delegatedManagerProfileIds`. A profile listed there may save but not change
  the list. Anyone else gets `42501`. The audit row's `actor_profile_id` and
  the record's `updated_by` are the caller's profile.
- `authenticated` can now call these through the Data API without the route's
  zod checks, so the wrappers also reject a table id other than
  `crm.giftHistory` and a view name outside 1–80 characters after trimming
  (`22023`).
- Callers: the admin CRM table-preference routes
  (`packages/api/src/admin/crm/table-preferences/route.ts`) make these calls
  with the request's session client
  (`packages/api/src/shared/request-session-client.ts`: bearer header, else
  cookies), never `supabaseAdmin`. Reads still use the service-role client.
  E2E auth-bypass requests have no Supabase session, so these writes fail with
  `42501` there; no e2e spec uses these routes.
- `tests/unit/security/authz-definer-execute-grants.test.ts` pins the
  migration's revoke and grant statements and fails the build if any
  migration grants these functions to `PUBLIC` or `anon`. The #2402 real-stack
  acceptance test checks the grantee sets, including after simulating the
  hosted defaults.

### Deploy

Applying migrations to a hosted project is a release step owned by the project
owner, not part of the PR.

- Production has none of `20260611160000`, `20260611170000` or this migration
  yet. When it is next released, all three ship **in the same release** as
  the app code that calls the wrappers with the session client.
- Development project: apply the migration and deploy the matching app build
  together, in one window. If the migration lands first, the old app's
  service-role writes get `42501`. If the app lands first, its calls don't
  match the old signatures. Either way table-preference writes return 500
  until both are in place. Reads are not affected.

### Rollback

`supabase/migrations/rollback_20261025125700_crm_table_preference_session_identity.sql`
drops the wrappers and the actor helper, moves the bodies back to `public`
under their original signatures and grants EXECUTE to `service_role` only
(nothing to `anon` or `authenticated`). It touches no rows. Always revert the
app commit together with it: the restored bodies trust their arguments and
need the service-role caller.

## Same pattern, not fixed here

Under hosted default privileges, 20 of the `public` functions gain EXECUTE for
`anon` and/or `service_role` because their migrations revoke only `PUBLIC` (or
`PUBLIC`, `anon` and `authenticated`). They are outside #2270. (#2402 fixed
the five SECURITY DEFINER CRM table-preference writes; see above.)

`anon` widened, beyond `current_user_memberships`:

- SECURITY INVOKER: `apply_crm_view_settings_patch`
  (`20260611160000_crm_table_preferences.sql`), `normalize_currency_code`,
  `normalize_money_currency` (`20261003051630_currency_foundation.sql`).

`service_role` widened only (low risk, since `service_role` bypasses RLS), from
`20260718013531_eve_admin_memory_tracer.sql`,
`20260718015747_eve_approval_budget_policy.sql`,
`20260718093000_eve_email_discord_notifications.sql` and
`20260718102000_eve_final_launch_verification.sql`:
`append_eve_admin_memory_audit`, `append_eve_approval_budget_audit`,
`append_eve_model_policy_audit`, `assert_eve_admin_memory_owner`,
`assert_eve_launch_profile`, `assert_eve_model_policy_change_allowed`,
`assert_eve_policy_actor_tenant`, `assert_eve_retention_actor`,
`contains_eve_admin_memory_exclusion`, `enforce_eve_ai_settings_grant_tenant`,
`enforce_eve_policy_permission_tenant`, `has_eve_launch_permission`,
`has_eve_policy_permission`, `is_eve_launch_safe_text`,
`record_eve_policy_decision`, `validate_eve_notification_recipient`.

Also noted and left unchanged: `authz.is_super_admin()` uses
`SET search_path = public` rather than `''`, and `20260226113000` grants
`CREATE ON SCHEMA authz TO service_role`.
