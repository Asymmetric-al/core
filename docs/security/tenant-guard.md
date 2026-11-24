# Tenant guard

`withTenant(tenantId, fn)` (`packages/api/src/identity/tenant-guard.ts`) is how no-JWT server code (webhooks, sagas, Inngest jobs, staff tools on the service-role client) runs tenant-scoped database work. Under the guard, RLS keeps each read and write inside the explicit tenant, not application filters. Introduced by #2250 (slice 1 of #505).

## Route: one function call

The guard uses the **function-call** route. It needs no login role, no `pg` connection, no new env var and no new credential.

- No-JWT paths reach Postgres only through PostgREST on the service-role key. PostgREST runs each `.rpc()` call in its own transaction, so one function call is one transaction.
- That call would still bypass RLS, because `service_role` and `postgres` both have BYPASSRLS. So each guarded function is a **SECURITY DEFINER** function owned by the role `tenant_guard`: **NOLOGIN**, **NOBYPASSRLS**, NOSUPERUSER, NOINHERIT, owning no table and holding no credential. Every statement inside the call runs as `tenant_guard`, so RLS applies.
- The guarded function first calls `tenant_guard.enter(p_tenant_id)`, which sets `app.current_tenant_id` with `set_config(…, true)`: transaction-local, so the setting cannot outlive the call or leak to the next caller on a pooled connection.
- The guard policy `tenant_guard_isolation` (`FOR ALL TO tenant_guard`, `USING` and `WITH CHECK` `tenant_id = tenant_guard.current_tenant_id()`) keeps rows inside that tenant. `current_tenant_id()` returns NULL when the setting is unset or `''`, so an unset guard sees 0 rows.

The **atomicity unit is one guarded call**. `fn` receives a guarded client that can only call allow-listed guarded RPCs; it cannot hold one transaction across several calls. A guarded function that raises leaves nothing committed.

## Contract

1. **Read isolation.** After `enter(A)`, an unfiltered read returns only tenant A's rows; with the setting unset it returns 0 rows.
2. **Cross-tenant writes.** Inside `enter(A)`, an INSERT of a tenant B row fails (`42501`), and an UPDATE of B's rows affects 0 rows (DELETE is not granted at all). B's rows stay byte-identical.
3. **Fail closed in TypeScript.** `withTenant` rejects a missing, empty, non-UUID or non-canonical tenant id with `TenantGuardError` before any I/O and before `fn` runs. Uppercase is accepted and compared as a UUID. A name outside the frozen allow-list, a caller-supplied `p_tenant_id` for another tenant, or a result whose `tenant_id` echo is missing or different throws `TenantGuardError`. Errors from `fn` propagate unchanged and nothing is retried.
4. **Fail closed in SQL.** `enter()` raises on a NULL tenant, on a different tenant already set in the same transaction, and when the setting does not read back as the requested tenant. `''` as a tenant raises `22P02` at the call.
5. **Atomicity.** If the guarded call raises, nothing it wrote is committed.
6. **No leak.** After the call commits or rolls back, the next transaction on the same connection sees `app.current_tenant_id` unset (`''`).
7. **Role catalog.** `tenant_guard` has `rolcanlogin`, `rolsuper`, `rolbypassrls`, `rolcreaterole`, `rolcreatedb` and `rolinherit` all false, owns no relation and only the guarded functions, has CREATE on no schema, and is a member of no role. Its only member is `postgres` (INHERIT FALSE, SET TRUE).

Threat model: a bug in one guarded call (a missing `tenant_id` filter, a wrong join, an id from another tenant) cannot read or write another tenant's rows. Non-goals: a **compromised service-role key** is not covered, because `service_role` keeps BYPASSRLS on every unrouted path; neither are paths not yet routed through the guard.

## Q2: `app.current_tenant_id` and the JWT policies

Guard policies read only `app.current_tenant_id`, through `tenant_guard.current_tenant_id()`. Policies for signed-in users read the tenant through `authz.current_tenant_id()`. Until the second release of WP2b it read JWT `app_metadata.tenant_id`; since then (AL-2675, `20261119135300_request_tenant_policies.sql`) it returns the tenant the request's `x-asym-tenant` header names, only when the request's one assignment resolves there, and reads no claim. The two settings stay separate: a guarded call never reads the request header, and a signed-in policy never reads `app.current_tenant_id`. Until #668, the setting is honored only by `TO tenant_guard` policies: inside a guarded call a JWT naming another tenant does not widen the guard, and every table without a guard policy (or a grant) is closed to `tenant_guard`. #668 makes `authz.current_tenant_id()` read the setting and decides whether to merge the guard policies into it. Current-authority use stays qualified until #669, #668 and #667 deliver.

On the Data API a refusal is an empty answer, not an error. A request that names no tenant, or whose `x-asym-tenant` and `x-asym-assignment` headers resolve to no live row of the caller's, gets no row through a policy's tenant-bound branch and no `42501`: `authz.request_assignment()` then returns one record with every field null, so the tenant condition matches nothing. That is not a promise of an empty table. Two things still answer without a resolved assignment: the reviewed exceptions of `docs/security/tenant-policy-exceptions.json` (published public posts and locations, the comments and reactions of a published public post, the caller's own profile, a claimant's own claims), and the `(SELECT authz.is_super_admin())` branch that some policies keep beside the tenant condition until WP2c removes it, so a `super_admin` profile still reads through it. A malformed header, anything but a hyphenated UUID, raises `22P02` only where a policy's lookup runs; where it never runs, because the table is empty or the filter finds no candidate row, the answer is empty too. Nothing is admitted through the tenant-bound branch either way. A caller that reads an empty answer as "no row" therefore cannot tell it from a refusal (activation review, council R13 and R15; both tested).

## Guarded paths

| Path                                                             | Public RPC (service_role)                                                                                                     | Guarded function (owner `tenant_guard`)                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| P1 workflow work claims (`packages/api/src/workflows/claims.ts`) | `public.acquire_workflow_work_claim(uuid, text, text, text, integer)`, `public.release_workflow_work_claim(uuid, uuid, text)` | `tenant_guard.acquire_workflow_work_claim`, `tenant_guard.release_workflow_work_claim` |

Release takes the acquiring tenant; a claim of another tenant reports `released: false` and stays untouched.

## Adding a guarded function

In one forward migration:

1. Create `tenant_guard.<name>(p_tenant_id uuid, …) RETURNS jsonb` as SECURITY DEFINER with `SET search_path = ''`. Its first statement is `PERFORM tenant_guard.enter(p_tenant_id)`. Schema-qualify every relation and guard function (`public.<table>`, `tenant_guard.enter`, `pg_catalog.set_config`, `pg_catalog.current_setting`). Return `tenant_id` from `tenant_guard.current_tenant_id()` in the jsonb (the echo).
2. Grant `tenant_guard` only what that function needs on its tables, at most `SELECT, INSERT, UPDATE` (claims need exactly those). Never DELETE, TRUNCATE, REFERENCES, TRIGGER, column or sequence grants unless the function needs them.
3. Add `CREATE POLICY tenant_guard_isolation ON public.<table> FOR ALL TO tenant_guard USING (tenant_id = tenant_guard.current_tenant_id()) WITH CHECK (tenant_id = tenant_guard.current_tenant_id())`, and make sure RLS is enabled on the table.
4. `REVOKE ALL … FROM PUBLIC, anon, authenticated, service_role`, then `GRANT EXECUTE … TO service_role`. Move ownership with `GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard`, `ALTER FUNCTION … OWNER TO tenant_guard`, `REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard`. On hosted Supabase this relies on the grant `GRANT tenant_guard TO postgres WITH INHERIT FALSE, SET TRUE` from the first guard migration.
5. Expose it as a `public` SECURITY INVOKER wrapper with `SET search_path = ''`, owned by `postgres`, EXECUTE for `service_role` only. Drop any unguarded overload in the same migration.
6. Add the RPC name to the allow-list in `tenant-guard.ts` and call it through `withTenant`.

Grant matrix (EXECUTE besides the owner):

| Function                                   | Owner        | EXECUTE      |
| ------------------------------------------ | ------------ | ------------ |
| `public.acquire_workflow_work_claim`       | postgres     | service_role |
| `public.release_workflow_work_claim`       | postgres     | service_role |
| `tenant_guard.acquire_workflow_work_claim` | tenant_guard | service_role |
| `tenant_guard.release_workflow_work_claim` | tenant_guard | service_role |
| `tenant_guard.enter(uuid)`                 | postgres     | tenant_guard |
| `tenant_guard.current_tenant_id()`         | postgres     | tenant_guard |

The migration also runs `ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_guard REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`. The P1 functions are worker entry points of the command lane below, which lists everything `tenant_guard` holds today.

## Command lane

AL-2674 (plan sections 5.4 and 7.2 of [the CRM, CMS and database plan](../audits/core-crm-cms-database-target-architecture.md)) widens the guard from one worker path to the lane every tenant command runs in. Migrations `20261117034638_command_lane_human_entry_points.sql` and `20261117034650_platform_schema_marker_and_health.sql` build it; later packages add the commands, each with the table privilege and guard policy it needs. Entry points live in two schemas and never mix:

| Kind                    | Schema         | Caller                                   | Owner                   | EXECUTE         |
| ----------------------- | -------------- | ---------------------------------------- | ----------------------- | --------------- |
| Human entry point       | `tenant_guard` | a signed-in person, on their token       | `tenant_guard`, DEFINER | `authenticated` |
| Worker entry point      | `tenant_guard` | the service key (jobs, webhooks, intake) | `tenant_guard`, DEFINER | `service_role`  |
| Platform command        | `platform`     | a platform operator, on their token      | `postgres`, DEFINER     | `authenticated` |
| Wrapper (one per entry) | `public`       | the same caller, through the Data API    | `postgres`, INVOKER     | that caller     |

Signed-in users have USAGE on both schemas, so that a `public` invoker wrapper can reach the function it wraps, and EXECUTE on human entry points and platform commands only. `anon` has no USAGE on either.

### What the guard role holds

`tenant_guard` stays NOLOGIN, NOBYPASSRLS, NOSUPERUSER and NOINHERIT (contract item 7). It holds:

- USAGE on schemas `public`, `tenant_guard` and `authz`, and since WP2c (AL-2675) `private`;
- EXECUTE on `authz.has_membership(uuid, authz.membership_role[])` and `authz.has_staff_membership(uuid, authz.staff_role[])`, and on the `tenant_guard` helpers below. `authz.is_super_admin()` is deliberately not granted: a command never takes a platform-role branch. Both membership helpers are SECURITY DEFINER functions owned by `postgres`, so they read `auth.uid()` as `postgres`, never as the guard. Since WP2a (AL-2675) it also holds EXECUTE on `authz.assignment_capabilities(uuid)`, which `begin_human_command(uuid, text)` calls to check the capability a command requires: an invoker owned by `postgres` that reads only `authz.memberships`, through the policy below, and names nothing in `auth`. Since WP3a (AL-2676) it also holds EXECUTE on `authz.caller_tenant_ids()`, which `begin_human_command(uuid, text)` calls to refuse a tenant that is not active before entering it: a SECURITY DEFINER function owned by `postgres` that returns the caller's tenants with a live membership and an active status; the guard gains no read of `tenants` itself;
- SELECT on `authz.memberships`, through the policy `tenant_guard_own_assignments`, which shows the guard only the session caller's own rows (`user_id = tenant_guard.caller_id()`; a worker call, with no session caller, sees none);
- `SELECT, INSERT, UPDATE` on `public.workflow_work_claims`, through `tenant_guard_isolation`;
- since WP2c (AL-2675), for the role-change and revoke commands: `INSERT` on `authz.memberships` (`user_id`, `tenant_id`, `role`, `staff_role`, `is_tenant_admin`, `is_active`, `granted_by`) and `UPDATE` of its lifecycle columns only (`is_active`, `revoked_at`, `is_tenant_admin`, `granted_by`, `updated_at`), so no guard command can move a row to another person, tenant, class or sub-role, through a `tenant_guard_isolation` policy (`FOR ALL`) keyed on the guard's tenant; `INSERT` on `public.audit_logs` through a `tenant_guard_isolation` policy `FOR INSERT` keyed the same way; and EXECUTE on `private.is_platform_operator(uuid)`, a `postgres`-owned definer that answers for one login without exposing the operator list;
- since WP4a's second part (AL-2677), for the note command: `SELECT` on `public.crm_notes` and `INSERT` of its columns `tenant_id`, `title`, `body`, `visibility`, `linked_record_id`, `linked_record_type`, `linked_record_label`, `author_profile_id` and `idempotency_key` (no ID, author name or time from a caller); `SELECT` of `id`, `tenant_id`, `action`, `resource_id` and `idempotency_key` on `public.crm_command_logs` and `INSERT` of `tenant_id`, `actor_user_id`, `actor_profile_id`, `request_id`, `action`, `resource_type`, `resource_id`, `idempotency_key` and `status`, never `command_payload`, `result_summary` or `error_message`; each table behind a `tenant_guard_isolation` policy (`FOR ALL`) keyed on the guard's tenant. And EXECUTE on `private.caller_profile_id()`, a `postgres`-owned definer with an empty search path and no argument that returns the session caller's own profile ID and nothing else: the profile whose `user_id` is the caller, or else a profile with no `user_id` whose `id` is the caller, never a profile linked to another user (NULL with no session caller). It is stricter than `authz.caller_profile_ids()`, which also answers with a profile whose `id` is the caller while it is linked to someone else. The guard holds no privilege on `public.profiles`, on the table or on any column, and the `issue-2250` suite asserts that for `tenants`, `profiles` and `donation_saga_outbox` with `has_any_column_privilege`;
- since WP4b part 1 (AL-2677), for the six Member Care commands: `SELECT (id, tenant_id)` and `UPDATE (manual_attention)` on `public.missionaries`; `SELECT, INSERT` on `public.member_care_activities` and `public.member_care_private_notes`; `SELECT, INSERT, UPDATE` on `public.member_care_goals` and `public.member_care_requirements`; each table behind a `tenant_guard_isolation` policy (`FOR ALL`) keyed on `(SELECT tenant_guard.current_tenant_id())`. And EXECUTE on `authz.request_tenant_id()`, `private.share_lock_tenant(uuid)` (returns `tenants.status` under `FOR SHARE`), and `private.profile_display_name(uuid)` (resolves a single display name for the user id it is given without granting `SELECT` on `public.profiles`; only `tenant_guard` may execute it). Care commands write zero rows to `audit_logs` and `crm_command_logs`.

It holds nothing on `auth`. On Supabase's own Postgres image `auth` belongs to `supabase_auth_admin`, and `postgres`, which runs the migrations and is not a superuser there, holds USAGE on it and EXECUTE on `auth.uid()` and `auth.jwt()` without the grant option: a `GRANT` of them to the guard only warns ("no privileges were granted") and grants nothing. That settled plan 15.2's row "Definer functions owned by a non-bypass role on hosted Supabase" with the fallback the plan names: a command reads the caller from the request's claims settings. `tenant_guard.caller_id()` reads them with the precedence and the result of the installed `auth.uid()` (the single-claim setting `request.jwt.claim.sub` first, then `sub` of the JSON setting `request.jwt.claims`, which is the one PostgREST sets; an empty or absent setting is NULL, a value that is not a UUID raises), and `tenant_guard.request_claims()` returns the claims as the installed `auth.jwt()` does, for a command that reads the assurance level or another claim. The platform operator check uses the same two helpers. Nothing in `tenant_guard` or `platform` may name `auth` (gate code `COMMAND_READS_AUTH`), and the policy above calls the guard's helper, not `auth.uid()`. The command-lane migration ends with a post-assert that raises unless the guard holds each `authz` privilege above, because a refused grant only warns and the migration would otherwise commit.

### Function inventory and grant matrix

EXECUTE besides the owner, on the migrated chain:

| Function                                                                                                                                                 | Owner          | Security | EXECUTE                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------- | ----------------------------------------------- |
| `tenant_guard.enter(uuid)`                                                                                                                               | `postgres`     | INVOKER  | `tenant_guard`                                  |
| `tenant_guard.current_tenant_id()`                                                                                                                       | `postgres`     | INVOKER  | `tenant_guard`                                  |
| `tenant_guard.caller_id()`                                                                                                                               | `postgres`     | INVOKER  | `tenant_guard`                                  |
| `tenant_guard.request_claims()`                                                                                                                          | `postgres`     | INVOKER  | `tenant_guard`                                  |
| `tenant_guard.request_assignment_id()`                                                                                                                   | `postgres`     | INVOKER  | `tenant_guard`                                  |
| `tenant_guard.begin_human_command(uuid, text)`                                                                                                           | `postgres`     | INVOKER  | `tenant_guard`                                  |
| `authz.caller_tenant_ids()`                                                                                                                              | `postgres`     | DEFINER  | `authenticated`, `service_role`, `tenant_guard` |
| `authz.request_tenant_id()`                                                                                                                              | `postgres`     | INVOKER  | `authenticated`, `service_role`, `tenant_guard` |
| `tenant_guard.resolve_command_assignment(uuid)`                                                                                                          | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.change_membership_role(uuid, uuid, text, text, boolean, text)`                                                                             | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.revoke_membership(uuid, uuid, text)`                                                                                                       | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.create_crm_note(uuid, uuid, text, text, text, text, text, text, uuid)`                                                                     | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.create_care_thread_post(uuid, uuid, text)`                                                                                                 | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.create_care_private_note(uuid, uuid, text)`                                                                                                | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.upsert_care_goal(uuid, uuid, text, text, date, uuid)`                                                                                      | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.log_care_activity(uuid, uuid, text, text)`                                                                                                 | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.upsert_care_requirement(uuid, uuid, text, integer, text, uuid)`                                                                            | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.set_manual_attention_flag(uuid, uuid, boolean)`                                                                                            | `tenant_guard` | DEFINER  | `authenticated`                                 |
| `tenant_guard.acquire_workflow_work_claim(...)`                                                                                                          | `tenant_guard` | DEFINER  | `service_role`                                  |
| `tenant_guard.release_workflow_work_claim(...)`                                                                                                          | `tenant_guard` | DEFINER  | `service_role`                                  |
| `public.resolve_command_assignment(uuid)`                                                                                                                | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.change_membership_role(uuid, uuid, text, text, boolean, text)`                                                                                   | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.revoke_membership(uuid, uuid, text)`                                                                                                             | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.create_crm_note(uuid, uuid, text, text, text, text, text, text, uuid)`                                                                           | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.create_care_thread_post(uuid, text)`                                                                                                             | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.create_care_private_note(uuid, text)`                                                                                                            | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.upsert_care_goal(uuid, text, text, date, uuid)`                                                                                                  | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.log_care_activity(uuid, text, text)`                                                                                                             | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.upsert_care_requirement(uuid, text, integer, text, uuid)`                                                                                        | `postgres`     | INVOKER  | `authenticated`                                 |
| `public.set_manual_attention_flag(uuid, boolean)`                                                                                                        | `postgres`     | INVOKER  | `authenticated`                                 |
| `private.is_platform_operator(uuid)`                                                                                                                     | `postgres`     | DEFINER  | `tenant_guard`                                  |
| `private.caller_profile_id()`                                                                                                                            | `postgres`     | DEFINER  | `tenant_guard`                                  |
| `private.share_lock_tenant(uuid)`                                                                                                                        | `postgres`     | DEFINER  | `tenant_guard`                                  |
| `private.profile_display_name(uuid)`                                                                                                                     | `postgres`     | DEFINER  | `tenant_guard`                                  |
| `public.acquire_workflow_work_claim(...)`                                                                                                                | `postgres`     | INVOKER  | `service_role`                                  |
| `public.release_workflow_work_claim(...)`                                                                                                                | `postgres`     | INVOKER  | `service_role`                                  |
| `platform.health()`                                                                                                                                      | `postgres`     | DEFINER  | `service_role`                                  |
| `public.platform_health()`                                                                                                                               | `postgres`     | INVOKER  | `service_role`                                  |
| `platform.require_operator()`                                                                                                                            | `postgres`     | INVOKER  | none                                            |
| `platform.caller_on_operator_list()`                                                                                                                     | `postgres`     | INVOKER  | none                                            |
| `platform.operator_session()`                                                                                                                            | `postgres`     | DEFINER  | `authenticated`                                 |
| `public.platform_operator_session()`                                                                                                                     | `postgres`     | INVOKER  | `authenticated`                                 |
| `platform.environment_kind()`, `advance_environment(text)`, `record_migration_head(text, text)`, `holds_people_or_gifts()`, `guard_environment_marker()` | `postgres`     | INVOKER  | none                                            |

`resolve_command_assignment` exists so that one human command can be proved on a signed-in token; no application code calls it, and WP2b decides whether the organization chooser uses it or it is dropped. WP2c (AL-2675) adds the first human commands that write: `change_membership_role` and `revoke_membership` (plan 5.4, "Invite, change role, revoke"), which require `people.manage_members`, write the membership and one `audit_logs` row and never `profiles.role`. `change_membership_role` changes a staff row and nothing else: its sub-role, its tenant-administrator flag, or both. It never changes a row's class, either way, because a person may hold rows of several classes in one tenant (plan 5.1): a row of another class is given by invitation (WP3's command), and a class is left with `revoke_membership`. A request that changes nothing writes nothing and returns `changed: false`. The refusals, in the order they are judged, each `42501` unless named and each changing nothing:

1. a caller without `people.manage_members` in the tenant, or with no live assignment there (the preamble);
2. no reason, or one of whitespace only (`22023`); the reason is stored trimmed;
3. a class, sub-role or flag outside the tenant's vocabulary: donor, missionary, or staff with one of the five sub-roles, and the flag only on a staff row. There is no platform role to grant;
4. a target that is not a live row of this tenant: not found (`P0002`);
5. a row of the caller's own;
6. for a change of role, a target that is not a staff row, or a request for another class, even one that would change nothing: the message says to give a row of another class by invitation and to end one with `revoke_membership`;
7. a login on the platform operator list (both commands): "This person's role cannot be changed here". A role-change request that changes nothing returns first; a membership elsewhere does not bar a change here;
8. for a change of role, a sub-role the person already holds in another live staff row (`23505`): that row is changed or revoked itself;
9. removing the tenant's last administrator.

They replace GraphQL `updateUserRole` and `public.atomic_update_user_role_with_audit`, which WP2c deletes.

WP4a's second part (AL-2677) adds `create_crm_note`, the one CRM write, which Mission Control's `POST /api/admin/crm/notes` calls on the caller's token. It requires `admin.crm.manage` and writes the note and one `crm_command_logs` row in the call's one transaction, both or neither. The note's author and the log row's actor are the session caller and the caller's own profile, from `private.caller_profile_id()`; no argument names either. The log row holds actor, action, references and outcome only: no title, body, visibility or linked record. It is idempotent on the submission key the client sends once for each note (`Idempotency-Key`): the same submission by the same author returns the stored note and log ID with `duplicate: true`. A request that sends no `Idempotency-Key` gets a key the server mints for it, so a retry of that request is not idempotent: this is kept for this release only, for browser tabs still on the previous build, and refusing a request without the header is owed to a later release. The refusals, each changing nothing:

1. the preamble's (`42501`): no signed-in caller, no live selected assignment of the caller in the tenant, no `admin.crm.manage`, a tenant that is not active. Right after it the command locks that assignment `FOR SHARE` and checks it again under the lock (found, the caller's, in this tenant, live, still holding `admin.crm.manage`), refusing with `42501` on anything not true, so a demotion or revocation either commits first and is seen, or waits until the command ends;
2. a restricted note without the selected assignment's tenant-administrator flag, read from the locked row (`42501`), the rule the signed-in insert policy on `crm_notes` applies too; a retry returns a stored restricted note only to a caller who holds the flag under the lock;
3. a caller with no profile (`42501`);
4. a missing key, a blank title or body, a title over 160 or a body over 10,000 characters, an unknown visibility or linked record type, or a linked record ID or label over 160 characters (`22023`);
5. a key already used for another note, another author's note or a note with no log row (`23505`).

The one platform command so far is `platform.operator_session()` (WP2c, AL-2675), whose whole body is the shared operator check: server code that acts for an operator outside the database runs the check through it on the operator's own token. WP3 ships the first platform command that changes anything.

### Adding a human entry point

In one forward migration:

1. Create `tenant_guard.<command>(p_tenant_id uuid, ...) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''`. Its first executable statement is `v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');` (or `PERFORM ...`), substituting the command's literal capability from `packages/auth/capabilities/registry.ts`. No declaration initializer may run first, and no outer `EXCEPTION` may intercept refusal. The catalog applies this even when the write is indirect. The standalone gate reads the sorted keys in `scripts/verify/command-capabilities.json`; its unit test requires exact equality with the registry.
2. The preamble reads the caller from the session and the assignment from the request's `x-asym-assignment` header. It refuses with `42501` unless the named row is the caller's live row in that tenant, or, when no row is named, the caller holds exactly one live row there. Only then does it enter the tenant for the transaction. It returns `tenant_guard.command_context` (`actor_id`, `tenant_id`, `assignment_id`, `role`, `staff_role`). The preamble checks the capability, `revoked_at` and active tenant status, so a command relies on the preamble for those and repeats none of them.

   The read side parses the two request headers by the same rule as `tenant_guard.request_assignment_id()`: absent or blank is no value, a hyphenated UUID in any letter case is compared as a `uuid`, anything else raises `22P02` (`authz.request_tenant_id()`, `authz.request_assignment_id()`; activation review Q11).

   A human command called with no `x-asym-assignment` header refuses a person who holds more than one live row in the tenant, whatever the classes: the preamble counts every live row there, while the application's resolver counts only the rows of the surface's class. The seeded demo owner, with a staff, a donor and a missionary row in the demo tenant, is such a person. The request names its row with `x-asym-assignment`, which every page request does from WP2b's first release. (PR #2720 review; pinned in `tests/unit/acceptance/issue-2675/membership-core.realstack.acceptance.test.ts`.)

3. The command writes only in the tenant it passed to the preamble, and takes its actor and assignment from the context the preamble returns, never from another argument. It never calls `tenant_guard.enter` itself (which refuses a second tenant in one transaction anyway).
4. Grant `tenant_guard` the least table privilege the command needs, with a `tenant_guard_isolation` policy on each table it touches ("Adding a guarded function", steps 2 and 3).
5. `REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated, service_role`, then `GRANT EXECUTE ... TO authenticated`. Change the owner in three steps: `GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard`, `ALTER FUNCTION ... OWNER TO tenant_guard`, `REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard`.
6. Add its `public` wrapper (below), with EXECUTE for `authenticated` only.

### Worker entry points

A command's internal helper is owned by `postgres`, is `SECURITY INVOKER` and grants EXECUTE only to `tenant_guard` (apart from the owner). It runs as the guard under the guard's policies. Two narrow `postgres`-owned `SECURITY DEFINER` helpers in `private` are documented exceptions for Member Care commands (AL-2677 WP4b part 1; W4b-R12, W4b-R15), each granting EXECUTE to `tenant_guard` only so `tenant_guard` never receives table `SELECT` on `public.tenants` or `public.profiles`: `private.share_lock_tenant(uuid)` (takes `FOR SHARE` on one tenant row and returns its status) and `private.profile_display_name(uuid)` (resolves an actor display-name snapshot with fallback to `user_id::text`). `tenant_guard` also holds `EXECUTE` on `authz.request_tenant_id()` so each care command requires a valid, non-null request tenant matching `v_ctx.tenant_id`. The six care commands (`create_care_thread_post`, `create_care_private_note`, `upsert_care_goal`, `log_care_activity`, `upsert_care_requirement`, `set_manual_attention_flag`) require `care.access` and intentionally write zero rows to `public.audit_logs` or `public.crm_command_logs` (W4b-R2). Any service-callable function in `tenant_guard` must instead be a guard-owned definer that opens with `PERFORM tenant_guard.enter(p_tenant_id);`. A wrapper that calls any human entry point grants nothing to `service_role`, even when it also calls a worker. The catalog gate's unit test independently pins both the pre-membership exceptions and their reviewed ceiling.

The migrated read-only `resolve_command_assignment(uuid)` is the sole one-argument human entry: its exact catalog signature and trimmed body digest are pinned in `scripts/verify/command-entry-boundaries.mjs`. For a command whose caller cannot yet hold a membership, use the separate `preMembershipEntries` list there (currently empty). Add its exact catalog signature and specific reason only with review of the alternate admission mechanism and a real-stack denial test. Pin both reason and SHA-256 of trimmed `pg_proc.prosrc` in the reviewed ceiling. Entries may shrink; an unreviewed addition, absent target, body or reason change, or duplicate fails. An exception waives only the preamble, never ownership, definer or grant checks. No invitation command is admitted here.

A worker entry point is executable by `service_role` only; signed-in and anonymous users cannot call it. It derives its tenant from a stored anchor (plan 5.4): a `public` invoker wrapper that only the service key may call finds the tenant from the anchor it is given (the provider event's account, the gift, the publish intent, the import batch, or the Site or donor-portal host record for intake), takes no tenant from its caller and writes nothing; the guard function enters that tenant, reads the anchor again under the guard's policy and refuses if the two disagree. Owner change and revokes as for a human entry point, with `GRANT EXECUTE ... TO service_role`. The workflow claim pair (P1) is a worker entry point by its grants but predates this rule: it enters the `p_tenant_id` its caller passes.

### Platform commands

Commands that cross tenants or act before a tenant exists (provisioning, tenant status, support grants, an administrator invitation for a tenant that has none, a domain's attachment steps, the tenant export) live in `platform`:

```sql
CREATE FUNCTION platform.<command>(...) RETURNS jsonb
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
  DECLARE
    v_operator uuid := platform.require_operator();
  BEGIN
    ...
  END $$;
```

The operator check initialises a variable in the function's outer `DECLARE` section, where no handler of the function can catch its refusal. It refuses with `42501` a call with no signed-in caller, a caller not on the operator list, or a session without a second factor (`aal2`). The list is `authz.platform_operators` (WP2c, AL-2675): row security forced, no policy and no privilege for signed-in, anonymous or service users, and one writer, the operator script (`docs/ops/platform-operators.md`). `platform.caller_on_operator_list()` reads it for the session caller through `private.is_platform_operator(uuid)`, the one test of the list, a `postgres`-owned definer that only `tenant_guard` may also execute. The admin proxy learns whether a person is on the list, without the second factor and without a refusal, from `public.caller_is_platform_operator()`, a `postgres`-owned definer in `public` for `authenticated`: it cannot live in `platform`, where every function signed-in users may execute must begin with the operator check (`PLATFORM_COMMAND_NO_OPERATOR_CHECK`), nor call into `platform`, which would make it a wrapper of a function that is not a command (`WRAPPER_GRANTS_WORKER`). Each command is owned by `postgres`, revokes `ALL` from `PUBLIC`, `anon`, `authenticated` and `service_role`, grants EXECUTE to `authenticated`, and has a `public` wrapper with EXECUTE for `authenticated` only.

### `public` wrappers

The Data API exposes only `public`, so every entry point and platform command is reached through a wrapper there. A function outside `tenant_guard` and `platform` that calls into either schema is a wrapper, and it:

- is SECURITY INVOKER, owned by `postgres`. A definer wrapper would run the call with its owner's rights and hand the entry point to whoever may call the wrapper;
- has `SET search_path = ''` (the gate accepts any set path that does not name `"$user"`);
- gives no EXECUTE to `PUBLIC` or `anon`;
- gives EXECUTE to `authenticated` only when every function it calls is a human entry point or a platform command, and otherwise to `service_role` only.

### Tests a package still touches

A package that adds a human entry point, a worker entry point or a platform command by the steps above, with the table privilege and guard policy each needs, edits no existing test. The real-stack suites derive the command inventory from the catalog: `issue-2250` asserts each function in `tenant_guard`, and each `public` wrapper into it, by its lane (owner, definer or invoker, search path, exact grantees for that lane) and each of the guard's table privileges by the policy that admits it; the `issue-2674` command-lane suite requires what signed-in users may execute in `tenant_guard` and `platform` to equal what follows each lane's convention, and calls every other function there as a signed-in user; its catalog-gate suite compares the gate's counts with the catalog. A package still edits:

- criterion 17 of `tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts` ("everything else granted to tenant_guard") when it widens what the guard role may use or execute outside its own functions and its tables: USAGE on another schema, EXECUTE on another helper (an `authz` function, say), or a new signature for a `tenant_guard` helper. That list is the guard's reach outside its tables and stays exact on purpose;
- the same file's rows for #2250's own four functions, or proof 1 of the command-lane suite, when it changes the workflow claim pair or `tenant_guard.resolve_command_assignment` (WP2b may drop the latter, and then drops proof 1 with it);
- the inventory table above, which records WP1's functions.

## Paths that must use the guard later

| #   | Path                                              | Why later                                                               |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| P2  | Donation saga outbox worker                       | `donation_saga_outbox` has ENABLE + FORCE but no guard policy yet       |
| P3  | Donation saga recovery (Inngest)                  | as P2; its claims already go through P1                                 |
| P4  | Stripe webhook intake                             | tenant comes from an untrusted payload; needs the Phase-3 resolver      |
| P5  | Stripe event processing (Inngest)                 | with P4                                                                 |
| P6  | Stripe recurring pledges                          | later                                                                   |
| P7  | Stripe and contribution replay                    | later                                                                   |
| P8  | Inbound email processing (Inngest)                | later                                                                   |
| P9  | Resend webhook                                    | needs a resolver                                                        |
| P10 | Eve notification sweep                            | later                                                                   |
| P11 | Eve engineering monitor sweep                     | later                                                                   |
| P12 | Eve specialist sessions, shared context and audit | later                                                                   |
| P13 | Eve launch canary watchdog                        | the scan stays; per-row writes get guarded                              |
| P14 | Demo-user cleanup                                 | GoTrue deletes cannot run inside a guarded RPC; needs another mechanism |

Not built yet, and must use the guard when they are: guest attribution and unclaimed find-or-create (#508), the Phase-3 resolver, merge (#512) and Inngest dedupe (#513). Recovery scans stay cross-tenant by design; their per-tenant work goes through guarded paths.

## CI step

`Verify tenant isolation (real stack)` is a step of the `migrate` job in `.github/workflows/ci-integration.yml`, followed by #2270's `Verify authz EXECUTE grants (real stack)` and then #2251's `Verify tenant table RLS posture (real stack)`. It sets `TENANT_GUARD_IT_ADMIN_DATABASE_URL` from `DATABASE_URL` (the job's disposable, migrated PG17 database) and runs `bun x vitest run tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts tests/unit/acceptance/issue-2269/donations-embed.realstack.acceptance.test.ts tests/unit/acceptance/issue-2256/person-anchor.realstack.acceptance.test.ts`: #2250's own real-stack file plus #2269's donations-embed and #2256's person-anchor real-stack files, which read the same `TENANT_GUARD_IT_ADMIN_DATABASE_URL` (explicit paths, not a substring filter). With no URL, it fails only when `GITHUB_JOB` is `migrate` and skips everywhere else, including the `test-unit` and `acceptance-tests` jobs in `ci.yml` and local runs. GitHub sets `GITHUB_JOB` to the job id, so the step needs no other env. When the URL is set, the suite runs in any job. The filter cannot pass vacuously: Vitest exits 1 when no file matches. A failure fails the required `migrate` check. Other slices run their own real-stack files in their own steps.

## Deploy note

CI's `postgres` is a superuser, so it cannot prove the hosted ownership transfer. Before production, apply the migration to a preview database. If `GRANT tenant_guard TO postgres WITH INHERIT FALSE, SET TRUE` or `ALTER FUNCTION … OWNER TO tenant_guard` fails there, the migration aborts as a whole and a login-role fallback gets its own spec. On hosted Postgres a non-superuser `CREATE ROLE` also auto-grants the creator an ADMIN membership row, so `pg_auth_members` can show an extra `postgres` row for `tenant_guard`.

## Tenant table RLS posture

Introduced by #2251 (slice 2 of #505) in `supabase/migrations/20261025070000_force_rls_tenant_tables.sql`.

### Rule

Every `public` tenant table (a `public` base table, `relkind` `r` or `p`, with a live `tenant_id` column) has row level security **enabled and forced**, and either:

- at least one policy, or
- a reviewed entry in `docs/security/rls-deny-by-default-exceptions.json`, and then **zero** policies.

A listed table is deny-by-default for every role without BYPASSRLS, including `tenant_guard`. No placeholder or permissive policy is added to satisfy the rule (Samson's Q5 + clash 2 ruling, Oct 24, 2026). A listed table that gains a policy leaves the list.

Each entry has `table`, `outcome`, `reason`, `code_paths` and `reviewed_by`:

- `service_role_needed`: the app reaches the table directly, and every direct site uses the service-role client (BYPASSRLS). `code_paths` lists every non-test file under `apps/` and `packages/` that queries the table, each as `path:line` of its first query. A new query site in another file adds its path.
- `deny_by_default`: no direct app access. `code_paths` names the postgres-owned SECURITY DEFINER function, the operator script or SQL function (`path:line`) that reaches it, or `"none"` for a dormant table.

### What FORCE changes

`ENABLE` applies policies to everyone except the table owner. `FORCE` applies them to the owner too. Superusers and BYPASSRLS roles skip RLS even under FORCE, and referential-integrity checks always bypass it. Today every tenant table and every app SECURITY DEFINER function is owned by `postgres`: a superuser in CI, NOSUPERUSER but BYPASSRLS on hosted Supabase. So FORCE changes no rows for `anon`, `authenticated`, `service_role`, `document_cutover_reader` or the postgres-owned definer functions. It binds an owner that loses BYPASSRLS, or a future owning role.

### Owner invariant

Never give a tenant table, or a SECURITY DEFINER function in `public`, `authz`, `document_cutover` or `private`, an owner without BYPASSRLS or superuser. Under FORCE that owner is bound by RLS, and these paths break (all work today because the owner bypasses):

- **B1** `public.handle_new_user()` (trigger `on_auth_user_created`) can no longer insert into `public.profiles`: every sign-up fails, and so do `supabase/seed.sql` and the seed-dependent CI steps.
- **B2** `document_cutover.table_census` and its siblings run with `row_security = off` and raise "query would be affected by row-level security policy" on the PDF and receipt tables.
- **B3** the unguarded workflow claim path could not insert into `public.workflow_work_claims`. #2250 already routes it through `tenant_guard`.
- **B4** every other postgres-owned definer function or trigger that touches a forced table, such as the Eve notification RPCs, `save_crm_tenant_table_default` (its body is `private.save_crm_tenant_table_default` since #2402), `enforce_contribution_notification_tenant_refs` and `private.seed_support_hub_defaults`.

The migration checks this first: if any tenant table or app definer function has an owner with neither `rolsuper` nor `rolbypassrls`, it raises, names each one and applies nothing. Work that should run under RLS goes through a `tenant_guard`-owned SECURITY DEFINER function in schema `tenant_guard` (see "Adding a guarded function" above). Those are the only sanctioned RLS-bound definer owners, and they own no table.

### Adding a tenant table

In the migration that creates the table:

1. `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY` and `ALTER TABLE public.<table> FORCE ROW LEVEL SECURITY`.
2. Prefer a real policy for the callers that need the table (JWT staff policies, or `tenant_guard_isolation` for a guarded path).
3. If no caller needs a policy, add one line to `docs/security/rls-deny-by-default-exceptions.json`, sorted by `table`, with a `reason` and its `code_paths`. Samson reviews the entry in the PR and only then is `reviewed_by` set. Never pre-fill a reviewer.

`tests/unit/scripts/rls-deny-by-default-exceptions.test.ts` checks the list without a database. The `migrate` job step `Verify tenant table RLS posture (real stack)` runs `tests/unit/acceptance/issue-2251/rls-posture.realstack.acceptance.test.ts` against the migrated database, with `TENANT_GUARD_IT_ADMIN_DATABASE_URL` set from `DATABASE_URL`. It checks the catalog against the list both ways, proves a NOBYPASSRLS owner is bound, compares rows with FORCE off, checks the owner invariant and fail-closed precondition, and re-runs the migration. The permanent catalog gate is #2253.

### Deploy and rollback

Apply to a preview database first. Before each apply, run `select rolname, rolsuper, rolbypassrls from pg_roles where rolname = 'postgres'`. Each `ALTER TABLE` takes an ACCESS EXCLUSIVE lock until commit, so apply in a quiet window. The migration sets `lock_timeout` to 5s for its ALTERs: if a long-running query holds a tenant table, it fails with `55P03` (lock not available), applies nothing and does not queue other queries behind it. Re-run it once that query has finished. Rollback is the file's `-- Down:` SQL, run by hand: `NO FORCE` on every target except `crm_notes`, and `DISABLE` on exactly `donation_saga_outbox`, `email_templates` and `email_template_versions`. It touches no data and no policy.

## Composite tenant FKs

The donor spine cannot reference across tenants. Introduced by #2252 (slice 3 of #505), migration `20261025100000_donations_composite_donor_fk.sql`. Each spine FK is `(tenant_id, <col>) → donors(tenant_id, id)` on the existing `donors_tenant_id_id_uidx`, validated, so the database refuses a donor from another tenant for every writer, `service_role` and BYPASSRLS owners included: FK checks ignore RLS and roles. Reads stay RLS's job.

The seven spine FKs:

| Table                    | FK                                                     | Column               | Tenant-complete by                |
| ------------------------ | ------------------------------------------------------ | -------------------- | --------------------------------- |
| `donations`              | `donations_donor_same_tenant_fk`                       | `donor_id`           | `donations_donor_requires_tenant` |
| `donor_merge_candidates` | `donor_merge_candidates_existing_donor_same_tenant_fk` | `existing_donor_id`  | `tenant_id NOT NULL`              |
| `donor_merge_candidates` | `donor_merge_candidates_incoming_donor_same_tenant_fk` | `incoming_donor_id`  | `tenant_id NOT NULL`              |
| `donor_merge_redirects`  | `donor_merge_redirects_merged_donor_same_tenant_fk`    | `merged_donor_id`    | `tenant_id NOT NULL`              |
| `donor_merge_redirects`  | `donor_merge_redirects_surviving_donor_same_tenant_fk` | `surviving_donor_id` | `tenant_id NOT NULL`              |
| `donor_merge_audit`      | `donor_merge_audit_surviving_donor_same_tenant_fk`     | `surviving_donor_id` | `tenant_id NOT NULL`              |
| `donor_merge_audit`      | `donor_merge_audit_merged_donor_same_tenant_fk`        | `merged_donor_id`    | `tenant_id NOT NULL`              |

The six `donor_merge_*` FKs come from `20260704140000_donor_matching_merge_candidates.sql` and are asserted, not changed. The migration replaces the single-column `donations_donor_id_fkey` and adds, validates and drops in one transaction, so no committed state has two `donations → donors` FKs (PostgREST would reject the unhinted `donors` embed as ambiguous, PGRST201).

**Rule for new donor references.** A new reference to `donors` must be `(tenant_id, <col>) → donors(tenant_id, id)`, with `tenant_id NOT NULL` on the referencing table or a validated `CHECK (<col> IS NULL OR tenant_id IS NOT NULL)`. A composite FK alone is not enough: under MATCH SIMPLE it is not checked when `tenant_id` is NULL, so a NULL-tenant row could name any donor. `donations.tenant_id` is nullable, which is why `donations_donor_requires_tenant` exists; it also means a donation that names a donor must carry a tenant (`23514`), and a donor that has donations cannot move to another tenant (`23503`).

The real-stack test `tests/unit/acceptance/issue-2252/donor-spine-fk.realstack.acceptance.test.ts` (the `migrate` step `Verify donor spine composite FKs (real stack)`) enforces this. It fails if any spine FK is missing, `NOT VALID`, not composite on `tenant_id` or not tenant-complete, and it ratchets every FK into `donors`: each must be a spine FK, composite on `(tenant_id, x) → (tenant_id, id)`, or on the follow-up list below.

**Follow-ups (shrink-only).** These 14 single-column FKs into `donors(id)` existed before this rule and are not changed yet. Remove an entry when its FK becomes composite; never add one.

- `campaigns_creator_donor_id_fkey`
- `contribution_notification_events_recipient_donor_id_fkey`
- `contribution_operation_audit_events_donor_id_fkey`
- `donation_saga_outbox_donor_id_fkey`
- `donor_activities_donor_id_fkey`
- `donor_feed_preferences_donor_id_fkey`
- `donor_pledges_donor_id_fkey`
- `follower_requests_donor_id_fkey`
- `follows_donor_id_fkey`
- `missionary_tasks_donor_id_fkey`
- `notification_queue_donor_id_fkey`
- `notification_queue_recipient_donor_id_fkey`
- `pledge_charge_attempts_donor_id_fkey`
- `staged_gifts_donor_id_fkey`

**Preflight.** Existing bad rows are surfaced, never rewritten. Before applying, the migration counts donations that name a donor in another tenant, or name a donor with a NULL `tenant_id`, and aborts with `23503` and counts only (no ids); `VALIDATE` stays as a second guard. This read-only operator query lists the rows (it returns tenant, donor and donation ids, so share counts only outside the database console):

```sql
SELECT d.id AS donation_id, d.tenant_id AS donation_tenant_id, d.donor_id,
       dn.tenant_id AS donor_tenant_id,
       CASE WHEN d.tenant_id IS NULL THEN 'null_tenant' ELSE 'cross_tenant' END AS problem
FROM public.donations d
JOIN public.donors dn ON dn.id = d.donor_id
WHERE d.tenant_id IS NULL OR dn.tenant_id IS DISTINCT FROM d.tenant_id
ORDER BY d.id;
```

**Deploy step.** Run the query on a preview database, then on production, and stop if it returns any rows; fixing data is a separate issue. Apply in version order, in a quiet window long enough to cover both full `VALIDATE` scans of `donations`. The migration is one transaction, and each lock below (traced on PostgreSQL 17) is held until `COMMIT`:

| Statement                                       | `donations`              | `donors`              |
| ----------------------------------------------- | ------------------------ | --------------------- |
| `ADD … CHECK … NOT VALID`                       | `ACCESS EXCLUSIVE`       | none                  |
| `ADD … FOREIGN KEY … NOT VALID`                 | `SHARE ROW EXCLUSIVE`    | `SHARE ROW EXCLUSIVE` |
| `VALIDATE` (the CHECK, then the FK)             | `SHARE UPDATE EXCLUSIVE` | `ROW SHARE` (FK only) |
| final `DROP CONSTRAINT donations_donor_id_fkey` | `ACCESS EXCLUSIVE`       | `ACCESS EXCLUSIVE`    |

So reads and writes on `donations` block from the `CHECK` add, through both `VALIDATE` scans, until `COMMIT`. Writes on `donors` block from the FK add, and reads on `donors` block after the final drop. `lock_timeout = '5s'` bounds only the wait to acquire each lock, so a busy table makes the migration fail fast instead of queueing; it does not bound the scans once the locks are held. Apply the whole file, and don't reload the PostgREST schema cache mid-apply. The rollback, `rollback_20261025100000_donations_composite_donor_fk.sql`, re-adds and validates `donations_donor_id_fkey` before dropping the composite FK and the CHECK, in one transaction; it needs a quiet window too.

## CI gates

Two permanent, blocking checks from #2253 (slice 4 of #505) keep the tenant posture from regressing. #516's tier job reuses both rather than re-implementing them.

### Tenant RLS catalog gate

`scripts/verify/tenant-rls-catalog.mjs` exports the catalog query (`TENANT_RLS_CATALOG_SQL`, marked `-- tenant-rls-catalog-gate:v1`), the pure evaluator `evaluateTenantRlsCatalog` and the runner `runTenantRlsCatalogGate`. `scripts/verify/supabase-migrations.mjs` runs it right after the field-policy census and before its `Verified N forward Supabase migrations` line, so the `Apply migrations` step of `migrate`, `test-e2e-smoke` and `test-e2e` all run it. On a pass it prints one counts line; on a failure it prints each violation as `CODE table: detail` and exits non-zero without the success line.

It fails with a stable code when:

- a tenant table has RLS off (`RLS_DISABLED`) or not forced (`FORCE_MISSING`);
- a tenant table has no policy and is not in `docs/security/rls-deny-by-default-exceptions.json` (`NO_POLICY_UNLISTED`);
- a listed table has gained a policy, no longer exists, or no longer has `tenant_id` (`STALE_HAS_POLICY`, `STALE_MISSING_TABLE`, `STALE_NOT_TENANT`);
- the list is missing, is not JSON, repeats a table or has an entry without `table` (`EXCEPTIONS_MALFORMED`);
- a tenant table's owner, or the owner of a SECURITY DEFINER function in `public`, `authz`, `document_cutover`, `private`, `tenant_guard` or `platform`, has neither `rolsuper` nor `rolbypassrls` (`OWNER_NO_BYPASS`, `DEFINER_OWNER_NO_BYPASS`). Functions `tenant_guard` owns in the `tenant_guard` schema are exempt, and nowhere else. This re-checks the owner invariant above on every PR, on top of #2251's one-time precondition.

Since AL-2674 it also fails, for the command lane and the privileges of `public`:

- `tenant_guard` owns a function outside the `tenant_guard` schema, in any schema, definer or not (`GUARD_OWNED_OUTSIDE_SCHEMA`);
- a SECURITY DEFINER function in `platform` is not owned by `postgres` (`PLATFORM_DEFINER_OWNER`);
- a SECURITY DEFINER function in those six schemas has no `search_path` setting (`DEFINER_SEARCH_PATH_UNSET`), or has one that is not exactly empty in `tenant_guard` or `platform`, or that names `"$user"` elsewhere (`DEFINER_SEARCH_PATH_UNSAFE`);
- `PUBLIC` may execute one (`DEFINER_PUBLIC_EXECUTE`), or `anon` may execute one that is not in `docs/security/anon-definer-allowlist.json` (`DEFINER_ANON_EXECUTE`); that list is malformed (`ANON_ALLOWLIST_MALFORMED`), names a function that is no longer a definer (`ANON_ALLOWLIST_STALE`), or names one that is volatile or has a non-empty search path (`ANON_ALLOWLISTED_UNSAFE`);
- `PUBLIC` or `anon` may execute any function in `tenant_guard` or `platform` (`COMMAND_PUBLIC_EXECUTE`), or both `authenticated` and `service_role` may execute one there (`COMMAND_LANE_MIXED`);
- a function in `tenant_guard` or `platform` names the `auth` schema, outside a comment (`COMMAND_READS_AUTH`): the guard holds nothing on `auth`, and reads the caller and the claims through `tenant_guard.caller_id()` and `tenant_guard.request_claims()` ("What the guard role holds");
- a `tenant_guard` function `authenticated` may execute is not a PL/pgSQL SECURITY DEFINER owned by `tenant_guard` whose first statement calls `tenant_guard.begin_human_command(...)` and ends right after the call's closing parenthesis, outside any `EXCEPTION` section of its outer block (`COMMAND_HUMAN_NO_PREAMBLE`). `PERFORM tenant_guard.begin_human_command(p) WHERE false`, which never calls it, fails;
- a `platform` function `authenticated` may execute is not a PL/pgSQL SECURITY DEFINER whose outer `DECLARE` section initialises a variable with an initialiser that ends right after `platform.require_operator()` (`PLATFORM_COMMAND_NO_OPERATOR_CHECK`). Both lane checks read the body with comments and string contents removed;
- a function outside the command schemas that calls into one is SECURITY DEFINER (`WRAPPER_DEFINER`), has no fixed search path (`WRAPPER_SEARCH_PATH`), lets `PUBLIC` or `anon` execute it (`WRAPPER_PUBLIC_EXECUTE`), or lets `authenticated` execute it while it calls a function that is not a human entry point or a platform command (`WRAPPER_GRANTS_WORKER`). "Calls into one" means that its text, with comments removed and string literals kept, names `tenant_guard.` or `platform.` as a qualifier: a call written out in dynamic SQL counts, and so does a name no call in it parses (a call the function assembles, a `regproc`), which is held to the first three rules though its targets are unknown. A name that appears only in a comment does not count, and neither does a comment inside a qualified name (`tenant_guard/**/.x(...)` is read as a call);
- a function outside the command schemas has `tenant_guard` or `platform` on its search path, which would let it call into them unqualified (`COMMAND_SCHEMA_ON_SEARCH_PATH`);
- in `public`, `PUBLIC` holds any privilege on a relation or one of its columns (`GRANT_TO_PUBLIC`), `anon` or `authenticated` holds `TRUNCATE`, `REFERENCES`, `TRIGGER` or `MAINTAIN` (`GRANT_UNSAFE_PRIVILEGE`), holds any privilege on a view, materialized view or foreign table, which row security does not bind (`GRANT_ON_VIEW`), or holds a table or column `SELECT`, `INSERT`, `UPDATE` or `DELETE` that no row-security policy admits for that role and command (`GRANT_WITHOUT_POLICY`). The table-level part is the end state that `20261117034926_close_default_privileges_and_demo_grants.sql` asserted once, kept on every chain; council round 2 added views and column grants. The two columns of `missionaries` that signed-in users may read are a column grant with a policy, and pass. New objects in `public` get no default grant, so each migration grants what it needs.

Since the second release of WP2b (AL-2675; plan 12, WP2's exit line; record D-25) it also fails, on every policy a Data API role reaches in `public` (one that names `PUBLIC`, or a role that `authenticated` or `anon` holds by membership, itself included; fixcheck F4):

- a policy of a tenant table that admits a row without `tenant_id = (SELECT authz.current_tenant_id())`: what each command effectively admits must be `false`, the tenant condition, a conjunction with a tenant-bound operand, or a disjunction of tenant-bound operands beside at most one `(SELECT authz.is_super_admin())` branch, which WP2c removes (`TENANT_CONDITION_MISSING`; activation review Q6). The gate judges the predicate as Postgres applies it: a missing `USING` admits every row, a missing `WITH CHECK` is the `USING`; `SELECT` and `DELETE` are judged by their `USING`, `INSERT` by its `WITH CHECK`, `UPDATE` and `FOR ALL` by both. The super-admin branch alone, with no tenant condition beside it, fails (council R2);
- a call of an `authz` or `auth` function that is not the whole of its own sub-select, or that passes a column of the row, so the lookup runs once for every row (`POLICY_LOOKUP_PER_ROW`). A bare `auth.uid()` compared with a column is such a call (council R12 (b));
- a policy that reads the token's claims (`auth.jwt()`, `app_metadata`, `request.jwt.claims`) (`POLICY_READS_TOKEN_CLAIM`), and a request-tenant helper (`authz.current_tenant_id`, `request_tenant_id`, `request_assignment_id`, `request_assignment`) that is missing or reads them (`TENANT_HELPER_MISSING`, `TENANT_HELPER_READS_CLAIM`). Every overload of a helper is read, keyed by its signature so that one cannot hide another, and so is every function a helper reaches through a qualified call in its text; such a function may read the token's subject (`auth.uid()`) and nothing else of it (council R12 (a)). Each helper also sets an empty search path, so a call it makes without a schema resolves in `pg_catalog` alone and reaches nothing the gate does not read (`TENANT_HELPER_SEARCH_PATH`; fixcheck F4). A function a helper reaches is not held to that, and an unqualified call inside it is not followed;
- a tenant table in a publication, or one of the tables that reach their tenant through a parent row (`donor_activities`, `post_comments`, `post_fires`, `post_likes`, `post_prayers`; `PARENT_SCOPED_TABLES` in the gate) (`TENANT_TABLE_PUBLISHED`; council R3);
- an `INSERT`, `UPDATE` or `DELETE` policy, on any table in `public`, where no Data API role it reaches holds the privilege its command needs: `authenticated` or `anon`, each when the policy names `PUBLIC` or a role it holds by membership, on the table or any of its columns, directly, through `PUBLIC` or through a membership (`WRITE_POLICY_WITHOUT_GRANT`; activation review Q7, section 4). Such a policy admits nothing today and would admit every role it names, unreviewed, the day a grant came back. A `FOR ALL` policy also writes, so where no signed-in role it names holds `INSERT`, `UPDATE` or `DELETE`, only a plain deny may stand (`false` for every command it governs; council R3);
- on a table that reaches its tenant through a parent row, any signed-in policy that is not a reviewed exception: Postgres ORs every permissive policy, so a second one beside the pinned one would widen it unseen (`PARENT_SCOPED_POLICY_NOT_PINNED`; council R3);
- a reviewed exception whose text, command, sorted roles or kind (permissive or restrictive) changed, that is gone, or that is malformed (`POLICY_EXCEPTION_CHANGED`, `POLICY_EXCEPTION_STALE`, `POLICY_EXCEPTIONS_MALFORMED`), and a reviewed exception whose text calls a helper once for every row (`POLICY_LOOKUP_PER_ROW`). The exceptions live in `docs/security/tenant-policy-exceptions.json`, each pinned to its deparsed text, its command, its sorted roles and whether it is permissive, and named with the package that ends it; `docs/security/tenant-policy-activation-review.md`, section 3, explains each.

The gate scans `public` only. `authz.memberships` keeps its own-row read outside it, which the real-stack suites of issues 2674 and 2675 assert.

What the gate does not judge (council R12 (c)): it accepts the tenant condition alone as tenant-bound, so a policy with the tenant condition and no class or ownership term (activation review question 2) would pass. That term is reviewed, in the activation review and in each migration's review, and is not gated. The gate also reads a policy's text, not the policies of the tables a sub-select of it reads: a sub-select's own tenant term is a matter of review too (council R11).

Wherever the gate reads a function's text, it reads `prosrc` together with `pg_get_function_sqlbody`, so a SQL-standard body (`BEGIN ATOMIC ... END`, or `RETURN ...`), whose `prosrc` is empty, is read too. The deparse qualifies a name that the gate's session cannot see unqualified; `tenant_guard` and `platform` are never on that session's search path.

The gate reads function text with a scanner, not a parser. The lane checks blank every quoted identifier first, so a quoted `"begin ..."`, `"end"` or `"case"` can neither fake the start of a body nor hide an outer `EXCEPTION` section. These deliberate defeats remain known limits:

1. An unquoted `begin` used as a label or alias, which the lane check can take for the start of the body.
2. In a platform command, an initialiser that compares with the operator check after a constant that decides the result (`v boolean := false AND 1 = platform.require_operator();`), which the planner folds away without calling it.
3. Two hops: a function outside the command schemas that calls a `public` wrapper (`public.acquire_workflow_work_claim(...)`) names no command schema, so the wrapper rules do not see it. A `postgres`-owned definer written so could hand a worker entry point to signed-in users, where `postgres` reaches the guard function (a superuser in CI; on hosted Supabase, through any role it holds).
4. A command schema's name assembled at run time, such as `format('%I.%I', 'tenant' || '_guard', v)`, which the function's text never names as a qualifier.
5. A search path set at run time: the search-path rule reads only the function's own `search_path` setting, so `set_config('search_path', 'tenant_guard', true)` followed by an unqualified call is not seen.

Each needs a function written on purpose to fool the gate, and every one of them, but the label in limit 1, needs a `postgres`-owned definer, which is all-powerful already. Code review of the migration stays the control for them. Council round 3 closed three more of this kind: a call no scanner reads (now held to the wrapper rules), a comment inside a qualified name, and a quoted identifier that unbalanced the lane check.

To comply, follow "Adding a tenant table" and "Command lane" above. The `migrate` job step `Verify RLS catalog gate (real stack)` runs `tests/unit/acceptance/issue-2253/rls-catalog-gate.realstack.acceptance.test.ts` against the migrated database, with `TENANT_GUARD_IT_ADMIN_DATABASE_URL` set from `DATABASE_URL`. It plants each violation in a rolled-back transaction and checks the gate names it.

### Service-role client gate

`scripts/verify/service-role-client-gate.mjs` parses every source file under `apps/`, `packages/`, `scripts/` and `tooling/` with the TypeScript compiler. It skips a file whose name (not a directory name) matches `*.test.*`, `*.spec.*` or `*.d.ts`, and any file under a `__tests__/`, `e2e/`, `dist/`, `.next/` or `node_modules/` directory at any depth. The repo-root `tests/` tree is outside the scan roots; a `tests/` directory inside them, or a directory whose name contains `.test.`, is scanned. It also skips the factory `packages/database/supabase/admin.ts` and the guard `packages/api/src/identity/**`. Nothing else is exempt, including the gate itself. It runs in `test:unit` (the `test-unit` job) through `tests/unit/acceptance/issue-2253/service-role-gate.acceptance.test.ts`, and locally with `bun run verify:service-role-clients`.

It counts four kinds of site:

- `admin_client`: a call to `getAdminClient` or `createAdminClient` bound from the factory (named, aliased, namespace, `await import()`, `require` or a relative path), or any non-call value use of such a binding. `typeof` in a type is not a site.
- `service_role_key`: every whole-word occurrence of the service-role key's env name (with or without the `SUPABASE_` prefix) in the file text, including string arguments, name lists, regexes and comments.
- `workflow_admin_wrapper`: a call to, or value use of, `requireWorkflowAdminClient` from `packages/api/src/workflows/admin-client.ts`.
- `operation_admin_context`: every call to or value use of `withPlatformOperation` from `packages/api/src/shared/with-operation.ts`. The ordinary `withOperation` authenticates the request and supplies only the caller-token client bound to the resolved tenant and assignment. It is not a service-role site.

The gate also counts `runDonorPortalOperation` and `runMissionaryPortalOperation` as platform context sites. A caller-lane file must not import a module with an admin-client site: for legacy allowlisted modules this check sees direct imports only, not arbitrary transitive dependencies, and any dynamic `import(...)` or `require(...)` in a caller-lane (`withOperation`) file whose specifier cannot be resolved statically fails (`CALLER_PRIVILEGED_IMPORT`). Two reviewed exceptions stand: the caller context's audit writer (which inserts behind the logger with a privileged client until WP4b moves it), and `packages/api/src/storage/media-store` (plan 6.6, 7.2; coordinator ruling W6-R3 amended, 23 November 2026), the single platform-lane media storage module whose request-reachable exports take the admitted `AuthenticatedContext` and derive `auth.tenantId` from it rather than a caller-supplied tenant argument. For `packages/api/src/storage/media-store`, the gate enforces three stricter rules: a `withOperation` file may import only static named bindings from `CALLER_MEDIA_STORE_ALLOWED_EXPORTS` (`issueSignedUpload`, `finalizeMediaUpload`, `readMediaVariant` — never unlisted exports, namespace, default, or dynamic imports); re-exporting `media-store` from any file fails (`REEXPORT media_store`); and importing any module that transitively imports or forwards `media-store` into a `withOperation` file fails (`CALLER_PRIVILEGED_IMPORT`).

In `packages/api/src/storage/media-store.ts`, strict container validation refuses trailing bytes after container end and refuses JPEG images with a deferred height (`DNL` marker) as unsupported. No code removes canonical media bytes. A deleted asset keeps its bytes in the private bucket. The delayed purge and the sweep of abandoned staging objects are owed to WP7, which adds the live-use check (plan section 12, "WP7 — Publishing and the public site", Behaviour and Acceptance evidence), scheduled by WP10 (plan section 9.6, "Continuing burden this design adds"); their requirements are in issue #2769.

Re-exporting a tracked factory or privileged wrapper from any other file always fails and cannot be allowlisted.

`docs/security/service-role-client-allowlist.json` is the frozen, shrink-only allowlist (Samson's Q4 ruling): one entry per (file, kind) with a `count`, a non-empty `reason`, its `path_ref` and `follow_up` (#2261–#2265), and `lines` for reference only. It was frozen at 117 entries, 188 sites in 111 files. A copy of every frozen count is also kept as a ceiling inside the gate, whose SHA-256 is pinned by `tests/unit/scripts/service-role-client-gate.test.ts`. The gate fails, naming the file, the kind and the real `file:line` of every site of that kind, on:

- a site in an unlisted file, or more sites than the entry allows (`NEW_SITE`);
- an entry that is not in the ceiling, or a count above it (`ALLOWLIST_GROWTH`);
- an entry whose count is above the real count, or whose file has none left (`STALE`: shrink or delete it);
- an entry with an unknown kind, a non-positive count, an empty reason or a duplicate key (`ALLOWLIST_MALFORMED`).

To comply, reach tenant data through `withTenant` (see "Adding a guarded function" above), not a new service-role site. A PR that removes sites lowers or deletes the matching allowlist entry and ceiling row in the same change. Adding an entry or raising a count means editing the pinned ceiling, which needs a new security ruling from Samson. Entries are reviewed like the deny-by-default list: each one needs a specific `reason` and its follow-up. Moving a site within an allowlisted file passes, which is acceptable for a shrink-only ceiling.

### HTTP mutation admission and audit (AL-2677)

All three product proxies call `admitApiMutation` in `createAuthMiddleware` before dispatching API writes. Browser requests must match the request's exact origin: the request scheme and the HTTP `Host` (including its port). Next's adapter URL can contain the server's bind hostname and normalizes loopback IPs to `localhost`; use its authority only if no `Host` is present. Do not use a forwarded host header or one fixed donor application URL. WP3b should resolve the incoming authority against the verified Site/portal registry at the donor proxy boundary before calling `createAuthMiddleware`; passing that check does not make a sibling verified host same-origin.

TLS termination must preserve the public scheme in the request URL and the verified public authority in `Host`. Admission ignores `X-Forwarded-Proto` and `X-Forwarded-Host`; a proxy that passes an internal HTTP URL instead of the public HTTPS scheme will refuse legitimate browser writes.

Without Origin, a matching Referer or same-origin Fetch Metadata can attest a browser request. Otherwise only a cookie-free bearer request or the exact Stripe, Resend and Inngest endpoints proceeds to its own authentication. JSON is accepted; multipart is limited to media uploads and Web Studio. An empty write needs no media type: a write with no `Transfer-Encoding` whose `Content-Length` is `0` or absent is empty, whatever body stream Next hands the proxy (it hands one to every write). Browsers send a bodyless `DELETE` with neither header. Next serves HTTP/1.1, where a request with neither header has no body (RFC 9112, section 6.3): bytes sent after its headers are parsed as the next request and refused, so no route reads an untyped body this rule admits (the admission suite proves it on a Node server). A front that terminates HTTP/2 or HTTP/3 must forward a body with a length or a transfer encoding, and such a write then needs a media type. Admission is not authorization or signature validation.

The proxy decides by headers alone, and over HTTP/2 or HTTP/3 a body needs no length header, so an untyped body can still arrive. The shared JSON reader (`ensureJsonBody`, and `readJsonBodyOrNull` for an optional body, in `packages/api/src/shared/http-errors.ts`) is the second line: it decides by the bytes it reads, and answers a non-empty body whose media type is not JSON with the proxy's 415; an empty body behaves as before. Every handler that reads a body falls in one of these classes (census of 21 November 2026, fix check G1):

- JSON through the shared reader: 45 files in `packages/api`, Web Studio's create-from-template endpoint, and 33 Mission Control route files through the member-care and Support Hub `readJsonBody` helpers, which read through it.
- Signed routes whose signature covers the raw body they read: Stripe's webhook (`constructVerifiedStripeEvent`), Resend's (`verifyResendWebhookSignature`, Svix), and `/api/inngest`, where the Inngest SDK (4.25.0) verifies `X-Inngest-Signature` over the body with the signing key in cloud mode; the local dev server is unsigned.
- Multipart, whose parser needs the request's type and refuses without one: the image uploads (`readForm`) and the email asset upload, both 400 before any storage call.
- Payload's REST handler under `/web-studio/api` parses a body only for `application/json` or multipart (`addDataAndFileToRequest`, Payload 4.0.0-beta.9), so an untyped body never becomes data; the picker form is admitted only with the GET override.
- The donor portal's GraphQL route: graphql-yoga (5.24.6) has no parser for an untyped `POST` and answers 415 itself.
- Web Studio's GraphQL route (`/web-studio/api/graphql`): Payload's handler builds its request and parses a multipart body before graphql-http (1.22.4) refuses anything that is not JSON, so the route itself requires `application/json` and refuses anything else with 415 in the Studio envelope before Payload runs. No Web Studio screen calls it; WP6 removes it.
- The assistant's channel routes parse JSON only after `adminEveRouteAuth`, which requires JSON on a cookie-carrying write.

Eve's cookie-authenticated session POSTs run outside Next's API proxy. Its channel authenticator uses the same source check and requires JSON before resolving ownership. In Eve 0.25.1 the session handler calls route auth before JSON parsing. Session stream reads are not writes; GitHub callbacks keep their separate signature verifier.

Vercel Blob client-upload completion is a signed server callback, not a browser write. Before enabling `BLOB_READ_WRITE_TOKEN`, enroll only its exact callback route in `signedRoutes` and the corresponding route-level `sameOriginWrites` exception, with signature verification and a test of both layers. Neither gate currently admits that originless callback.

Server Actions, including Web Studio organization actions and Payload's server function, are outside this API gate. Next checks a supplied Origin and trusts `X-Forwarded-Host`; an absent Origin is permitted with a warning. The ingress must overwrite that header rather than forward a client-supplied value. This repository does not establish that every deployed proxy does so. Studio picker lookups additionally admit same-origin form POSTs with Payload's GET override.

Operation failures log sanitized exception name, code, stack, status and request ID; the tracker receives the same correlation ID. CRM command rows record actor, action, references and outcome only. The human audit logger binds identity to the authenticated context; system events have no human actor. Governed exports require a same-origin download and a successful audit insert.
The command-log scrub removes all historic `command_payload` values and revokes signed-in SELECT on that column and on `result_summary` and `error_message`, which staff could once fill with free JSON and text through the original insert grant. The note writer supplied body, title and visibility only in the payload, not in `result_summary` or `error_message`, so those two are kept, not cleared. Signed-in callers keep the other columns, which every reader and `count(*)` need. Since WP4a's second part (AL-2677) the one writer is `tenant_guard.create_crm_note` on the caller's token ("Function inventory and grant matrix", above): the guard may not insert those three columns, so they keep their defaults, and a retried note is found by its submission key in `crm_notes` with its log row's ID. No CRM handler reaches the service key.
