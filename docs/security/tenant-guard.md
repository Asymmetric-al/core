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

## CI gates

Two permanent, blocking checks from #2253 (slice 4 of #505) keep the tenant posture from regressing. #516's tier job reuses both rather than re-implementing them.

### Tenant RLS catalog gate

`scripts/verify/tenant-rls-catalog.mjs` exports the catalog query (`TENANT_RLS_CATALOG_SQL`, marked `-- tenant-rls-catalog-gate:v1`), the pure evaluator `evaluateTenantRlsCatalog` and the runner `runTenantRlsCatalogGate`. `scripts/verify/supabase-migrations.mjs` runs it right after the field-policy census and before its `Verified N forward Supabase migrations` line, so the `Apply migrations` step of `migrate`, `test-e2e-smoke` and `test-e2e` all run it. On a pass it prints one counts line; on a failure it prints each violation as `CODE table: detail` and exits non-zero without the success line.

It fails with a stable code when:

- a tenant table has RLS off (`RLS_DISABLED`) or not forced (`FORCE_MISSING`);
- a tenant table has no policy and is not in `docs/security/rls-deny-by-default-exceptions.json` (`NO_POLICY_UNLISTED`);
- a listed table has gained a policy, no longer exists, or no longer has `tenant_id` (`STALE_HAS_POLICY`, `STALE_MISSING_TABLE`, `STALE_NOT_TENANT`);
- the list is missing, is not JSON, repeats a table or has an entry without `table` (`EXCEPTIONS_MALFORMED`);
- a tenant table's owner, or the owner of a SECURITY DEFINER function in `public`, `authz`, `document_cutover` or `private`, has neither `rolsuper` nor `rolbypassrls` (`OWNER_NO_BYPASS`, `DEFINER_OWNER_NO_BYPASS`). `tenant_guard`-owned functions are exempt. This re-checks the owner invariant above on every PR, on top of #2251's one-time precondition.

To comply, follow "Adding a tenant table" above. The `migrate` job step `Verify RLS catalog gate (real stack)` runs `tests/unit/acceptance/issue-2253/rls-catalog-gate.realstack.acceptance.test.ts` against the migrated database, with `TENANT_GUARD_IT_ADMIN_DATABASE_URL` set from `DATABASE_URL`. It plants each violation in a rolled-back transaction and checks the gate names it.

### Service-role client gate

`scripts/verify/service-role-client-gate.mjs` parses every source file under `apps/`, `packages/`, `scripts/` and `tooling/` with the TypeScript compiler. Tests (`*.test.*`, `*.spec.*`, `__tests__/`, `e2e/`, `tests/`), `*.d.ts`, build output and dependencies are skipped, and so are the factory `packages/database/supabase/admin.ts` and the guard `packages/api/src/identity/**`. Nothing else is exempt, including the gate itself. It runs in `test:unit` (the `test-unit` job) through `tests/unit/acceptance/issue-2253/service-role-gate.acceptance.test.ts`, and locally with `bun run verify:service-role-clients`.

It counts four kinds of site:

- `admin_client`: a call to `getAdminClient` or `createAdminClient` bound from the factory (named, aliased, namespace, `await import()`, `require` or a relative path), or any non-call value use of such a binding. `typeof` in a type is not a site.
- `service_role_key`: every whole-word occurrence of the service-role key's env name (with or without the `SUPABASE_` prefix) in the file text, including string arguments, name lists, regexes and comments.
- `workflow_admin_wrapper`: a call to, or value use of, `requireWorkflowAdminClient` from `packages/api/src/workflows/admin-client.ts`.
- `operation_admin_context`: a `withOperation` handler (from `packages/api/src/shared/with-operation.ts`) whose context parameter destructures or reads `supabaseAdmin`, uses a rest element, or is passed on, spread, returned or assigned whole; a handler that is not an inline function; or a non-call value use of `withOperation`. A handler that takes only `{ auth, request }` is not a site.

Re-exporting the factory, `requireWorkflowAdminClient` or `withOperation` from any other file always fails and cannot be allowlisted.

`docs/security/service-role-client-allowlist.json` is the frozen, shrink-only allowlist (Samson's Q4 ruling): one entry per (file, kind) with a `count`, a non-empty `reason`, its `path_ref` and `follow_up` (#2261–#2265), and `lines` for reference only. It was frozen at 117 entries, 188 sites in 111 files. A copy of every frozen count is also kept as a ceiling inside the gate, whose SHA-256 is pinned by `tests/unit/scripts/service-role-client-gate.test.ts`. The gate fails, naming the file, the kind and the real `file:line` of every site of that kind, on:

- a site in an unlisted file, or more sites than the entry allows (`NEW_SITE`);
- an entry that is not in the ceiling, or a count above it (`ALLOWLIST_GROWTH`);
- an entry whose count is above the real count, or whose file has none left (`STALE`: shrink or delete it);
- an entry with an unknown kind, a non-positive count, an empty reason or a duplicate key (`ALLOWLIST_MALFORMED`).

To comply, reach tenant data through `withTenant` (see "Adding a guarded function" above), not a new service-role site. A PR that removes sites lowers or deletes the matching allowlist entry and ceiling row in the same change. Adding an entry or raising a count means editing the pinned ceiling, which needs a new security ruling from Samson. Entries are reviewed like the deny-by-default list: each one needs a specific `reason` and its follow-up. Moving a site within an allowlisted file passes, which is acceptable for a shrink-only ceiling.
