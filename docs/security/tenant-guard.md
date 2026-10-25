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

Guard policies read only `app.current_tenant_id`, through `tenant_guard.current_tenant_id()`. Existing JWT policies read the tenant through `authz.current_tenant_id()`, which reads JWT `app_metadata.tenant_id`; this slice leaves it unchanged. Until #668, the setting is honored only by `TO tenant_guard` policies: inside a guarded call a JWT naming another tenant does not widen the guard, and every table without a guard policy (or a grant) is closed to `tenant_guard`. #668 makes `authz.current_tenant_id()` read the setting and decides whether to merge the guard policies into it. Current-authority use stays qualified until #669, #668 and #667 deliver.

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

The migration also runs `ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_guard REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`. `tenant_guard` holds exactly: `SELECT, INSERT, UPDATE` on `public.workflow_work_claims`, `USAGE` on schemas `public` and `tenant_guard`, and EXECUTE on `enter` and `current_tenant_id`.

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

`Verify tenant isolation (real stack)` is a step of the `migrate` job in `.github/workflows/ci-integration.yml`, followed by #2270's `Verify authz EXECUTE grants (real stack)` and then #2251's `Verify tenant table RLS posture (real stack)`. It sets `TENANT_GUARD_IT_ADMIN_DATABASE_URL` from `DATABASE_URL` (the job's disposable, migrated PG17 database) and runs `bun x vitest run tests/unit/acceptance/issue-2250/tenant-guard.realstack.acceptance.test.ts tests/unit/acceptance/issue-2269/donations-embed.realstack.acceptance.test.ts`: #2250's own real-stack file plus #2269's donations-embed real-stack file, which reads the same `TENANT_GUARD_IT_ADMIN_DATABASE_URL` (explicit paths, not a substring filter). With no URL, it fails only when `GITHUB_JOB` is `migrate` and skips everywhere else, including the `test-unit` and `acceptance-tests` jobs in `ci.yml` and local runs. GitHub sets `GITHUB_JOB` to the job id, so the step needs no other env. When the URL is set, the suite runs in any job. The filter cannot pass vacuously: Vitest exits 1 when no file matches. A failure fails the required `migrate` check. Other slices run their own real-stack files in their own steps.

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
- **B4** every other postgres-owned definer function or trigger that touches a forced table, such as the Eve notification RPCs, `save_crm_tenant_table_default`, `enforce_contribution_notification_tenant_refs` and `private.seed_support_hub_defaults`.

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
