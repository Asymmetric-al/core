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
from the branches without checking them out:

| Seam                                                                                                                     | Stable?       | Evidence                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------- |
| Exposed schemas `public, graphql_public`; `max_rows = 1000` (`supabase/config.toml` `[api]`)                             | Stable        | Branch diffs of `config.toml` touch only Auth settings and `[remotes.*]`                                   |
| Bootstrap + migrations + seed on plain Postgres 17                                                                       | Stable        | Branch bootstrap diff changes only `auth.uid()` to read `request.jwt.claims`                               |
| PostgREST roles `authenticator` → `anon` / `authenticated` / `service_role`; JWT `role`, `sub`, `app_metadata.tenant_id` | Stable        | Bootstrap; `authz.current_tenant_id()` reads `app_metadata.tenant_id` (docs/security/tenant-read-floor.md) |
| `authz.memberships (user_id, tenant_id, role, staff_role, is_active)`                                                    | Stable        | WP2a adds `granted_by`, `revoked_at`, `is_tenant_admin`, all defaulted                                     |
| Missionary-portal service reads that take a client parameter                                                             | Stable        | Branch diff of `missionary-portal/service.ts` is three lines                                               |
| Select strings in `packages/api/src`                                                                                     | Self-updating | Read from source on every run                                                                              |
| Invariant: no cross-tenant or anonymous tenant reads                                                                     | Stable        | `supabase/AGENTS.md`, `docs/security/tenant-read-floor.md`                                                 |
| `packages/auth`, `withOperation` handlers, principal resolver                                                            | Unstable      | `context.ts` +515, `middleware.ts` +351, principal moves into `packages/auth`                              |
| Individual policies, per-role positive visibility, `anon`/`authenticated` grants                                         | Unstable      | `20261117034926_close_default_privileges_and_demo_grants.sql`: "WP2 rewrites" policies                     |
| Membership RPCs (`current_user_assignments`, `current_user_memberships`)                                                 | Unstable      | Recreated by WP2a with a new return shape                                                                  |
| Money path (webhook claim, saga, refunds, pledges, staged gifts)                                                         | Replaced      | AL-2671 plan WP8 "Money kernel" removes the legacy writers                                                 |

## Goals / Non-Goals

**Goals:**

- Fail by name on a phantom column, phantom embed or unexposed schema in any
  statically resolvable select in `packages/api/src`.
- Prove tenant isolation through the Data API for signed-in users of two
  tenants and for `anon`, without depending on individual policy text.
- Run unchanged on the plain-Postgres CI path and on a workstation.

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
   check with it.
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
   missionary, a donor and a task, with random ids, written as `postgres`
   through only the columns that exist, and deleted afterwards.
6. **Select inventory by TypeScript AST.** Resolves string literals, template
   literals and same-file `const` strings (also through `${CONST}`
   substitution), and the table from the nearest `.from("...")` in the call
   chain, with `.schema("...")` when present. Each select runs as
   `service_role` with `limit=0`: PostgreSQL still plans the column list and
   PostgREST still resolves embeds, so no data is needed.
7. **Isolation sweep discovers tables from the catalog.** Every table or view in
   the exposed schemas with a `tenant_id` column. A leak is a row naming another
   tenant beyond what `anon` may read from the ruled public reads (a public row
   is public to everyone); NULL-tenant rows such as platform-default
   `field_policies` belong to no tenant. Vacuity guards: each signed-in caller
   must see some row of its own tenant, and at least one readable table must
   hold other tenants' rows; the run prints how many tables were refused for
   lack of privilege and which held rows to leak.
8. **Known defects are explicit and two-way.** A select that fails today
   because of a product defect the check found is listed in
   `known-defects.ts` (file, table, PostgREST code), so the advisory run stays
   useful: any other failure fails it, and an entry that stops failing fails it
   too, so the fixing change deletes its entry. Alternative: leave the job red
   until the defects are fixed; rejected because a permanently red advisory job
   hides new regressions.
9. **Separate workflow, advisory.** `.github/workflows/api-contract.yml`, hosted
   runner, `contents: read`, actions pinned by SHA, no secrets, not in
   `ci-gate`. Pull requests run it when the API layer, the schema chain, the
   harness or dependencies change; every `develop` push runs it as a backstop.
   It does not edit `ci-integration.yml`, so no fingerprint changes.

## Risks / Trade-offs

- [In-flight migrations change grants or policies] → The sweep asserts only
  floors (no foreign-tenant rows, no anonymous rows outside the ruled list) and
  treats a privilege refusal as no rows, so a correct rewrite stays green.
- [The plain-Postgres replay has narrower grants than hosted projects until
  AL-2674's default-privilege migration lands] → A permissive policy on a
  table `authenticated` cannot select is latent here (88 of 146 tenant tables
  are refused today); the run prints that count so the gap stays visible.
- [The plain-Postgres path hides real-stack differences] → Out of scope by
  design; the AL-2673 `local-supabase.yml` job guards the chain on the real
  image. The tests take their endpoint from environment variables so they can
  run against that stack's PostgREST once it lands.
- [Static inventory misses run-time selects] → Unresolved selects are listed
  in the output with their location, so coverage is visible.
- [Ruled public-read list drifts from policy] → One list, each entry citing its
  ruling; adding a public read means editing it in review.
- [Runner cost] → One job, about the `migrate` job's build plus seconds of
  tests; it does not block merges.

## Migration Plan

Add the workflow, harness and tests. Rollback is deleting them; nothing else
references them. Promotion to a required check is a separate owner decision.

## Open Questions

- Whether the job should move onto the AL-2673 Supabase stack once that lands
  (the tests already accept any PostgREST endpoint).
