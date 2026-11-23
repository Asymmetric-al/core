# 0003. Isolate preflight and rollback suites, omit demo seed in historical replays and trigger local-stack replay on gate edits

**Status:** Recorded on 2026-11-23 from code comments in `tests/` removed under
AL-2676 ([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It
describes the code as it is and ratifies no product intent. Accepted platform
intent is in [`docs/adr/`](../../../docs/adr/README.md).

## Context

WP3a part 1a (AL-2676) added tenant status, `ON DELETE RESTRICT` keys to
`public.tenants`, legal entities on giving targets and tenant-key enforcement in
the catalog gate. Several real-stack acceptance suites, historical migration
replay harnesses and the Local Supabase Stack workflow path filter needed
specific structural arrangements to keep parallel test runs safe and historical
replays runnable.

## Decisions

1. **Run `20261120130004`'s preflight and operator query on scratch schema
   copies.** In
   `tests/unit/acceptance/issue-2676/giving-targets.realstack.acceptance.test.ts`,
   the preflight case executes the shipped preflight block from
   `supabase/migrations/20261120130004_giving_target_entities.sql` and
   `scripts/sql/giving-target-preflight.sql` unchanged except for schema name
   against scratch copies of the seven tables (`funds`, `missionaries` and the
   five money tables). The already-migrated catalog can no longer hold the
   unconvertible rows (tenantless targets, cross-tenant money rows and blank
   tenant names) that the preflight refuses. Cited: AL-2676 council F3.
2. **Isolate the `20261120130001` rollback suite on a throwaway database and
   never echo `psql` stderr.** In
   `tests/unit/acceptance/issue-2676/tenant-status-rollback.realstack.acceptance.test.ts`,
   the suite creates a throwaway database from `template0` and replays the
   migration chain up to `20261120130001` (with guard refusals proved inside
   rolled-back transactions) rather than running against the shared `migrate`
   database, because rolling back `20261120130001` on the shared database would
   hold `public.tenants` exclusively while parallel program suites run. Its
   `psql` helper passes the connection URL as the whole target argument and
   returns only the process exit status without echoing `stderr`, avoiding
   credential exposure in test output. Cited: AL-2676 fix checks K1 and K12;
   modelled on `issue-2675/tenant-policy-migration`.
3. **Seed only the signup trigger's tenant in historical predecessor replay
   harnesses.** `Stack` in `tests/unit/acceptance/issue-2364/harness.ts`,
   `tests/unit/acceptance/issue-2406/harness.ts` and
   `tests/unit/acceptance/issue-2407/harness.ts` replays migrations without
   running `supabase/seed.sql` and instead inserts only the signup trigger's
   tenant (`00000000-0000-0000-0000-000000000001`). The demo seed's giving
   targets require `public.legal_entities`, which does not exist at historical
   predecessor snapshots such as `#2364`.
4. **Trigger the Local Supabase Stack workflow when the catalog gate or security
   exception lists change.** `tests/unit/workflows/local-supabase-paths.test.ts`
   pins `scripts/verify/tenant-rls-catalog.mjs` and `docs/security/*.json` in
   `.github/workflows/local-supabase.yml`'s path filter because the workflow's
   replay step runs `scripts/verify/supabase-migrations.mjs`, which imports
   `scripts/verify/tenant-rls-catalog.mjs` and reads its reviewed security
   exception lists. Cited: AL-2676 round M, M4.
