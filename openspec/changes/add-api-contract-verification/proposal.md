# Proposal

## Why

No CI test sends an application query through the Supabase Data API
(PostgREST). The `migrate` job stops at SQL, and every browser job points at a
placeholder backend, so the defects that escaped in the last 90 days all sat on
that seam: a selected column no migration creates (fixed in 23f2bd454), five
reads embedding a relationship that does not exist (#2269), a private schema
queried through PostgREST (#1560, fe954896d), the 1,000-row cap truncating gift
totals (1eb444a5f) and five policies allowing anonymous cross-tenant reads
(#2312). An executed check on the migrated database finds each of these by
name; a mocked one cannot.

## What Changes

- An advisory CI workflow, `.github/workflows/api-contract.yml`, that builds
  the same plain Postgres 17 database as the `migrate` job (compat bootstrap,
  every migration, the demo seed), starts PostgREST on it with the exposed
  schemas and row cap that `supabase/config.toml` declares, and mints its own
  short-lived tokens for users in two tenants. No GoTrue and no Supabase CLI.
- A harness script that prepares that database for PostgREST (local test setup
  only, never a migration) and starts and stops uniquely named containers, so a
  developer can run the same check on a workstation.
- Tests under `tests/integration/api-contract/` that:
  - execute every statically resolvable `.select(...)` in `packages/api/src`
    against its table through PostgREST, so a phantom column, a missing
    relationship embed or an unexposed schema fails with the source location,
    the select string and PostgREST's error;
  - run real `packages/api` missionary-portal read functions with a real
    `supabase-js` client against two tenants and assert on the rows returned;
  - check that a read matching more rows than the declared row cap returns
    exactly the cap;
  - probe every tenant table as a user of each of two tenants and as `anon`,
    fail when a row comes back that is another tenant's and no ruling makes
    public, require evidence on the core tenant tables in both directions, and
    list per run which tables were evidenced, readable without evidence, or
    refused for lack of privilege (which proves nothing on plain Postgres,
    where hosted default grants are absent).
- Not a required check. It runs on pull requests and on `develop`, and is
  promoted only after it has run cleanly for a while (a later owner decision).

## Capabilities

### New Capabilities

- `api-contract-verification`: executed verification that application reads
  match the migrated schema as the Data API serves it, and that the Data API
  keeps tenants apart, on a disposable database in CI.

### Modified Capabilities

None. The check observes existing behaviour; it changes no product
requirement.

## Authority

Owner ruling of 2026-11-18 on step 5 of the repository-quality program
(issue #2708). Step 5 as offered: "Real-backend job: start with PostgREST on
the already-migrated Postgres using minted tenant tokens, then money-path
tests." Owner: "do #5". The same ruling adds: "Keep in mind there is currently
active constriction of the supabase database/rls/auth at the moment." and
"work carefully to not break anything or cause any regression in quality."

Scope taken from that ruling for this change: the PostgREST check and its
read-path and tenant-isolation tests. The money-path tests are deferred (see
Non-goals) because the in-flight database work replaces that code. The
review-fix pass of 2026-11-18 (#2708, independent review "REVIEW e") stays
inside that scope: it makes the same tests fail when what they name is broken
and words them to what they prove; it needs no new ruling.

## Non-goals

- No change to migrations, the seed, row-level security policies, grants,
  `packages/auth/**` or `packages/api` product code. A defect the check finds is
  reported, not fixed here.
- No money-path tests (Stripe webhook claim, donation saga, refunds, pledges,
  staged gifts). The ratified AL-2671 plan (WP8, "Money kernel") replaces those
  routes and writers; tests for them wait for the new commands.
- No duplicate of the full local Supabase stack that AL-2673 adds
  (`local-supabase.yml`, migration-chain guard on the real image). This check
  stays on the plain-Postgres path and is built so its tests can move onto that
  stack later.
- No required-check or branch-protection change, and no edit to `ci.yml`,
  `ci-integration.yml`, `docs/ci.md` or the root `package.json` in this pass.

## Impact

- New files only: the workflow, a harness script under `scripts/`, the tests
  and their Vitest configuration under `tests/integration/api-contract/`, and
  this change.
- CI cost: one hosted job per matching pull request and `develop` push, about
  the `migrate` job's database build plus under a minute of tests. The
  pull-request filter covers every input that can change the result,
  including `packages/**`, so most pull requests that touch shared code run
  it.
- Rollback: delete the workflow file (nothing depends on it), then the test
  directory and the harness script. No data, schema or runtime state changes.
