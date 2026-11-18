# Design

## Context

See proposal.md, Why. Today only `ci-integration.yml`'s `migrate` job touches a
real Postgres: it runs `scripts/sql/supabase-compat-bootstrap.sql`, every
forward migration (`scripts/verify/supabase-migrations.mjs`) and
`supabase/seed.sql`, then SQL-level realstack tests. Nothing serves that
database through PostgREST.

The database, row-level security and auth are being rebuilt on local branches
that are not yet on `develop` (AL-2671 plan; AL-2673, AL-2674 and AL-2675
branches). This design builds only on seams those branches leave intact, read
from the branches without checking them out. Diffs are against this change's
base (`cf634218a`); the most integrated branch, `int/AL-2675-wp2-on-stage1`,
was read at `34f5bf731` and re-checked at `e5e5b95c0`. Files that exist only on
those branches are marked in-flight.

| Seam                                                                                                                     | Stable?       | Evidence                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exposed schemas `public, graphql_public`; `max_rows = 1000` (`supabase/config.toml` `[api]`)                             | Stable        | Branch diffs of `config.toml` touch only Auth settings and `[remotes.*]`                                                                                                                                                                                     |
| Bootstrap + migrations + seed on plain Postgres 17                                                                       | Stable        | Branch bootstrap diff (+8/−1) changes only `auth.uid()` to read `request.jwt.claims`; the in-flight migrations add tables, functions and grants but no column the fixtures write is dropped                                                                  |
| PostgREST roles `authenticator` → `anon` / `authenticated` / `service_role`; JWT `role`, `sub`, `app_metadata.tenant_id` | Stable        | Bootstrap; `authz.current_tenant_id()` is defined only in `20260226113000` and unchanged on the branches. Application code moves tenant resolution from the claim to memberships (AL-2675 `f57383048`); the minted tokens copy what GoTrue issues either way |
| `authz.memberships (user_id, tenant_id, role, staff_role, is_active)`                                                    | Stable        | WP2a (in-flight `20261117065007`) adds nullable `granted_by` and `revoked_at`, `is_tenant_admin` defaulting to `false`, a check `is_active = (revoked_at IS NULL)` and a lifecycle trigger; the fixture's active rows with no `revoked_at` satisfy both      |
| Missionary-portal service reads that take a client parameter                                                             | Stable        | Branch diff of `missionary-portal/service.ts` is three lines (+2/−1): it drops the profile read's tenant filter (AL-2675, NR-68); the missionaries-row lookup keeps the tenant scope the portal test asserts                                                 |
| Select strings in `packages/api/src`                                                                                     | Self-updating | Read from source on every run                                                                                                                                                                                                                                |
| Invariant: no cross-tenant or anonymous tenant reads                                                                     | Stable        | `supabase/AGENTS.md`, `docs/security/tenant-read-floor.md`                                                                                                                                                                                                   |
| `packages/auth`, `withOperation` handlers, principal resolver                                                            | Unstable      | `context.ts` +405/−110 and `middleware.ts` +333/−18; the principal moves into `packages/auth/principal/`                                                                                                                                                     |
| Individual policies, per-role positive visibility, `anon`/`authenticated` grants                                         | Unstable      | In-flight AL-2674 `20261117034926_close_default_privileges_and_demo_grants.sql` (not on `develop`): "Policies are not changed; WP2 rewrites them", and it revokes every `anon`/`authenticated` grant no policy admits                                        |
| Membership RPCs (`current_user_assignments`, `current_user_memberships`)                                                 | Unstable      | In-flight `20261117065007` drops and recreates both with an `is_tenant_admin` column                                                                                                                                                                         |
| Money path (webhook claim, saga, refunds, pledges, staged gifts)                                                         | Replaced      | AL-2671 plan WP8 "Money kernel" (WP8a, WP8c) removes the legacy writers                                                                                                                                                                                      |

## Goals / Non-Goals

**Goals:**

- Fail by name on a phantom column, phantom embed or unexposed schema in any
  statically resolvable select in `packages/api/src`.
- Prove tenant isolation through the Data API for signed-in users of two
  tenants and for `anon`, without depending on individual policy text, and say
  exactly which tables the run proved it on.
- Run unchanged on the plain-Postgres CI path and on a workstation, without
  touching anything the run did not create.

**Non-Goals:**

- Testing route handlers, `getAuthContext` or the principal resolver.
- Asserting which rows a role may read inside its own tenant (WP2 is changing
  that); only the cross-tenant and anonymous floors are asserted.
- Money-path tests (deferred until the WP8 commands exist).

## Decisions

1. **PostgREST image: `public.ecr.aws/supabase/postgrest`, the version the
   repository's pinned Supabase CLI runs, pinned by digest.** Same build as the
   local stack and hosted projects, served from ECR Public like the CI Postgres
   image (no Docker Hub rate limits). Alternative: the static binary used by
   the #2269 recipe; rejected because it differs from the stack's build and
   needs a checksum-download step per runner.
2. **Configuration read from `supabase/config.toml`.** `db-schemas`,
   `db-max-rows` and `db-extra-search-path` mirror the Supabase stack's
   PostgREST environment, so a change to the declared API surface changes the
   check with it. A live test reads one tenant's `max_rows + 1` donors and
   asserts that exactly `max_rows` come back while the exact count reports all
   of them (the 1eb444a5f class), so the served cap is checked, not only the
   mapping.
3. **Harness setup SQL is local-only.** It gives `authenticator` a login with a
   random per-run password (Supabase's login role for PostgREST), defines
   `auth.uid()` and `auth.role()` exactly as Supabase Auth does (AL-2674 puts
   the same `auth.uid()` in the bootstrap, so that part becomes a no-op), and
   creates the empty `graphql_public` schema that Supabase's image provides
   (PostgREST refuses to load a schema cache when an exposed schema is
   missing). It grants nothing on product tables and changes no policy.
4. **Tokens are minted per run, from `auth.users`.** HS256 with a random
   per-run secret; claims copy what GoTrue issues for that row (`sub`, `role`,
   `aud`, `email`, `app_metadata`, `user_metadata`). No secret is stored or
   printed.
5. **Fixtures: the seed's demo tenant is tenant A; the tests add tenant B.**
   Tenant B gets an auth user, profile, staff/donor/missionary memberships, a
   missionary, a donor and a task, plus the rows that give tenant A something
   to leak: a gift, a pledge, and a draft post and draft location that no
   ruling makes public. All with random ids, written as `postgres` through
   only the columns that exist, and deleted afterwards.
6. **Select inventory by TypeScript AST.** Resolves string literals, template
   literals and same-file `const` strings (also through `${CONST}`
   substitution), and the table from the nearest `.from("...")` in the call
   chain, with `.schema("...")` when present. Each select runs as
   `service_role` with `limit=0`: PostgreSQL still plans the column list and
   PostgREST still resolves embeds, so no data is needed.
7. **Isolation sweep discovers tables from the catalog and reports what it
   proved.** Every table or view in the exposed schemas with a `tenant_id`
   column is probed as a user of tenant A, a user of tenant B and `anon`.
   - A leak is a row naming another tenant (any row, for `anon`) that no
     ruling makes public. NULL-tenant rows such as platform-default
     `field_policies` belong to no tenant.
   - The ruled public reads are rows, not tables: `ruled-public-reads.ts` holds
     each ruling's row predicate as the policies apply it (published and
     public posts, their comments and reactions, published locations), and the
     admin connection computes which rows are public. Any other row of those
     tables read by `anon` or by a user of another tenant is a leak.
   - A read counts as refused only when Postgres refuses the swept relation
     itself (42501 naming it); a 42501 naming a function, a schema or another
     table is an error. When a refused role still holds column privileges
     (`missionaries` grants `authenticated` `id, profile_id`), the sweep reads
     a readable single-column primary key and resolves each row's tenant
     through the admin connection; a column grant without one fails the run.
   - A table is evidenced for a caller when the caller could query it and the
     database holds rows that caller must not read. Donors, donations,
     donor_pledges, profiles, missionaries, posts and locations must be
     evidenced for both tenants, and posts and locations for `anon`. Each run
     prints the evidenced, readable-but-unevidenced and refused tables by name.
   - Identity guard: each signed-in caller must read its own `profiles` row by
     id and some row of its own tenant outside the ruled public reads. A token
     for an unknown subject carrying tenant A's claims must fail that guard.
8. **Known defects are explicit, specific and two-way.** A select that fails
   today because of a product defect the check found is listed in
   `known-defects.ts` with its file, table, PostgREST code and `match`, text
   specific to that select (the broken embed) that must occur in the select
   string or PostgREST's message. Any other failure fails the run, as do an
   entry matching more than one failing select and an entry that stops
   failing, so the fixing change deletes its entry. Alternative: leave the job
   red until the defects are fixed; rejected because a permanently red
   advisory job hides new regressions.
9. **Separate workflow, advisory.** `.github/workflows/api-contract.yml`, hosted
   runner, `contents: read`, actions pinned by SHA, no secrets, not in
   `ci-gate`. Pull requests run it when anything that can change the result
   changes: `packages/**` (the reads import most workspace packages), the
   schema chain, the harness and installer scripts, the Vitest configuration
   chain and the dependency manifests; `workflow-paths.test.ts` derives those
   inputs from the repository and fails when the filter misses one. Every
   `develop` push runs it as a backstop. It does not edit `ci-integration.yml`,
   so no fingerprint changes.
10. **The harness touches only what it started.** `DATABASE_URL` must be a
    Postgres URL on a loopback host with no `host`, `hostaddr` or `service`
    parameter (node-postgres and libpq honour those over the hostname).
    `up` and `prepare` remove a container or network only when the run's state
    file records it, refuse a same-named one they did not start, and record a
    name before starting anything under it. On the host network PostgREST
    binds to `127.0.0.1`; in a container network only the loopback port is
    published.

## Risks / Trade-offs

- [In-flight migrations change grants or policies] → The sweep asserts only
  floors (no foreign-tenant rows, no anonymous rows outside the ruled rows) and
  treats a privilege refusal of the relation as no rows, so a correct rewrite
  stays green. If WP2 makes a required core table unreadable on purpose, the
  evidence assertion fails by name and the table leaves `REQUIRED_EVIDENCE`
  with the reason recorded.
- [The plain-Postgres replay has narrower grants than hosted projects until
  AL-2674's default-privilege migration lands] → On hosted projects `anon` and
  `authenticated` hold table grants by default, so a permissive policy on a
  table refused here (87 of 146 for each tenant, 140 for `anon`, today) would
  leak there and stays latent in this check. Each run lists the refused tables
  by name. A second pass with hosted-like grants applied only to the scratch
  database is possible until AL-2674 lands; it is not built.
- [The ruled predicates duplicate the policies' public-row text] → Deliberate:
  they encode the ruling, so a policy that widens past it fails. A narrower
  policy stays green; a new public read needs a ruling and an entry.
- [The plain-Postgres path hides real-stack differences] → Out of scope by
  design; the AL-2673 `local-supabase.yml` job guards the chain on the real
  image. The tests take their endpoint from environment variables so they can
  run against that stack's PostgREST once it lands.
- [Static inventory misses run-time selects] → Unresolved selects are listed
  in the output with their location, so coverage is visible.
- [Ruled public-read list drifts from policy] → One list, each entry citing its
  ruling; adding a public read means editing it in review.
- [Runner cost] → One job, about the `migrate` job's build plus under a minute
  of tests; the widened filter runs it on most pull requests that touch
  packages. It does not block merges.

## Migration Plan

Add the workflow, harness and tests. Rollback is deleting them; nothing else
references them. Promotion to a required check is a separate owner decision,
and needs the trigger changed first: a required check must report on every
pull request, so the `pull_request` path filter goes (or a skipped run must
report success), and a `merge_group` trigger is added so the merge queue can
run it.

## Open Questions

- Whether the job should move onto the AL-2673 Supabase stack once that lands
  (the tests already accept any PostgREST endpoint).
- Whether to add the hosted-like grants pass described under Risks before
  AL-2674's default-privilege migration lands.
