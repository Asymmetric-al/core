# TP1: CRM list and detail on the caller's token, and the cost of the tenant condition

**Purpose.** This is the first thin proof of plan section 12 ("Packages are containers, not single issues"): one caller-token CRM read, the first issue of WP4a. It settles two rows of plan 15.2 before the second release of WP2b is built: "Caller-token lane as the default for server reads" and "Policy cost with the tenant condition on every policy". It also covers the server half of "A request header reaching the database helper".

**Issue and branch.** AL-2677. Branch `proof/AL-2677-tp1-caller-token-crm`, cut from `23297a52b`, the tip of the membership core (WP2a, AL-2675). The prototype is not for merge. It is kept as a patch (section 14).

**Where it ran.** A disposable Postgres 17.10 database in the shared test container, behind a PostgREST 16.4 container of its own, on 17 November 2026. No hosted project was used (decision D-03), so section 13 lists what a hosted run would add.

## 1. Verdicts

**Risk 1, the caller-token lane as the default for server reads: it works.** CRM list and CRM detail ran through the caller's token, with the tenant and assignment headers and no service key, and returned the same rows as the service key on every read tried, page two included. Getting there took 5 grants, 13 new or replaced policies and one dropped policy, on 14 of the 15 tables the two reads touch, and two code changes for names. One difference remains and is a product decision: a profile with no name is labelled by its email today and by nothing through the member directory. On today's chain the same reads go wrong in 10 of 17 table queries: 6 fail with permission denied and 4 return an empty list with no error. So the lane is sound, but no handler can move without its table-by-table grants and policies, and each move needs a two-tenant test because a missing policy shows up as an empty list, not an error.

**Risk 2, the cost of the tenant condition on every policy: settled, with one correction to the plan.** The tenant condition costs nothing measurable and is what lets every read use the tenant index. The membership check is the risk. Written as a whole-expression init-plan, `(SELECT authz.assignment_is('staff'))`, it runs twice per statement whatever the row count. Written with a constant argument, `has_staff_membership((SELECT current_tenant_id()))`, which is the form 15.2 names, it runs once per row: 250,001 calls and 16 to 21 seconds for the first list page of the large tenant, no better than today's per-row policy (13 to 19 seconds for the same page). So the plan's wording must change to the init-plan form. Two smaller costs remain, and neither is the tenant condition. The helpers must be marked `PARALLEL SAFE`, or every caller-token scan loses parallel query and runs about twice as slow as the service key. And a search under row security can misplan, because Postgres withholds column statistics from `ILIKE` when row security applies.

**The header path, from a server: it works.** PostgREST puts both headers into `request.headers`, lowercased, on every request, and the helpers read them. A missing tenant gives no rows. A forged tenant gives no rows. A malformed value is refused with HTTP 400 and SQL state `22P02`. The browser half (a cross-origin preflight) was not measured.

## 2. What was built

| Path                                                                                                  | What it is                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20261117115836_tp1_caller_token_crm_read_policies.sql`                           | The policy pattern of plan 5.4 for the tables behind CRM list and detail: the header helpers, `authz.current_tenant_id()` repointed, the grants, and the staff read policies with the tenant condition        |
| `docs/security/rls-deny-by-default-exceptions.json`                                                   | Four entries removed, because their tables now have a policy and the catalog gate fails a stale entry                                                                                                         |
| `packages/auth/request-headers.ts`                                                                    | `TENANT_HEADER = "x-asym-tenant"`, beside the existing assignment header. The name is a proposal                                                                                                              |
| `packages/database/supabase/server.ts`, `packages/api/src/shared/request-session-client.ts`           | Both per-request session clients take optional headers                                                                                                                                                        |
| `packages/api/src/shared/caller-client.ts`                                                            | `callerScopeHeaders(auth)` and `createCallerClient(request, auth)`: the caller's session client with the two headers from the resolved assignment. No assignment means 403, not a client                      |
| `packages/api/src/shared/with-operation.ts`                                                           | `withCallerOperation`: the same wrapper as `withOperation`, but it gives the handler `db`, the caller client, and never creates the service-key client                                                        |
| `packages/api/src/admin/crm/index.ts`, `crm/detail/index.ts`                                          | CRM list and detail on `withCallerOperation`                                                                                                                                                                  |
| `packages/api/src/admin/crm/service.ts`, `crm/detail/service.ts`, `contribution-shared/row-inputs.ts` | Owner and missionary names through `public.tenant_member_directory` when the caller lane asks for it; today's profile read stays the default, so the service-key path is unchanged and serves as the baseline |
| `scripts/proofs/tp1/fixture.sql`                                                                      | Two tenants of the plan's large size and the people the checks need                                                                                                                                           |
| `scripts/proofs/tp1/harness.sql`, `probe.sql`                                                         | Harness setup on the disposable database only: hosted `auth.uid()`, hosted-style service grants, and a probe that shows what the helpers see                                                                  |
| `scripts/proofs/tp1/measure-policy-cost.mjs`                                                          | The cost measurement of section 6                                                                                                                                                                             |
| `tests/unit/acceptance/tp1-caller-token/crm-read.postgrest.test.ts`                                   | The real-stack test: the census, equality through the handlers, isolation, the header probes and round-trip times. It skips unless its environment is set                                                     |

## 3. Method

**Databases.** Both are on `core-crmcms-pg` (Postgres 17.10, `shared_buffers` 128 MB, `work_mem` 4 MB, two parallel workers per gather). `tp1_base` has the migration chain as it stands at `23297a52b` and a small fixture (2,000 donors and 16,000 gifts per tenant). It shows what today's policies do on the caller's token. `tp1_proof` has the chain plus the prototype migration and the full fixture: 250,001 donors and 2,000,120 gifts in each of two tenants, 2.1 GB, loaded in 8 minutes. `node scripts/verify/supabase-migrations.mjs` applied both chains. On `tp1_proof` its catalog gate first failed on the four stale exception entries; with them removed, the gate passed (65 tables with policies, 86 definer functions).

**Fixture.** Each tenant has 500 missionaries with logins, 500 funds, 30 staff, 1,000 donors with portal logins and memberships, the bulk donors and gifts, and one "rich" donor with rows in every table CRM detail reads: 120 gifts, 60 staged gifts, 20 split lines, 30 CRM links, corrections, pending correction requests, adjustments that move the fund, pledges, activities, merge candidates and an approval policy. The owner of each rich donor is missionary 1, whose profile has an email and no name. The people:

| Person | Memberships                                          | Used for                                         |
| ------ | ---------------------------------------------------- | ------------------------------------------------ |
| P      | staff (development) in T1, staff (development) in T2 | equality, and the person in two tenants          |
| S1     | staff (finance) in T1                                | forged tenant, someone else's assignment         |
| S2     | staff (finance) and staff (hr) in T1                 | two rows in one tenant with no assignment header |
| D      | donor in T1, owner of T1's rich donor                | the own-row branch, bound to the donor class     |
| X      | none                                                 | signed in with no membership                     |

**PostgREST.** `public.ecr.aws/supabase/postgrest:v16.4`, the image the local Supabase stacks on this machine use, in containers `tp1-postgrest` (port 25480, `tp1_base`) and `tp1-postgrest-proof` (port 25481, `tp1_proof`). It logged in as a role of its own, `tp1_authenticator`, which can switch to `anon`, `authenticated` and `service_role`. Tokens were HS256 tokens minted with a throwaway secret: `{sub, role: "authenticated"}` for a person and `{role: "service_role"}` for the service key.

**The harness has to fix one thing first.** The compatibility bootstrap that every disposable database starts from defines `auth.uid()` as the legacy `request.jwt.claim.sub` setting only (`scripts/sql/supabase-compat-bootstrap.sql:108-114`). PostgREST no longer sets that; it sets `request.jwt.claims`. Hosted Supabase's `auth.uid()` falls back to `request.jwt.claims ->> 'sub'` (GoTrue migration `20211202183645_update_auth_uid`, read from the `gotrue:v2.197.0` image). Without the fix, every caller behind PostgREST has no user id. `scripts/proofs/tp1/harness.sql` installs the hosted definition on the two `tp1_` databases only.

**Sources checked.** PostgREST's "Transaction-Scoped Settings" (its `docs/references/transactions.rst`): headers are stored as JSON in `request.headers`, names lowercased, per transaction, and read back as `''` after the transaction ends. Supabase's row-level security guide: wrapping a function in `select` makes the planner run it once as an `initPlan`, which works only when the result does not depend on the row. Postgres 17's volatility page: a `STABLE` function may be optimized to a single call, and an index scan evaluates its comparison value once.

**What runs where.** The test calls the real route handlers. Three things are replaced: `getAuthContext` returns the context the resolver would return (there is no GoTrue here), the public Supabase config points at PostgREST, and `getAdminClient` throws and counts, so any service-key use on the two caller paths fails the run. Global `fetch` is wrapped only to rewrite the host and record each request's credentials and headers. The baseline ("today") is the same service functions called with a service-key client, which is what the handlers did before.

## 4. Same rows on both lanes

### 4.1 Today's chain on the caller's token

Every query CRM list and detail issue, run once with the service key and once as P with T1's tenant and assignment headers, on `tp1_base`:

| Query                                  | Service key | Caller's token                                             |
| -------------------------------------- | ----------- | ---------------------------------------------------------- |
| `donors`, list page                    | 51          | 51, same rows                                              |
| `profiles`, owner names                | 1           | 1, same rows                                               |
| `donors`, detail                       | 1           | 1, same row                                                |
| `donations`                            | 101         | 101, same rows                                             |
| `staged_gifts`                         | 60          | **0, no error** (a deny-all policy)                        |
| `donor_activities`                     | 20          | 20, same rows                                              |
| `donor_pledges`                        | 3           | 3, same rows                                               |
| `crm_merge_candidates`                 | 2           | 2, same rows                                               |
| `contribution_approval_policies`       | 1           | **error 42501**, no grant                                  |
| `donation_crm_links`                   | 30          | **0, no error** (a deny-all policy)                        |
| `contribution_corrections`             | 3           | **error 42501**, no grant                                  |
| `contribution_correction_requests`     | 2           | **error 42501**, no grant                                  |
| `contribution_adjustments`             | 2           | **error 42501**, no grant                                  |
| `staged_gift_allocations`              | 20          | **0, no error** (a deny-all policy)                        |
| `funds`                                | 3           | **0, no error** (the helper reads the token claim)         |
| `missionaries`, embedded profile names | 3           | **error 42501**, no grant on the `tenant_id` filter column |
| `missionaries`, keys only              | 3           | **error 42501**, the same                                  |
| `tenant_member_directory` (function)   | error 42501 | 1                                                          |

Seven of the 17 table queries agree; 6 fail and 4 return nothing without an error. The member directory works on the caller's token only, because it needs a caller. The reads that agree do so only because P is staff in T1: today's policies on `donors` and `donations` do not test the request's tenant. With T1's headers, or with none, an unfiltered read by P returned both tenants' donors and gifts (NR-01).

### 4.2 Grants and policies added, table by table

| Table                              | Grant added                           | Policy                                                                                                  | Why                                                         |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `donors`                           | none                                  | replaced: tenant condition and (staff, or donor class and own row)                                      | no tenant condition (NR-01); own row not bound to its class |
| `donations`                        | none                                  | replaced: tenant condition and (staff, or donor class and own gift, or missionary class and own gift)   | the same                                                    |
| `donor_pledges`                    | none                                  | replaced, the same shape                                                                                | the same                                                    |
| `donor_activities`                 | none                                  | replaced: the donor's tenant must be the active tenant, through `donors` (the table has no `tenant_id`) | the same, and no tenant column                              |
| `crm_merge_candidates`             | none                                  | replaced: tenant condition and staff                                                                    | no tenant condition; a `super_admin` branch                 |
| `staged_gifts`                     | none                                  | added: tenant condition and staff                                                                       | deny-all policy, so an empty list                           |
| `staged_gift_allocations`          | none                                  | added, the same                                                                                         | the same                                                    |
| `donation_crm_links`               | none                                  | added, the same                                                                                         | the same                                                    |
| `contribution_corrections`         | `SELECT`                              | added, the same                                                                                         | no grant, no policy                                         |
| `contribution_correction_requests` | `SELECT`                              | added, the same                                                                                         | the same                                                    |
| `contribution_adjustments`         | `SELECT`                              | added, the same                                                                                         | the same                                                    |
| `contribution_approval_policies`   | `SELECT`                              | added, the same                                                                                         | the same                                                    |
| `missionaries`                     | `SELECT (tenant_id)`, the column only | added: tenant condition and staff. No care column is opened                                             | own-row policy only; the filter column had no grant (NR-10) |
| `funds`                            | none                                  | none: its existing "tenant scoped read" follows the repointed helper                                    | helper read the claim                                       |
| `profiles`                         | none                                  | dropped: "profiles staff tenant select", as WP2b drops it (NR-54)                                       | names move to the member directory                          |

**Totals:** 5 grants (4 table, 1 column) on 5 tables; 13 policies created on 13 tables, of which 5 replace a membership-only policy and 8 are new; 6 policies dropped. Four entries leave the deny-by-default exception list. Two code paths change, both for names.

### 4.3 Equality through the handlers

On `tp1_proof`, P called the real handlers in each tenant: the list with six queries (default, sort by name, sort by lifetime giving, a status filter, a search, portal holders only) and page two of each through its cursor, and detail for the rich donor and for an ordinary donor. That is 16 handler reads and 12 second pages, compared field by field with the service-key baseline.

- Every read returned HTTP 200. Every request carried P's token and the tenant and assignment headers of the tenant it was in. The service-key client was requested zero times.
- Every second page and both ordinary-donor details were identical.
- Every other difference was one defect: missionary 1's profile has an email and no name. The service key labels it with the email. The member directory has no email fallback, so the caller lane gives `null`. That is one field on each list page where the owner appears (5 of 12 first pages), and 51 fields in each rich-donor detail: the owner, and 25 gift rows twice (the row and its designation summary).

### 4.4 Defects met

| Kind                                                        | Count | Where                                                                                                                                                            |
| ----------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Permission denied: no table grant                           | 4     | the four contribution tables                                                                                                                                     |
| A column no grant admits                                    | 1     | `missionaries.tenant_id`, used only as a filter                                                                                                                  |
| A row policy that admits only the owner                     | 1     | `missionaries`                                                                                                                                                   |
| An empty list where an error was expected: deny-all policy  | 3     | `staged_gifts`, `staged_gift_allocations`, `donation_crm_links`                                                                                                  |
| An empty list where an error was expected: the claim helper | 1     | `funds`                                                                                                                                                          |
| A join or read that returns nothing under row security      | 2     | owner names from `profiles`, missionary names embedded from `profiles`, once the staff profile policy is dropped (in the census, 3 of 3 embeds came back `null`) |
| A label that changes                                        | 1     | the directory has no email fallback                                                                                                                              |
| An unfiltered read that crosses tenants (today)             | 2     | `donors`, `donations` (of the 4 tables probed)                                                                                                                   |
| A gate that must change with the policies                   | 1     | four stale entries in `rls-deny-by-default-exceptions.json`                                                                                                      |
| A table without a tenant column                             | 1     | `donor_activities`, whose row security is also not forced                                                                                                        |

## 5. Isolation

On `tp1_proof`, through PostgREST. "Unfiltered" means `select id, tenant_id from donors limit 1000` with no tenant filter.

| Case                                                   | Result                                               |
| ------------------------------------------------------ | ---------------------------------------------------- |
| P (staff in both), T1 headers, unfiltered donors       | 1,000 rows, all T1                                   |
| P, T1 headers, unfiltered gifts                        | 1,000 rows, all T1                                   |
| P, T1 headers, donors filtered to T2                   | 0 rows                                               |
| P, no headers                                          | 0 rows, no error                                     |
| P, assignment header only                              | 0 rows                                               |
| S1 (staff in T1 only), forged T2 header                | 0 rows                                               |
| S1, T2 header with S1's own T1 assignment              | 0 rows                                               |
| S1, T1 header naming P's T1 assignment                 | 0 rows                                               |
| P, T1 header naming P's own T2 assignment              | 0 rows                                               |
| X (no membership), T1 header                           | 0 rows                                               |
| No token, T1 header                                    | HTTP 401, 42501 (anonymous has no grant on `donors`) |
| S2 (two staff rows in T1), no assignment header        | 0 rows                                               |
| S2, T1 header naming one of its rows                   | T1 rows                                              |
| S1, T1 header, no assignment header (one live row)     | T1 rows                                              |
| D (donor in T1), T1 headers, donors                    | 1 row, D's own                                       |
| D, T1 headers, `staged_gifts`                          | 0 rows                                               |
| Tenant header `not-a-uuid`                             | HTTP 400, 22P02                                      |
| Tenant header without hyphens (Postgres would cast it) | HTTP 400, 22P02                                      |
| Assignment header `nope`                               | HTTP 400, 22P02                                      |
| P under T1, CRM detail handler with T2's donor ID      | HTTP 404 "CRM donor record not found."               |
| P under T1, gifts filtered by T2's donor ID            | 0 rows                                               |

A person in two tenants who reads with no filter receives the named tenant's rows only. A request that names no tenant receives none. A forged tenant receives none. The other tenant's IDs return nothing. These are the four isolation claims of the brief, and each holds.

## 6. Cost

### 6.1 Method

- **Queries.** The CRM list query of plan 11.4 as PostgREST runs it for the first page: 18 columns of `donors`, `tenant_id = T1`, `ORDER BY updated_at DESC NULLS LAST, id DESC LIMIT 51`. Beside it: a search that matches nothing, so the whole tenant is scanned (the worst case for a search); the same first page with no tenant filter in the query, which is what a read that forgets the filter costs; and CRM detail's gift read, the 101 newest gifts of one donor. PostgREST's own plan for the real list request (`Accept: application/vnd.pgrst.plan+text`) has the same shape as these runs: two init-plans, the tenant condition as a one-time filter, a bitmap scan on the tenant index and a top-N sort, 435 ms cold.
- **Size.** 250,001 donors and 2,000,120 gifts per tenant, the large tenant of plan 9.1. Plan 11.4 asks for 50,000 rows; this is five times that.
- **Variants.** For each, the script replaced the select policies of `donors` and `donations` inside a transaction, switched to `authenticated` with P's claims and T1's headers set as PostgREST sets them, measured, and rolled back. "Per row" means the helper takes the row's `tenant_id`. "Constant argument" means the helper takes `(SELECT authz.current_tenant_id())`. "Init-plan" means the whole check is wrapped in `(SELECT ...)`.
- **Runs.** `EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)`: one warm-up, then 10 timed runs. A statement over 2 seconds got 3 runs, the warm-up included, so the per-row variants did not hold the shared machine for an hour. `TIMING OFF` keeps per-node clock overhead out of plans that touch 250,000 rows; the execution time is still measured. Helper calls per statement come from `pg_stat_xact_user_functions` with `track_functions = all`.
- **Two phases.** First with the indexes the chain creates. Then with one more index, `donors (tenant_id, updated_at DESC NULLS LAST, id DESC)`, which matches the list's default order and does not exist today.
- **Load.** The machine is shared and was busy. At the start of the first phase the WSL load average was 8.2 and Windows CPU 48%. Between the phases they were 4.4 and 82%. At the end of the second phase they were 36 and 100%. No other backend was active in the database cluster at the start of either phase. Ranges below are min to max; read the medians with that in mind.

### 6.2 Results with the indexes as migrated

Execution time in milliseconds, median (min to max). Planning took 0.1 to 2.5 ms in every case but one (today's policy on the gift read, 17 ms).

| Variant                                                                 | Helper calls per statement       | First page                | No-match search           | First page, no tenant filter | Gift read              |
| ----------------------------------------------------------------------- | -------------------------------- | ------------------------- | ------------------------- | ---------------------------- | ---------------------- |
| Service key (no row security)                                           | none                             | 103 (89 to 116)           | 246 (204 to 342)          | 190 (159 to 226)             | 0.30 (0.21 to 0.56)    |
| Today: no tenant condition, `(SELECT has_staff_membership(row tenant))` | 250,001 (500,002 with no filter) | 14,874 (13,465 to 18,942) | 22,384 (17,426 to 23,416) | 26,724 (25,717 to 53,548)    | 63 (18 to 99)          |
| No tenant condition, `has_staff_membership(tenant_id)`                  | 250,001 (500,002)                | 41,648 (24,568 to 49,382) | 16,617 (15,398 to 20,805) | 31,856 (25,846 to 35,088)    | 12 (4.4 to 19)         |
| Tenant condition only, no class check                                   | 1                                | 277 (239 to 335)          | 566 (523 to 703)          | 299 (272 to 466)             | 0.58 (0.53 to 1.0)     |
| Tenant condition and constant argument, `has_staff_membership`          | 250,001                          | 18,367 (15,879 to 20,708) | 14,558 (14,073 to 15,081) | 14,538 (12,351 to 19,824)    | 5.2 (3.8 to 8.1)       |
| Tenant condition and constant argument, `has_staff_assignment`          | 250,001                          | 25,023 (20,060 to 25,676) | 32,592 (25,048 to 47,101) | 30,440 (27,166 to 38,116)    | 17 (13 to 19)          |
| **Tenant condition and init-plan, `(SELECT assignment_is('staff'))`**   | **2**                            | **217 (198 to 257)**      | **469 (399 to 636)**      | **281 (205 to 456)**         | **0.97 (0.64 to 1.6)** |
| Tenant condition and per row, `has_staff_assignment(tenant_id)`         | 250,001                          | 27,385 (23,898 to 35,292) | 38,006 (37,545 to 48,512) | 26,238 (22,694 to 29,826)    | 9.6 (9.0 to 11)        |
| Naive: `tenant_id = current_tenant_id()` and per row                    | 250,001                          | 22,452 (21,998 to 24,944) | 22,849 (22,449 to 23,117) | 27,921 (24,902 to 28,662)    | 13 (9.8 to 15)         |
| The prototype's policy (staff, own donor, own missionary)               | 2                                | 224 (187 to 476)          | 509 (450 to 656)          | 225 (188 to 280)             | 1.5 (1.3 to 2.4)       |
| **The prototype's policy, helpers `PARALLEL SAFE`**                     | **2 to 3**                       | **94 (81 to 131)**        | **172 (158 to 209)**      | **84 (77 to 90)**            | **0.93 (0.87 to 2.5)** |
| Init-plan, helpers `PARALLEL SAFE`                                      | 2                                | 103 (87 to 140)           | 174 (156 to 216)          | 90 (76 to 106)               | 0.73 (0.66 to 0.89)    |

What the plans show:

- **Once per statement or once per row.** Only the init-plan forms are evaluated once: two calls of the resolving function per statement, whether the scan touches 101 rows or 250,001. Every form that passes anything to a helper inside the row filter is evaluated per row, the constant-argument form included. Postgres does not hoist it out of a row-security filter, so 15.2's "membership check written with a constant argument" costs the same as the per-row form. Each per-row call cost 50 to 260 microseconds here, which is 13 to 49 seconds for one first page of a large tenant.
- **The tenant index is used.** In every variant with the tenant condition, the planner used the tenant index (a bitmap scan on `idx_donors_tenant_status`, an index with `tenant_id` first). Where the query names the tenant too, it used the query's literal for the index and turned the policy's condition into a one-time filter checked once. Where the query names no tenant, it used the policy's init-plan value for the index, so a forgotten filter still reads one tenant. Without the tenant condition, as today, the same query scans both tenants and checks membership on 500,002 rows.
- **Rows removed by the policy.** With the init-plan form the policy removes no row of the active tenant; the work is the scan and the sort, about 18,000 blocks for the tenant's heap. The per-row forms remove the same rows but pay a function call for each.
- **Parallel query.** The service key's plan is a parallel sequential scan. The caller-token plans are not parallel, because the helpers are `PARALLEL UNSAFE`, the default, and a query that references any unsafe function gets no parallel plan. That is the gap between 103 ms and 217 ms on the first page. Marked `PARALLEL SAFE`, the same policies get a parallel plan and match the service key (94 ms against 103). Marking only the `authz` and `tenant_guard` helpers is enough: `auth.uid()`, which hosted Supabase owns, is called only inside them, and with it left unsafe the first page still ran in parallel (74 ms). The results did not change. Run serially and in parallel, donor D received the same 1 row and P in T2 the same 250,001 rows, so the request settings reach the parallel workers.

### 6.3 Results with a `(tenant_id, updated_at, id)` index

| Variant                                   | Helper calls (first page) | First page          | No-match search           | First page, no tenant filter |
| ----------------------------------------- | ------------------------- | ------------------- | ------------------------- | ---------------------------- |
| Service key                               | none                      | 0.23 (0.16 to 0.26) | 185 (158 to 233)          | 164 (138 to 212)             |
| Today's policy                            | 51                        | 2.3 (2.1 to 3.3)    | 9,752 (8,874 to 10,161)   | 22,988 (22,735 to 25,326)    |
| Tenant condition only                     | 1                         | 1.0 (0.63 to 1.2)   | 566 (493 to 587)          | 0.39 (0.32 to 0.68)          |
| Constant argument, `has_staff_membership` | 51                        | 3.3 (2.6 to 4.0)    | 10,906 (10,696 to 11,805) | 3.0 (2.7 to 3.7)             |
| Constant argument, `has_staff_assignment` | 51                        | 4.8 (4.3 to 8.0)    | 30,453 (25,859 to 42,139) | 6.7 (4.1 to 8.5)             |
| Init-plan                                 | 2                         | 1.5 (0.78 to 3.4)   | 932 (688 to 1,787)        | 0.86 (0.66 to 1.7)           |
| Per row, `has_staff_assignment`           | 51                        | 8.0 (4.9 to 11)     | 49,889 (45,342 to 58,608) | 28 (6.4 to 49)               |
| Naive                                     | 51                        | 12 (6.0 to 15)      | 65,678 (64,621 to 89,805) | 15 (9.8 to 18)               |
| The prototype's policy                    | 2                         | 1.2 (0.98 to 3.5)   | 1,279 (1,058 to 1,783)    | 1.1 (0.97 to 3.6)            |
| The prototype's policy, `PARALLEL SAFE`   | 2                         | 1.0 (0.97 to 2.0)   | 1,225 (1,023 to 2,289)    | 4.1 (1.1 to 8.2)             |

With the index, the first page reads 51 rows and every form is fast, the per-row ones included (51 calls). The scans are where the forms part: a no-match search took 9 to 90 seconds with a per-row or constant-argument check and about one second with an init-plan.

**Why the search is slower on the caller's token with the index.** The machine was at its busiest at the end of this phase, so the search was run again, alone, in two passes back to back (load average 23.8 before, 10.2 after). The service key took 188 ms in both. The row-security variants took 616 to 1,317 ms, with no consistent order between them, so the class check and the own-row branches add nothing measurable. The cause is the plan. When a user may not see every row, Postgres does not let a non-leakproof operator such as `ILIKE` use column statistics (the Postgres 17 page "Planner Statistics and Security" states the rule for privileges and security-barrier views; row security behaved the same here). With the same role and grants, the planner estimated 1,240 matching rows with row security on `donors` and about 25 with it off. Expecting many matches, it walks the new index in order and expects to stop after 51; with no match it reads the whole tenant through the index, 232,000 buffer hits and 19,000 reads. The service key's plan is a parallel sequential scan and a sort. This is a property of row security, not of the policy pattern. It affects any caller-token search that sorts by an indexed column. WP4a needs a search the planner can serve from an index, such as a trigram index on the searched columns. That was not measured.

### 6.4 Round trips through PostgREST

Measured from the test client, 15 runs after one warm-up, without the extra index, in the same session as section 4. The caller-token runs use the prototype policy without `PARALLEL SAFE`.

| Read                       | Service key, ms median (min to max) | Caller's token, ms median (min to max) |
| -------------------------- | ----------------------------------- | -------------------------------------- |
| List, first page           | 177 (141 to 241)                    | 419 (350 to 562)                       |
| List, search "Quill"       | 335 (277 to 546)                    | 743 (681 to 1,354)                     |
| CRM detail, the rich donor | 157 (136 to 411)                    | 188 (170 to 468)                       |

The list gap is the database gap of 6.2: no parallel plan and no index for the order. The list makes 2 calls on either lane. Detail makes 16 calls on the caller's token and 15 on the service key.

### 6.5 Against the budgets of 9.2

| Budget                                                                                   | Result                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy cost: the active tenant and the membership check each resolved once per statement | Met by the init-plan form: two calls per statement at any row count. Not met by the constant-argument form or by today's policies                                                                                                                  |
| Normal indexed read, p95 at the database, 300 ms                                         | The first page under the prototype policy took 187 to 476 ms with today's indexes, because it reads and sorts the whole tenant: over budget at the top of the range. With `PARALLEL SAFE` helpers, 81 to 131 ms. With the order index, 1 to 3.5 ms |
| Mission Control list page, at most four Data API round trips                             | Met: 2                                                                                                                                                                                                                                             |
| CRM detail, at most four Core database calls                                             | Not met on either lane: 15 with the service key, 16 on the caller's token                                                                                                                                                                          |

A search with no match is not an indexed read on either lane. It took 158 to 342 ms on the service key and, on the caller's token, 399 to 656 ms with today's indexes, 156 to 216 ms with `PARALLEL SAFE` helpers, and 0.6 to 2.3 seconds with the order index.

## 7. The header path

What `public.tp1_header_probe()` saw for one request each, through PostgREST 16.4:

| Request                                      | What reached the helpers                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P, tenant and assignment headers             | both values; the assignment resolved to P's T1 row; `current_tenant_id` T1                 |
| P, tenant header only (T2)                   | the tenant; no assignment header; P's one live row in T2 was taken; `current_tenant_id` T2 |
| P, no headers                                | both `null`; no assignment; `current_tenant_id` `null`                                     |
| S1, forged T2 header                         | `request_tenant_id` T2, but no assignment resolves, so `current_tenant_id` is `null`       |
| Malformed tenant header                      | refused: 22P02 "the tenant header is not a canonical UUID"                                 |
| Header names in mixed case (`X-Asym-Tenant`) | read normally: PostgREST lowercases names                                                  |
| Tenant value with surrounding spaces         | read normally: the HTTP layer trims header values, and the helper trims as well            |

The plan's rule holds as written: the requested tenant only narrows, and the database repeats the membership check. A missing header is not an error, because a read that names no tenant must return nothing (5.4); a malformed one is, because it is a client defect and should not look like an empty list.

## 8. The helper shape recommended for WP2b

The prototype's helpers, with one change: mark them `PARALLEL SAFE`.

```sql
-- The tenant the request names. NULL when absent; 22P02 when not a canonical
-- lower-case UUID. Reads request.headers ->> 'x-asym-tenant'.
authz.request_tenant_id() RETURNS uuid
  STABLE PARALLEL SAFE SECURITY INVOKER SET search_path = ''

-- The one membership row the request acts under: the row x-asym-assignment
-- names, if it is the caller's, live and in the named tenant; else, with no
-- assignment header, the caller's one live row there. Otherwise no row.
-- WP3 adds the tenant-status test here, so every policy gets it at once.
authz.request_assignment(OUT membership_id uuid, OUT tenant_id uuid,
  OUT role authz.membership_role, OUT staff_role authz.staff_role,
  OUT is_tenant_admin boolean)
  STABLE PARALLEL SAFE SECURITY DEFINER SET search_path = ''   -- owner postgres

authz.current_tenant_id() RETURNS uuid   -- SELECT tenant_id FROM authz.request_assignment()
authz.assignment_is(p_role authz.membership_role,
                    p_staff_roles authz.staff_role[] DEFAULT NULL) RETURNS boolean
```

Every signed-in policy on a tenant table then has this shape:

```sql
USING (
  tenant_id = (SELECT authz.current_tenant_id())
  AND (
    (SELECT authz.assignment_is('staff'))
    OR (
      (SELECT authz.assignment_is('donor'))
      AND profile_id IN (SELECT authz.caller_profile_ids())
    )
  )
)
```

The evidence for each choice:

1. **Every helper call is a whole sub-select, and no helper takes a column of the row.** The init-plan form ran twice per statement; the constant-argument and per-row forms ran 250,001 times (6.2). The catalog gate should fail any policy that calls an `authz` helper outside a sub-select or passes it a column. Today's `(SELECT has_staff_membership(tenant_id))` form, used across the chain, has to go everywhere, not only where the tenant condition is added: it is a sub-select, but it depends on the row.
2. **One resolving function.** The tenant helper and the class helper read the same row from `authz.request_assignment()`, so a request cannot pass the tenant test under one row and the class test under another. Each policy calls it two or three times per statement; each call is an index lookup on the membership index WP2a created.
3. **Definer for the lookup, plain SQL for the wrappers.** The definer function reads `authz.memberships` without passing through that table's own policy, so its cost does not change when the membership policies do. The wrappers are SQL, which the planner can inline.
4. **`PARALLEL SAFE`.** Without it every caller-token scan is serial: 217 against 103 ms for the first page (6.2). With it the caller-token plan matches the service key's. Only our own helpers need the mark, and only because policies reference them; `auth.uid()` stays as hosted Supabase defines it. Results were identical serial and parallel.
5. **Missing and malformed values.** A missing tenant gives NULL, so the read returns nothing, as 5.4 requires. A malformed tenant or assignment raises `22P02`, which PostgREST returns as HTTP 400, so a client defect is not mistaken for an empty list. A value Postgres would cast but which is not canonical (no hyphens, upper case) is refused, matching the page-address rule of 5.2. The existing assignment helper accepts upper case; the two should agree.
6. **Own-row branches use an uncorrelated sub-select.** `profile_id IN (SELECT authz.caller_profile_ids())` is evaluated once, as a hashed sub-plan, and only when the class test before it is true. Today's own-row branches use a correlated `EXISTS` per row.
7. **Tables without a tenant column** take their parent's tenant through a correlated `EXISTS` on the parent's primary key (`donor_activities` through `donors`), never through an `IN` list of the parent's IDs, which would hash every ID in the tenant. A `tenant_id` column is better still.

## 9. What WP4a needs for CRM list and detail

The migration in section 2, less its measurement-only helper, with these settled:

1. **Grants:** `SELECT` on `contribution_corrections`, `contribution_correction_requests`, `contribution_adjustments` and `contribution_approval_policies` to `authenticated`, and `SELECT (tenant_id)` on `missionaries`. WP4a should decide whether the correction tables get column grants instead; the CRM reads `donation_id` and `status` only, and the Contributions Hub reads more.
2. **Policies, select only, each `TO authenticated`:** the 13 of section 4.2. Every one starts with `tenant_id = (SELECT authz.current_tenant_id())` and judges the class through an init-plan. `donor_activities` has no tenant column and takes its donor's tenant through a correlated `EXISTS` on `donors` (not an `IN` list, which would hash every donor id in the tenant).
3. **Drop** the five membership-only policies and the profiles staff policy (the last is WP2b's own step).
4. **Exceptions file:** remove the four contribution tables.
5. **`donor_merge_candidates`** (D-14): CRM detail is to read it in place of `crm_merge_candidates`. It has no grant and no policy today, so it needs `SELECT` and a tenant staff policy too. The prototype kept today's table so that the comparison was like for like.

## 10. What `withOperation` and the CRM handlers need

- **Two wrappers.** `withOperation` creates the service-key client before it authenticates, and every handler under it receives it. The prototype's `withCallerOperation` authenticates, resolves the assignment, builds the caller client with the two headers and gives the handler `db` and nothing else. WP4a makes that the default and moves the service key to a platform wrapper. The service-key gate counts `withOperation` call sites (`scripts/verify/service-role-client-gate.mjs:64-71`) and must change with it. It already notices the move: with the prototype, `node scripts/verify/service-role-client-gate.mjs` fails with `STALE operation_admin_context packages/api/src/admin/crm/detail/index.ts: allowlist 1, none found`, and so does item 11 of the #2253 acceptance suite. That is the allowlist ceiling falling, as WP4's acceptance list asks; WP4a deletes the entry in the same change. The list file keeps its entry while the tag-options read beside it stays on the service key.
- **Both session clients send the headers** (`createClient` in `packages/database/supabase/server.ts`, `createRequestSessionClient`). The prototype added an optional headers argument to each; WP2b's first release needs exactly that. Only the bearer branch was exercised here.
- **Fail closed in the wrapper.** `callerScopeHeaders` throws 403 when the resolver selected no assignment. Without that a handler would read nothing and return an empty 200.
- **Names.** Staff can no longer read other people's profiles once WP2b drops the policy, so every name a CRM read shows comes from the member directory. Three things follow. The directory has no email fallback, so the label changes for a profile with no name (a decision for the owner or the CRM's design). It returns every live member of the tenant and PostgREST filters the result afterwards, so its cost grows with the tenant's members; an `ids` argument would bound it. It names live members only, so an owner whose membership was revoked loses their name (not tested).
- **The shared row loader** (`contribution-shared/row-inputs.ts`) serves the Contributions Hub on the service key and CRM detail on the caller's token. The directory refuses the service key (no caller), so the loader cannot simply switch. The prototype added an option; WP4a either moves the Hub with CRM or keeps the option until it does.
- **Round trips.** The list makes 2 Data API calls (1 when no row on the page has an owner): inside the 9.2 budget of four. Detail makes 14 to 16 on the caller's token and 13 to 15 on the service key, against a budget of "at most four Core database calls". Detail is over budget on either lane today; the caller lane adds one call, for the directory. Meeting the budget needs a read function or a view for the gift history, which WP4a should decide.
- **Rename** the detail service's `supabaseAdmin` argument; the prototype passes the caller client through it unchanged.
- **The tag-options read** beside the list (`GET_TAG_OPTIONS`) still uses the service key. It reads only `donors` and would work under the same policy.

## 11. The other CRM reads, by table

From source, not run. "Today" means on the caller's token with today's chain.

| Read                                                        | Tables                                                                                                                            | What it needs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Notes (`crm/notes`)                                         | `crm_notes`; `crm_command_logs` on write                                                                                          | `crm_notes` has grants and two policies that call `has_staff_membership(tenant_id)` per row with no tenant condition, and gate restricted notes on `profiles.role`. It needs the tenant condition, the init-plan form, and the restricted branch on the tenant-administrator flag (WP2b already plans the last). `crm_command_logs` needs the same for its read                                                                                                                                                                         |
| Relationships (`crm/relationships`)                         | `donors`, `missionaries`, `profiles`, `donor_pledges`, `member_care_activities`                                                   | Reads each with `select *` filtered by `tenant_id` and no paging, so a large tenant gets the Data API's row cap silently. On the caller's token: `missionaries *` fails (care columns have no grant); `profiles` by `tenant_id` returns the caller's own row only once WP2b drops the staff policy; `member_care_activities` will admit only the member-care sub-role (WP4b), so other staff get an empty care section. It needs explicit columns, names from the directory, paging, and a "restricted" state that is not an empty list |
| Reports (`crm/reports`)                                     | `donations`, `contribution_adjustments`, `donation_crm_links`, `funds`, `missionaries` (names embedded from `profiles`), `donors` | With the prototype's policies all but the names would read; missionary names would come back `null` and need the directory. The label lookups by ID are unchunked (NB-09) on either lane. The export goes through the projection resolver (WP4a item 2)                                                                                                                                                                                                                                                                                 |
| Saved views and table preferences (`crm/table-preferences`) | `crm_table_user_preferences`, `crm_table_tenant_defaults`, `crm_table_named_views`                                                | No grant and no policy (NR-70); read with the service key, written through definer functions on the session client. Each needs `SELECT` and a policy with the tenant condition and staff class; user preferences and named views add `profile_id` in the caller's profiles. The write functions already run on the session client, which from WP2b sends the headers                                                                                                                                                                    |

## 12. Findings outside the two reads

- **The compatibility bootstrap's `auth.uid()`** reads only the legacy claim setting (section 3). Every real-stack test that sets `request.jwt.claim.sub` itself passes, and every test that goes through PostgREST on that bootstrap sees no caller. A later package should bring the bootstrap to the hosted definition.
- **The pinned Supabase CLI runner** (`bun run supabase -- migration new`) failed under `npx` with an npm override conflict on `sharp`. The installed CLI (2.115.0) created the migration file instead. Unrelated to this proof, but it blocks the rule that every migration is created with the CLI.
- **`donors` has no index for the list's default order** (`updated_at`, `id`). Every first page reads and sorts the whole tenant, on either lane: 89 to 116 ms with the service key and its parallel scan, 187 to 476 ms on the caller's token. With the index it is under 4 ms. The list's other sort orders would need their own.
- **Parallel query is lost on the caller's token** unless the helpers are marked `PARALLEL SAFE` (6.2). That applies to every row-security read, not only CRM.
- **Search misplans under row security**, because `ILIKE` loses its statistics (6.3).
- **`donor_activities`** has row security enabled but not forced, and no tenant column.

## 13. Not measured

- A hosted Supabase project (D-03): its pooler, real GoTrue tokens, hosted settings, and the browser's cross-origin preflight for the two headers. The hosted step is the 15.2 row "A request header reaching the database helper"; it would repeat section 7 from a browser on another origin.
- The real `getAuthContext`. It was replaced by the context the resolver returns; the resolver itself is WP2a's and has its own tests.
- The cookie branch of the session clients. Only the bearer branch ran.
- Concurrency. Every request ran alone.
- Writes and commands.
- The other CRM reads of section 11, which were read in source only.
- A revoked owner's name through the directory.
- Deep pages of the list, and sort orders other than the six tried.
- The 76 claim-keyed policies that the repointed helper switches on elsewhere. Their activation review is WP2b's.
- Policy variants on the other 13 tables. Only `donors` and `donations` were varied in section 6; the other tables' reads touch a few rows each.
- An index for the list search under row security, such as a trigram index.
- Capability checks inside a policy (`authz.assignment_capabilities`), which no CRM read needs.

## 14. How to repeat

All commands run from the repository root. Never point them at a hosted project.

```sh
# 1. Two databases. tp1_base takes the chain as it is at 23297a52b: run its
# migration step from a checkout of that commit, without the prototype patch.
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres -c "create database tp1_base"
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp1_base node scripts/verify/supabase-migrations.mjs
psql postgresql://postgres:postgres@127.0.0.1:25432/tp1_base -v donors=2000 -v gifts=16000 -f scripts/proofs/tp1/fixture.sql -f scripts/proofs/tp1/harness.sql
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres -c "create database tp1_proof"
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp1_proof node scripts/verify/supabase-migrations.mjs
psql postgresql://postgres:postgres@127.0.0.1:25432/tp1_proof -f scripts/proofs/tp1/fixture.sql -f scripts/proofs/tp1/harness.sql -f scripts/proofs/tp1/probe.sql

# 2. A login role and PostgREST in front of each database.
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres -c "create role tp1_authenticator login noinherit password 'tp1-local-only'; grant anon, authenticated, service_role to tp1_authenticator"
docker run -d --name tp1-postgrest-proof -p 127.0.0.1:25481:3000 --add-host host.docker.internal:host-gateway \
  -e PGRST_DB_URI=postgres://tp1_authenticator:tp1-local-only@host.docker.internal:25432/tp1_proof \
  -e PGRST_DB_SCHEMAS=public -e PGRST_DB_ANON_ROLE=anon -e PGRST_JWT_SECRET=<a 64-character secret> \
  -e PGRST_DB_PLAN_ENABLED=true public.ecr.aws/supabase/postgrest:v16.4
# (the same on port 25480 for tp1_base)

# 3. The census, equality, isolation, header probes and round trips.
TP1_POSTGREST_URL=http://127.0.0.1:25481 TP1_JWT_SECRET=<secret> TP1_STAGE=prototype TP1_RESULTS_PATH=out.json \
  bun x vitest run tests/unit/acceptance/tp1-caller-token/crm-read.postgrest.test.ts
TP1_POSTGREST_URL=http://127.0.0.1:25480 TP1_JWT_SECRET=<secret> TP1_STAGE=today TP1_RESULTS_PATH=today.json \
  bun x vitest run tests/unit/acceptance/tp1-caller-token/crm-read.postgrest.test.ts

# 4. Policy cost.
TP1_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp1_proof TP1_RUNS=10 TP1_OUT=cost.json \
  node scripts/proofs/tp1/measure-policy-cost.mjs

# 5. Clean up.
docker rm -f tp1-postgrest tp1-postgrest-proof
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres -c "drop database tp1_base" -c "drop database tp1_proof" -c "drop role tp1_authenticator"
```

The prototype patch is `tp1-prototype.patch` (section 2's files, without this report), made from the branch with a scratch index.

## 15. Checks run

| Check                                                                                                                                                                                            | Result                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/verify/supabase-migrations.mjs` on `tp1_base` (109 migrations, no prototype)                                                                                                       | passed, catalog gate included                                                                                                                 |
| The same on `tp1_proof` (110 migrations)                                                                                                                                                         | migrations applied; the catalog gate failed on 4 stale exception entries, then passed with them removed                                       |
| The real-stack test, stage `today`, against `tp1_base`                                                                                                                                           | 2 passed, 4 skipped by design                                                                                                                 |
| The real-stack test, stage `prototype`, against `tp1_proof`                                                                                                                                      | 6 passed (two earlier runs failed on test mistakes, fixed: a donor filter that matched nothing and an upper-case case on IDs with no letters) |
| The same test with no environment                                                                                                                                                                | 6 skipped                                                                                                                                     |
| `scripts/proofs/tp1/measure-policy-cost.mjs`, both phases, and a focused re-run of the indexed search                                                                                            | completed                                                                                                                                     |
| `bun x tsc -p packages/api/tsconfig.json --noEmit`                                                                                                                                               | passed                                                                                                                                        |
| `bun x eslint` on the changed TypeScript files                                                                                                                                                   | passed                                                                                                                                        |
| Existing unit suites that touch the changed code: CRM list service, CRM detail report, link scope, row inputs, table preferences, named views, the service-key gate's unit test, #2402 and #2253 | 116 passed, 1 failed: #2253 item 11, the stale allowlist entry for CRM detail described in section 10                                         |
| `bun x prettier --check` on every changed file                                                                                                                                                   | passed                                                                                                                                        |

The full unit suite was not run, to keep the shared machine usable.
