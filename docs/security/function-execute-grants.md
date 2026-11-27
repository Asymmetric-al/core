# Function EXECUTE grants (#2270)

`supabase/migrations/20261024163000_authz_definer_execute_lockdown.sql` gives
the `authz` SECURITY DEFINER helpers and `public.current_user_memberships` an
explicit EXECUTE grant list. A SECURITY DEFINER function runs as its owner and
reads past RLS, so who may call it is the whole boundary.

## Why `REVOKE … FROM PUBLIC` is not enough

CI keeps two different local controls. The plain PG17 `migrate` database checks that the application does not depend on implicit hosted grants; it is not privilege-identical to hosted Supabase. The stage-1 privilege acceptance suite in that job and the release fingerprint replay separately start with `scripts/sql/hosted-default-privileges.sql`. On a disposable replay after WP4a's export migration, plain defaults granted `service_role` SELECT on future public tables only; hosted-style defaults still granted it all table and sequence privileges and function EXECUTE. The field census and tenant catalog passed with the hosted defaults. Keep both initial states rather than replacing the plain control. Do not infer least privilege for `service_role` from either gate. The 21 November 2026 ruling (D-111) retains service_role's default table, sequence and function privileges until WP4 exit, except TRUNCATE, REFERENCES, TRIGGER and MAINTAIN on relations in `public` and CREATE on schema `authz`: the 26 November 2026 ruling on #2832 amends D-111 for those only, and `20261126190000_wp8a2_service_role_privileges.sql` (issue 2841) revokes them, from the default privileges of `postgres` in `public` too, so that `TRUNCATE` and trigger DDL cannot step around the seals of the line-based money rows. The tenant catalog gate keeps them closed. SELECT, INSERT, UPDATE, DELETE, the sequence privileges and EXECUTE stay as D-111 ruled (but for `service_role`'s INSERT and UPDATE on `public.parties`, narrowed to named columns by `20261126180000`, below), and WP4 exit revisits them with a grant inventory of the remaining service and worker callers.

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
| `authz.has_membership(uuid, authz.membership_role[])`  | DEFINER  | `postgres` (owner), `authenticated`, `service_role`, `tenant_guard` |
| `authz.has_staff_membership(uuid, authz.staff_role[])` | DEFINER  | `postgres` (owner), `authenticated`, `service_role`, `tenant_guard` |

- No row has a `PUBLIC` or an `anon` entry.
- `authz.is_super_admin()`, a DEFINER with the same grants as the membership
  helpers but `tenant_guard`, was dropped by WP2c's rest (AL-2675,
  `20261127040000_wp2c_rest_no_super_admin.sql`) with the last policy branch
  that called it. The staff-wide reads call `authz.staff_read()` instead, a
  SECURITY INVOKER with EXECUTE for `postgres` (owner), `authenticated` and
  `service_role`, none for `PUBLIC` or `anon`.
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
  checks who sees which name and the grantee set. Since AL-2678 (WP5 part
  2-r2a, `20261126050000_wp5_2r2a_comment_authors.sql`, grants unchanged) a
  worker is named only by the post's organization's public name, and a
  commenter linked to a restricted or high-risk Party in any organization, or
  a worker with no sole row in the post's organization, has no photo and is
  named only by an alias or not at all.
- `public.donor_is_restricted_party(public.donors)` (AL-2678, WP5 part
  2-r2s, `20261126060000_wp5_2r2s_donor_restricted_party.sql`) is a computed
  column for the service key: false only when the donor has a Party in its
  own organization and every Party linked to its login, or to a login of that
  Party, in any organization, is standard or sensitive; never NULL. It is
  owned by `postgres`, has an empty search path, and its migration revokes
  `PUBLIC`, `anon`, `authenticated` and `service_role` by name and grants
  `service_role` alone. It is a definer because it reads other people's
  rows (the logins and Parties of other organizations) that no caller's own
  privileges reach, and it reveals only the one boolean.
  `tests/unit/acceptance/issue-2678/supporter-redaction.realstack.acceptance.test.ts`
  asserts the owner, the search path and the exact grantees, and
  `supporter-names.postgrest` that a donor's token and `anon` get `42501`.
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
- WP5 part 1 (AL-2678, `20261125050100_parties_account_links_and_own_rows.sql`)
  adds one more `authz` definer, `authz.caller_missionary_ids()`: the ministry
  assignments the signed-in caller is linked to through `account_links` in
  the request's tenant, for the missionary branches of the own-row policies.
  It is owned by `postgres`, has an empty search path, is revoked from
  `PUBLIC`, `anon`, `authenticated` and `service_role` by name, and is
  executable by `authenticated` and `service_role` only.
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
  (`tenant-policy-activation-review.md`, Q7 and Q8). WP4a's second part (AL-2677) drops
  `crm_merge_candidates` with its read policy
  (`20261121030001_drop_crm_merge_candidates.sql`), so two stand, and the
  rollback below no longer applies to that table's three lines.

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
migration intended. It applies only to a chain without
`20261119135300_request_tenant_policies.sql`. On a chain with it, it would
change grants and policy roles while that migration's predicates and helpers
stay, which restores no earlier state. Roll that migration back first with
its own file and procedure (`docs/ops/release-job.md`, "Rolling it back by
hand"), then this revert applies as written.

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
- Tenant rule (since AL-2675, NR-55; tightened by AL-2676). The caller must
  have a profile, `x-asym-tenant` must name the tenant passed (missing, blank —
  empty or ASCII spaces only — or another tenant fails with `42501`; malformed
  raises `22P02`), and the caller must resolve a live `staff` membership in
  that tenant through `authz.caller_assignment`: the row `x-asym-assignment`
  names, or, with no `x-asym-assignment` header, the caller's one live
  membership row of any class in that tenant (which must be `staff`). No
  `auth.uid()`, no profile, no such row, or several live rows of any class
  there with no `x-asym-assignment` header fails with `42501` before the body
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
  neither `anon` nor `authenticated` can execute them. Since WP8a part 2,
  slice R2a (AL-2681), `tenant_guard` also executes `normalize_currency_code`,
  which the currency triggers on `donations` and `staged_gifts` call as the
  inserting role when the guard inserts a line-based intake or its staged
  gift. The same migration
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

## Member Care functions added by AL-2677 (WP4b part 1)

| Function                                                          | Security | EXECUTE grantees (exact)            |
| ----------------------------------------------------------------- | -------- | ----------------------------------- |
| `public.member_care_directory_rows(uuid, uuid, integer)`          | DEFINER  | `postgres` (owner), `authenticated` |
| `public.create_care_thread_post(uuid, text)`                      | INVOKER  | `postgres` (owner), `authenticated` |
| `public.create_care_private_note(uuid, text)`                     | INVOKER  | `postgres` (owner), `authenticated` |
| `public.upsert_care_goal(uuid, text, text, date, uuid)`           | INVOKER  | `postgres` (owner), `authenticated` |
| `public.log_care_activity(uuid, text, text)`                      | INVOKER  | `postgres` (owner), `authenticated` |
| `public.upsert_care_requirement(uuid, text, integer, text, uuid)` | INVOKER  | `postgres` (owner), `authenticated` |
| `public.set_manual_attention_flag(uuid, boolean)`                 | INVOKER  | `postgres` (owner), `authenticated` |
| `private.share_lock_tenant(uuid)`                                 | DEFINER  | `postgres` (owner), `tenant_guard`  |
| `private.profile_display_name(uuid)`                              | DEFINER  | `postgres` (owner), `tenant_guard`  |

Each revokes `PUBLIC`, `anon`, `authenticated`, and `service_role` by name
before granting. `authz.request_tenant_id()` additionally grants `EXECUTE` to
`tenant_guard` (alongside `authenticated` and `service_role`) so the six care
commands enforce non-null request-tenant binding on direct calls.

## Site functions added by AL-2676 (WP3a part 1b)

| Function                                         | Security | EXECUTE grantees (exact)                                    |
| ------------------------------------------------ | -------- | ----------------------------------------------------------- |
| `public.resolve_verified_host(text)`             | DEFINER  | `postgres` (owner), `anon`, `authenticated`, `service_role` |
| `public.create_site(uuid, text)`                 | INVOKER  | `postgres` (owner), `authenticated`                         |
| `public.set_site_status(uuid, uuid, text)`       | INVOKER  | `postgres` (owner), `authenticated`                         |
| `public.set_account_brand(uuid, text)`           | INVOKER  | `postgres` (owner), `authenticated`                         |
| `public.designate_home(uuid, text)`              | INVOKER  | `postgres` (owner), `authenticated`                         |
| `tenant_guard.create_site(uuid, text)`           | DEFINER  | `tenant_guard` (owner), `authenticated`                     |
| `tenant_guard.set_site_status(uuid, uuid, text)` | DEFINER  | `tenant_guard` (owner), `authenticated`                     |
| `tenant_guard.set_account_brand(uuid, text)`     | DEFINER  | `tenant_guard` (owner), `authenticated`                     |
| `tenant_guard.designate_home(uuid, text)`        | DEFINER  | `tenant_guard` (owner), `authenticated`                     |
| `private.share_lock_site_domain(uuid, text)`     | DEFINER  | `postgres` (owner), `tenant_guard`                          |
| `public.resolve_home_host(text)`                 | DEFINER  | `postgres` (owner), `anon`, `authenticated`, `service_role` |
| `public.tenant_site_settings(uuid)`              | INVOKER  | `postgres` (owner), `authenticated`                         |
| `tenant_guard.tenant_site_settings(uuid)`        | DEFINER  | `tenant_guard` (owner), `authenticated`                     |

Each revokes `PUBLIC`, `anon`, `authenticated`, and `service_role` by name
before granting (`private.share_lock_site_domain` also revokes `tenant_guard`
before its one grant). `resolve_verified_host` and `resolve_home_host` (added
by WP3b part 2, AL-2676: the anonymous home read behind the redirect of a Site
name's account paths to home) are the two entries on
`docs/security/anon-definer-allowlist.json`. The two `tenant_site_settings`
rows (added by WP3b part 3, AL-2676) are the staff read of an organization's
Sites and brand under `sites.manage`, executable by `authenticated` only.

## Worker record functions added by AL-2678 (WP5 part 2-r2b1)

| Function                                                | Security | EXECUTE grantees (exact)                |
| ------------------------------------------------------- | -------- | --------------------------------------- |
| `public.worker_records(uuid)`                           | DEFINER  | `postgres` (owner), `authenticated`     |
| `tenant_guard.reveal_worker_identity(uuid, uuid, text)` | DEFINER  | `tenant_guard` (owner), `authenticated` |
| `public.reveal_worker_identity(uuid, uuid, text)`       | INVOKER  | `postgres` (owner), `authenticated`     |
| `public.read_party_restricted(uuid)`                    | DEFINER  | `postgres` (owner)                      |

Each new function revokes `PUBLIC`, `anon`, `authenticated` and
`service_role` by name before granting (`20261126180000_wp5_2r2b1_worker_record.sql`,
re-dated with the package). `worker_records` answers the request's
organization's staff only, never a legal name, and fills `has_legal_identity`
only for an assignment holding `safety.restrict_publication`; for any other
staff member it is NULL. The reveal is a human command needing the same
capability and a reason, and writes one `worker_identity_revealed` audit row
that holds the reason and the assignment, never the values. The same file
revokes `authenticated`'s `EXECUTE` on `public.read_party_restricted(uuid)`,
which had no caller outside tests, so the audited reveal is the one database
read of `private.party_restricted` a signed-in caller can make. It also
narrows `service_role` on `public.parties` from table `INSERT` and `UPDATE` to
`INSERT (id, tenant_id, display_name, import_batch_id, created_at, updated_at)`
and `UPDATE (display_name, import_batch_id, updated_at)`: the level, its
source, the alias and do-not-publish change only through the safety commands.
It replaces `tenant_guard.restrict_worker_publication` so that an alias the
safety normalization reduces to nothing is no alias; its owner (`tenant_guard`),
security and grantees (`tenant_guard`, `authenticated`) do not change, and the
file restates part 1's `REVOKE` and `GRANT` for it.

## Functions added by AL-2678 (WP5 rest, pull request 1)

| Function                                                                                          | Security | EXECUTE grantees (exact)                           |
| ------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| `public.donor_party_for_insert(uuid, uuid, text, text)`                                           | DEFINER  | `postgres` (owner), `service_role`, `tenant_guard` |
| `public.crm_notes_page(uuid, text, text, boolean, integer, integer)`                              | INVOKER  | `postgres` (owner), `authenticated`                |
| `public.crm_relationships_page(uuid, text, text[], text, boolean, integer, integer, timestamptz)` | INVOKER  | `postgres` (owner), `authenticated`                |
| `tenant_guard.add_partner(uuid, uuid, text, text, text, text, text, uuid)`                        | DEFINER  | `tenant_guard` (owner), `authenticated`            |
| `public.add_partner(uuid, uuid, text, text, text, text, text, uuid)`                              | INVOKER  | `postgres` (owner), `authenticated`                |

Each revokes `PUBLIC`, `anon`, `authenticated` and `service_role` by name
before granting (`20261126200000_wp5_rest_party_writer.sql`,
`20261126200100_wp5_rest_crm_pages.sql`,
`20261126200200_wp5_rest_add_partner.sql`). The Party writer is the one way
a donor insert names its Party (`begin_donation_saga`,
`atomic_create_donation_with_audit`, `tenant_guard.add_partner`, and WP8a's
next donor writer); it reads nothing from `auth` and writes only in the
tenant the transaction entered. The two page functions run on the caller's
token under row security; the relationships page reads member-care activity
only for an assignment holding `care.access`. `begin_donation_saga` and
`atomic_create_donation_with_audit` are replaced with their grants
(`service_role`) unchanged, and `authz.assignment_capabilities(uuid)` with
its owner and grantee (`tenant_guard`) unchanged.

## Functions added by AL-2681 (WP8a part 2 rest, pull request 1)

| Function                                                                                                                                                                                     | Security | EXECUTE grantees (exact)                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- |
| `tenant_guard.set_large_gift_threshold(uuid, bigint, text)`                                                                                                                                  | DEFINER  | `tenant_guard` (owner), `authenticated` |
| `tenant_guard.resolve_gift_hold(uuid, uuid, text)`                                                                                                                                           | DEFINER  | `tenant_guard` (owner), `authenticated` |
| `public.set_large_gift_threshold(uuid, bigint, text)`, `public.resolve_gift_hold(uuid, uuid, text)`                                                                                          | INVOKER  | `postgres` (owner), `authenticated`     |
| `tenant_guard.abandon_unpaid_intake(uuid, uuid)`                                                                                                                                             | DEFINER  | `tenant_guard` (owner), `service_role`  |
| `public.abandon_unpaid_intake(uuid)`                                                                                                                                                         | INVOKER  | `postgres` (owner), `service_role`      |
| `private.grant_linked_donor_membership(uuid, uuid, uuid)`                                                                                                                                    | DEFINER  | `postgres` (owner), `tenant_guard`      |
| `private.insert_giver_donor(uuid, uuid, text, text, jsonb)`                                                                                                                                  | DEFINER  | `postgres` (owner), `tenant_guard`      |
| `private.money_norm(text)`, `private.money_entered_name(text, text)`, `private.money_duplicate_donors(uuid, text, text, jsonb, uuid)`, `private.money_large_gift_hold(bigint, text, bigint)` | INVOKER  | `postgres` (owner), `tenant_guard`      |
| `public.line_based_gift_lines(uuid, uuid[])`                                                                                                                                                 | DEFINER  | `postgres` (owner), `service_role`      |
| `public.actor_gifts_without_donor(uuid, uuid)`                                                                                                                                               | DEFINER  | `postgres` (owner), `service_role`      |
| `public.donor_portal_lifetime(uuid, uuid, uuid[])`                                                                                                                                           | DEFINER  | `postgres` (owner), `service_role`      |
| `private.staged_gifts_hold_guard()` (trigger)                                                                                                                                                | DEFINER  | `postgres` (owner)                      |

`public.actor_gifts_without_donor(uuid, uuid)` (fix round F2) is a
`postgres`-owned STABLE definer with EXECUTE for `service_role` only: the
ids of a login's counted line-based gifts that have no donor yet, for the
donor portal. `public.admin_contributions_summary(uuid)` is replaced (F5)
with its owner and grants unchanged and its search path emptied.
`public.donor_portal_lifetime(uuid, uuid, uuid[])` (pull request 2a, issue
2857 item 8, `20261127050000_wp8a2_rest2a_item_zero.sql`) is a
`postgres`-owned STABLE definer with EXECUTE for `service_role` only: the
sum and count of a person's settled gifts, by the portal list's ownership
filters, so the lifetime figures do not depend on the 250 rows it shows.

Each revokes `PUBLIC`, `anon`, `authenticated` and `service_role` by name
before granting (`20261127030100_wp8a2_rest_holds.sql`,
`20261127030200_wp8a2_rest_unpaid_and_unmatched.sql`,
`20261127030300_wp8a2_rest_apply_core.sql`,
`20261127030400_wp8a2_rest_review_and_reads.sql`). The two human commands open
with `tenant_guard.begin_human_command` and their capability
(`contributions.manage_settings`, `contributions.apply_corrections`), so the
request's `x-asym-tenant` must name the organization; the sweep's wrapper takes
no tenant and reads it from the stored intake. The trigger function is a
definer so that the hold it reads binds every writer of a staged gift, whatever
that writer's grants. `tenant_guard.apply_account_event` and
`tenant_guard.apply_payment_outcome` are replaced as their owner, with the same
security and grantees. `private.replace_line_based_allocations` does not exist:
the line-based review lives in the four-argument
`public.replace_staged_gift_allocations`, whose owner, security and grantees do
not change.

## Functions added by AL-2675 (WP2c rest, pull request A)

| Function                               | Security | EXECUTE grantees (exact)            |
| -------------------------------------- | -------- | ----------------------------------- |
| `platform.tenant_operators(uuid)`      | DEFINER  | `postgres` (owner), `authenticated` |
| `public.tenant_operators(uuid)`        | INVOKER  | `postgres` (owner), `authenticated` |
| `platform.eve_history(integer)`        | DEFINER  | `postgres` (owner), `authenticated` |
| `public.platform_eve_history(integer)` | INVOKER  | `postgres` (owner), `authenticated` |

Each revokes `PUBLIC`, `anon`, `authenticated` and `service_role` by name
before granting (`20261127035000_wp2c_rest_operator_reads.sql`). The two
platform commands begin with the shared operator check
(`platform.require_operator()`, an operator at `aal2`) and write nothing:
the launch-permission picker's list of an organization's operators, which
also requires that organization to be the request's `x-asym-tenant` and
active, and the caller to hold a live staff row there (the one
`x-asym-assignment` names, when it names one), and the assistant runtime's
audit rows recorded with no organization. `service_role` holds neither: the picker's
route reads on the caller's token and the operator area on the browser's
session.

## Functions added by AL-2681 (WP8a part 2 rest, pull request 2a)

| Function                                                                                                             | Security | EXECUTE grantees (exact)                    |
| -------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| `tenant_guard.begin_line_gift(uuid, text, text, text, jsonb, bigint, text, boolean, text, jsonb, jsonb, uuid)`       | DEFINER  | `tenant_guard` (owner), `service_role`      |
| `public.begin_line_gift(text, text, text, jsonb, bigint, text, boolean, text, jsonb, jsonb, uuid)`                   | INVOKER  | `postgres` (owner), `service_role`          |
| `tenant_guard.defer_payment_event(uuid, uuid, integer)`, `tenant_guard.reconcile_payment_account(uuid, uuid, jsonb)` | DEFINER  | `tenant_guard` (owner), `service_role`      |
| `public.defer_payment_event(uuid, integer)`, `public.reconcile_payment_account(uuid, jsonb)`                         | INVOKER  | `postgres` (owner), `service_role`          |
| `public.take_intake_rate_token(text)`                                                                                | DEFINER  | `postgres` (owner), `service_role`          |
| `public.checkout_giving_config(text, jsonb)`                                                                         | DEFINER  | `postgres` (owner), `anon`, `authenticated` |
| `public.money_due_work(integer)`                                                                                     | INVOKER  | `postgres` (owner), `service_role`          |
| `private.donation_intake_requests_sealed()` (trigger)                                                                | INVOKER  | `postgres` (owner)                          |

`public.begin_line_gift` reads its organization from the reviewed host lookup
`public.resolve_verified_host` (ruling W8-R41) and takes no tenant;
`public.defer_payment_event` and `public.reconcile_payment_account` read it from
the stored event and the stored account. `public.checkout_giving_config` is the
anonymous config read (W8-R18), listed in `anon-definer-allowlist.json`: one
output, the connected account, or nothing. `public.take_intake_rate_token`
counts an address's digest in a ten-minute window and trims ended windows in
the same call. `public.money_due_work` is an invoker over tables
`service_role` already reads, for the money schedule. `tenant_guard.claim_provider_event`
is replaced as its owner with the same security and grantees; a deferred event
answers terminal. Each file revokes `PUBLIC`, `anon`, `authenticated` and
`service_role` by name before granting
(`20261127050100_wp8a2_rest2a_intake_command.sql`,
`20261127050200_wp8a2_rest2a_guest_reads.sql`,
`20261127050300_wp8a2_rest2a_deferred_events.sql`).

## Functions added by AL-2678 (WP5 rest, pull request 2a)

| Function                                                 | Security | EXECUTE grantees (exact)           |
| -------------------------------------------------------- | -------- | ---------------------------------- |
| `private.login_party(uuid, uuid)`                        | DEFINER  | `postgres` (owner), `tenant_guard` |
| `private.record_claim_merge_candidate(uuid, uuid, uuid)` | DEFINER  | `postgres` (owner), `tenant_guard` |

Each revokes `PUBLIC`, `anon`, `authenticated` and `service_role` by name
before granting (`20261127060000_wp5_rest2_party_lock.sql`). Both refuse a
call outside the tenant the transaction entered (42501) and read nothing from
`auth`. `private.login_party` answers the Party a login resolves to in the
donor writer's order (account link, else sole worker row, else that login's
donor); `private.record_claim_merge_candidate` writes one open
`donor_merge_candidates` row for a claim refused because the login is tied to
another Party, by an account link, a worker row or its own donor, and never
merges. It records nothing when that other Party holds no donor or several,
when its one donor is the claimed donor, or when the pair is already open in
either direction; it reads under the advisory lock
(`donor_merge_candidate`, organization and the pair), so two refusals of one
pair at once record one. A claim refused for another reason (the token, the
person, the e-mail, the donor's contact, or a claimed donor already linked)
records nothing. `begin_donation_saga`,
`atomic_create_donation_with_audit` and `tenant_guard.redeem_account_claim`
are replaced, and `tenant_guard.add_partner` by
`20261127060100_wp5_rest2_add_partner_digest.sql`, each with its owner,
security and grantees unchanged.

## Functions added by AL-2681 (WP8a part 2 rest, pull request 2b)

| Function                                                   | Security | EXECUTE grantees (exact)                    |
| ---------------------------------------------------------- | -------- | ------------------------------------------- |
| `public.take_intake_attempt(text, text, text, text, uuid)` | DEFINER  | `postgres` (owner), `service_role`          |
| `public.purge_intake_attempts()`                           | DEFINER  | `postgres` (owner), `service_role`          |
| `public.checkout_giving_config(text, jsonb, text, uuid)`   | DEFINER  | `postgres` (owner), `anon`, `authenticated` |
| `public.donor_portal_login_lifetime(uuid, uuid, uuid)`     | DEFINER  | `postgres` (owner), `service_role`          |

`20261127080100_wp8a2_rest2b_limit_and_config.sql` drops
`public.take_intake_rate_token(text)`, `private.intake_rate_windows` and
`public.checkout_giving_config(text, jsonb)`, and creates the three forms above
it names. `public.take_intake_attempt` is the limit of gift attempts: two
buckets over a rolling ten minutes (the Site with the client address, or the
organization with it for an account-area gift: fewer than 30 unpaid and 250 in
all; for a signed-in gift also the session's user: fewer than 6 unpaid and 15
in all), kept in `private.intake_rate_attempts`, which stores only SHA-256
digests of the bucket and the client key, holds no grant for any API role, and
restricts its organization's deletion. `public.purge_intake_attempts` removes
every row older than the window; the money schedule calls it on each tick.
`public.checkout_giving_config` is told which surface asks and, given a source
Site, answers its primary domain when it is a current Site of the host's
organization (the way back); the allowlist still lists three functions.
`public.donor_portal_login_lifetime` counts a login's donorless line-based
gifts by its own intake contacts, with no capped list
(`20261127080000_wp8a2_rest2b_item_zero.sql`, which also replaces
`tenant_guard.claim_provider_operation`, `tenant_guard.apply_account_event` and
`tenant_guard.begin_line_gift` as their owner with the same security and
grantees).
