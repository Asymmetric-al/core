# Function EXECUTE grants (#2270)

`supabase/migrations/20261024163000_authz_definer_execute_lockdown.sql` gives
the `authz` SECURITY DEFINER helpers and `public.current_user_memberships` an
explicit EXECUTE grant list. A SECURITY DEFINER function runs as its owner and
reads past RLS, so who may call it is the whole boundary.

## Why `REVOKE … FROM PUBLIC` is not enough

CI keeps two different local controls. The plain PG17 `migrate` database checks that the application does not depend on implicit hosted grants; it is not privilege-identical to hosted Supabase. The stage-1 privilege acceptance suite in that job and the release fingerprint replay separately start with `scripts/sql/hosted-default-privileges.sql`. On a disposable replay after WP4a's export migration, plain defaults granted `service_role` SELECT on future public tables only; hosted-style defaults still granted it all table and sequence privileges and function EXECUTE. The field census and tenant catalog passed with the hosted defaults. Keep both initial states rather than replacing the plain control. Do not infer least privilege for `service_role` from either gate. Removing its defaults requires the database/security owner's decision and a grant-by-grant inventory of the remaining service and worker callers; this package changes no default privileges.

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

| Function                                               | Security | EXECUTE grantees (exact)                                            |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------- |
| `public.current_user_memberships(uuid)`                | DEFINER  | `postgres` (owner), `authenticated`                                 |
| `public.current_user_organizations()`                  | DEFINER  | `postgres` (owner), `authenticated`                                 |
| `public.post_comment_authors(uuid)`                    | DEFINER  | `postgres` (owner), `authenticated`                                 |
| `authz.is_super_admin()`                               | DEFINER  | `postgres` (owner), `authenticated`, `service_role`                 |
| `authz.has_membership(uuid, authz.membership_role[])`  | DEFINER  | `postgres` (owner), `authenticated`, `service_role`, `tenant_guard` |
| `authz.has_staff_membership(uuid, authz.staff_role[])` | DEFINER  | `postgres` (owner), `authenticated`, `service_role`, `tenant_guard` |

- No row has a `PUBLIC` or an `anon` entry.
- `tenant_guard` gained EXECUTE on the two membership helpers in AL-2674
  (`20261117034638_command_lane_human_entry_points.sql`), for the human-command
  preamble. Its other grants are listed in `docs/security/tenant-guard.md`,
  "Command lane".
- `service_role` has no EXECUTE on `current_user_memberships`; for
  `service_role` `auth.uid()` is NULL. Since AL-2675 the application resolves
  through `public.current_user_assignments()` instead (the principal resolver
  in `packages/auth/principal`), and both functions return the
  tenant-administrator flag. AL-2675 drops and recreates both (their result
  types changed) with the same grants.
- `public.current_user_organizations()` (AL-2675,
  `20261119135100_current_user_organizations.sql`) names the organization
  chooser's organizations: the id and name of each tenant in which the session
  caller holds a live membership row, and nothing else. Signed-in users have
  no privilege on `public.tenants`, so it runs as its owner. Its migration
  revokes `PUBLIC`, `anon`, `authenticated` and `service_role` by name and
  grants `authenticated` alone; for `service_role` and `anon`, `auth.uid()`
  is NULL. `tests/unit/acceptance/issue-2675/organization-names.realstack.acceptance.test.ts`
  checks who sees which name and the grantee set, also after simulating the
  hosted defaults.
- `public.post_comment_authors(uuid)` (AL-2675, JB11,
  `20261119135200_post_comment_authors.sql`) gives one row for each person
  who commented on a published public post: the display name (NULL when blank)
  and the avatar, only to a caller with a live membership in the post's
  organization, and NULL to anyone else. It runs as its owner because those
  profiles are not the caller's. Its migration revokes `PUBLIC`, `anon`,
  `authenticated` and `service_role` by name and grants `authenticated`
  alone. `tests/unit/acceptance/issue-2675/post-comment-authors.realstack.acceptance.test.ts`
  checks who sees which name and the grantee set.
- The `authz` INVOKER helpers `current_user_id()` and `current_tenant_id()`
  keep `PUBLIC` EXECUTE; they run with the caller's privileges and gain nothing.
- Since the second release of WP2b (AL-2675,
  `20261119135300_request_tenant_policies.sql`), `has_membership` and
  `has_staff_membership` keep these grants and judge the request's one
  assignment, through `authz.request_assignment()`. The request-tenant helpers
  it adds (`authz.request_tenant_id()`, `request_assignment_id()`,
  `request_assignment()`, `assignment_is(...)`, `assignment_is_tenant_admin()`,
  `assignment_holds(text)`, `caller_profile_ids()`, `caller_tenant_ids()`) are
  owned by `postgres` and executable by `authenticated` and `service_role`
  only; so `anon` calling `current_tenant_id()` gets `42501`. It marks
  `authz.is_super_admin()` and `authz.current_user_id()` `PARALLEL SAFE`.
  The commenter read, `public.post_comment_authors(uuid)`, ships with the
  first release of WP2b, not this one (council R1). `tenant_guard` keeps its
  `EXECUTE` on `has_membership` and `has_staff_membership` (AL-2674's
  command-lane migration asserts it); nothing in `tenant_guard` or
  `platform` calls them, and after this migration no policy in `public` does.
- The 8 `authz staff tenant …` policies on `crm_command_logs`,
  `crm_record_links` and `crm_merge_candidates` were `TO public` and call these
  helpers. They are now `TO authenticated`, with USING and WITH CHECK
  unchanged. Hosted defaults give `anon` table privileges, so without this
  `anon` would get `permission denied for function is_super_admin` instead of
  0 rows. Since the second release of WP2b (AL-2675) five of them are
  dropped: the insert of `crm_command_logs` and the insert and update of
  `crm_merge_candidates` with their write grants, and the insert and update of
  `crm_record_links`, where signed-in users never held a write grant. The
  three read policies that stand carry the request's tenant
  (`tenant-policy-activation-review.md`, Q7 and Q8).

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
migration intended. On a chain that has
`20261119135300_request_tenant_policies.sql`, the five write policies it
dropped do not exist: leave out their `ALTER POLICY` lines.

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
- Tenant rule (since AL-2675, NR-55). The caller must have a profile and a
  selected live `staff` membership in the tenant it passes: the row the
  `x-asym-assignment` header names, or its one live staff row there
  (`authz.caller_assignment`). No `auth.uid()`, no profile, no such row, or
  several staff rows there and no header fails with `42501` before the body
  runs, so nothing is written. `profiles.role`, `profiles.tenant_id` and
  `super_admin` are not read.
- Tenant defaults. A caller whose selected row holds
  `crm.gift_history.manage_view_defaults` (the tenant administrator) may save
  them and change `delegatedManagerProfileIds`. A profile listed there may save
  but not change the list. Anyone else gets `42501`. The audit row's `actor_profile_id` and
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

Under hosted default privileges, 20 of the `public` functions gained EXECUTE
for `anon` and/or `service_role` because their migrations revoked only `PUBLIC`
(or `PUBLIC`, `anon` and `authenticated`). They were outside #2270. (#2402
fixed the five SECURITY DEFINER CRM table-preference writes; see above.)

`anon` widened, beyond `current_user_memberships`, and fixed since by AL-2674:

- SECURITY INVOKER: `apply_crm_view_settings_patch`
  (`20260611160000_crm_table_preferences.sql`), `normalize_currency_code`,
  `normalize_money_currency` (`20261003051630_currency_foundation.sql`).
  `20261117034926_close_default_privileges_and_demo_grants.sql` revokes
  `PUBLIC`, `anon` and `authenticated` on all three by name, and asserts that
  neither `anon` nor `authenticated` can execute them. The same migration
  removes `postgres`'s default privileges in `public` for `anon` and
  `authenticated`, so new functions there get no grant to either by default.

`service_role` widened only (low risk, since `service_role` bypasses RLS), and
still open, from
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

## Membership functions added by AL-2675 (WP2a)

| Function                                                                                     | Security | EXECUTE grantees (exact)            |
| -------------------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| `public.tenant_member_directory(uuid)`                                                       | DEFINER  | `postgres` (owner), `authenticated` |
| `authz.assignment_capabilities(uuid)`                                                        | INVOKER  | `postgres` (owner), `tenant_guard`  |
| `tenant_guard.begin_human_command(uuid, text)`                                               | INVOKER  | `postgres` (owner), `tenant_guard`  |
| `authz.caller_assignment(uuid, authz.membership_role)`                                       | INVOKER  | `postgres` (owner)                  |
| `private.profile_in_tenant(uuid, uuid)`                                                      | INVOKER  | `postgres` (owner)                  |
| `authz.memberships_lifecycle()` (trigger)                                                    | INVOKER  | `postgres` (owner)                  |
| `public.tenant_member_profiles(uuid, uuid[], uuid[], boolean, text, boolean, uuid, integer)` | INVOKER  | `postgres` (owner), `service_role`  |

Each revokes `PUBLIC`, `anon`, `authenticated` and `service_role` by name
before granting. `tenant_member_profiles`, added by the WP2a sweep, is the
service-key reader of a tenant's memberships joined to profiles: the server
code that needs a tenant's members, approvers or notification recipients
reads them there, never by filtering `profiles` on `tenant_id` or `role`
(NR-68). It returns named columns and serves the server's own notification,
approval and history work. Mission Control's users list reads the member
directory instead, on the caller's own token (council round 1 on WP2a, F8). `begin_human_command` replaces the one-argument function of
AL-2674; its second argument, the capability, defaults to NULL.
